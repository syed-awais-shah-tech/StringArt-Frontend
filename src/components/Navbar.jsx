import React, { useState } from 'react';

export default function Navbar({ onUploadClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="brand-icon">🧵</div>
          <span className="brand-name">StringArt</span>
          <span className="brand-badge">Handcrafted</span>
        </a>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <button className="nav-link" onClick={() => scrollTo('how-it-works')}>
            How it works
          </button>
          <button className="nav-link" onClick={() => scrollTo('gallery')}>
            Gallery
          </button>
          <button className="nav-link" onClick={() => scrollTo('products')}>
            Art & Kits
          </button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>
            FAQ
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="btn btn-primary-dark"
            onClick={() => {
              if (onUploadClick) onUploadClick();
              scrollTo('preview-studio');
            }}
          >
            Create Your Art
          </button>

          {/* Mobile hamburger button */}
          <button
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <button className="mobile-nav-link" onClick={() => scrollTo('how-it-works')}>
            How it works
          </button>
          <button className="mobile-nav-link" onClick={() => scrollTo('gallery')}>
            Gallery
          </button>
          <button className="mobile-nav-link" onClick={() => scrollTo('products')}>
            Art & Kits
          </button>
          <button className="mobile-nav-link" onClick={() => scrollTo('faq')}>
            FAQ
          </button>
          <button
            className="btn btn-primary-dark w-full mt-2"
            onClick={() => {
              if (onUploadClick) onUploadClick();
              scrollTo('preview-studio');
            }}
          >
            Upload Photo
          </button>
        </div>
      )}
    </header>
  );
}
