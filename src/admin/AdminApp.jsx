import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './AdminContext.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminForgotPassword from './AdminForgotPassword.jsx';
import AdminResetPassword from './AdminResetPassword.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminOrders from './AdminOrders.jsx';
import AdminOrderDetail from './AdminOrderDetail.jsx';
import AdminSettings from './AdminSettings.jsx';
import './admin.css';

function AdminRouter() {
  const { isAuthenticated, isLoading, currentPath, navigate } = useAdmin();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  if (isLoading) {
    return (
      <div className="admin-loading-screen">
        <span className="admin-spinner admin-spinner-lg" />
        <p>Verifying admin session...</p>
      </div>
    );
  }

  const pathname = currentPath.split('?')[0];

  // If unauthenticated: allow login, forgot-password, and reset-password
  if (!isAuthenticated) {
    if (pathname === '/admin/forgot-password') {
      return <AdminForgotPassword />;
    }
    if (pathname === '/admin/reset-password') {
      return <AdminResetPassword />;
    }
    if (pathname !== '/admin/login') {
      navigate('/admin/login');
    }
    return <AdminLogin />;
  }

  // If authenticated and user visits any auth pages, redirect to /admin
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password'
  ) {
    navigate('/admin');
    return null;
  }

  // Route matching
  if (currentPath === '/admin' || currentPath === '/admin/') {
    return (
      <AdminLayout activeTab="dashboard" newOrdersCount={newOrdersCount}>
        <AdminDashboard onStatsUpdate={setNewOrdersCount} />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/orders' || currentPath === '/admin/orders/') {
    return (
      <AdminLayout activeTab="orders" newOrdersCount={newOrdersCount}>
        <AdminOrders />
      </AdminLayout>
    );
  }

  if (currentPath.startsWith('/admin/orders/')) {
    const orderId = currentPath.replace(/^\/admin\/orders\//, '').split('/')[0];
    return (
      <AdminLayout activeTab="orders" newOrdersCount={newOrdersCount}>
        <AdminOrderDetail orderId={decodeURIComponent(orderId)} />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/settings' || currentPath === '/admin/settings/') {
    return (
      <AdminLayout activeTab="settings" newOrdersCount={newOrdersCount}>
        <AdminSettings />
      </AdminLayout>
    );
  }

  // Default fallback for any unmatched /admin/* route
  return (
    <AdminLayout activeTab="dashboard" newOrdersCount={newOrdersCount}>
      <AdminDashboard onStatsUpdate={setNewOrdersCount} />
    </AdminLayout>
  );
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminRouter />
    </AdminProvider>
  );
}
