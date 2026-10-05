/**
 * App.jsx — Public Customer-Facing Business Website
 * Inspired by stringboard.co.uk
 */
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroGenerator from './components/HeroGenerator.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Gallery from './components/Gallery.jsx';
import PricingPreview from './components/PricingPreview.jsx';
import FAQ from './components/FAQ.jsx';
import Footer from './components/Footer.jsx';
import { useStringArt } from './hooks/useStringArt.js';
import AdminApp from './admin/AdminApp.jsx';

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Admin section: protected admin dashboard
  if (pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  const {
    params,
    setParam,
    imageFile,
    imagePreviewUrl,
    selectImage,
    uploadAndGenerate,
    status,
    error,
    generate,
    cancel,
    resetAll,
    previewData,
    stats,
    viewStep,
    submittedOrder,
    isSubmittingOrder,
    submitOrderError,
    cooldownSeconds,
    isGenerating,
    startOrder,
    backToPreview,
    submitOrder,
    eightColorEnabled,
    threadMode,
    setThreadMode,
  } = useStringArt();

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  // Show toast notifications on error or completion
  useEffect(() => {
    if (status === 'error' && error) {
      addToast('error', error);
    }
    if (status === 'done') {
      addToast('success', 'Your custom string art preview is ready!');
    }
  }, [status, error, addToast]);

  // Load example photo helper (e.g. from gallery or sample buttons)
  const handleLoadExample = async (type = 'portrait') => {
    try {
      const src = type === 'dog' ? '/gallery/dog_original.jpg' : '/gallery/input.png';
      const name = type === 'dog' ? 'golden-retriever-sample.jpg' : 'portrait-sample.png';
      const res = await fetch(src);
      const blob = await res.blob();
      const file = new File([blob], name, { type: blob.type || 'image/png' });
      uploadAndGenerate(file);
      const studio = document.getElementById('preview-studio');
      if (studio) studio.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load example photo', err);
    }
  };

  const handleUploadNavClick = () => {
    const el = document.getElementById('hero-file-input');
    if (el) {
      el.click();
    }
  };

  return (
    <div className="website-root">
      {/* 1. Header / Navbar */}
      <Navbar onUploadClick={handleUploadNavClick} />

      {/* 2. Hero Section + Interactive Generator */}
      <HeroGenerator
        params={params}
        setParam={setParam}
        imageFile={imageFile}
        imagePreviewUrl={imagePreviewUrl}
        onSelectImage={selectImage}
        uploadAndGenerate={uploadAndGenerate}
        status={status}
        error={error}
        generate={generate}
        cancel={cancel}
        resetAll={resetAll}
        previewData={previewData}
        stats={stats}
        viewStep={viewStep}
        submittedOrder={submittedOrder}
        isSubmittingOrder={isSubmittingOrder}
        submitOrderError={submitOrderError}
        cooldownSeconds={cooldownSeconds}
        isGenerating={isGenerating}
        startOrder={startOrder}
        backToPreview={backToPreview}
        submitOrder={submitOrder}
        eightColorEnabled={eightColorEnabled}
        threadMode={threadMode}
        setThreadMode={setThreadMode}
      />

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. Examples / Gallery Section */}
      <Gallery onLoadExample={handleLoadExample} />

      {/* 5. Art, Kits & Offerings */}
      <PricingPreview />

      {/* 6. FAQ Section */}
      <FAQ />

      {/* 7. Footer */}
      <Footer />

      {/* Floating Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span className="toast-text">{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
