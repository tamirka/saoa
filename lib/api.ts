import { supabase } from './supabaseClient';
import type { Product, Category, Order, Notification, Review, Conversation, Message } from '../types';

const checkSupabase = () => {
    if (!supabase) {
        throw new Error("Supabase client not initialized.");
    }
    return supabase;
}

// A helper to map Supabase product data to our frontend Product type.
// This is complex due to joins and data shaping.
const mapToProductType = (p: any): Product => ({
    id: p.id.toString(),
    name: p.name,
    seller: {
        id: p.sellers.id,
        name: p.sellers.profiles.full_name,
        logoUrl: p.sellers.logo_url,
        response_time: 2, // These would need to be calculated or stored
        rating: 4.8, 
        reviews: 120,
    },
    category: p.categories.name,
    imageUrl: p.image_url,
    images: p.images || [],
    description: p.description,
    minOrderQuantity: p.min_order_quantity,
    rating: 4.8, // calculated
    reviewsCount: p.reviews?.length || 0,
    variants: (p.product_variants || []).map((v: any) => ({
        id: v.id.toString(),
        name: v.name,
        paperType: v.paper_type,
        pricePerUnit: v.price_per_unit,
    })),
    faqs: (p.product_faqs || []).map((f: any) => ({ question: f.question, answer: f.answer })),
    reviews: (p.reviews || []).map((r: any) => ({
        id: r.id.toString(),
        author: r.profiles.full_name,
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString(),
    })),
});

export async function getCategories(): Promise<Category[]> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('categories').select('*');
    if (error) throw error;
    return data.map(c => ({ ...c, id: c.id.toString(), imageUrl: c.image_url }));
}

export async function getProducts(options?: { limit?: number; searchTerm?: string; categories?: string[]; maxMoq?: number; sortBy?: string; }): Promise<Product[]> {
    const sb = checkSupabase();
    let query = sb.from('products').select(`
        id, name, image_url, min_order_quantity,
        categories ( name ),
        sellers ( id, logo_url, profiles (full_name) ),
        product_variants ( price_per_unit )
    `);

    if (options?.limit) query = query.limit(options.limit);
    if (options?.searchTerm) query = query.ilike('name', `%${options.searchTerm}%`);
    if (options?.categories && options.categories.length > 0) {
        query = query.in('category_id', options.categories.map(c => c)); // Assumes category name matches for now. A real query would join.
    }
    if (options?.maxMoq) query = query.lte('min_order_quantity', options.maxMoq);

    const { data, error } = await query;
    if (error) throw error;
    
    return data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        imageUrl: p.image_url,
        minOrderQuantity: p.min_order_quantity,
        category: p.categories.name,
        seller: {
            id: p.sellers.id,
            name: p.sellers.profiles.full_name,
            logoUrl: p.sellers.logo_url,
            response_time: 0, rating: 0, reviews: 0
        },
        rating: 4.5, reviewsCount: 100,
        images: [], variants: [], description: '', faqs: [], reviews: []
    }));
}

export async function getProductById(id: string): Promise<Product | null> {
    const sb = checkSupabase();
    const { data, error } = await sb
        .from('products')
        .select(`
            *,
            categories ( name ),
            sellers ( *, profiles (full_name) ),
            product_variants (*),
            product_faqs (*),
            reviews (*, profiles (full_name))
        `)
        .eq('id', id)
        .single();
    if (error) throw error;
    return data ? mapToProductType(data) : null;
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('products').select(`
        id, name, image_url, min_order_quantity,
        categories ( name )
    `).eq('seller_id', sellerId);
    if (error) throw error;
    return data.map((p:any) => ({
        id: p.id.toString(),
        name: p.name,
        imageUrl: p.image_url,
        minOrderQuantity: p.min_order_quantity,
        category: p.categories.name,
        seller: {} as any, rating: 0, reviewsCount: 0, images: [], variants: [], description: '', faqs: [], reviews: []
    }));
}

