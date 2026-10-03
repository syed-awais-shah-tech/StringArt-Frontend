import React, { useState } from 'react';
import { useAdmin } from './AdminContext.jsx';
import { getApiUrl } from '../config/api.js';

export default function AdminForgotPassword() {
  const { navigate } = useAdmin();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please provide your admin email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(getApiUrl('/api/admin/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setMessage(
        data.message ||
          'If this email is registered as an administrator, a password reset link has been sent.'
      );
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="admin-login-title">Reset Admin Password</h1>
          <p className="admin-login-subtitle">
            Enter your admin email address to receive a secure password reset link.
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

        {message && (
          <div className="admin-alert admin-alert-success" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{message}</span>
          </div>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="reset-email" className="admin-label">
                Admin Email
              </label>
              <input
                id="reset-email"
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

            <button
              type="submit"
              className="admin-btn admin-btn-primary admin-btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-spinner-content">
                  <span className="admin-spinner" /> Sending Reset Link...
                </span>
              ) : (
                'Send Password Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-block"
              onClick={() => navigate('/admin/login')}
            >
              Return to Login
            </button>
          </div>
        )}

        <div className="admin-login-footer">
          <a
            href="/admin/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/login');
            }}
            className="admin-back-store-link"
          >
            &larr; Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
