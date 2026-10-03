/**
 * CanvasPreview.jsx
 * HTML5 canvas that animates the string art sequence step-by-step.
 *
 * Features:
 *  - Play / Pause animation
 *  - Speed control (1× → 100× using batched steps per frame)
 *  - Step counter
 *  - Draws nail dots and circular board border
 *  - requestAnimationFrame loop — no React re-renders inside hot path
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';

const NAIL_RADIUS   = 2.2;
const BOARD_PADDING = 8;   // px inside canvas edge
const BG_COLOR      = '#ffffff';
const NAIL_COLOR    = '#52525b'; // zinc metallic pin color
const BORDER_COLOR  = 'rgba(0, 0, 0, 0.15)';

export default function CanvasPreview({ previewData }) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef({
    playing:      false,
    stepIdx:      0,
    speed:        10,      // steps drawn per frame
    rafId:        null,
  });
  const [uiState, setUiState] = useState({ playing: false, stepIdx: 0, total: 0, speed: 10 });

  // ── Draw a single Bresenham line on the canvas ──────────────────────────
  const drawStep = useCallback((ctx, step, nails, scale) => {
    // step = [r, g, b, nailIdx]  — but we need prevNailIdx per color
    // We track prevNails in stateRef
    const [r, g, b, nailIdx] = step;
    const key = `${r},${g},${b}`;
    const prev = stateRef.current.prevNails?.[key];
    if (prev === undefined) {
      // first time seeing this color — just record position
      if (!stateRef.current.prevNails) stateRef.current.prevNails = {};
      stateRef.current.prevNails[key] = nailIdx;
      return;
    }

    const x0 = nails[prev][0] * scale + BOARD_PADDING;
    const y0 = nails[prev][1] * scale + BOARD_PADDING;
    const x1 = nails[nailIdx][0] * scale + BOARD_PADDING;
    const y1 = nails[nailIdx][1] * scale + BOARD_PADDING;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.13)`;
    ctx.lineWidth   = 0.6;
    ctx.stroke();

    stateRef.current.prevNails[key] = nailIdx;
  }, []);

  // ── Initialise canvas when previewData arrives ───────────────────────────
  useEffect(() => {
    if (!previewData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { nails, width, height, sequence } = previewData;

    // Fit canvas inside its CSS container (max 580px)
    const containerW = canvas.parentElement?.clientWidth || 580;
    const containerH = Math.min(containerW, window.innerHeight - 260);
    const canvasSize  = Math.min(containerW - BOARD_PADDING * 2, containerH);

    canvas.width  = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width  = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const scale = (canvasSize - BOARD_PADDING * 2) / Math.max(width, height);

    // Store scaled data in ref for animation
    stateRef.current.scale    = scale;
    stateRef.current.nails    = nails;
    stateRef.current.sequence = sequence;
    stateRef.current.stepIdx  = 0;
    stateRef.current.playing  = false;
    stateRef.current.prevNails = {};

    const ctx = canvas.getContext('2d');

    // Clear to white
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw circular board border
    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const r  = (canvasSize - BOARD_PADDING * 2) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth   = 1.2;
    ctx.stroke();

    // Draw nails
    ctx.fillStyle = NAIL_COLOR;
    for (const [nx, ny] of nails) {
      const px = nx * scale + BOARD_PADDING;
      const py = ny * scale + BOARD_PADDING;
      ctx.beginPath();
      ctx.arc(px, py, NAIL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    stateRef.current.ctx = ctx;

    // Draw all lines immediately so the finished artwork is visible right away!
    stateRef.current.prevNails = {};
    for (let i = 0; i < sequence.length; i++) {
      drawStep(ctx, sequence[i], nails, scale);
    }
    stateRef.current.stepIdx = sequence.length;

    setUiState((u) => ({ ...u, stepIdx: sequence.length, total: sequence.length, playing: false }));
  }, [previewData, drawStep]);

  // ── Animation loop ────────────────────────────────────────────────────────
  const animate = useCallback(() => {
    const s = stateRef.current;
    if (!s.playing || !s.ctx || !s.sequence) return;

    const batchSize = s.speed || 25;
    for (let i = 0; i < batchSize; i++) {
      if (s.stepIdx >= s.sequence.length) {
        s.playing = false;
        setUiState((u) => ({ ...u, playing: false, stepIdx: s.sequence.length }));
        return;
      }
      drawStep(s.ctx, s.sequence[s.stepIdx], s.nails, s.scale);
      s.stepIdx++;
    }

    if (s.stepIdx % (batchSize * 2) === 0 || s.stepIdx >= s.sequence.length) {
      setUiState((u) => ({ ...u, stepIdx: s.stepIdx }));
    }

    s.rafId = requestAnimationFrame(animate);
  }, [drawStep]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const resetCanvas = useCallback(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.rafId);
    s.playing  = false;
    s.stepIdx  = 0;
    s.prevNails = {};

    if (!s.ctx || !previewData) return;
    const { nails } = previewData;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasSize = canvas.width;
    const scale = s.scale;

    s.ctx.fillStyle = BG_COLOR;
    s.ctx.fillRect(0, 0, canvasSize, canvasSize);

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const r  = (canvasSize - BOARD_PADDING * 2) / 2;
    s.ctx.beginPath();
    s.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    s.ctx.strokeStyle = BORDER_COLOR;
    s.ctx.lineWidth   = 1.2;
    s.ctx.stroke();

    s.ctx.fillStyle = NAIL_COLOR;
    for (const [nx, ny] of nails) {
      s.ctx.beginPath();
      s.ctx.arc(nx * scale + BOARD_PADDING, ny * scale + BOARD_PADDING, NAIL_RADIUS, 0, Math.PI * 2);
      s.ctx.fill();
    }

    setUiState((u) => ({ ...u, playing: false, stepIdx: 0 }));
  }, [previewData]);

  const togglePlay = useCallback(() => {
    const s = stateRef.current;
    if (!s.sequence || s.sequence.length === 0) return;

    // If finished, restart weaving animation from 0
    if (s.stepIdx >= s.sequence.length) {
      resetCanvas();
      setTimeout(() => {
        stateRef.current.playing = true;
        stateRef.current.speed = 25;
        setUiState((u) => ({ ...u, playing: true, stepIdx: 0 }));
        cancelAnimationFrame(stateRef.current.rafId);
        stateRef.current.rafId = requestAnimationFrame(animate);
      }, 40);
      return;
    }

    s.playing = !s.playing;
    setUiState((u) => ({ ...u, playing: s.playing }));

    if (s.playing) {
      cancelAnimationFrame(s.rafId);
      s.rafId = requestAnimationFrame(animate);
    }
  }, [animate, resetCanvas]);

  // ── Draw ALL instantly ────────────────────────────────────────────────────
  const drawAll = useCallback(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.rafId);
    s.playing = false;

    if (!s.ctx || !s.sequence) return;

    resetCanvas();

    setTimeout(() => {
      const { sequence, nails, scale, ctx } = stateRef.current;
      stateRef.current.prevNails = {};
      for (let i = 0; i < sequence.length; i++) {
        drawStep(ctx, sequence[i], nails, scale);
      }
      stateRef.current.stepIdx = sequence.length;
      setUiState((u) => ({ ...u, playing: false, stepIdx: sequence.length }));
    }, 20);
  }, [resetCanvas, drawStep]);

  // Cleanup RAF on unmount
  useEffect(() => () => cancelAnimationFrame(stateRef.current.rafId), []);

  if (!previewData) {
    return (
      <div className="canvas-wrap">
        <div className="canvas-empty">
          <span className="canvas-empty-icon">🎨</span>
          <span>Generate string art to see the preview here</span>
        </div>
      </div>
    );
  }

  const isComplete = uiState.stepIdx >= uiState.total && uiState.total > 0;

  return (
    <div className="canvas-section">
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="string-canvas" />
      </div>

      {/* Clean controls for customer preview */}
      <div className="canvas-controls">
        <div className="canvas-controls-left">
          <button
            id="btn-play-pause"
            type="button"
            className="btn btn-secondary-light btn-sm"
            onClick={togglePlay}
          >
            {uiState.playing
              ? '⏸ Pause'
              : isComplete
              ? '▶ Replay Weaving'
              : '▶ Continue Weaving'}
          </button>

          {!isComplete && (
            <button
              id="btn-draw-all"
              type="button"
              className="btn btn-secondary-light btn-sm"
              onClick={drawAll}
            >
              ⚡ Complete View
            </button>
          )}
        </div>

        <div className="canvas-controls-right">
          <span className="canvas-step-label">
            {isComplete ? '✓ Full Detail Rendered' : `${uiState.stepIdx.toLocaleString()} threads placed`}
          </span>
        </div>
      </div>
    </div>
  );
}
