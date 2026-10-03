import React from 'react';

/**
 * Footer
 * Site footer with brand, navigation links, and copyright.
 */
export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-top-grid">
          {/* Brand info */}
          <div className="footer-brand-col">
            <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className="brand-icon">🧵</div>
              <span className="brand-name">StringArt</span>
            </a>
            <p className="footer-tagline">
              Turning cherished photos into timeless, tactile thread art.
              Precision algorithms meet artisan craftsmanship.
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <button className="footer-link-btn" onClick={() => scrollTo('preview-studio')}>
                  Instant Preview Tool
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => scrollTo('how-it-works')}>
                  How It Works
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => scrollTo('gallery')}>
                  Gallery & Examples
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => scrollTo('products')}>
                  Art & Kits
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => scrollTo('faq')}>
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">The Craft</h4>
            <ul className="footer-links-list">
              <li><span>✓ 200 perimeter nails</span></li>
              <li><span>✓ 1.5+ km unbroken thread</span></li>
              <li><span>✓ Zero ink, paint or paper</span></li>
              <li><span>✓ 50cm Baltic birch board</span></li>
              <li><span>✓ 100% money-back guarantee</span></li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Connect</h4>
            <p className="footer-contact-info">
              Questions or custom inquiries?
              <br />
              <a href="mailto:info@stringart.io" className="footer-email-link">
                info@stringart.io
              </a>
            </p>
            <div className="footer-social-row">
              <a
                href="https://github.com/vxjnc/StringArt"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="GitHub Repository"
              >
                <span>GitHub ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            © {new Date().getFullYear()} StringArt. Inspired by artisanal thread craftsmanship.
          </p>
          <div className="footer-legal-links">
            <a href="#preview-studio" className="legal-link">Preview</a>
            <span>·</span>
            <a href="#how-it-works" className="legal-link">Process</a>
            <span>·</span>
            <a href="#faq" className="legal-link">FAQ</a>
            <span>·</span>
            <a href="/admin" className="legal-link" title="Store & Workshop Admin Portal">Admin Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
