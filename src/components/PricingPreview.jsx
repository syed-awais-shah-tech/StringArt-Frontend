import React from 'react';

/**
 * PricingPreview
 * Customer-facing offerings inspired by stringboard.co.uk (no checkout functionality in Phase 1).
 */
export default function PricingPreview({ onCtaClick }) {
  const scrollToStudio = () => {
    const el = document.getElementById('preview-studio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section-container" id="products">
      <div className="section-header-centered">
        <span className="section-eyebrow">Options & Offerings</span>
        <h2 className="section-title">Art, Kits & Digital Patterns</h2>
        <p className="section-subtitle">
          Choose between a fully finished handcrafted piece delivered ready to hang,
          a complete DIY kit, or an instant free digital preview.
        </p>
      </div>

      <div className="pricing-grid">
        {/* Featured Card: Finished Artwork */}
        <div className="pricing-card featured">
          <div className="pricing-badge-popular">Most Popular</div>
          <div className="pricing-header">
            <h3 className="pricing-tier-name">Finished Artwork</h3>
            <div className="pricing-price">
              <span className="currency">£</span>
              <span className="amount">175</span>
            </div>
            <p className="pricing-desc">
              A 50cm circular wooden piece, meticulously woven by hand and shipped ready to hang.
            </p>
          </div>

          <ul className="pricing-features">
            <li>✓ Custom handmade from your photo</li>
            <li>✓ Over 1.5 km of tensioned continuous thread</li>
            <li>✓ 200 precision silver nails on Baltic birch</li>
            <li>✓ Digital preview to approve before physical crafting</li>
            <li>✓ Free UK delivery + international shipping</li>
            <li>✓ 100% money-back satisfaction guarantee</li>
          </ul>

          <div className="pricing-cta-wrap">
            <button
              className="btn btn-primary-dark w-full"
              onClick={scrollToStudio}
            >
              Preview Your Photo Free
            </button>
            <span className="pricing-subtext">Shipped in ~2 weeks · Ready to hang</span>
          </div>
        </div>

        {/* Card 2: DIY Kit */}
        <div className="pricing-card">
          <div className="pricing-header">
            <span className="badge-coming-soon">Coming Soon</span>
            <h3 className="pricing-tier-name">DIY Maker Kit</h3>
            <div className="pricing-price">
              <span className="currency">£</span>
              <span className="amount">75</span>
            </div>
            <p className="pricing-desc">
              Everything you need in one box to weave your own custom portrait at home.
            </p>
          </div>

          <ul className="pricing-features">
            <li>✓ Pre-drilled 50cm circular board</li>
            <li>✓ 200 precision-length nails</li>
            <li>✓ High-tensile thread spools</li>
            <li>✓ Numbered nail template & guide</li>
            <li>✓ Step-by-step progress tracking app</li>
          </ul>

          <div className="pricing-cta-wrap">
            <button
              className="btn btn-secondary-light w-full"
              onClick={scrollToStudio}
            >
              Test Your Photo First
            </button>
            <span className="pricing-subtext">Register interest · Launching soon</span>
          </div>
        </div>

        {/* Card 3: Free Digital Preview */}
        <div className="pricing-card">
          <div className="pricing-header">
            <span className="badge-digital">Instant Access</span>
            <h3 className="pricing-tier-name">Free Digital Preview</h3>
            <div className="pricing-price">
              <span className="currency">£</span>
              <span className="amount">0</span>
              <span className="period">/ unlimited</span>
            </div>
            <p className="pricing-desc">
              Generate an instant high-fidelity string art preview from any photo directly in your browser.
            </p>
          </div>

          <ul className="pricing-features">
            <li>✓ Full high-resolution string simulation</li>
            <li>✓ Side-by-side original photo comparison</li>
            <li>✓ Automated thread path balancing</li>
            <li>✓ Save design for handcrafted ordering</li>
          </ul>

          <div className="pricing-cta-wrap">
            <button
              className="btn btn-secondary-light w-full"
              onClick={scrollToStudio}
            >
              Preview Your Photo Free
            </button>
            <span className="pricing-subtext">Instant generator · No account required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
