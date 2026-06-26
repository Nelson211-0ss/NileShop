import { api } from '@/lib/api';
import type {
  ApiResponse,
  HomeData,
  Product,
  Category,
  Brand,
  Cart,
  Order,
  Address,
  WalletData,
  Vendor,
  AdminDashboard,
  PaymentGateway,
} from '@nileshop/types';

export const homeApi = {
  get: () => api.get<ApiResponse<HomeData>>('/home').then((r) => r.data),
};

export const catalogApi = {
  categories: () => api.get<ApiResponse<Category[]>>('/catalog/categories').then((r) => r.data),
  brands: () => api.get<ApiResponse<Brand[]>>('/catalog/brands').then((r) => r.data),
};

export const productApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Product[]>>('/products', { params }).then((r) => r.data),
  get: (slug: string) => api.get<ApiResponse<Product>>(`/products/${slug}`).then((r) => r.data),
  search: (q: string) =>
    api.get<ApiResponse<Product[]>>('/products/search', { params: { q } }).then((r) => r.data),
};

export const cartApi = {
  get: () => api.get<ApiResponse<Cart>>('/cart').then((r) => r.data),
  add: (product_id: number, quantity = 1, product_variant_id?: number) =>
    api.post<ApiResponse<Cart>>('/cart/items', { product_id, quantity, product_variant_id }).then((r) => r.data),
  update: (itemId: number, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId: number) => api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`).then((r) => r.data),
  clear: () => api.delete<ApiResponse<null>>('/cart').then((r) => r.data),
};

export const orderApi = {
  list: () => api.get<ApiResponse<Order[]>>('/orders').then((r) => r.data),
  get: (uuid: string) => api.get<ApiResponse<Order>>(`/orders/${uuid}`).then((r) => r.data),
  checkout: (data: {
    shipping_address: Record<string, string>;
    billing_address?: Record<string, string>;
    coupon_code?: string;
    notes?: string;
    payment_gateway: PaymentGateway;
    shipping_zone_id?: number;
  }) => api.post<ApiResponse<{ order: Order; payment: Record<string, unknown> }>>('/orders/checkout', data).then((r) => r.data),
  cancel: (uuid: string) => api.post<ApiResponse<Order>>(`/orders/${uuid}/cancel`).then((r) => r.data),
  track: (uuid: string) => api.get<ApiResponse<Order>>(`/orders/track/${uuid}`).then((r) => r.data),
};

export const addressApi = {
  list: () => api.get<ApiResponse<Address[]>>('/addresses').then((r) => r.data),
  create: (data: Partial<Address>) => api.post<ApiResponse<Address>>('/addresses', data).then((r) => r.data),
  update: (id: number, data: Partial<Address>) => api.put<ApiResponse<Address>>(`/addresses/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/addresses/${id}`),
};

export const wishlistApi = {
  list: () => api.get<ApiResponse<Product[]>>('/wishlist').then((r) => r.data),
  add: (product_id: number) => api.post('/wishlist', { product_id }),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
};

export const walletApi = {
  get: () => api.get<ApiResponse<WalletData>>('/wallet').then((r) => r.data),
};

export const uploadApi = {
  images: (form: FormData) =>
    api.post<ApiResponse<{ path: string; url: string }[]>>('/upload/images', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};

export const vendorApi = {
  get: (slug: string) => api.get<ApiResponse<Vendor>>(`/vendors/${slug}`).then((r) => r.data),
  products: (slug: string) => api.get<ApiResponse<Product[]>>(`/vendors/${slug}/products`).then((r) => r.data),
  myStore: () => api.get<ApiResponse<Vendor>>('/vendor/store').then((r) => r.data),
  myOrders: () => api.get<ApiResponse<Order[]>>('/vendor/orders').then((r) => r.data),
  myProducts: () => api.get<ApiResponse<Product[]>>('/vendor/products').then((r) => r.data),
  getProduct: (id: number) => api.get<ApiResponse<Product>>(`/vendor/products/${id}`).then((r) => r.data),
  createProduct: (data: Record<string, unknown>) => api.post<ApiResponse<Product>>('/vendor/products', data).then((r) => r.data),
  updateProduct: (id: number, data: Record<string, unknown>) => api.put<ApiResponse<Product>>(`/vendor/products/${id}`, data).then((r) => r.data),
  deleteProduct: (id: number) => api.delete(`/vendor/products/${id}`),
};

export const adminApi = {
  dashboard: () => api.get<ApiResponse<AdminDashboard>>('/admin/dashboard').then((r) => r.data),
  vendors: (status?: string) => api.get<ApiResponse<Vendor[]>>('/admin/vendors', { params: { status } }).then((r) => r.data),
  approveVendor: (id: number) => api.post(`/admin/vendors/${id}/approve`),
  rejectVendor: (id: number) => api.post(`/admin/vendors/${id}/reject`),
  orders: () => api.get<ApiResponse<Order[]>>('/admin/orders').then((r) => r.data),
  products: () => api.get<ApiResponse<Product[]>>('/admin/products').then((r) => r.data),
  users: () => api.get<ApiResponse<import('@nileshop/types').User[]>>('/admin/users').then((r) => r.data),
  deliveries: () => api.get<ApiResponse<AdminDelivery[]>>('/admin/deliveries').then((r) => r.data),
  riders: () => api.get<ApiResponse<AdminRider[]>>('/admin/deliveries/riders').then((r) => r.data),
  assignDelivery: (uuid: string, riderId: number) =>
    api.post(`/admin/deliveries/${uuid}/assign`, { rider_id: riderId }),
};

interface AdminDelivery {
  uuid: string;
  status: string;
  order?: { order_number: string };
  rider?: { id: number; name: string };
}

interface AdminRider {
  id: number;
  name: string;
  phone?: string;
}

export const couponApi = {
  validate: (code: string, subtotal: number) =>
    api.post<ApiResponse<{ code: string; discount: number }>>('/coupons/validate', { code, subtotal }).then((r) => r.data),
};
