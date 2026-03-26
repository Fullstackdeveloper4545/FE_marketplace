import { useEffect, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminSchedules() {
  const { adminKey, tenantSlug } = useAdminAuth();
  const [stores, setStores] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [reportType, setReportType] = useState('pending_orders');
  const [frequency, setFrequency] = useState('daily');
  const [storeId, setStoreId] = useState('');
  const [recipientsStr, setRecipientsStr] = useState('');
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch('/admin/report-schedules', adminKey);
      setSchedules(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }

  async function loadStores() {
    try {
      const data = await apiAdminFetch('/admin/stores', adminKey);
      setStores(data.items || []);
    } catch {
      setStores([]);
    }
  }

  useEffect(() => {
    loadStores().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, tenantSlug]);

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  async function createSchedule() {
    setCreating(true);
    setError(null);
    try {
      const recipients = recipientsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        report_type: reportType,
        store_id: storeId.trim() ? storeId.trim() : null,
        frequency,
        recipients,
        is_active: true,
      };

      await apiAdminFetch('/admin/report-schedules', adminKey, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await refresh();
    } catch (e) {
      setError(e.message || 'Could not create schedule');
    } finally {
      setCreating(false);
    }
  }

  async function runDueSchedules() {
    setRunning(true);
    setRunMessage(null);
    setError(null);
    try {
      const data = await apiAdminFetch('/admin/reports/run-schedules', adminKey, { method: 'POST' });
      const results = data.results || [];
      const ok = results.filter((r) => r.ok).length;
      setRunMessage(`Processed ${results.length} due schedule(s): ${ok} ok.`);
    } catch (e) {
      setError(e.message || 'Run failed');
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Report schedules</h1>
      <p className="admin-help">
        <strong>Schedules</strong> automate recurring reports (e.g. the pending-orders pipeline) and email them to your
        team. Pick <strong>daily</strong> or <strong>weekly</strong>, optionally scope to one physical store, and list
        recipient emails. The backend sends mail when <code className="admin-mono">SMTP_HOST</code> and{' '}
        <code className="admin-mono">SMTP_FROM</code> are set; run <code className="admin-mono">npm run report:schedules</code>{' '}
        on a cron (e.g. daily) to process due schedules.
      </p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-filters">
        <label className="admin-field">
          <span className="store-field-label">report_type</span>
          <input className="cart-coupon-input" value={reportType} onChange={(e) => setReportType(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">frequency</span>
          <select className="store-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
          </select>
        </label>
        <label className="admin-field">
          <span className="store-field-label">Store (optional)</span>
          <select className="store-select" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">All stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span className="store-field-label">recipients (comma-separated emails)</span>
          <input
            className="cart-coupon-input"
            value={recipientsStr}
            onChange={(e) => setRecipientsStr(e.target.value)}
            placeholder="a@x.com,b@y.com"
          />
        </label>
        <button className="btn-primary" type="button" onClick={() => createSchedule()} disabled={creating}>
          {creating ? 'Creating…' : 'Create'}
        </button>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => runDueSchedules()}
          disabled={running}
          title="Runs pending schedules for this tenant (same logic as cron)"
        >
          {running ? 'Running…' : 'Run due schedules now'}
        </button>
      </div>

      {runMessage && <p className="admin-help admin-help--success">{runMessage}</p>}

      <h2 className="admin-subtitle">{loading ? 'Loading…' : 'Schedules'}</h2>
      <ul className="admin-schedules-list">
        {schedules.map((s) => (
          <li key={s.id}>
            <strong>{s.report_type}</strong> · {s.frequency} ·{' '}
            <span className="store-muted">{s.store_id ? s.store_id : 'all stores'}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

