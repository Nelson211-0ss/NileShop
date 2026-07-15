export type UserRole = 'customer' | 'vendor' | 'delivery_rider' | 'administrator';

export interface User {
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  locale: string;
  currency: string;
  timezone: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  is_active: boolean;
  roles: UserRole[];
  created_at: string;
}

export interface AuthTokenResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page?: number;
  per_page?: number;
  total?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  locale?: string;
  currency?: string;
}

export interface Vendor {
  id: number;
  store_name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: string | null;
  status: string;
  rating: number;
  total_reviews: number;
  is_featured: boolean;
  address?: string | null;
  city: string | null;
  country: string;
  contact_phone?: string | null;
  contact_email?: string | null;
}

export interface CustomerActivity {
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  body: string;
  sender_id: number;
  sender?: { id: number; name: string };
  read_at?: string | null;
  created_at: string;
  is_mine?: boolean;
}

export interface Conversation {
  id: number;
  vendor?: Vendor;
  customer?: { id: number; name: string; avatar?: string | null };
  product?: { id: number; name: string; slug: string } | null;
  last_message?: ChatMessage | null;
  messages?: ChatMessage[];
  unread_count: number;
  last_message_at?: string | null;
  peer_name?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  id: number;
  path: string;
  url: string;
  alt?: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  sku?: string;
  price: number;
  compare_price?: number;
  stock: number;
  weight?: number;
  status: string;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  total_sales: number;
  tags?: string[];
  specifications?: Record<string, string>;
  warranty?: string;
  vendor?: Vendor;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  created_at?: string;
}

export interface ProductVariant {
  id: number;
  sku?: string;
  name: string;
  attributes?: Record<string, string>;
  price: number;
  stock: number;
  image?: string;
  is_active: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
  vendor?: Vendor;
}

export interface Cart {
  id: number;
  currency: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
}

export interface Address {
  id: number;
  label?: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  type: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
  vendor?: Vendor;
}

export interface OrderStatusHistory {
  status: string;
  note?: string;
  created_at: string;
}

export interface Order {
  uuid: string;
  order_number: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  coupon_code?: string;
  shipping_address?: Record<string, string>;
  billing_address?: Record<string, string>;
  notes?: string;
  items?: OrderItem[];
  status_histories?: OrderStatusHistory[];
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  user?: { name: string; avatar?: string };
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
  position: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomeData {
  banners: Banner[];
  featured_products: Product[];
  best_sellers: Product[];
  flash_sale?: {
    name: string;
    ends_at: string;
    products: Product[];
  };
}

export interface WalletData {
  balance: number;
  currency: string;
  transactions: Array<{
    type: string;
    amount: number;
    balance_after: number;
    description: string;
    created_at: string;
  }>;
}

export interface AdminDashboard {
  total_users: number;
  total_vendors: number;
  pending_vendors: number;
  total_products: number;
  published_products: number;
  total_orders: number;
  pending_orders: number;
  active_deliveries: number;
  revenue_today: number;
  revenue_month: number;
}

export interface SalesReportPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  total_sales: number;
  price: number;
}

export interface SalesReport {
  daily_sales: SalesReportPoint[];
  top_products: TopProduct[];
  total_revenue: number;
  total_orders: number;
}

export type PaymentGateway = 'cash_on_delivery' | 'bank_transfer' | 'mobile_money' | 'wallet' | 'card';
