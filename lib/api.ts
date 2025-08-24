import { supabase } from './supabaseClient';
import type { Product, Category, Seller, Conversation, Message, ProductVariant } from '../types';

// Helper function to get public URL for storage items
const getPublicUrl = (bucket: string, path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

// =============================================
// PRODUCTS & CATEGORIES
// =============================================

export const getFeaturedProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            sellers ( id, company_name, logo_url ),
            categories ( name )
        `)
        .limit(3);
    if (error) throw error;
    return data as any;
};

export const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data;
};

export const getAllProducts = async (filters: { searchTerm?: string; categories?: number[]; maxMoq?: number; sortBy?: string }): Promise<Product[]> => {
    let query = supabase
        .from('products')
        .select(`
            *,
            sellers ( id, company_name, logo_url ),
            categories ( name )
        `);
    
    if (filters.searchTerm) {
        query = query.ilike('name', `%${filters.searchTerm}%`);
    }
    if (filters.categories && filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
    }
    if (filters.maxMoq) {
        query = query.lte('min_order_quantity', filters.maxMoq);
    }
    // Add sorting logic later based on sortBy filter
    
    const { data, error } = await query;
    if (error) throw error;
    return data as any;
}


export const getProductById = async (id: string): Promise<(Product & { product_variants: ProductVariant[], sellers: Seller }) | null> => {
     const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            sellers ( * ),
            product_variants ( * )
        `)
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as any;
}

// =============================================
// SELLERS
// =============================================

export const hasSellerProfile = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('sellers')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error checking for seller profile:', error);
        return false;
    }

    return !!data;
};

export const createSellerProfile = async (userId: string, profileData: any, logoFile: File) => {
    // 1. Upload logo
    const filePath = `${userId}/${logoFile.name}`;
    const { error: uploadError } = await supabase.storage.from('seller_logos').upload(filePath, logoFile, { upsert: true });
    if (uploadError) throw uploadError;

    // 2. Get public URL
    const logoUrl = getPublicUrl('seller_logos', filePath);

    // 3. Create seller profile
    const { data, error } = await supabase
        .from('sellers')
        .insert({
            id: userId,
            company_name: profileData.company_name,
            description: profileData.description,
            shipping_policy: profileData.shipping_policy,
            return_policy: profileData.return_policy,
            logo_url: logoUrl,
        });

    if (error) throw error;
    
    // 4. Update user role in profiles table
    const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', userId);
        
    if(roleError) throw roleError;

    return data;
};

export const createProduct = async (sellerId: string, productData: any, variants: any[], images: File[]) => {
    // 1. Upload images
    const imageUrls: string[] = [];
    for (const image of images) {
        const filePath = `${sellerId}/${productData.name}/${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage.from('product_images').upload(filePath, image);
        if (uploadError) throw uploadError;
        const publicUrl = getPublicUrl('product_images', filePath);
        if (publicUrl) imageUrls.push(publicUrl);
    }
    
    // 2. Create Product
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
            seller_id: sellerId,
            name: productData.name,
            category_id: parseInt(productData.category_id, 10),
            description: productData.description,
            min_order_quantity: parseInt(productData.min_order_quantity, 10),
            images: imageUrls,
        })
        .select()
        .single();
    
    if (productError) throw productError;

    // 3. Create Variants
    const variantsToInsert = variants.map(v => ({
        product_id: product.id,
        name: v.name,
        paper_type: v.paper_type,
        price_per_unit: parseFloat(v.price_per_unit),
    }));

    const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);

    if (variantsError) throw variantsError;

    return product;
};

export const getSellerProducts = async (sellerId: string) => {
    const { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('seller_id', sellerId);
        
    if (error) throw error;
    return data;
}


// =============================================
// MESSAGING
// =============================================

export const getConversations = async (): Promise<Conversation[]> => {
    const { data, error } = await supabase
        .from('conversations_with_details')
        .select('*');
    if (error) throw error;
    return data;
};

export const getMessages = async (conversationId: number): Promise<Message[]> => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

export const sendMessage = async (conversationId: number, senderId: string, content: string) => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
        });
    if (error) throw error;
    return data;
};

export const getOrCreateConversation = async (recipientId: string): Promise<number> => {
    const { data, error } = await supabase.rpc('get_or_create_conversation', { recipient_id: recipientId });
    if (error) throw error;
    return data;
}

export const markConversationAsRead = async (conversationId: number, userId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId) // Don't mark your own messages as read
        .eq('is_read', false);
    
    if (error) console.error("Error marking as read:", error);
};

// =============================================
// ORDERS
// =============================================
export const getOrdersForUser = async (userId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                products ( name, images )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export const getOrderDetails = async (orderId: number) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                products ( name, images, category_id ),
                product_variants ( name, paper_type )
            )
        `)
        .eq('id', orderId)
        .single();
    
    if (error) throw error;
    return data;
}

// =============================================
// NOTIFICATIONS
// =============================================
export const getNotifications = async (userId: string) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}