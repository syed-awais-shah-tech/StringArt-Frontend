import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from './AdminContext.jsx';
import { getDataUrl, getApiUrl } from '../config/api.js';

const ORDER_STATUS_OPTIONS = [
  { value: 'new', label: 'New (Pending Review)' },
  { value: 'confirmed', label: 'Confirmed (Accepted)' },
  { value: 'in_production', label: 'In Production (Weaving)' },
  { value: 'shipped', label: 'Shipped (In Transit)' },
  { value: 'delivered', label: 'Delivered (Completed)' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending (Due on Delivery)' },
  { value: 'paid', label: 'Paid (Cash Collected)' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetail({ orderId }) {
  const { authFetch, navigate } = useAdmin();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status edit state
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [showSequenceModal, setShowSequenceModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) {
        throw new Error(`Order ${orderId} not found`);
      }
      const data = await res.json();
      setOrder(data.order);
      setOrderStatus(data.order.orderStatus || 'new');
      setPaymentStatus(data.order.paymentStatus || 'pending');
    } catch (err) {
      setError(err.message || 'Error loading order details');
    } finally {
      setLoading(false);
    }
  }, [authFetch, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      const res = await authFetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setOrder((prev) => ({
        ...prev,
        orderStatus: data.order.orderStatus,
        paymentStatus: data.order.paymentStatus,
        updatedAt: data.order.updatedAt,
      }));

      setUpdateMessage({
        type: 'success',
        text: `Order status updated to "${data.order.orderStatus.replace('_', ' ')}" & payment to "${data.order.paymentStatus}".`,
      });

      setTimeout(() => setUpdateMessage(null), 5000);
    } catch (err) {
      setUpdateMessage({
        type: 'error',
        text: err.message || 'Failed to update order',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price, currency = order?.product?.currency || 'GBP') => {
    if (currency === 'PKR') {
      return `Rs. ${Number(price || 0).toLocaleString()}`;
    }
    return `£${Number(price || 0).toLocaleString()}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatusBadgeClass = (status) => {
    switch (status) {
      case 'new':
        return 'badge-blue';
      case 'confirmed':
        return 'badge-cyan';
      case 'in_production':
        return 'badge-purple';
      case 'shipped':
        return 'badge-amber';
      case 'delivered':
        return 'badge-green';
      case 'cancelled':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'badge-green';
      case 'pending':
        return 'badge-amber';
      case 'refunded':
      case 'cancelled':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  // Helper to resolve static file URLs reliably
  const resolveFileUrl = (filePath) => {
    return getDataUrl(filePath);
  };

  // Helper to trigger direct sequence download with cookie auth
  const handleDownloadSequence = async () => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/sequence`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orderId}-sequence.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download sequence:', err);
      alert('Could not download sequence file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-page-view">
        <div className="admin-loading-box">
          <span className="admin-spinner" /> Loading order {orderId}...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-page-view">
        <div className="admin-alert admin-alert-danger">
          <span>{error || 'Order not found'}</span>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => navigate('/admin/orders')}
        >
          &larr; Back to Orders
        </button>
      </div>
    );
  }

  const hasStatusChanged =
    orderStatus !== order.orderStatus || paymentStatus !== order.paymentStatus;

  return (
    <div className="admin-page-view">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="admin-order-topbar">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate('/admin/orders')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Orders</span>
        </button>

        <div className="admin-order-id-group">
          <h1 className="admin-order-heading">{order.orderNumber}</h1>
          <span className={`status-badge ${getOrderStatusBadgeClass(order.orderStatus)}`}>
            {order.orderStatus.replace('_', ' ')}
          </span>
          <span className={`status-badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>

        <div className="admin-order-meta-date">
          Placed on {formatDate(order.createdAt)}
        </div>
      </div>

      {updateMessage && (
        <div
          className={`admin-alert ${
            updateMessage.type === 'success' ? 'admin-alert-success' : 'admin-alert-danger'
          }`}
        >
          <span>{updateMessage.text}</span>
        </div>
      )}

      {/* 2-Column Shopify-Style Layout */}
      <div className="admin-order-grid">
        {/* ── Left Column: Production Assets & Product ─────────────────────── */}
        <div className="admin-order-main">
          {/* Visual Artwork & Production Assets Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Artwork & String Art Production</h2>
                <p className="admin-card-subtitle">
                  Verify customer photo, generated preview, and physical workshop sequence
                </p>
              </div>
            </div>

            <div className="admin-artwork-comparison">
              {/* Original Customer Image */}
              <div className="artwork-box">
                <div className="artwork-box-header">
                  <span className="artwork-box-title">Original Upload</span>
                  {order.files?.originalImage && (
                    <a
                      href={resolveFileUrl(order.files.originalImage)}
                      target="_blank"
                      rel="noreferrer"
                      className="artwork-link"
                    >
                      View Full &nearr;
                    </a>
                  )}
                </div>
                <div className="artwork-img-wrapper">
                  {order.files?.originalImage ? (
                    <img
                      src={resolveFileUrl(order.files.originalImage)}
                      alt="Original Customer Upload"
                      className="artwork-img"
                    />
                  ) : (
                    <div className="artwork-missing">Image not available</div>
                  )}
                </div>
              </div>

              {/* Generated String Art Preview */}
              <div className="artwork-box">
                <div className="artwork-box-header">
                  <span className="artwork-box-title">String-Art Preview</span>
                  {order.files?.previewImage && (
                    <a
                      href={resolveFileUrl(order.files.previewImage)}
                      target="_blank"
                      rel="noreferrer"
                      className="artwork-link"
                    >
                      View Full &nearr;
                    </a>
                  )}
                </div>
                <div className="artwork-img-wrapper dark-bg">
                  {order.files?.previewImage ? (
                    <img
                      src={resolveFileUrl(order.files.previewImage)}
                      alt="Generated String Art Preview"
                      className="artwork-img"
                    />
                  ) : (
                    <div className="artwork-missing">Preview not available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sequence File & Workshop Download Box */}
            <div className="sequence-production-box">
              <div className="sequence-box-info">
                <div className="sequence-file-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="sequence-meta">
                  <div className="sequence-filename">
                    {order.files?.sequenceFile ? `${order.orderNumber}-sequence.txt` : 'sequence.txt'}
                  </div>
                  <div className="sequence-sub">
                    Nail pinning instructions for workshop stringing loom
                  </div>
                </div>
              </div>

              <div className="sequence-box-actions">
                {order.sequenceFileContent && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setShowSequenceModal(!showSequenceModal)}
                  >
                    {showSequenceModal ? 'Hide Sequence' : 'Inspect Sequence'}
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  onClick={handleDownloadSequence}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Sequence File</span>
                </button>
              </div>
            </div>

            {/* Collapsible Sequence Preview */}
            {showSequenceModal && order.sequenceFileContent && (
              <div className="sequence-preview-accordion">
                <div className="sequence-preview-header">
                  <span>Sequence Instructions Preview (first 100 lines)</span>
                  <span className="sequence-line-count">
                    {order.sequenceFileContent.split('\n').length} steps
                  </span>
                </div>
                <pre className="sequence-code-preview">
                  {order.sequenceFileContent.split('\n').slice(0, 100).join('\n')}
                  {order.sequenceFileContent.split('\n').length > 100 && (
                    <span className="sequence-more-indicator">
                      {'\n'}... [{order.sequenceFileContent.split('\n').length - 100} more steps in full file]
                    </span>
                  )}
                </pre>
              </div>
            )}
          </div>

          {/* Product & Order Items Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Product Details</h2>
            </div>
            <div className="admin-product-row">
              <div className="product-thumb">
                {order.files?.previewImage ? (
                  <img src={resolveFileUrl(order.files.previewImage)} alt="Product Thumbnail" />
                ) : (
                  <div className="product-thumb-placeholder">🧵</div>
                )}
              </div>
              <div className="product-details">
                <div className="product-title-text">
                  {order.product?.name || 'Custom String Art Portrait Kit & Framed Artwork'}
                </div>
                <div className="product-attributes">
                  <span>Size: 480mm Round Board</span> &bull;{' '}
                  <span>Nails: 200–250 Pin Loom</span> &bull;{' '}
                  <span>Lines: ~3,000 Monofilament Threads</span>
                </div>
              </div>
              <div className="product-pricing">
                <div className="product-price-val">
                  {formatPrice(order.product?.price)}
                </div>
                <div className="product-qty">Qty: 1</div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="admin-cost-breakdown">
              <div className="cost-line">
                <span>Subtotal</span>
                <span>{formatPrice(order.product?.price)}</span>
              </div>
              <div className="cost-line">
                <span>Shipping (Nationwide Express COD)</span>
                <span className="cost-free">FREE</span>
              </div>
              <div className="cost-line total-line">
                <span>Total Due</span>
                <span>{formatPrice(order.product?.price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Status & Customer Info ─────────────────────────── */}
        <div className="admin-order-sidebar">
          {/* Order & Payment Status Management Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Manage Status</h2>
            </div>

            <form onSubmit={handleUpdateStatus} className="status-management-form">
              {/* Order Status */}
              <div className="admin-form-group">
                <label htmlFor="order-status-select" className="admin-label">
                  Fulfillment / Order Status
                </label>
                <select
                  id="order-status-select"
                  className="admin-select"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div className="admin-form-group">
                <label htmlFor="payment-status-select" className="admin-label">
                  Payment Status
                </label>
                <select
                  id="payment-status-select"
                  className="admin-select"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`admin-btn ${
                  hasStatusChanged ? 'admin-btn-primary' : 'admin-btn-secondary'
                } admin-btn-block`}
                disabled={isUpdating || !hasStatusChanged}
              >
                {isUpdating ? 'Saving Changes...' : hasStatusChanged ? 'Save Status Changes' : 'Status Saved'}
              </button>
            </form>
          </div>

          {/* Customer Information Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Customer Information</h2>
            </div>
            <div className="customer-info-block">
              <div className="customer-info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value customer-strong">
                  {order.customer?.fullName || '—'}
                </span>
              </div>

              <div className="customer-info-item">
                <span className="info-label">Phone Number</span>
                {order.customer?.phone ? (
                  <a href={`tel:${order.customer.phone}`} className="info-value phone-link">
                    {order.customer.phone}
                  </a>
                ) : (
                  <span className="info-value">—</span>
                )}
              </div>

              <div className="customer-info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">
                  {order.customer?.email ? (
                    <a href={`mailto:${order.customer.email}`} className="text-link">
                      {order.customer.email}
                    </a>
                  ) : (
                    <span className="text-muted">None provided</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Shipping Address Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Shipping Address</h2>
            </div>
            <div className="shipping-address-block">
              <div className="shipping-name">{order.customer?.fullName}</div>
              <div className="shipping-street">{order.customer?.address || '—'}</div>
              <div className="shipping-city">
                {order.customer?.city || '—'}, Pakistan
              </div>

              <div className="delivery-method-box">
                <div className="method-label">Payment & Delivery Method</div>
                <div className="method-value">
                  <span className="cod-badge">Cash on Delivery (COD)</span>
                </div>
                <div className="method-hint">
                  Collect {formatPrice(order.product?.price)} upon handover
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
