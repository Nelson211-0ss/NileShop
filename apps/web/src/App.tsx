import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthProvider } from '@/components/AuthProvider';
import { ProtectedRoute, RoleRoute } from '@/components/ProtectedRoute';
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
import { RiderDashboardPage } from '@/features/rider/pages/RiderDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:uuid" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/vendor" element={<RoleRoute roles={['vendor']}><VendorDashboardPage /></RoleRoute>} />
                <Route path="/vendor/products/new" element={<RoleRoute roles={['vendor']}><VendorProductFormPage /></RoleRoute>} />
                <Route path="/vendor/products/:id/edit" element={<RoleRoute roles={['vendor']}><VendorProductEditPage /></RoleRoute>} />
                <Route path="/rider" element={<RoleRoute roles={['delivery_rider']}><RiderDashboardPage /></RoleRoute>} />
                <Route path="/admin" element={<RoleRoute roles={['administrator']}><AdminDashboardPage /></RoleRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
