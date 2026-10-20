import { useCallback, useEffect, useRef, useState } from 'react';
import type { Sfx } from '../types';

const STORAGE_KEY = 'secret-bloom-sound';

function getInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Tiny WebAudio synth for interaction sounds — no external audio files.
 * Sound stays OFF until the user explicitly enables it (persisted in localStorage).
 */
export function useSound(): { enabled: boolean; toggle: () => void } & Sfx {
  const [enabled, setEnabled] = useState<boolean>(getInitial);
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ stop: () => void } | null>(null);

  const ensureCtx = (): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === 'suspended') {
        void ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  };

  const tone = useCallback(
    (
      freq: number,
      startAt: number,
      dur: number,
      type: OscillatorType = 'sine',
      vol = 0.1,
    ) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      try {
        const t0 = ctx.currentTime + startAt;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
      } catch {
        /* ignore synth errors */
      }
    },
    [],
  );

  const play = useCallback(
    (notes: Array<[number, number]>) => {
      if (!enabled) return;
      notes.forEach(([f, d], i) => tone(f, i * 0.13, d));
    },
    [enabled, tone],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
      if (next) ensureCtx(); // unlock audio on the user gesture
      return next;
    });
  }, []);

  // Gentle ambient bed: soft wind (filtered noise) + a low warm pad.
  // Generated locally, very quiet, starts/stops with the toggle.
  const startAmbient = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx || ambientRef.current) return;
    try {
      // wind: looped noise through a wandering lowpass
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 320;
      lp.Q.value = 0.6;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.016;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.008;
      lfo.connect(lfoGain);
      lfoGain.connect(windGain.gain);
      // pad: two soft detuned triangles
      const padGain = ctx.createGain();
      padGain.gain.value = 0.007;
      const o1 = ctx.createOscillator();
      o1.type = 'triangle';
      o1.frequency.value = 110;
      const o2 = ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.value = 164.81;
      noise.connect(lp);
      lp.connect(windGain);
      windGain.connect(ctx.destination);
      o1.connect(padGain);
      o2.connect(padGain);
      padGain.connect(ctx.destination);
      noise.start();
      lfo.start();
      o1.start();
      o2.start();
      ambientRef.current = {
        stop: () => {
          try {
            noise.stop();
            lfo.stop();
            o1.stop();
            o2.stop();
          } catch {
            /* already stopped */
          }
        },
      };
    } catch {
      /* ignore synth errors */
    }
  }, []);

  const stopAmbient = useCallback(() => {
    ambientRef.current?.stop();
    ambientRef.current = null;
  }, []);

  // Start/stop the ambient bed with the toggle; pause when tab hidden.
  useEffect(() => {
    if (enabled) startAmbient();
    else stopAmbient();
  }, [enabled, startAmbient, stopAmbient]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        // suspend the whole context; resume restores the bed
        ctxRef.current?.suspend().catch(() => {});
      } else if (enabled) {
        ctxRef.current?.resume().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [enabled ]);

  // Warm swell for major reveals: low root + fifth rising slowly.
  const swell = useCallback(() => {
    if (!enabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime;
      [130.81, 196.0, 261.63].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, t0 + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.05, t0 + i * 0.25 + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.25 + 2.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0 + i * 0.25);
        osc.stop(t0 + i * 0.25 + 2.8);
      });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(
    () => () => {
      ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  return {
    enabled,
    toggle,
    chime: () => play([[523.25, 0.5], [659.25, 0.5], [783.99, 0.9]]),
    sparkle: () => play([[880, 0.3], [1174.66, 0.6]]),
    pop: () => play([[392, 0.22]]),
    success: () => play([[523.25, 0.3], [659.25, 0.3], [783.99, 0.3], [1046.5, 0.8]]),
    error: () => play([[220, 0.35], [174.61, 0.55]]),
    reveal: () => play([[329.63, 0.4], [440, 0.4], [554.37, 0.7]]),
    swell,
  };
}
