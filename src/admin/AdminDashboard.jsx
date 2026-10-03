import React, { useEffect, useState } from 'react';
import { useAdmin } from './AdminContext.jsx';

export default function AdminDashboard({ onStatsUpdate }) {
  const { authFetch, navigate } = useAdmin();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, ordersRes] = await Promise.all([
          authFetch('/api/admin/stats'),
          authFetch('/api/admin/orders'),
        ]);

        if (!statsRes.ok || !ordersRes.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        if (isMounted) {
          setStats(statsData.stats);
          if (onStatsUpdate) {
            onStatsUpdate(statsData.stats.newOrders);
          }
          setRecentOrders((ordersData.orders || []).slice(0, 6));
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Error loading dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [authFetch, onStatsUpdate]);

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
      {/* Page Title & Actions */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Dashboard</h1>
          <p className="admin-page-desc">
            Monitor real-time customer orders, production progress, and workshop fulfillment.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => navigate('/admin/orders')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Manage All Orders</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {/* Total Orders */}
        <div className="admin-kpi-card" onClick={() => navigate('/admin/orders')}>
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Total Orders</span>
            <div className="admin-kpi-icon icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">
            {loading ? <span className="kpi-skeleton" /> : stats?.totalOrders ?? 0}
          </div>
          <div className="admin-kpi-foot">All customer submissions</div>
        </div>

        {/* New Orders */}
        <div
          className="admin-kpi-card kpi-highlight"
          onClick={() => navigate('/admin/orders')}
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">New Orders</span>
            <div className="admin-kpi-icon icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">
            {loading ? <span className="kpi-skeleton" /> : stats?.newOrders ?? 0}
          </div>
          <div className="admin-kpi-foot">
            <span className="foot-status-dot" /> Awaiting confirmation
          </div>
        </div>

        {/* Orders In Production */}
        <div className="admin-kpi-card" onClick={() => navigate('/admin/orders')}>
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Orders in Production</span>
            <div className="admin-kpi-icon icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">
            {loading ? <span className="kpi-skeleton" /> : stats?.inProductionOrders ?? 0}
          </div>
          <div className="admin-kpi-foot">Active stringing & weaving</div>
        </div>

        {/* Shipped Orders */}
        <div className="admin-kpi-card" onClick={() => navigate('/admin/orders')}>
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Shipped Orders</span>
            <div className="admin-kpi-icon icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">
            {loading ? <span className="kpi-skeleton" /> : stats?.shippedOrders ?? 0}
          </div>
          <div className="admin-kpi-foot">Dispatched with courier (COD)</div>
        </div>
      </div>

      {/* Workshop Summary Card + Recent Orders */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Recent Customer Orders</h2>
            <p className="admin-card-subtitle">
              Latest incoming custom string-art portrait requests
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => navigate('/admin/orders')}
          >
            View All ({stats?.totalOrders ?? 0}) &rarr;
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-box">
            <span className="admin-spinner" /> Loading recent orders...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="admin-empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Orders Received Yet</h3>
            <p>Orders submitted from the customer storefront will appear here automatically.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
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
                        Inspect &rarr;
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
