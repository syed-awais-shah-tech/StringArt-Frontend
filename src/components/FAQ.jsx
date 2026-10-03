import React, { useState } from 'react';

/**
 * FAQ
 * Collapsible questions and answers addressing customer inquiries inspired by stringboard.co.uk.
 */
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // open first by default

  const faqs = [
    {
      q: 'What kind of photos produce the best string art results?',
      a: 'Close-up portraits of people or pets with high contrast and simple backgrounds work best. Good lighting that clearly defines facial features, eyes, and shadows will translate into crisp, recognizable thread lines. Blurry photos or complex, busy backgrounds can be distracting.',
    },
    {
      q: 'Is there any paint or ink used on the artwork?',
      a: 'None whatsoever. The image is formed entirely by the optical density of straight continuous threads stretched under tension across perimeter nails. Darker shadows are formed where hundreds of thread lines intersect; lighter highlights appear where fewer threads cross.',
    },
    {
      q: 'How does the free online preview work?',
      a: 'Our preview generator calculates the exact continuous thread paths across perimeter pins directly from your uploaded image. It simulates the tension and optical density of thousands of thread lines so you can see precisely how your handcrafted finished piece will look.',
    },
    {
      q: 'How is my string art created from the preview?',
      a: 'When you place your order, our system captures the complete thread path blueprint required to weave your portrait. Our master craftspeople then physically tension and wind high-strength continuous thread across every perimeter pin to match your preview.',
    },
    {
      q: 'Can I choose color threads or is it always black thread?',
      a: 'The classic monochrome style uses a single high-strength black thread against a white circular background for maximum contrast and timeless elegance. We also offer curated thread palettes for custom commissions upon request.',
    },
    {
      q: 'How big is the physical artwork and does it arrive ready to hang?',
      a: 'Physical custom pieces are created on a 50cm (approx. 20-inch) circular Baltic birch board, finished with 200 precision perimeter pins. Every piece arrives fully assembled and threaded, complete with integrated wall mounting hardware on the back.',
    },
    {
      q: 'Do I need an account or login to preview my photo?',
      a: 'No. You can upload photos, generate instant previews, and start your order completely free without creating an account or providing a password.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="section-container bg-subtle" id="faq">
      <div className="section-header-centered">
        <span className="section-eyebrow">Got Questions?</span>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Everything you need to know about our string art technology, materials, and digital generator.
        </p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
              <button
                className="faq-question-btn"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <span className="faq-question-text">{faq.q}</span>
                <span className="faq-icon-arrow">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions banner */}
      <div className="faq-contact-card">
        <div className="faq-contact-text">
          <h4 className="faq-contact-title">Still have a question or custom idea?</h4>
          <p className="faq-contact-sub">
            We are always happy to help with photo recommendations or custom board dimensions.
          </p>
        </div>
        <a
          href="mailto:info@stringart.io"
          className="btn btn-secondary-light"
        >
          Contact Our Team
        </a>
      </div>
    </section>
  );
}
