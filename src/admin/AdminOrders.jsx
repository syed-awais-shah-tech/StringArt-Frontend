import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAdmin } from './AdminContext.jsx';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'new', label: 'New' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_production', label: 'In Production' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrders() {
  const { authFetch, navigate } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Compute status counts for tab badges
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    orders.forEach((o) => {
      counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filter orders by tab and search
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (activeTab !== 'all' && o.orderStatus !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const numMatch = o.orderNumber?.toLowerCase().includes(q);
        const nameMatch = o.customer?.fullName?.toLowerCase().includes(q);
        const cityMatch = o.customer?.city?.toLowerCase().includes(q);
        const phoneMatch = o.customer?.phone?.toLowerCase().includes(q);
        return numMatch || nameMatch || cityMatch || phoneMatch;
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const formatPrice = (price, currency = 'GBP') => {
    if (currency === 'PKR') {
      return `Rs. ${Number(price || 0).toLocaleString()}`;
    }
    return `£${Number(price || 0).toLocaleString()}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
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

  return (
    <div className="admin-page-view">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-header-title-row">
            <h1 className="admin-page-title">Orders</h1>
            <span className="admin-count-pill">{orders.length} total</span>
          </div>
          <p className="admin-page-desc">
            Manage customer orders, update statuses, inspect uploaded images, and export sequence files.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={fetchOrders}
            disabled={loading}
            title="Refresh order list"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Main Orders Table Card */}
      <div className="admin-card">
        {/* Status Filter Tabs */}
        <div className="admin-tabs-bar">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {count > 0 && <span className="tab-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or customer name..."
            />
            {searchQuery && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="admin-loading-box">
            <span className="admin-spinner" /> Fetching orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Orders Found</h3>
            <p>
              {searchQuery
                ? `No orders matching "${searchQuery}" in this view.`
                : 'No orders have been placed in this status category.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.orderNumber}
                    className="admin-table-row-clickable"
                    onClick={() => navigate(`/admin/orders/${ord.orderNumber}`)}
                  >
                    <td>
                      <span className="order-number-tag">{ord.orderNumber}</span>
                    </td>
                    <td className="text-muted">{formatDate(ord.createdAt)}</td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{ord.customer?.fullName || '—'}</span>
                        <span className="customer-sub">{ord.customer?.city || 'Pakistan'}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="order-price">
                        {formatPrice(ord.product?.price, ord.product?.currency)}
                      </strong>
                    </td>
                    <td>
                      <span className="payment-method-tag">
                        {ord.paymentMethod?.toUpperCase() || 'COD'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getPaymentStatusBadgeClass(ord.paymentStatus)}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getOrderStatusBadgeClass(ord.orderStatus)}`}>
                        {ord.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-table-action-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${ord.orderNumber}`);
                        }}
                      >
                        Details &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
