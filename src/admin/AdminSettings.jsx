import React from 'react';
import { useAdmin } from './AdminContext.jsx';

export default function AdminSettings() {
  const { admin } = useAdmin();

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
              value={admin?.email || 'admin@stringart.io'}
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
