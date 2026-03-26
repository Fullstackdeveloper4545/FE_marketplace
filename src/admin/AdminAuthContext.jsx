/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAdminTenantSlug } from './adminClient';

/** Browser session key for admin API auth; value must match backend env ADMIN_API_KEY (never commit the real key). */
const STORAGE_KEY = 'dm_admin_key';
const TENANT_KEY = 'dm_tenant_slug';

const AdminAuthContext = createContext({
  adminKey: '',
  setAdminKey: () => {},
  tenantSlug: 'default',
  setTenantSlug: () => {},
  logout: () => {},
  isAuthed: false,
});

export function AdminAuthProvider({ children }) {
  const [adminKey, setAdminKeyState] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [tenantSlug, setTenantSlugState] = useState(() => sessionStorage.getItem(TENANT_KEY) || 'default');

  useEffect(() => {
    setAdminTenantSlug(tenantSlug);
    sessionStorage.setItem(TENANT_KEY, tenantSlug);
  }, [tenantSlug]);

  const setAdminKey = (key) => {
    setAdminKeyState(key);
    sessionStorage.setItem(STORAGE_KEY, key);
  };

  const setTenantSlug = (slug) => {
    setTenantSlugState(String(slug || 'default').trim() || 'default');
  };

  const logout = () => {
    setAdminKeyState('');
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      adminKey,
      setAdminKey,
      tenantSlug,
      setTenantSlug,
      logout,
      isAuthed: Boolean(adminKey),
    }),
    [adminKey, tenantSlug]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
