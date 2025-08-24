export interface Seller {
  id: string;
  name: string;
  logoUrl: string;
  response_time: number; // in hours
  rating: number;
  reviews: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Small", "Medium", "Large"
  paperType: string; // e.g., "Kraft", "Cardboard"
  pricePerUnit: number;
}

export interface Product {
  id: string;
  name: string;
  seller: Seller;
  category: string;
  imageUrl: string;
  images: string[];
  description: string;
  minOrderQuantity: number;
  rating: number;
  reviewsCount: number;
  variants: ProductVariant[];
  faqs: { question: string; answer: string; }[];
  reviews: Review[];
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'Pending' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: Product[];
  shippingAddress: string;
  statusHistory: { status: string; date: string; }[];
}

export interface Notification {
    id: string;
    message: string;
    date: string;
    read: boolean;
    link: string;
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  switchRole: () => void;
}
