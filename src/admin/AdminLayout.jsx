import { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAdminAuth } from './AdminAuthContext';
import { apiAdminFetchNoTenant } from './adminClient';

export default function AdminLayout() {
  const { isAuthed, adminKey, tenantSlug, setTenantSlug, logout } = useAdminAuth();
  const [tenants, setTenants] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = location.pathname.startsWith('/admin/login');

  useEffect(() => {
    if (!isAuthed || !adminKey || isLoginRoute) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiAdminFetchNoTenant('/admin/tenants', adminKey);
        const items = data?.items || [];
        if (!cancelled) setTenants(items);
        if (!cancelled && items.length) {
          const current = sessionStorage.getItem('dm_tenant_slug') || 'default';
          if (!items.some((t) => t.slug === current)) {
            setTenantSlug(items[0].slug);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, adminKey, isLoginRoute, setTenantSlug]);

  async function handleLogout() {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Logout confirmation',
      text: 'Do you want to logout from admin?',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    logout();
    navigate('/admin/login', { replace: true });
  }

  if (!isAuthed && !isLoginRoute) return <Navigate to="/admin/login" replace />;

  if (!isAuthed) return <Outlet />;

  return (
    <div className="admin">
      <header className="admin-shell-header">
        <nav className="admin-nav">
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/reports/pending-orders">
            Pending
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/orders">
            Orders
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/invoices">
            Invoices
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/schedules">
            Schedules
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/routing">
            Routing
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/products">
            Products
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/attributes">
            Attributes
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/categories">
            Categories
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/shopify">
            Shopify
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/modules">
            Modules
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`} to="/admin/shipping">
            Shipping
          </NavLink>
        </nav>
        <div className="admin-shell-actions">
          {tenants.length > 0 && (
            <label className="admin-tenant-select">
              <span className="admin-tenant-label">Tenant</span>
              <select
                className="admin-input admin-tenant-input"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                aria-label="Active tenant"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="admin-logout" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

