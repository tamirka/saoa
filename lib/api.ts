import { supabase } from './supabaseClient';
import type { Product, Category, Order, Notification, Review } from '../types';

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
    images: p.images,
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

    // Sorting logic would be added here

    const { data, error } = await query;
    if (error) throw error;
    
    // Map simplified data structure for list view
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
            response_time: 0, rating: 0, reviews: 0 // Not fetched for list view
        },
        rating: 4.5, // Not fetched
        reviewsCount: 100, // Not fetched
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
    // Simplified mapping for seller dashboard
    return data.map((p:any) => ({
        id: p.id.toString(),
        name: p.name,
        imageUrl: p.image_url,
        minOrderQuantity: p.min_order_quantity,
        category: p.categories.name,
        seller: {} as any, rating: 0, reviewsCount: 0, images: [], variants: [], description: '', faqs: [], reviews: []
    }));
}

export async function getOrders(): Promise<Order[]> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('orders').select('*'); // Should be user-specific
    if (error) throw error;
    // This is a placeholder as items need to be fetched separately
    return data.map(o => ({
        id: o.id.toString(),
        date: o.created_at,
        status: o.status,
        total: o.total,
        shippingAddress: (o.shipping_address as any)?.address || 'N/A',
        items: [], // requires another query
        statusHistory: [] // requires another query or table
    }));
}

export async function getOrderById(id: string): Promise<Order | null> {
    const sb = checkSupabase();
    const { data, error } = await sb.from('orders').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
    // Also a placeholder
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
