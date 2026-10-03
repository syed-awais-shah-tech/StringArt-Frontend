import React, { useRef } from 'react';
import CompareSlider from './CompareSlider.jsx';
import CanvasPreview from './CanvasPreview.jsx';
import OrderForm from './OrderForm.jsx';
import OrderSuccess from './OrderSuccess.jsx';

/**
 * HeroGenerator.jsx
 * Customer-Facing String Art Generator Flow:
 * Generate → Preview → Place Order → Order Form → COD → Order Created
 */
export default function HeroGenerator({
  params,
  setParam,
  imageFile,
  imagePreviewUrl,
  onSelectImage,
  uploadAndGenerate,
  status,
  error,
  generate,
  cancel,
  resetAll,
  previewData,
  stats,
  viewStep = 'studio',
  submittedOrder,
  isSubmittingOrder,
  submitOrderError,
  startOrder,
  backToPreview,
  submitOrder,
}) {
  const fileInputRef = useRef(null);

  const isRunning = status === 'running';
  const isDone = status === 'done' && previewData;

  // Helper to load sample image directly into engine
  const handleLoadSample = async (type = 'portrait') => {
    try {
      const src = type === 'dog' ? '/gallery/dog_original.jpg' : '/gallery/input.png';
      const filename = type === 'dog' ? 'golden-retriever-sample.jpg' : 'portrait-sample.png';
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type || 'image/png' });
      if (uploadAndGenerate) {
        uploadAndGenerate(file);
      } else {
        onSelectImage(file, true);
      }
    } catch (e) {
      console.error('Failed to load sample image', e);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadAndGenerate) {
        uploadAndGenerate(file);
      } else {
        onSelectImage(file, true);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (uploadAndGenerate) {
        uploadAndGenerate(file);
      } else {
        onSelectImage(file, true);
      }
    }
  };

  return (
    <section className="hero-section" id="preview-studio">
      <div className="hero-container">
        {/* Hero Header Copy */}
        <div className="hero-header-text">
          <div className="hero-pill-badge">
            <span className="hero-pill-dot"></span>
            Handmade String Art · 100% Tensioned Thread
          </div>
          <h1 className="hero-title">Turn your photo into string art</h1>
          <p className="hero-subtitle">
            Upload any portrait of a pet, partner, or cherished memory. Our studio engine transforms your image into thousands of continuous tensioned thread paths across a circular wooden board.
          </p>
        </div>

        {/* Generator Studio Card */}
        <div className="generator-card">
          {/* Stepper Header: 1. Upload → 2. Generate → 3. Preview → 4. Order */}
          <div className="stepper-nav" aria-label="Customer Order Flow">
            <div className="stepper-track"></div>

            {/* Step 1: Upload */}
            <div className="stepper-step">
              <div
                className={`stepper-node ${
                  viewStep === 'studio' && !imageFile && !isDone && !isRunning
                    ? 'active'
                    : 'completed'
                }`}
              >
                {viewStep === 'studio' && !imageFile && !isDone && !isRunning ? '1' : '✓'}
              </div>
              <span
                className={`stepper-label ${
                  viewStep === 'studio' && !imageFile && !isDone && !isRunning ? 'active' : ''
                }`}
              >
                1. Upload
              </span>
            </div>

            {/* Step 2: Generate */}
            <div className="stepper-step">
              <div
                className={`stepper-node ${
                  isRunning
                    ? 'active'
                    : isDone || viewStep !== 'studio'
                    ? 'completed'
                    : imageFile
                    ? 'ready'
                    : ''
                }`}
              >
                {isRunning ? (
                  <span className="spinner-inline"></span>
                ) : isDone || viewStep !== 'studio' ? (
                  '✓'
                ) : (
                  '2'
                )}
              </div>
              <span className={`stepper-label ${isRunning ? 'active' : ''}`}>
                2. Generate
              </span>
            </div>

            {/* Step 3: Preview */}
            <div className="stepper-step">
              <div
                className={`stepper-node ${
                  viewStep === 'studio' && isDone
                    ? 'active'
                    : viewStep === 'order-form' || viewStep === 'order-success'
                    ? 'completed'
                    : ''
                }`}
              >
                {viewStep === 'order-form' || viewStep === 'order-success' ? '✓' : '3'}
              </div>
              <span className={`stepper-label ${viewStep === 'studio' && isDone ? 'active' : ''}`}>
                3. Preview
              </span>
            </div>

            {/* Step 4: Order (COD) */}
            <div className="stepper-step">
              <div
                className={`stepper-node ${
                  viewStep === 'order-form'
                    ? 'active'
                    : viewStep === 'order-success'
                    ? 'active completed'
                    : ''
                }`}
              >
                {viewStep === 'order-success' ? '★' : '4'}
              </div>
              <span
                className={`stepper-label ${
                  viewStep === 'order-form' || viewStep === 'order-success' ? 'active' : ''
                }`}
              >
                4. Order (COD)
              </span>
            </div>
          </div>

          {/* Error Message (Generation Level) */}
          {error && viewStep === 'studio' && (
            <div className="studio-alert error" role="alert">
              <span className="studio-alert-icon">⚠️</span>
              <div className="studio-alert-content">
                <strong>Notice:</strong> {error}
                <button
                  type="button"
                  className="btn-alert-retry"
                  onClick={() => (resetAll ? resetAll() : onSelectImage(null))}
                >
                  Try another photo
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW A: Order Success View (Step 4 completed)
              ══════════════════════════════════════════════════════════════ */}
          {viewStep === 'order-success' && submittedOrder && (
            <OrderSuccess
              order={submittedOrder}
              imagePreviewUrl={imagePreviewUrl}
              onNewArt={resetAll}
            />
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW B: Order Form View (Step 4 active)
              ══════════════════════════════════════════════════════════════ */}
          {viewStep === 'order-form' && (
            <OrderForm
              imagePreviewUrl={imagePreviewUrl}
              previewData={previewData}
              stats={stats}
              onSubmit={submitOrder}
              onBack={backToPreview}
              isSubmitting={isSubmittingOrder}
              submitError={submitOrderError}
            />
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW C: Studio Generation & Preview View (Step 1, 2, 3)
              ══════════════════════════════════════════════════════════════ */}
          {viewStep === 'studio' && (
            <>
              {/* STATE 1: Upload Photo (Idle / No photo processing) */}
              {!imageFile && !isRunning && !isDone && (
                <div className="studio-idle-view">
                  {/* Interactive Before/After Preview Demo */}
                  <div className="studio-hero-preview">
                    <CompareSlider
                      originalSrc="/gallery/dog_original.jpg"
                      stringArtSrc="/gallery/dog_stringart.jpg"
                      originalLabel="Original Photo"
                      stringArtLabel="Woven String Art"
                    />
                    <span className="preview-caption">
                      Drag the slider to preview the transformation
                    </span>
                  </div>

                  {/* Upload Drop Zone */}
                  <div className="studio-upload-box">
                    <input
                      ref={fileInputRef}
                      id="hero-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />

                    <label
                      htmlFor="hero-file-input"
                      className="upload-drop-target"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <div className="upload-icon-circle">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 16V8M12 8l-3.5 3.5M12 8l3.5 3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 16.5v1.2A2.3 2.3 0 006.3 20h11.4a2.3 2.3 0 002.3-2.3v-1.2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span className="upload-main-text">Upload your photo</span>
                      <span className="upload-sub-text">
                        Drag & drop or click to choose · JPG, PNG, WEBP
                      </span>
                    </label>

                    {/* Example Photo Shortcuts */}
                    <div className="sample-triggers">
                      <span className="sample-triggers-label">Or test with an example portrait:</span>
                      <div className="sample-buttons">
                        <button
                          type="button"
                          className="btn-sample"
                          onClick={() => handleLoadSample('dog')}
                        >
                          <img
                            src="/gallery/dog_original.jpg"
                            alt="Golden Retriever"
                            className="sample-thumb"
                          />
                          Golden Retriever
                        </button>
                        <button
                          type="button"
                          className="btn-sample"
                          onClick={() => handleLoadSample('portrait')}
                        >
                          <img
                            src="/gallery/input.png"
                            alt="Portrait Model"
                            className="sample-thumb"
                          />
                          Portrait Model
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Helpful Recommendation */}
                  <div className="studio-tip-card">
                    <span className="studio-tip-icon">📸</span>
                    <div className="studio-tip-body">
                      <div className="studio-tip-title">Photo recommendation</div>
                      <div className="studio-tip-desc">
                        Close-up portraits of people or pets with clear lighting and simple backgrounds produce the most striking string art definition.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 2: Clean Loading / Generating State */}
              {isRunning && (
                <div className="studio-generating-card">
                  <div className="generating-visual">
                    <div className="generating-thumb-box">
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Your uploaded portrait"
                          className="generating-thumb-img"
                        />
                      ) : (
                        <div className="generating-thumb-placeholder">📷</div>
                      )}
                      <div className="generating-spinner-ring"></div>
                    </div>

                    <div className="generating-status-info">
                      <h3 className="generating-headline">Weaving your string art preview…</h3>
                      <p className="generating-subline">
                        Tracing continuous thread paths and balancing highlight & shadow depths for your portrait.
                      </p>
                      <div className="generating-time-indicator">
                        <span className="pulsing-dot"></span>
                        <span>Usually takes 5–8 seconds</span>
                      </div>
                    </div>
                  </div>

                  <div className="generating-action-row">
                    <button
                      type="button"
                      className="btn btn-secondary-light btn-sm"
                      onClick={cancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 2.1: Cancelled fallback (image present, not running, no result) */}
              {imageFile && !isRunning && !isDone && (
                <div className="studio-ready-view">
                  <div className="selected-photo-card">
                    <div className="selected-photo-preview">
                      <img src={imagePreviewUrl} alt="Selected photo" />
                    </div>
                    <div className="selected-photo-details">
                      <div className="selected-photo-name">{imageFile.name}</div>
                      <div className="selected-photo-size">
                        Ready to generate custom string art
                      </div>
                      <button
                        type="button"
                        className="btn-link-action"
                        onClick={resetAll}
                      >
                        Choose another photo
                      </button>
                    </div>
                  </div>

                  <div className="ready-action-box">
                    <button
                      type="button"
                      id="btn-trigger-generate"
                      className="btn btn-primary-dark btn-hero-generate"
                      onClick={() => generate()}
                    >
                      <span>🧵 Generate String Art Preview</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 3: Result & Place Order State (isDone) */}
              {isDone && (
                <div className="studio-result-view">
                  {/* Result Top Bar */}
                  <div className="result-header">
                    <div className="result-title-box">
                      <span className="badge-success">✓ Generation Complete</span>
                      <h3 className="result-heading">Your Handcrafted String Art Preview</h3>
                    </div>
                    <div className="result-actions">
                      <button
                        type="button"
                        className="btn btn-secondary-light btn-sm btn-try-another-top"
                        onClick={resetAll}
                      >
                        ← Try another photo
                      </button>
                    </div>
                  </div>

                  {/* Main Showcase Grid: String Art (Main Focus) + Original Photo & Specs */}
                  <div className="result-showcase-grid">
                    {/* Primary Column: Generated String Art (Main Focus) */}
                    <div className="result-primary-col">
                      <div className="result-canvas-frame">
                        <div className="artboard-wood-backdrop">
                          <CanvasPreview previewData={previewData} />
                        </div>
                      </div>
                    </div>

                    {/* Companion Column: Original Image & Piece Details */}
                    <div className="result-companion-col">
                      {/* Original Image Preview Card */}
                      <div className="original-photo-card">
                        <div className="original-photo-header">
                          <span className="card-badge">Original Photo</span>
                          <span className="card-meta">Uploaded Image</span>
                        </div>
                        <div className="original-photo-wrap">
                          <img
                            src={imagePreviewUrl}
                            alt="Original source portrait"
                            className="original-photo-img"
                          />
                        </div>
                      </div>

                      {/* Handcrafted Piece Specifications (Artisan, Non-technical) */}
                      <div className="product-specs-box">
                        <div className="spec-row">
                          <span className="spec-icon">📐</span>
                          <div className="spec-text">
                            <strong>50 cm Circular Artboard</strong>
                            <span>Solid Baltic birch wood with matte finish</span>
                          </div>
                        </div>

                        <div className="spec-row">
                          <span className="spec-icon">🧵</span>
                          <div className="spec-text">
                            <strong>100% Tensioned Thread</strong>
                            <span>Over 1.5 km of continuous unbroken thread</span>
                          </div>
                        </div>

                        <div className="spec-row">
                          <span className="spec-icon">📍</span>
                          <div className="spec-text">
                            <strong>Handcrafted Production</strong>
                            <span>No paint, ink, or print — woven by hand</span>
                          </div>
                        </div>

                        <div className="spec-row">
                          <span className="spec-icon">🖼️</span>
                          <div className="spec-text">
                            <strong>Ready to Hang</strong>
                            <span>Integrated heavy-duty wall mount pre-installed</span>
                          </div>
                        </div>
                      </div>

                      {/* Ordering Summary Card */}
                      <div className="order-summary-card">
                        <div className="order-price-row">
                          <span className="price-label">Custom Finished Artwork</span>
                          <span className="price-amount">£175</span>
                        </div>
                        <span className="order-delivery-tag">
                          ✓ Free UK delivery · Dispatches in ~2 weeks
                        </span>

                        {/* Prominent Place Order CTA Button */}
                        <button
                          id="btn-place-order-side"
                          type="button"
                          className="btn btn-primary-dark btn-place-order w-full"
                          onClick={startOrder}
                        >
                          <span>🛍️ Place Your Order</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clear Bottom CTA Row: "Place Your Order" below the result */}
                  <div className="result-bottom-cta-bar">
                    <button
                      id="btn-place-order"
                      type="button"
                      className="btn btn-primary-dark btn-place-order btn-large"
                      onClick={startOrder}
                    >
                      <span>🛍️ Place Your Order — Custom Handcrafted Piece</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary-light btn-try-another-bottom"
                      onClick={resetAll}
                    >
                      ← Try another photo
                    </button>
                  </div>

                  <div className="result-satisfaction-note">
                    <span>
                      🛡️ Cash on Delivery only · Zero advance risk · Pay upon arrival
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
