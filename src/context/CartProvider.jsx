import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext } from './cartContext';
import { useLocale } from '../hooks/useLocale';
import { apiDelete, apiFetch, apiPatch, apiPost } from '../api/client';

const STORAGE_KEY = 'dm_cart_id';

export function CartProvider({ children }) {
  const { locale } = useLocale();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      setCart(null);
      return;
    }
    try {
      const c = await apiFetch(`/carts/${id}?locale=${encodeURIComponent(locale)}`);
      setCart(c);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setCart(null);
    }
  }, [locale]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ensureCart = useCallback(async () => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (id) {
      try {
        const c = await apiFetch(`/carts/${id}?locale=${encodeURIComponent(locale)}`);
        setCart(c);
        return c;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    const c = await apiPost('/carts', { locale });
    localStorage.setItem(STORAGE_KEY, c.id);
    setCart(c);
    return c;
  }, [locale]);

  const addItem = useCallback(
    async (productId, variantId = null, quantity = 1) => {
      setLoading(true);
      try {
        await ensureCart();
        const id = localStorage.getItem(STORAGE_KEY);
        const c = await apiPost(`/carts/${id}/items`, {
          product_id: productId,
          variant_id: variantId,
          quantity,
          locale,
        });
        setCart(c);
        return c;
      } finally {
        setLoading(false);
      }
    },
    [ensureCart, locale]
  );

  const updateLineQty = useCallback(
    async (lineId, quantity) => {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) return;
      const c = await apiPatch(`/carts/${id}/items/${lineId}`, { quantity, locale });
      setCart(c);
      return c;
    },
    [locale]
  );

  const removeLine = useCallback(
    async (lineId) => {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) return;
      const c = await apiDelete(`/carts/${id}/items/${lineId}?locale=${encodeURIComponent(locale)}`);
      setCart(c);
      return c;
    },
    [locale]
  );

  const applyCoupon = useCallback(
    async (code) => {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) throw new Error('No cart');
      const c = await apiPost(`/carts/${id}/coupon`, { code, locale });
      setCart(c);
      return c;
    },
    [locale]
  );

  const clearCoupon = useCallback(async () => {
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) return;
    const c = await apiDelete(`/carts/${id}/coupon?locale=${encodeURIComponent(locale)}`);
    setCart(c);
    return c;
  }, [locale]);

  const placeOrder = useCallback(
    async (payload) => {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) throw new Error('No cart');
      setLoading(true);
      try {
        const result = await apiPost('/orders', {
          cart_id: id,
          locale,
          ...payload,
        });
        localStorage.removeItem(STORAGE_KEY);
        setCart(null);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      refresh,
      ensureCart,
      addItem,
      updateLineQty,
      removeLine,
      applyCoupon,
      clearCoupon,
      placeOrder,
    }),
    [
      cart,
      loading,
      refresh,
      ensureCart,
      addItem,
      updateLineQty,
      removeLine,
      applyCoupon,
      clearCoupon,
      placeOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
