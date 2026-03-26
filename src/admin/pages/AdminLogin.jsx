import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAdminAuth } from '../AdminAuthContext';

/**
 * Admin login: paste the same string as backend/.env ADMIN_API_KEY.
 * It is saved in sessionStorage (key dm_admin_key) — not in source code. Never commit secrets.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdminKey } = useAdminAuth();
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!key.trim()) {
      setError('Admin key is required.');
      return;
    }

    setAdminKey(key.trim());
    await Swal.fire({
      icon: 'success',
      title: 'Signed in',
      text: 'Welcome to admin dashboard.',
      timer: 1400,
      showConfirmButton: false,
    });
    navigate('/admin/reports/pending-orders', { replace: true });
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Admin login</h1>
      <p className="admin-lead">Enter the API key used to protect admin routes.</p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <form className="admin-form" onSubmit={onSubmit}>
        <label className="admin-field">
          <span className="store-field-label">ADMIN_API_KEY</span>
          <input
            className="cart-coupon-input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button className="btn-primary" type="submit">
          Login
        </button>
      </form>
    </main>
  );
}

