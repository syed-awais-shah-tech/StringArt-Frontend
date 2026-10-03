import React, { useState, useEffect } from 'react';
import { useAdmin } from './AdminContext.jsx';
import { getApiUrl } from '../config/api.js';

export default function AdminResetPassword() {
  const { navigate } = useAdmin();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (!tokenParam) {
      setError('Invalid or missing password reset token. Please request a new link.');
    } else {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing reset token. Please request a new link.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(getApiUrl('/api/admin/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Your password has been reset successfully! You can now log in.');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="admin-login-title">Set New Password</h1>
          <p className="admin-login-subtitle">
            Choose a strong new password for your admin account.
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

        {success && (
          <div className="admin-alert admin-alert-success" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="new-password" className="admin-label">
                New Password (minimum 8 characters)
              </label>
              <input
                id="new-password"
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isSubmitting || !token}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="confirm-password" className="admin-label">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isSubmitting || !token}
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary admin-btn-block"
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? (
                <span className="btn-spinner-content">
                  <span className="admin-spinner" /> Updating Password...
                </span>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="admin-btn admin-btn-primary admin-btn-block"
            onClick={() => navigate('/admin/login')}
          >
            Go to Login
          </button>
        )}

        <div className="admin-login-footer">
          <a
            href="/admin/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/forgot-password');
            }}
            className="admin-back-store-link"
          >
            Request a new reset link
          </a>
        </div>
      </div>
    </div>
  );
}
