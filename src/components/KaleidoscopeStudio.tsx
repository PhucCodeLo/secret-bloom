import { useEffect, useRef, useState } from 'react';
import type { Sfx } from '../types';

interface KaleidoscopeStudioProps {
  sfx: Sfx;
  colors?: string[];
}

const DEFAULT_COLORS = ['#F4A0BC', '#F3D79B', '#B9A8E8', '#8FD8C9', '#FFF4E6'];

/**
 * KÍNH VẠN HOA — the finale reward. The garden shatters into a living
 * kaleidoscope: twelve mirrored facets refract generative art painted from
 * the journey's own colors. Drag to spin the tube — every angle is a new
 * painting. Shuffle the pattern, or save a frame as PNG.
 */
export default function KaleidoscopeStudio({ sfx, colors = DEFAULT_COLORS }: KaleidoscopeStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [patternKey, setPatternKey] = useState(0);
  const stRef = useRef({
    rot: 0,
    ox: 0,
    oy: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const size = wrap.clientWidth;
    if (size === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const ctx = canvas.getContext('2d')!;
    const st = stRef.current;

    // ---- generative source art, seeded per pattern ----
    const paintSource = (seed: number): HTMLCanvasElement => {
      const S = 640;
      const c = document.createElement('canvas');
      c.width = S;
      c.height = S;
      const x = c.getContext('2d')!;
      let s = seed >>> 0 || 1;
      const rnd = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
      const bg = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      bg.addColorStop(0, '#16203A');
      bg.addColorStop(1, '#060913');
      x.fillStyle = bg;
      x.fillRect(0, 0, S, S);
      // soft color blobs
      for (let i = 0; i < 44; i++) {
        const cx = rnd() * S;
        const cy = rnd() * S;
        const r = 24 + rnd() * 95;
        const col = colors[Math.floor(rnd() * colors.length)];
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.globalAlpha = 0.14 + rnd() * 0.3;
        x.fillStyle = g;
        x.beginPath();
        x.arc(cx, cy, r, 0, Math.PI * 2);
        x.fill();
      }
      // petals
      for (let i = 0; i < 26; i++) {
        const cx = rnd() * S;
        const cy = rnd() * S;
        const rx = 9 + rnd() * 24;
        const ry = rx * (1.6 + rnd() * 1.2);
        const col = colors[Math.floor(rnd() * colors.length)];
        x.save();
        x.translate(cx, cy);
        x.rotate(rnd() * Math.PI * 2);
        x.globalAlpha = 0.5 + rnd() * 0.4;
        x.fillStyle = col;
        x.beginPath();
        x.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        x.fill();
        x.globalAlpha = 0.85;
        x.fillStyle = '#FFF4E6';
        x.beginPath();
        x.ellipse(0, 0, rx * 0.28, ry * 0.28, 0, 0, Math.PI * 2);
        x.fill();
        x.restore();
      }
      // stars
      for (let i = 0; i < 70; i++) {
        const cx = rnd() * S;
        const cy = rnd() * S;
        const r = 0.8 + rnd() * 2.2;
        x.globalAlpha = 0.5 + rnd() * 0.5;
        x.fillStyle = rnd() > 0.5 ? '#FFF4E6' : '#F3D79B';
        x.shadowColor = '#FFF4E6';
        x.shadowBlur = 6;
        x.beginPath();
        x.arc(cx, cy, r, 0, Math.PI * 2);
        x.fill();
      }
      x.shadowBlur = 0;
      // faint rings
      for (let i = 0; i < 5; i++) {
        x.globalAlpha = 0.22;
        x.strokeStyle = colors[i % colors.length];
        x.lineWidth = 2 + rnd() * 3;
        x.beginPath();
        x.arc(S / 2, S / 2, 60 + rnd() * 220, 0, Math.PI * 2);
        x.stroke();
      }
      x.globalAlpha = 1;
      return c;
    };

    const src = paintSource((Date.now() ^ (patternKey * 7919)) >>> 0);
    const SEG = 12;
    const seg = (Math.PI * 2) / SEG;
    const R = size * 0.78;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t = Math.random() * 100;

    const frame = () => {
      t += 1 / 60;
      if (!st.dragging && !reduced) st.rot += 0.0035;
      // the sampled region drifts slowly, like looking deeper into the tube
      const ox = Math.sin(t * 0.21) * 70 + st.ox;
      const oy = Math.cos(t * 0.17) * 70 + st.oy;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      for (let i = 0; i < SEG; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(st.rot + i * seg);
        if (i % 2 === 1) ctx.scale(-1, 1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, -seg / 2, seg / 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(src, -320 + ox, -320 + oy);
        ctx.restore();
      }
      // circular tube mask
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // brass ring
      ctx.strokeStyle = 'rgba(201,162,75,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(201,162,75,0.35)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2 - 8, 0, Math.PI * 2);
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternKey]);

  const st = stRef.current;
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    st.dragging = true;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!st.dragging) return;
    const dx = e.clientX - st.lastX;
    const dy = e.clientY - st.lastY;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.rot += dx * 0.008;
    st.oy = Math.max(-150, Math.min(150, st.oy + dy * 1.1));
  };
  const onPointerUp = () => {
    st.dragging = false;
  };

  const savePng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kinh-van-hoa-20-10.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      sfx.success();
    }, 'image/png');
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        ref={wrapRef}
        className="relative aspect-square w-full max-w-[380px] overflow-hidden rounded-full shadow-[0_18px_60px_rgba(0,0,0,0.6)]"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Kính vạn hoa — chạm và xoay"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-8 px-8 text-center font-display text-sm italic leading-6 text-ivory/70">
          Chạm & xoay — mỗi góc là một bức tranh mới.
        </p>
      </div>
      <div className="flex w-full max-w-[380px] gap-2.5">
        <button
          type="button"
          onClick={() => {
            setPatternKey((k) => k + 1);
            sfx.sparkle();
          }}
          className="min-h-[52px] flex-1 rounded-full border border-champagne/40 bg-deepblue/60 px-6 text-base font-semibold text-champagne transition hover:bg-deepblue"
        >
          🎲 Đổi họa tiết
        </button>
        <button
          type="button"
          onClick={savePng}
          className="min-h-[52px] flex-1 rounded-full border border-champagne/40 bg-deepblue/60 px-6 text-base font-semibold text-champagne transition hover:bg-deepblue"
        >
          🖼️ Lưu tranh (PNG)
        </button>
      </div>
    </div>
  );
}