export async function createSellerProfile(profileData: any): Promise<any> {
    const sb = checkSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    let logoUrl = null;
    if (profileData.logo) {
        const file = profileData.logo;
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        await sb.storage.from('seller_logos').upload(filePath, file, { upsert: true });
        const { data } = sb.storage.from('seller_logos').getPublicUrl(filePath);
        logoUrl = data.publicUrl;
    }

    const { data, error } = await sb.from('sellers').upsert({
        id: user.id,
        company_name: profileData.company_name,
        description: profileData.description,
        shipping_policy: profileData.shipping_policy,
        return_policy: profileData.return_policy,
        logo_url: logoUrl,
    }).select().single();

    if (error) throw error;
    return data;
}

async function uploadProductImages(files: File[], sellerId: string): Promise<string[]> {
    const sb = checkSupabase();
    const uploadPromises = files.map(async file => {
        const filePath = `${sellerId}/${Date.now()}_${file.name}`;
        const { error } = await sb.storage.from('product_images').upload(filePath, file);
        if (error) throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        const { data } = sb.storage.from('product_images').getPublicUrl(filePath);
        return data.publicUrl;
    });
    return Promise.all(uploadPromises);
}

export async function createProduct(productDetails: any): Promise<any> {
    const sb = checkSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const imageUrls = await uploadProductImages(productDetails.images, user.id);

    const { data: newProduct, error: productError } = await sb
        .from('products')
        .insert({
            name: productDetails.name,
            description: productDetails.description,
            category_id: parseInt(productDetails.category_id, 10),
            seller_id: user.id,
            min_order_quantity: parseInt(productDetails.min_order_quantity, 10),
            image_url: imageUrls[0] || null,
            images: imageUrls.length > 1 ? imageUrls.slice(1) : [],
        })
        .select()
        .single();
    
    if (productError) throw productError;

    const variantsToInsert = productDetails.variants.map((v: any) => ({
        product_id: newProduct.id,
        name: v.name,
        paper_type: v.paper_type,
        price_per_unit: parseFloat(v.price_per_unit),
    }));

    if (variantsToInsert.length > 0) {
        const { error: variantError } = await sb.from('product_variants').insert(variantsToInsert);
        if (variantError) {
            await sb.from('products').delete().eq('id', newProduct.id);
            throw variantError;
        }
    }

    return newProduct;
}

// MESSAGING API
export async function getConversations(): Promise<Conversation[]> {
    const sb = checkSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await sb
        .from('conversation_participants')
        .select('conversation_id, profiles(id, full_name)')
        .neq('user_id', user.id);

    if (error) throw error;
    
    // This is a simplified fetch. A real app might use an RPC to get last message + unread count.
    return data.map((item: any) => ({
        id: item.conversation_id.toString(),
        other_user: {
            id: item.profiles.id,
            name: item.profiles.full_name,
        },
        last_message: null, // To be implemented
        unread_count: 0,    // To be implemented
    }));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    const sb = checkSupabase();
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(m => ({...m, id: m.id.toString()}));
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
    const sb = checkSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await sb
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content
        })
        .select()
        .single();
    
    if (error) throw error;
    return {...data, id: data.id.toString() };
}

export async function getOrCreateConversation(recipientId: string): Promise<string> {
    const sb = checkSupabase();
    const { data, error } = await sb.rpc('get_or_create_conversation', {
        recipient_id: recipientId
    });

    if (error) throw error;
    return data.toString();
}

// Existing functions
export async function getOrders(): Promise<Order[]> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('orders').select('*'); // Should be user-specific
    if (error) throw error;
    return data.map(o => ({
        id: o.id.toString(),
        date: o.created_at,
        status: o.status,
        total: o.total,
        shippingAddress: (o.shipping_address as any)?.address || 'N/A',
        items: [],
        statusHistory: []
    }));
}

export async function getOrderById(id: string): Promise<Order | null> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('orders').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
     return {
        id: data.id.toString(),
        date: data.created_at,
        status: data.status,
        total: data.total,
        shippingAddress: (data.shipping_address as any)?.address || 'N/A',
        items: [],
        statusHistory: [{status: 'Pending', date: data.created_at}]
    };
}

export async function getNotifications(): Promise<Notification[]> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(n => ({
        id: n.id.toString(),
        message: n.message,
        date: n.created_at,
        read: n.is_read,
        link: n.link
    }));
}