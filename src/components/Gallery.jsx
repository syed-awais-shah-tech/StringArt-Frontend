import React, { useState } from 'react';
import CompareSlider from './CompareSlider.jsx';

/**
 * Gallery
 * Showcases string art examples and real customer comparisons using existing repository assets.
 */
export default function Gallery({ onLoadExample }) {
  const [activeTab, setActiveTab] = useState('all');

  const galleryItems = [
    {
      id: 'dog',
      category: 'pets',
      title: 'Golden Retriever — Loyal Companion',
      specs: 'Monochrome Thread · 200 Nails · 3,400 Lines',
      original: '/gallery/dog_original.jpg',
      stringArt: '/gallery/dog_stringart.jpg',
      description: 'Fine facial fur contours and playful eyes captured exclusively with tensioned black thread.',
    },
    {
      id: 'portrait-mono',
      category: 'portraits',
      title: 'Studio Portrait with Lily (Monochrome)',
      specs: 'Single Black Thread · 200 Nails · 3,000 Lines',
      original: '/gallery/input.png',
      stringArt: '/gallery/output-gray.png',
      description: 'Deep shadows across the jawline and hair with high delicate contrast on the floral petals.',
    },
    {
      id: 'portrait-color',
      category: 'portraits',
      title: 'Studio Portrait with Lily (Color Weave)',
      specs: 'Multi-Color Thread · 200 Nails · 3,200 Lines',
      original: '/gallery/input.png',
      stringArt: '/gallery/output.png',
      description: 'Subtle cyan and red thread undertones accentuating the eye color and lips with vibrant depth.',
    },
  ];

  const filteredItems = activeTab === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeTab);

  const reviews = [
    {
      quote: "It's home. It's amazing. I'm gob smacked. Thank you so so much for bringing our memory to life.",
      author: 'Lisa / Ted',
      note: 'Anniversary Portrait',
    },
    {
      quote: "Absolutely LOVEE the string art! The likeness is unbelievable and people can't stop staring at it on the wall.",
      author: 'Eman',
      note: 'Home Studio Artwork',
    },
    {
      quote: "We love the string art you made for us. It's a brilliant likeness and so well made.",
      author: 'Lucy',
      note: 'Wedding Gift',
    },
  ];

  return (
    <section className="section-container bg-subtle" id="gallery">
      <div className="section-header-centered">
        <span className="section-eyebrow">Real Transformations</span>
        <h2 className="section-title">Examples & Gallery</h2>
        <p className="section-subtitle">
          See how everyday photos transform into intricate thread art pieces.
          Drag the sliders to inspect the likeness and line density.
        </p>

        {/* Filter buttons */}
        <div className="filter-tab-bar">
          <button
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Pieces
          </button>
          <button
            className={`filter-tab ${activeTab === 'portraits' ? 'active' : ''}`}
            onClick={() => setActiveTab('portraits')}
          >
            Portraits
          </button>
          <button
            className={`filter-tab ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => setActiveTab('pets')}
          >
            Pets & Wildlife
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="gallery-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="gallery-card">
            <div className="gallery-slider-wrap">
              <CompareSlider
                originalSrc={item.original}
                stringArtSrc={item.stringArt}
                originalLabel={item.title}
                stringArtLabel="String Art Result"
              />
            </div>

            <div className="gallery-card-body">
              <div className="gallery-card-specs">{item.specs}</div>
              <h3 className="gallery-card-title">{item.title}</h3>
              <p className="gallery-card-desc">{item.description}</p>

              <button
                type="button"
                className="btn-try-example"
                onClick={() => {
                  if (onLoadExample) {
                    onLoadExample(item.id === 'dog' ? 'dog' : 'portrait');
                  }
                  const el = document.getElementById('preview-studio');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Try this photo in the preview tool →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Praise Quotes */}
      <div className="reviews-section">
        <h3 className="reviews-heading">What people are saying</h3>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-stars">★★★★★</div>
              <p className="review-quote">"{r.quote}"</p>
              <div className="review-meta">
                <span className="review-author">{r.author}</span>
                <span className="review-note">{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
