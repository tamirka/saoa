// =============================================
// DATABASE-ALIGNED TYPES
// =============================================

export interface Profile {
  id: string; // UUID
  full_name: string;
  role: 'buyer' | 'seller';
}

export interface Seller extends Profile {
  company_name: string;
  description: string;
  logo_url: string;
  shipping_policy: string;
  return_policy: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  seller_id: string; // UUID
  category_id: number;
  name: string;
  description: string;
  min_order_quantity: number;
  images: string[]; // Array of image URLs
  created_at: string;
  // Joined properties
  sellers?: Seller;
  categories?: Category;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  paper_type: string;
  price_per_unit: number;
}

export interface Order {
  id: number;
  user_id: string;
  total: number;
  status: 'Pending' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
  shipping_address: any; // JSONB
  created_at: string;
  order_items: OrderItemWithProduct[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id: number;
    quantity: number;
    unit_price: number;
    artwork_url: string | null;
}

export interface OrderItemWithProduct extends OrderItem {
    products: {
        name: string;
        images: string[];
    }
}

export interface Notification {
    id: number;
    user_id: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
  conversation_id: number;
  other_user_id: string;
  other_user_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

// =============================================
// CONTEXT & UI-SPECIFIC TYPES
// =============================================

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface CartItem {
  id: string; // Combination of product.id and variant.id
  product: Product;
  quantity: number;
  selectedVariant: ProductVariant;
  uploadedFile?: {
    name: string;
  };
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface ToastContextType {
    addToast: (message: string, type: Toast['type']) => void;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  switchToSeller: () => void;
  switchToBuyer: () => void;
}
