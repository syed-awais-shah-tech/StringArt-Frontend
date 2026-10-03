import React from 'react';
import { useAdmin } from './AdminContext.jsx';

export default function AdminLayout({ children, activeTab, newOrdersCount = 0 }) {
  const { admin, logout, navigate } = useAdmin();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      path: '/admin/orders',
      badge: newOrdersCount > 0 ? newOrdersCount : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/admin/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-shell">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        {/* Brand & Store Switcher */}
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 2 15 22 2 12 22 12" />
            </svg>
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">StringArt</span>
            <span className="admin-brand-badge">Admin</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-sidebar-nav" aria-label="Admin Navigation">
          <div className="admin-nav-section-title">Store Management</div>
          <ul className="admin-nav-list">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="admin-nav-item">
                  <button
                    type="button"
                    className={`admin-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="admin-nav-icon">{item.icon}</span>
                    <span className="admin-nav-label">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="admin-nav-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="admin-nav-section-title">Quick Links</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <a
                href="/"
                className="admin-nav-link"
                target="_blank"
                rel="noreferrer"
                title="Open customer storefront in a new tab"
              >
                <span className="admin-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </span>
                <span className="admin-nav-label">View Storefront</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-user-avatar">
              {(admin?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{admin?.name || 'Administrator'}</span>
              <span className="admin-user-email">{admin?.email || 'admin@stringart.io'}</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={logout}
            title="Log out of admin session"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ───────────────────────────────────────────────────── */}
      <div className="admin-main-wrap">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-pill">Shopify-style Order Engine</span>
            <span className="admin-topbar-status-dot" />
            <span className="admin-topbar-mode">Production Ready</span>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-topbar-store-btn"
              onClick={() => navigate('/admin/orders')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Quick Search</span>
            </button>
            <a
              href="/"
              className="admin-topbar-link"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
            >
              Online Store &rarr;
            </a>
          </div>
        </header>

        {/* Content View */}
        <main className="admin-content-container">{children}</main>
      </div>
    </div>
  );
}
