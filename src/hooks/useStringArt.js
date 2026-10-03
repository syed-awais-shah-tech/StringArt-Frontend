/**
 * useStringArt.js
 * Custom hook that manages all state + API communication for the app.
 */
import { useState, useCallback, useRef } from 'react';
import { getApiUrl } from '../config/api.js';

const DEFAULT_PARAMS = {
  numNails:          200,
  boardDiameterMm:   480,
  threadThicknessMm: 0.10,
  maxIterations:     3000,
  alpha:             0.13,
  lineDensity:       1.00,   // maps to kDensity = lineDensity * 500
  brightness:        0.8,
  contrast:          1,
  bgThreshold:       0,      // 0 = disabled
  imageSize:         512,
  name:              'myStringArt',
  featureHighlight:  'none',
  // Thread color palette — first 8 match C++ defaults
  colors: [
    [0, 0, 0],
    [255, 255, 255],
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 0],
  ],
};

export function useStringArt() {
  const [params, setParams]           = useState(DEFAULT_PARAMS);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [status, setStatus]           = useState('idle'); // idle | running | done | error
  const [error, setError]             = useState(null);
  const [previewData, setPreviewData] = useState(null);  // { nails, width, height, sequence }
  const [stats, setStats]             = useState(null);  // { lines, time }
  const [sequenceText, setSequenceText] = useState(null);
  const [sequenceFilename, setSequenceFilename] = useState(null);
  const [orderDraft, setOrderDraft]   = useState(null);
  const [viewStep, setViewStep]       = useState('studio'); // 'studio' | 'order-form' | 'order-success'
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitOrderError, setSubmitOrderError] = useState(null);
  const abortRef                      = useRef(null);

  // ── Parameter updater ───────────────────────────────────────────────────
  const setParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Internal helper to save order package for admin / checkout system ───
  const persistOrderInternally = useCallback((file, previewPayload, seqText, filename, currentParams) => {
    try {
      const orderId = `SA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const draft = {
        orderId,
        createdAt: new Date().toISOString(),
        imageName: file?.name || 'custom-portrait.png',
        filename: filename || 'sequence.txt',
        sequenceText: seqText,
        totalLines: previewPayload?.totalLines || currentParams?.maxIterations || 3000,
        numNails: currentParams?.numNails || 200,
        boardDiameterMm: currentParams?.boardDiameterMm || 480,
        status: 'ready_for_order',
      };

      setOrderDraft(draft);

      if (typeof window !== 'undefined') {
        localStorage.setItem('stringart_pending_order', JSON.stringify(draft));
        localStorage.setItem('stringart_latest_sequence', seqText);
        sessionStorage.setItem('stringart_pending_order', JSON.stringify(draft));
        window.__STRING_ART_ORDER__ = draft;
        window.__STRING_ART_SEQUENCE__ = seqText;
      }
      return draft;
    } catch (e) {
      console.warn('Failed to persist order draft internally:', e);
      return null;
    }
  }, []);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  // ── Reset / Try Another Photo ─────────────────────────────────────────────
  const resetAll = useCallback(() => {
    cancel();
    setImageFile(null);
    setImagePreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPreviewData(null);
    setStats(null);
    setSequenceText(null);
    setSequenceFilename(null);
    setOrderDraft(null);
    setViewStep('studio');
    setSubmittedOrder(null);
    setIsSubmittingOrder(false);
    setSubmitOrderError(null);
    setStatus('idle');
    setError(null);
  }, [cancel]);

  // ── Core Generate implementation ──────────────────────────────────────────
  const generate = useCallback(async (targetFile = null) => {
    const fileToProcess = targetFile || imageFile;
    if (!fileToProcess) {
      setError('Please upload an image first.');
      return;
    }

    setStatus('running');
    setError(null);
    setPreviewData(null);
    setStats(null);
    setSequenceText(null);
    setSequenceFilename(null);
    setViewStep('studio');
    setSubmittedOrder(null);
    setSubmitOrderError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append('image', fileToProcess);
      formData.append('params', JSON.stringify(params));

      const t0 = Date.now();
      const response = await fetch(getApiUrl('/api/generate'), {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error || `Server error ${response.status}`);
      }

      const data = await response.json();

      if (data.previewData) {
        setPreviewData(data.previewData);
        setStats({ lines: data.previewData.totalLines, timeMs: Date.now() - t0 });
      }

      const filename = data.filename || `${params.name}.txt`;
      setSequenceText(data.sequenceText);
      setSequenceFilename(filename);

      // Keep generated sequence internally for admin/order system
      persistOrderInternally(fileToProcess, data.previewData, data.sequenceText, filename, params);

      setStatus('done');
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setError(err.message || 'Generation failed');
      setStatus('error');
    }
  }, [imageFile, params, persistOrderInternally]);

  // ── Image selection & auto-generation ─────────────────────────────────────
  const selectImage = useCallback((file, autoGenerate = false) => {
    if (!file || !file.type.startsWith('image/')) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setPreviewData(null);
    setStats(null);
    setSequenceText(null);
    setSequenceFilename(null);
    setViewStep('studio');
    setSubmittedOrder(null);
    setError(null);

    if (autoGenerate) {
      generate(file);
    } else {
      setStatus('idle');
    }
  }, [generate]);

  // Convenience trigger: upload photo & immediately start generating
  const uploadAndGenerate = useCallback((file) => {
    selectImage(file, true);
  }, [selectImage]);

  // ── Customer Order Navigation ─────────────────────────────────────────────
  const startOrder = useCallback(() => {
    setSubmitOrderError(null);
    setViewStep('order-form');
    // Scroll to the order form smoothly
    const el = document.getElementById('preview-studio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const backToPreview = useCallback(() => {
    setViewStep('studio');
    const el = document.getElementById('preview-studio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Customer Order Submission (Cash on Delivery) ──────────────────────────
  const submitOrder = useCallback(async (customerData) => {
    setIsSubmittingOrder(true);
    setSubmitOrderError(null);

    try {
      // 1. Get original image data URL
      let originalImageData = null;
      if (imageFile) {
        originalImageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(imageFile);
        });
      }

      // 2. Capture preview image from canvas
      let previewImageData = null;
      const canvas = document.querySelector('canvas.string-canvas');
      if (canvas) {
        try {
          previewImageData = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn('Canvas toDataURL warning:', e);
        }
      }

      // 3. Assemble payload
      const payload = {
        customer: customerData,
        product: {
          name: 'Custom Handcrafted String Art (50 cm)',
          price: 175,
          currency: 'GBP',
        },
        originalImageData,
        previewImageData,
        sequenceText,
        previewMetadata: {
          totalLines: previewData?.totalLines || stats?.lines || 3000,
          numNails: params.numNails,
        },
      };

      const res = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setSubmittedOrder(data.order);
      setViewStep('order-success');

      if (typeof window !== 'undefined') {
        localStorage.setItem('stringart_last_order', JSON.stringify(data.order));
      }

      // Scroll to order confirmation
      const el = document.getElementById('preview-studio');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('[useStringArt] Order submission error:', err);
      setSubmitOrderError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [imageFile, sequenceText, previewData, stats, params]);

  return {
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
    sequenceText,
    sequenceFilename,
    orderDraft,
    viewStep,
    submittedOrder,
    isSubmittingOrder,
    submitOrderError,
    startOrder,
    backToPreview,
    submitOrder,
    DEFAULT_PARAMS,
  };
}
