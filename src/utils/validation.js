/**
 * utils/validation.js
 * Client-side validation utilities for images and customer order data.
 *
 * NOTE: Frontend validation improves UX and prevents unnecessary network requests.
 * Backend validation remains strictly authoritative and mandatory.
 */

// Max image file size: 10MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

// Allowed image MIME types & extensions
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validate an image file before upload or processing.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Please choose an image file to upload.' };
  }

  // Check file type
  const mimeType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!ALLOWED_IMAGE_TYPES.includes(mimeType) && !hasAllowedExt) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPG, PNG, or WebP photo.',
    };
  }

  // Check file size (10MB limit)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Photo is too large (${sizeMb}MB). Maximum allowed size is 10MB.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate customer order form fields before submitting to backend.
 */
export function validateOrderFields(formData = {}) {
  const errors = {};

  // Full Name: required, 2–100 characters
  const fullName = (formData.fullName || '').trim();
  if (!fullName) {
    errors.fullName = 'Full Name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters.';
  } else if (fullName.length > 100) {
    errors.fullName = 'Full Name cannot exceed 100 characters.';
  }

  // Phone: required, 7–25 characters, valid symbols
  const phone = (formData.phone || '').trim();
  const phoneRegex = /^[\d\s+\-()]{7,25}$/;
  if (!phone) {
    errors.phone = 'Phone number is required for courier delivery.';
  } else if (!phoneRegex.test(phone)) {
    errors.phone = 'Please enter a valid phone number (7–25 digits/symbols).';
  }

  // Delivery Address: required, 5–250 characters
  const address = (formData.address || '').trim();
  if (!address) {
    errors.address = 'Delivery address is required.';
  } else if (address.length < 5) {
    errors.address = 'Please enter a complete street address.';
  } else if (address.length > 250) {
    errors.address = 'Address cannot exceed 250 characters.';
  }

  // City: required, 2–100 characters
  const city = (formData.city || '').trim();
  if (!city) {
    errors.city = 'Town / City is required.';
  } else if (city.length < 2) {
    errors.city = 'Town / City must be at least 2 characters.';
  } else if (city.length > 100) {
    errors.city = 'City cannot exceed 100 characters.';
  }

  // Email: optional, but if supplied must be valid format & max 100 characters
  const email = (formData.email || '').trim();
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 100 || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format server & network errors into clean, user-friendly messages.
 * Never exposes raw technical stack traces or internal logs.
 */
export function formatUserErrorMessage(err, status = 0, serverJson = null) {
  // Rate limiting
  if (status === 429 || serverJson?.error?.includes('Too many') || err?.message?.includes('429')) {
    return 'Too many requests. Please wait a little and try again.';
  }

  // Payload too large
  if (status === 413 || serverJson?.error?.includes('10MB') || err?.message?.includes('413')) {
    return 'The uploaded image exceeds the 10MB limit. Please select a smaller photo.';
  }

  // Clean validation messages from backend
  if (serverJson?.error && typeof serverJson.error === 'string') {
    // Suppress technical traces if leaked
    if (
      serverJson.error.includes('at ') ||
      serverJson.error.includes('Error:') ||
      serverJson.error.includes('node:') ||
      serverJson.error.includes('TypeError')
    ) {
      return 'A server error occurred. Please try again in a few moments.';
    }
    return serverJson.error;
  }

  // Server error
  if (status >= 500) {
    return 'A temporary server error occurred. Please try again in a few moments.';
  }

  // Abort / Cancellation
  if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
    return 'Request was cancelled.';
  }

  // Network / Fetch failure
  if (err?.name === 'TypeError' && err?.message?.includes('fetch')) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  return err?.message || 'An unexpected error occurred. Please try again.';
}
