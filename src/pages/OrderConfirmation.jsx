import { Link, useLocation } from 'react-router-dom';
import { formatMoney } from '../utils/format';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order?.order_number) {
    return (
      <main className="store-main">
        <div className="store-empty">
          <p>No order details here.</p>
          <Link to="/">Back to shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="store-main order-confirmation">
      <h1 className="cart-title">Order placed</h1>
      <p className="order-confirmation-number">
        Order <strong>{order.order_number}</strong>
      </p>
      <p className="store-muted">
        Status: <strong>{order.status}</strong>
        {order.fulfillment_store?.name && (
          <>
            {' '}
            · Fulfilment: {order.fulfillment_store.name} ({order.fulfillment_store.code})
          </>
        )}
      </p>
      <p className="store-muted">
        Total due: <strong>{formatMoney(order.grand_total)}</strong> (routing mode:{' '}
        {order.routing_mode})
      </p>
      <p className="store-muted order-confirmation-note">
        Next step: complete payment via IfthenPay / Klarna. When the provider calls your webhook,
        this order will move to <strong>paid</strong>.
      </p>
      <p className="product-detail-back">
        <Link to="/">Continue shopping</Link>
      </p>
    </main>
  );
}
