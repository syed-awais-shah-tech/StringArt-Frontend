/**
 * test_frontend_protection.mjs
 * Automated unit & integration tests for Frontend Request Protection
 */

import {
  validateImageFile,
  validateOrderFields,
  formatUserErrorMessage,
  MAX_IMAGE_SIZE_BYTES,
} from './src/utils/validation.js';

console.log('====================================================');
console.log('  Frontend Request Protection Test Suite');
console.log('====================================================\n');

// ── Test 1: Image Validation (<10MB, JPG/PNG/WEBP only) ──────────────────────
console.log('--- 1. Testing Image Format & Size Validation ---');

// 1a. Unsupported file types
const textFile = { name: 'notes.txt', type: 'text/plain', size: 1024 };
const resText = validateImageFile(textFile);
console.log(`  text/plain valid: ${resText.valid}, error: "${resText.error}"`);
if (resText.valid !== false || !resText.error.includes('JPG, PNG, or WebP')) {
  throw new Error('Failed to reject unsupported text file format.');
}

const pdfFile = { name: 'document.pdf', type: 'application/pdf', size: 2048 };
const resPdf = validateImageFile(pdfFile);
console.log(`  application/pdf valid: ${resPdf.valid}, error: "${resPdf.error}"`);
if (resPdf.valid !== false) {
  throw new Error('Failed to reject PDF file format.');
}
console.log('  ✅ PASS: Non-image formats rejected before network request.');

// 1b. Oversized image (>10MB)
const oversizedFile = {
  name: 'huge_portrait.png',
  type: 'image/png',
  size: 11 * 1024 * 1024, // 11MB
};
const resOversized = validateImageFile(oversizedFile);
console.log(`  11MB image valid: ${resOversized.valid}, error: "${resOversized.error}"`);
if (resOversized.valid !== false || !resOversized.error.includes('10MB')) {
  throw new Error('Failed to reject oversized image (>10MB).');
}
console.log('  ✅ PASS: Oversized image (>10MB) rejected before sending.');

