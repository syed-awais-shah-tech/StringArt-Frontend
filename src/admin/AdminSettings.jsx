import React, { useState } from 'react';
import { useAdmin } from './AdminContext.jsx';

export default function AdminSettings() {
  const { admin, authFetch } = useAdmin();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'An error occurred while changing password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="admin-page-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Settings</h1>
          <p className="admin-page-desc">
            Store configuration, workshop parameters, and administrative controls.
          </p>
        </div>
      </div>

      {/* Security & Change Password Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Security &amp; Change Password</h2>
        </div>
        <div className="admin-settings-section">
          {passwordError && (
            <div className="admin-alert admin-alert-danger" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="admin-alert admin-alert-success" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
            <div className="settings-field-group">
              <label className="admin-label" htmlFor="current-pwd">Current Password</label>
              <input
                id="current-pwd"
                type="password"
                className="admin-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmittingPassword}
              />
            </div>

            <div className="settings-field-group">
              <label className="admin-label" htmlFor="new-pwd">New Password (minimum 8 characters)</label>
              <input
                id="new-pwd"
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isSubmittingPassword}
              />
            </div>

            <div className="settings-field-group">
              <label className="admin-label" htmlFor="confirm-pwd">Confirm New Password</label>
              <input
                id="confirm-pwd"
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isSubmittingPassword}
              />
            </div>

            <div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">General Information (Placeholder)</h2>
        </div>
        <div className="admin-settings-section">
          <div className="settings-field-group">
            <label className="admin-label">Store Name</label>
            <input
              type="text"
              className="admin-input"
              value="StringArt Pakistan — Custom String Art Studio"
              readOnly
              disabled
            />
          </div>

          <div className="settings-field-group">
            <label className="admin-label">Support & Contact Email</label>
            <input
              type="text"
              className="admin-input"
              value={admin?.email || 'Store Administrator'}
              readOnly
              disabled
            />
          </div>

          <div className="settings-field-group">
            <label className="admin-label">Payment Gateway Mode</label>
            <input
              type="text"
              className="admin-input"
              value="Cash on Delivery (COD) Only — Online Gateways Disabled"
              readOnly
              disabled
            />
          </div>

          <div className="settings-field-group">
            <label className="admin-label">Workshop Production Specs</label>
            <input
              type="text"
              className="admin-input"
              value="Standard 200 Pins Loom &bull; 480mm Circular Frame &bull; Monofilament Black Thread"
              readOnly
              disabled
            />
          </div>

          <div className="admin-info-callout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Phase 4 Notice:</strong> Administrative settings are currently managed via server environment configuration and presets. Dynamic store settings will be customizable in future updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
