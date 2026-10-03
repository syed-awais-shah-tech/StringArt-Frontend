import React, { useState } from 'react';

/**
 * CompareSlider
 * Interactive split comparison between original photo and string art result.
 */
export default function CompareSlider({
  originalSrc = '/gallery/input.png',
  stringArtSrc = '/gallery/output-gray.png',
  originalLabel = 'Original Photo',
  stringArtLabel = 'String Art Piece',
  className = '',
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100

  return (
    <div className={`compare-slider-container ${className}`}>
      {/* Background image: String art */}
      <img
        src={stringArtSrc}
        alt={stringArtLabel}
        className="compare-img compare-img-under"
        draggable={false}
      />

      {/* Foreground image: Original photo, clipped */}
      <div
        className="compare-clip-layer"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={originalSrc}
          alt={originalLabel}
          className="compare-img compare-img-over"
          draggable={false}
        />
      </div>

      {/* Divider line and handle */}
      <div
        className="compare-divider"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="compare-handle" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M5.5 4.5L2 8L5.5 11.5M10.5 4.5L14 8L10.5 11.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="compare-badge compare-badge-left">Original</span>
      <span className="compare-badge compare-badge-right">String Art</span>

      {/* Invisible range input for effortless, high-performance touch/drag across all devices */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="compare-range-input"
        aria-label="Image comparison slider"
      />
    </div>
  );
}