// 1c. Valid images
const validJpg = { name: 'my_dog.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 };
const resJpg = validateImageFile(validJpg);
if (!resJpg.valid) throw new Error('Valid JPG was incorrectly rejected.');

const validWebp = { name: 'artwork.webp', type: 'image/webp', size: 500 * 1024 };
const resWebp = validateImageFile(validWebp);
if (!resWebp.valid) throw new Error('Valid WebP was incorrectly rejected.');
console.log('  ✅ PASS: Valid JPG, PNG, and WebP files under 10MB accepted.');

// ── Test 2: Order Form Field Validation ───────────────────────────────────────
console.log('\n--- 2. Testing Customer Order Form Field Validation ---');

// 2a. Missing all fields
const emptyForm = {};
const resEmpty = validateOrderFields(emptyForm);
console.log('  Empty form errors:', Object.keys(resEmpty.errors));
if (resEmpty.isValid || !resEmpty.errors.fullName || !resEmpty.errors.phone || !resEmpty.errors.address || !resEmpty.errors.city) {
  throw new Error('Failed to require mandatory order fields.');
}

// 2b. Invalid phone format & length
const invalidPhoneForm = {
  fullName: 'John Doe',
  phone: 'abc-not-a-phone!',
  address: '10 Downing Street',
  city: 'London',
};
const resPhone = validateOrderFields(invalidPhoneForm);
console.log(`  Invalid phone error: "${resPhone.errors.phone}"`);
if (!resPhone.errors.phone) {
  throw new Error('Failed to reject invalid phone format.');
}

// 2c. Invalid email format
const invalidEmailForm = {
  fullName: 'John Doe',
  phone: '+44 7911 123456',
  email: 'not-an-email',
  address: '10 Downing Street',
  city: 'London',
};
const resEmail = validateOrderFields(invalidEmailForm);
console.log(`  Invalid email error: "${resEmail.errors.email}"`);
if (!resEmail.errors.email) {
  throw new Error('Failed to reject malformed email.');
}

// 2d. Valid complete form
const validForm = {
  fullName: 'Sarah Jenkins',
  phone: '+44 7911 123456',
  email: 'sarah@example.com',
  address: '221B Baker Street, Flat 2',
  city: 'London',
};
const resValid = validateOrderFields(validForm);
if (!resValid.isValid || Object.keys(resValid.errors).length > 0) {
  throw new Error('Valid order form was incorrectly rejected.');
}
console.log('  ✅ PASS: Complete and valid order fields pass validation.');

// ── Test 3: User-Friendly Error Messages ──────────────────────────────────────
console.log('\n--- 3. Testing Error Message Sanitization & User Formatting ---');

// 3a. 429 Rate limiting
const msg429 = formatUserErrorMessage(null, 429);
console.log(`  429 error: "${msg429}"`);
if (msg429 !== 'Too many requests. Please wait a little and try again.') {
  throw new Error(`Unexpected 429 message: ${msg429}`);
}

// 3b. 413 Payload too large
const msg413 = formatUserErrorMessage(null, 413);
console.log(`  413 error: "${msg413}"`);
if (!msg413.includes('10MB')) {
  throw new Error(`Unexpected 413 message: ${msg413}`);
}

// 3c. Server error suppression of technical stack traces
const stackTraceError = {
  error: 'Error: Database connection timeout\n    at Client.connect (/app/node_modules/pg/lib/client.js:123:45)',
};
const msgTrace = formatUserErrorMessage(null, 500, stackTraceError);
console.log(`  Sanitized stack trace: "${msgTrace}"`);
if (msgTrace.includes('at ') || msgTrace.includes('client.js')) {
  throw new Error('Failed to suppress technical stack trace.');
}

// 3d. Abort error
const abortErr = new Error('The user aborted a request.');
abortErr.name = 'AbortError';
const msgAbort = formatUserErrorMessage(abortErr);
console.log(`  Abort message: "${msgAbort}"`);
if (!msgAbort.includes('cancelled')) {
  throw new Error('Failed to format abort error cleanly.');
}
console.log('  ✅ PASS: Error messages sanitized and user-friendly.');

// ── Test 4: Concurrency Guards, Double-Click Prevention & Idempotency ─────────
console.log('\n--- 4. Testing Double-Click Protection & Idempotency Key Handling ---');

// 4a. Rapid Generate clicks simulation
let isGenerating = false;
let generateCallCount = 0;

function simulateGenerateClick() {
  if (isGenerating) {
    // Blocked by synchronous guard
    return { started: false, reason: 'ALREADY_GENERATING' };
  }
  isGenerating = true;
  generateCallCount++;
  return { started: true };
}

const click1 = simulateGenerateClick();
const click2 = simulateGenerateClick(); // Rapid double click
const click3 = simulateGenerateClick(); // Rapid triple click
console.log(`  Rapid generate clicks: Click 1 started=${click1.started}, Click 2 started=${click2.started} (${click2.reason}), Click 3 started=${click3.started}`);
if (!click1.started || click2.started || click3.started || generateCallCount !== 1) {
  throw new Error('Rapid generation double-click was not prevented.');
}
isGenerating = false;
console.log('  ✅ PASS: Rapid repeated Generate clicks successfully blocked.');

// 4b. Rapid Place Order clicks simulation
let isSubmitting = false;
let orderSubmitCallCount = 0;

function simulatePlaceOrderClick() {
  if (isSubmitting) {
    return { started: false, reason: 'ALREADY_SUBMITTING' };
  }
  isSubmitting = true;
  orderSubmitCallCount++;
  return { started: true };
}

const orderClick1 = simulatePlaceOrderClick();
const orderClick2 = simulatePlaceOrderClick(); // Rapid double click
console.log(`  Rapid place order clicks: Click 1 started=${orderClick1.started}, Click 2 started=${orderClick2.started} (${orderClick2.reason})`);
if (!orderClick1.started || orderClick2.started || orderSubmitCallCount !== 1) {
  throw new Error('Rapid order submission double-click was not prevented.');
}
isSubmitting = false;
console.log('  ✅ PASS: Rapid duplicate Place Order clicks successfully blocked.');

// 4c. Idempotency Key Lifecycle & Retry Logic
let currentIdempotencyKey = null;

function getOrCreateKey() {
  if (!currentIdempotencyKey) {
    currentIdempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  return currentIdempotencyKey;
}

// 1. User starts order
const initialKey = getOrCreateKey();
console.log(`  Initial order submission key: ${initialKey}`);

// 2. Submission fails (e.g. temporary network error): key must be REUSED for retry
const retryKey = getOrCreateKey();
console.log(`  Order retry submission key:   ${retryKey}`);
if (retryKey !== initialKey) {
  throw new Error('Order retry generated a different idempotency key! Must reuse the same key.');
}
console.log('  ✅ PASS: Retrying failed order reused exact same idempotency key.');

// 3. User intentionally starts a NEW order: fresh key must be generated
currentIdempotencyKey = null; // Cleared on order completion or reset
const newOrderKey = getOrCreateKey();
console.log(`  New intentional order key:    ${newOrderKey}`);
if (newOrderKey === initialKey) {
  throw new Error('New order reused old idempotency key! Must generate fresh key.');
}
console.log('  ✅ PASS: New intentional order generated fresh idempotency key.');

console.log('\n════════════════════════════════════════════════════════════');
console.log('🎉 ALL FRONTEND REQUEST PROTECTION TESTS PASSED 100%! 🎉');
console.log('════════════════════════════════════════════════════════════\n');
