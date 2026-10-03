import React, { useState } from 'react';
import { useAdmin } from './AdminContext.jsx';

export default function AdminLogin() {
  const { login, navigate } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both admin email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Brand Header */}
        <div className="admin-login-brand">
          <div className="admin-logo-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 2 15 22 2 12 22 12" />
            </svg>
          </div>
          <h1 className="admin-login-title">StringArt Admin</h1>
          <p className="admin-login-subtitle">
            Sign in to manage orders, customer requests, and workshop production.
          </p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-danger" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email" className="admin-label">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-form-group">
            <div className="admin-label-row">
              <label htmlFor="admin-password" className="admin-label">
                Password
              </label>
            </div>
            <input
              id="admin-password"
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary admin-btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-content">
                <span className="admin-spinner" /> Authenticating...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="admin-back-store-link"
          >
            &larr; Back to customer store
          </a>
        </div>
      </div>
    </div>
  );
}
