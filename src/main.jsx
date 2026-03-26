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
 * Vercel static hosting often returns 404 for deep links like /admin/login unless rewrites apply.
 * HashRouter keeps the path in the fragment (#/admin/login) so the server always serves / and the app boots.
 * Set VITE_USE_HASH_ROUTER=true on any host that has the same issue (e.g. custom domain on Vercel).
 */
const useHashRouter =
  import.meta.env.VITE_USE_HASH_ROUTER === 'true' ||
  (typeof window !== 'undefined' && /\.vercel\.app$/i.test(window.location.hostname));

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
