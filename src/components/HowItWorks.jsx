import React from 'react';

/**
 * HowItWorks
 * Explains the string art creation process and craftsmanship inspired by stringboard.co.uk.
 */
export default function HowItWorks({ onCtaClick }) {
  return (
    <section className="section-container" id="how-it-works">
      <div className="section-header-centered">
        <span className="section-eyebrow">The Craft</span>
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          From a digital portrait on your screen to a tactile art piece on your wall,
          here is how thread and mathematics come together.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="steps-grid">
        <div className="step-card">
          <div className="step-badge">Step 1</div>
          <div className="step-icon-box">📸</div>
          <h3 className="step-title">Upload your photo</h3>
          <p className="step-desc">
            Choose a favorite portrait of a pet, partner, wedding, or memory.
            High-contrast photos with simple backgrounds produce the most striking clarity.
          </p>
        </div>

        <div className="step-card">
          <div className="step-badge">Step 2</div>
          <div className="step-icon-box">✨</div>
          <h3 className="step-title">Instant Art Preview</h3>
          <p className="step-desc">
            Our preview engine maps out thousands of continuous thread paths across perimeter pins,
            accurately recreating shadows, contrast, and fine details before placing your order.
          </p>
        </div>

        <div className="step-card">
          <div className="step-badge">Step 3</div>
          <div className="step-icon-box">🧵</div>
          <h3 className="step-title">Woven by hand</h3>
          <p className="step-desc">
            Each nail is hammered into a circular 50cm wooden board. Over 1.5 kilometers of unbroken
            thread is guided back-and-forth under tension to bring the image to life.
          </p>
        </div>
      </div>

      {/* Craftsmanship Spotlight */}
      <div className="craft-spotlight">
        <div className="craft-image-col">
          <img
            src="/gallery/artisan_craft.jpg"
            alt="Handcrafting string art board in workshop studio"
            className="craft-img"
            loading="lazy"
          />
          <div className="craft-floating-badge">
            <span className="craft-badge-icon">✨</span>
            <div>
              <strong>100% Genuine Thread</strong>
              <span>No paint, ink, or print — pure tension</span>
            </div>
          </div>
        </div>

        <div className="craft-text-col">
          <span className="section-eyebrow">Behind the Scenes</span>
          <h3 className="craft-heading">A custom gift they will never forget</h3>
          <p className="craft-text">
            There is zero ink or paint on the board. The portraits appear entirely through the
            crisscrossing density of fine thread. Where threads bunch together, deep shadows form;
            where they spread apart, subtle highlights emerge.
          </p>

          <div className="craft-stats-grid">
            <div className="craft-stat">
              <span className="stat-number">200</span>
              <span className="stat-label">Precision Nails</span>
            </div>
            <div className="craft-stat">
              <span className="stat-number">3,000+</span>
              <span className="stat-label">Thread Chords</span>
            </div>
            <div className="craft-stat">
              <span className="stat-number">1.5 km</span>
              <span className="stat-label">Total String Length</span>
            </div>
            <div className="craft-stat">
              <span className="stat-number">50 cm</span>
              <span className="stat-label">Circular Diameter</span>
            </div>
          </div>

          <div className="craft-cta-box">
            <button
              className="btn btn-primary-dark"
              onClick={() => {
                const el = document.getElementById('preview-studio');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Preview Your Photo Now
            </button>
            <span className="craft-guarantee-note">
              ✓ Free instant preview · No signup required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
