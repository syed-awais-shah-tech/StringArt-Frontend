import React from 'react';

/**
 * OrderSuccess.jsx — Order Success Confirmation Page
 *
 * Displays:
 *   - Order number e.g. SA-1001
 *   - Delivery summary
 *   - Cash on Delivery details
 *   - Artwork thumbnail
 *   - Action to create another artwork
 */
export default function OrderSuccess({ order, imagePreviewUrl, onNewArt }) {
  if (!order) return null;

  const {
    orderNumber,
    customer = {},
    product = {},
    paymentMethod = 'COD',
    paymentStatus = 'pending',
    orderStatus = 'new',
    createdAt,
  } = order;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Today';

  return (
    <div className="order-success-container">
      {/* Success Hero Banner */}
      <div className="order-success-header">
        <div className="success-icon-badge">✓</div>
        <span className="badge-pill success">Order Confirmed</span>
        <h2 className="success-title">Thank You, {customer.fullName}!</h2>
        <p className="success-subtitle">
          Your custom string art order has been successfully placed. We have saved your blueprint and queued it for handcrafted production.
        </p>

        <div className="order-number-banner">
          <span className="order-number-label">Your Order Number</span>
          <span className="order-number-val" id="confirmed-order-number">{orderNumber}</span>
          <span className="order-number-date">Placed on {formattedDate}</span>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="order-success-cards-grid">
        {/* Card 1: Artwork Item */}
        <div className="success-card">
          <h4 className="success-card-title">1. Your Custom Piece</h4>
          <div className="success-artwork-row">
            <div className="success-artwork-thumb">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Your Custom Portrait" className="success-thumb-img" />
              ) : (
                <div className="success-thumb-fallback">🧵</div>
              )}
            </div>
            <div className="success-artwork-info">
              <strong className="artwork-name">{product.name || 'Custom Handcrafted String Art (50 cm)'}</strong>
              <span className="artwork-meta">Solid Baltic birchwood · 50 cm circular</span>
              <span className="artwork-meta">Over 1.5 km unbroken tensioned thread</span>
              <span className="artwork-price">£{product.price || 175}.00</span>
            </div>
          </div>
        </div>

        {/* Card 2: Delivery Details */}
        <div className="success-card">
          <h4 className="success-card-title">2. Delivery Address</h4>
          <div className="success-detail-list">
            <div className="detail-item">
              <span className="detail-label">Recipient:</span>
              <span className="detail-val">{customer.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-val">{customer.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-val">{customer.address}, {customer.city}</span>
            </div>
            {customer.email && (
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-val">{customer.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Payment & Production Status */}
        <div className="success-card highlight-card">
          <h4 className="success-card-title">3. Payment & Delivery Terms</h4>
          <div className="success-detail-list">
            <div className="detail-item">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-val">
                <strong>Cash on Delivery (COD)</strong>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment Status:</span>
              <span className="status-badge-pending">
                Pending (£{product.price || 175}.00 on delivery)
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Order Status:</span>
              <span className="status-badge-new">
                {orderStatus === 'new' ? 'New (Queued for Crafting)' : orderStatus}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Estimated Delivery:</span>
              <span className="detail-val">~2 weeks (Handcrafted to order)</span>
            </div>
          </div>

          <div className="cod-instruction-notice">
            <span className="notice-icon">💡</span>
            <p>
              Please keep <strong>£{product.price || 175}.00</strong> in cash ready when the courier arrives at your address.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="order-success-actions">
        <button
          type="button"
          className="btn btn-primary-dark btn-large"
          onClick={onNewArt}
        >
          <span>🧵 Create Another String Art</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary-light"
          onClick={() => window.print()}
        >
          <span>🖨️ Print Order Summary</span>
        </button>
      </div>
    </div>
  );
}
