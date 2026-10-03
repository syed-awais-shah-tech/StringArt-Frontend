import React, { useState } from 'react';

/**
 * OrderForm.jsx — Customer Order Form with Cash on Delivery (COD)
 *
 * Fields:
 *   - Full Name (required)
 *   - Email (optional)
 *   - Phone Number (required)
 *   - Address (required)
 *   - City (required)
 *   - Payment Method: Cash on Delivery (only)
 */
export default function OrderForm({
  imagePreviewUrl,
  previewData,
  stats,
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery Address is required.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <div className="order-form-container">
      {/* Back button */}
      <div className="order-form-top-nav">
        <button
          type="button"
          className="btn-back-link"
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Back to Preview
        </button>
      </div>

      <div className="order-form-header">
        <span className="badge-pill">Step 4 · Checkout</span>
        <h2 className="order-form-title">Complete Your Order</h2>
        <p className="order-form-subtitle">
          Please enter your delivery details below. Pay in cash when your handcrafted string art piece arrives at your door.
        </p>
      </div>

      {submitError && (
        <div className="order-form-alert error" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-text">
            <strong>Order Notice:</strong> {submitError}
          </div>
        </div>
      )}

      <div className="order-form-layout">
        {/* Left Column: Input Form */}
        <form className="order-fields-card" onSubmit={handleSubmit} noValidate>
          <div className="form-section-title">
            <span className="section-step-num">1</span>
            <h3>Delivery Information</h3>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="order-fullName" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="order-fullName"
              name="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'has-error' : ''}`}
              placeholder="e.g. Sarah Jenkins"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <span className="field-error-msg">{errors.fullName}</span>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="form-group">
            <div className="label-with-optional">
              <label htmlFor="order-email" className="form-label">
                Email Address
              </label>
              <span className="optional-badge">Optional</span>
            </div>
            <input
              id="order-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. sarah@example.com (for order updates)"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="order-phone" className="form-label">
              Phone Number <span className="required-star">*</span>
            </label>
            <input
              id="order-phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'has-error' : ''}`}
              placeholder="e.g. +44 7911 123456 (for courier delivery)"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <span className="field-error-msg">{errors.phone}</span>
            )}
          </div>

          {/* Delivery Address */}
          <div className="form-group">
            <label htmlFor="order-address" className="form-label">
              Street Address <span className="required-star">*</span>
            </label>
            <textarea
              id="order-address"
              name="address"
              rows={2}
              className={`form-textarea ${errors.address ? 'has-error' : ''}`}
              placeholder="House/flat number, building name, and street"
              value={formData.address}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.address && (
              <span className="field-error-msg">{errors.address}</span>
            )}
          </div>

          {/* City */}
          <div className="form-group">
            <label htmlFor="order-city" className="form-label">
              Town / City <span className="required-star">*</span>
            </label>
            <input
              id="order-city"
              name="city"
              type="text"
              className={`form-input ${errors.city ? 'has-error' : ''}`}
              placeholder="e.g. London"
              value={formData.city}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.city && (
              <span className="field-error-msg">{errors.city}</span>
            )}
          </div>

          {/* Payment Method Section: Cash on Delivery Only */}
          <div className="payment-method-section">
            <div className="form-section-title">
              <span className="section-step-num">2</span>
              <h3>Payment Method</h3>
            </div>

            <div className="cod-choice-card selected">
              <div className="cod-header-row">
                <div className="cod-radio-indicator">
                  <span className="cod-radio-dot"></span>
                </div>
                <div className="cod-info">
                  <div className="cod-title-row">
                    <span className="cod-icon">💵</span>
                    <strong className="cod-title">Cash on Delivery (COD)</strong>
                    <span className="badge-tag">Only payment method</span>
                  </div>
                  <p className="cod-desc">
                    Pay in cash when your piece is physically delivered to your doorstep. No prepayment or online card details required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="form-submit-row">
            <button
              id="btn-submit-order"
              type="submit"
              className="btn btn-primary-dark btn-large w-full btn-submit-order"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-inline"></span>
                  <span>Placing Order…</span>
                </>
              ) : (
                <span>Confirm Order — £175 (Cash on Delivery)</span>
              )}
            </button>
            <span className="submit-security-note">
              🛡️ Zero prepayment risk · Verified handcrafted order
            </span>
          </div>
        </form>

        {/* Right Column: Order Preview Summary */}
        <div className="order-summary-sidebar">
          <div className="summary-sticky-box">
            <h4 className="summary-title">Your Custom Artwork</h4>

            {/* Visual Preview */}
            <div className="summary-visual-card">
              <div className="summary-preview-thumb">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Custom String Art Source"
                    className="summary-img"
                  />
                ) : (
                  <div className="summary-img-placeholder">🧵</div>
                )}
                <span className="summary-preview-badge">Custom Woven Portrait</span>
              </div>

              <div className="summary-product-details">
                <strong className="product-title">Handcrafted String Art</strong>
                <span className="product-spec">50 cm Circular Baltic Birchboard</span>
                <span className="product-spec">Continuous tensioned thread</span>
                <span className="product-spec">Ready to hang (mount included)</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="summary-price-breakdown">
              <div className="price-line">
                <span>Handmade Custom Piece</span>
                <span>£175.00</span>
              </div>
              <div className="price-line">
                <span>Delivery (UK & International)</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="price-divider"></div>
              <div className="price-line total-line">
                <strong>Total Due on Delivery</strong>
                <strong className="total-amount">£175.00</strong>
              </div>
            </div>

            <div className="summary-guarantee-box">
              <div className="guarantee-item">
                <span>✓</span>
                <span>100% Tensioned thread, zero ink</span>
              </div>
              <div className="guarantee-item">
                <span>✓</span>
                <span>Handcrafted by master makers</span>
              </div>
              <div className="guarantee-item">
                <span>✓</span>
                <span>Pay cash upon courier arrival</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
