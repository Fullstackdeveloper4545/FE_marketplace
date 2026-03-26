import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './context/LocaleProvider';
import { CartProvider } from './context/CartProvider';
import Layout from './pages/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLayout from './admin/AdminLayout';
import { AdminAuthProvider } from './admin/AdminAuthContext';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminPendingOrders from './admin/pages/AdminPendingOrders';
import AdminSchedules from './admin/pages/AdminSchedules';
import AdminOrders from './admin/pages/AdminOrders';
import AdminInvoices from './admin/pages/AdminInvoices';
import AdminRouting from './admin/pages/AdminRouting';
import AdminProducts from './admin/pages/AdminProducts';
import AdminCategories from './admin/pages/AdminCategories';
import AdminAttributes from './admin/pages/AdminAttributes';
import AdminShopifyIntegration from './admin/pages/AdminShopifyIntegration';
import AdminModules from './admin/pages/AdminModules';
import AdminShipping from './admin/pages/AdminShipping';
import './index.css';

/**
 * Static hosts (Vercel, S3, etc.) often 404 on /admin/login. HashRouter uses #/… so only / must resolve.
 * Production defaults to HashRouter. Set VITE_USE_HASH_ROUTER=false only if your host rewrites all paths to index.html.
 */
const useHashRouter =
  import.meta.env.VITE_USE_HASH_ROUTER === 'true' ||
  (import.meta.env.VITE_USE_HASH_ROUTER !== 'false' && import.meta.env.PROD);

/**
 * HashRouter only reads location.hash. If Vercel rewrites /admin/login → index.html but the URL bar
 * still shows /admin/login (no #), React would render the "/" route (home). Sync once to #/admin/login.
 */
if (typeof window !== 'undefined' && useHashRouter) {
  const { pathname, search, hash, origin } = window.location;
  const hasHashRoute = hash.length > 1;
  if (!hasHashRoute && pathname !== '/' && !pathname.startsWith('/api')) {
    const lastSeg = pathname.split('/').pop() || '';
    const looksLikeFile = /\.[a-z0-9]{1,8}$/i.test(lastSeg);
    if (!looksLikeFile) {
      const isSpaPath =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/product') ||
        pathname === '/cart' ||
        pathname === '/checkout' ||
        pathname.startsWith('/order');
      if (isSpaPath) {
        window.location.replace(`${origin}/#${pathname}${search}`);
      }
    }
  }
}

const Router = useHashRouter ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <Router>
    <LocaleProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/confirmation" element={<OrderConfirmation />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminAuthProvider>
                <AdminLayout />
              </AdminAuthProvider>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports/pending-orders" element={<AdminPendingOrders />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="routing" element={<AdminRouting />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="attributes" element={<AdminAttributes />} />
            <Route path="shopify" element={<AdminShopifyIntegration />} />
            <Route path="modules" element={<AdminModules />} />
            <Route path="shipping" element={<AdminShipping />} />
          </Route>
        </Routes>
      </CartProvider>
    </LocaleProvider>
  </Router>
);
