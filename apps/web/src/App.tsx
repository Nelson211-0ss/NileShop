import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { ProtectedRoute, RoleRoute } from '@/components/ProtectedRoute';
import { CustomerDashboardLayout } from '@/components/dashboard/CustomerDashboardLayout';
import { VendorDashboardLayout } from '@/components/dashboard/VendorDashboardLayout';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { RiderDashboardLayout } from '@/components/dashboard/RiderDashboardLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VendorRegisterPage } from '@/features/auth/pages/VendorRegisterPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { CartPage } from '@/features/cart/pages/CartPage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { OrdersPage, OrderDetailPage } from '@/features/orders/pages/OrdersPage';
import { AccountPage } from '@/features/account/pages/AccountPage';
import { WalletPage } from '@/features/account/pages/WalletPage';
import { AddressesPage } from '@/features/account/pages/AddressesPage';
import { WishlistPage } from '@/features/wishlist/pages/WishlistPage';
import { VendorDashboardPage } from '@/features/vendor/pages/VendorDashboardPage';
import { VendorProductFormPage } from '@/features/vendor/pages/VendorProductFormPage';
import { VendorProductEditPage } from '@/features/vendor/pages/VendorProductEditPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { MessagesPage } from '@/features/messages/pages/MessagesPage';
import { VendorMessagesPage } from '@/features/vendor/pages/VendorMessagesPage';
import { RiderDashboardPage } from '@/features/rider/pages/RiderDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/vendor-register" element={<VendorRegisterPage />} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

                <Route element={<ProtectedRoute><CustomerDashboardLayout /></ProtectedRoute>}>
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:uuid" element={<OrderDetailPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/addresses" element={<AddressesPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/messages/:id" element={<MessagesPage />} />
                </Route>

                <Route element={<ProtectedRoute><RoleRoute roles={['vendor']}><VendorDashboardLayout /></RoleRoute></ProtectedRoute>}>
                  <Route path="/vendor" element={<VendorDashboardPage />} />
                  <Route path="/vendor/messages" element={<VendorMessagesPage />} />
                  <Route path="/vendor/messages/:id" element={<VendorMessagesPage />} />
                  <Route path="/vendor/products/new" element={<VendorProductFormPage />} />
                  <Route path="/vendor/products/:id/edit" element={<VendorProductEditPage />} />
                </Route>

                <Route element={<RoleRoute roles={['delivery_rider']}><RiderDashboardLayout /></RoleRoute>}>
                  <Route path="/rider" element={<RiderDashboardPage />} />
                </Route>

                <Route element={<RoleRoute roles={['administrator']}><AdminDashboardLayout /></RoleRoute>}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
