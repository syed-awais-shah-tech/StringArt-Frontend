/**
 * useStringArt.js
 * Custom hook that manages all state + API communication for the app.
 * Includes frontend request protection, concurrency locks, request cancellation,
 * validation, cooldowns, and order idempotency.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { getApiUrl } from '../config/api.js';
import {
  validateImageFile,
  validateOrderFields,
  formatUserErrorMessage,
} from '../utils/validation.js';

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
  // Thread color palette — first 8 match algorithm defaults
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
  const [params, setParams]                     = useState(DEFAULT_PARAMS);
  const [imageFile, setImageFile]               = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl]   = useState(null);
  const [status, setStatus]                     = useState('idle'); // idle | running | done | error
  const [error, setError]                       = useState(null);
  const [previewData, setPreviewData]           = useState(null);   // { nails, width, height, sequence }
  const [stats, setStats]                       = useState(null);   // { lines, time }
  const [sequenceText, setSequenceText]         = useState(null);
  const [sequenceFilename, setSequenceFilename] = useState(null);
  const [orderDraft, setOrderDraft]             = useState(null);
  const [viewStep, setViewStep]                 = useState('studio'); // 'studio' | 'order-form' | 'order-success'
  const [submittedOrder, setSubmittedOrder]     = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitOrderError, setSubmitOrderError] = useState(null);
  const [cooldownSeconds, setCooldownSeconds]   = useState(0);

  // Synchronous execution guards & controllers
  const abortRef                                = useRef(null);
  const isGeneratingRef                         = useRef(false);
  const isSubmittingRef                         = useRef(false);
  const orderIdempotencyKeyRef                  = useRef(null);
  const cooldownTimerRef                        = useRef(null);

  // ── Cooldown Timer Effect ────────────────────────────────────────────────
  useEffect(() => {
    if (cooldownSeconds > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [cooldownSeconds]);

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

  // ── Cancel Request ────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    isGeneratingRef.current = false;
    setStatus('idle');
    setError(null);
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
    isSubmittingRef.current = false;
    setSubmitOrderError(null);
    orderIdempotencyKeyRef.current = null; // Fresh idempotency key on new photo
    setStatus('idle');
    setError(null);
  }, [cancel]);

  // ── Core Generate Implementation with Request Protection ─────────────────
  const generate = useCallback(async (targetFile = null) => {
    // 1. Prevent overlapping generation requests
    if (isGeneratingRef.current || status === 'running') {
      console.warn('[useStringArt] Generation already active. Ignoring repeat call.');
      return;
    }

    const fileToProcess = targetFile || imageFile;
    if (!fileToProcess) {
      setError('Please select or upload an image first.');
      return;
    }

    // 2. Validate image file format and size (<10MB) before network request
    const imageCheck = validateImageFile(fileToProcess);
    if (!imageCheck.valid) {
      setError(imageCheck.error);
      return;
    }

    // Synchronous execution lock
    isGeneratingRef.current = true;
    setStatus('running');
    setError(null);
    setPreviewData(null);
    setStats(null);
    setSequenceText(null);
    setSequenceFilename(null);
    setViewStep('studio');
    setSubmittedOrder(null);
    setSubmitOrderError(null);

    // Setup request cancellation controller
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

      let json = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(formatUserErrorMessage(null, response.status, json));
      }

      const data = json || {};

      if (data.previewData) {
        setPreviewData(data.previewData);
        setStats({ lines: data.previewData.totalLines, timeMs: Date.now() - t0 });
      }

      const filename = data.filename || `${params.name}.txt`;
      setSequenceText(data.sequenceText);
      setSequenceFilename(filename);

      // Keep generated sequence internally for order checkout
      persistOrderInternally(fileToProcess, data.previewData, data.sequenceText, filename, params);

      setStatus('done');
      // Set short 3-second cooldown to prevent accidental immediate spamming
      setCooldownSeconds(3);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[useStringArt] Generation cancelled by user.');
        setStatus('idle');
        return;
      }
      const message = formatUserErrorMessage(err);
      setError(message);
      setStatus('error');
    } finally {
      isGeneratingRef.current = false;
      abortRef.current = null;
    }
  }, [imageFile, params, status, persistOrderInternally]);

  // ── Image selection & auto-generation ─────────────────────────────────────
  const selectImage = useCallback((file, autoGenerate = false) => {
    if (!file) return;

    // Validate before setting state
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

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
    // Generate fresh idempotency key when entering the order checkout
    if (!orderIdempotencyKeyRef.current) {
      orderIdempotencyKeyRef.current =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
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

  // ── Customer Order Submission (Cash on Delivery with Idempotency) ──────────
  const submitOrder = useCallback(async (customerData) => {
    // 1. Prevent double-click duplicate order submissions
    if (isSubmittingRef.current || isSubmittingOrder) {
      console.warn('[useStringArt] Order submission already in progress. Ignoring duplicate click.');
      return;
    }

    // 2. Validate form fields before network call
    const fieldCheck = validateOrderFields(customerData);
    if (!fieldCheck.isValid) {
      setSubmitOrderError('Please correct the highlighted fields before placing your order.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmittingOrder(true);
    setSubmitOrderError(null);

    // Reuse existing key for retries; generate one if missing
    if (!orderIdempotencyKeyRef.current) {
      orderIdempotencyKeyRef.current =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    const currentIdempotencyKey = orderIdempotencyKeyRef.current;

    try {
      // Get original image data URL
      let originalImageData = null;
      if (imageFile) {
        originalImageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(imageFile);
        });
      }

      // Capture preview image from canvas
      let previewImageData = null;
      const canvas = document.querySelector('canvas.string-canvas');
      if (canvas) {
        try {
          previewImageData = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn('Canvas toDataURL warning:', e);
        }
      }

      // Assemble payload with idempotency key
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
        idempotencyKey: currentIdempotencyKey,
      };

      const res = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': currentIdempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(formatUserErrorMessage(null, res.status, data));
      }

      // Order succeeded: clear current idempotency key so next order gets a fresh key
      orderIdempotencyKeyRef.current = null;

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
      // NOTE: On error, orderIdempotencyKeyRef is kept unchanged so clicking retry
      // sends the exact same idempotency key safely!
      const userMessage = formatUserErrorMessage(err);
      setSubmitOrderError(userMessage);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmittingOrder(false);
    }
  }, [imageFile, sequenceText, previewData, stats, params, isSubmittingOrder]);

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
    cooldownSeconds,
    isGenerating: isGeneratingRef.current || status === 'running',
    startOrder,
    backToPreview,
    submitOrder,
    DEFAULT_PARAMS,
  };
}
