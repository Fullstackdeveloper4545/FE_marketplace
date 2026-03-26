import { useEffect, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminModules() {
  const { adminKey, tenantSlug } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState('');
  const [notice, setNotice] = useState('');
  const [toast, setToast] = useState('');
  const [pendingToggle, setPendingToggle] = useState(null);

  async function load() {
    setError(null);
    const data = await apiAdminFetch('/admin/modules', adminKey);
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message || 'Failed to load modules'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, tenantSlug]);

  function requestToggle(moduleKey, enabled) {
    const current = items.find((m) => m.module_key === moduleKey);
    if (!current) return;
    if (moduleKey === 'admin' && !enabled) {
      setToast('Admin module cannot be disabled.');
      return;
    }
    setPendingToggle({ moduleKey, enabled });
  }

  async function confirmToggle() {
    if (!pendingToggle) return;
    const { moduleKey, enabled } = pendingToggle;

    setLoading(true);
    setError(null);
    setSaved('');
    setNotice('');
    setToast('');
    try {
      await apiAdminFetch(`/admin/modules/${encodeURIComponent(moduleKey)}`, adminKey, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      setItems((prev) => prev.map((m) => (m.module_key === moduleKey ? { ...m, enabled } : m)));
      const msg = enabled
        ? `Module "${moduleKey}" has been enabled.`
        : `Module "${moduleKey}" has been disabled.`;
      setSaved(msg);
      setNotice(msg);
      setToast(msg);
    } catch (e) {
      setError(e.message || 'Could not save module');
    } finally {
      setPendingToggle(null);
      setLoading(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Modules</h1>
      <p className="admin-lead">Enable or disable platform modules per project.</p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="store-muted">{saved}</p>}
      {notice && <p className="store-muted">{notice}</p>}
      {toast && (
        <div className="admin-toast" role="status">
          <span>{toast}</span>
          <button
            type="button"
            className="admin-toast-close"
            onClick={() => setToast('')}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {pendingToggle && (
        <section className="admin-card admin-confirm">
          <p>
            Confirm: <strong>{pendingToggle.enabled ? 'Enable' : 'Disable'}</strong> module{' '}
            <strong>{pendingToggle.moduleKey}</strong>?
          </p>
          <div className="admin-actions-row">
            <button className="btn-primary" type="button" disabled={loading} onClick={confirmToggle}>
              {loading ? 'Saving…' : 'Confirm'}
            </button>
            <button
              className="admin-btn"
              type="button"
              disabled={loading}
              onClick={() => setPendingToggle(null)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <section className="admin-card">
        {items.length === 0 ? (
          <p className="store-muted">No modules found.</p>
        ) : (
          <ul className="admin-orders-flat">
            {items.map((m) => (
              <li key={m.module_key}>
                <div className="admin-module-row">
                  <div>
                    <strong>{m.module_key}</strong>
                  </div>
                  {m.module_key === 'admin' ? (
                    <span className="store-muted">always enabled (system)</span>
                  ) : (
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={Boolean(m.enabled)}
                        disabled={loading}
                        onChange={(e) => requestToggle(m.module_key, e.target.checked)}
                      />
                      <span>{m.enabled ? 'enabled' : 'disabled'}</span>
                    </label>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

