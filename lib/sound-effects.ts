/**
 * Sintetizador Procedural de Efeitos Sonoros (SFX) e Trilha Musical
 * Usa Web Audio API pura para gerar Whoosh, Pop, Impacto e Batida Ambiente sem depender de links quebrados.
 */

import { SfxType } from '@/types/studio';

class StudioSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Dispara um som de transição cinematográfico procedural via WebAudio
   */
  public playSfx(type: SfxType = 'whoosh', volume = 0.25) {
    if (type === 'none') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
      return;
    }

    if (type === 'cash') {
      // Som metálico de registradora / moeda (2 harmônicos agudos)
      [1200, 1800].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(volume * 0.9, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.26);
      });
      return;
    }

    if (type === 'glitch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(920, now + 0.03);
      osc.frequency.setValueAtTime(80, now + 0.06);
      osc.frequency.setValueAtTime(640, now + 0.09);
      gain.gain.setValueAtTime(volume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
      return;
    }

    if (type === 'typing') {
      for (let k = 0; k < 3; k++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + k * 120, now + k * 0.05);
        gain.gain.setValueAtTime(volume * 0.6, now + k * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + k * 0.05 + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + k * 0.05);
        osc.stop(now + k * 0.05 + 0.035);
      }
      return;
    }

    if (type === 'impact' || type === 'cinematic_boom') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const dur = type === 'cinematic_boom' ? 0.65 : 0.35;
      osc.frequency.setValueAtTime(type === 'cinematic_boom' ? 95 : 130, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + dur);

      gain.gain.setValueAtTime(volume * 1.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
      return;
    }

    // Default 'whoosh' / 'rise' filtered noise
    const bufferSize = ctx.sampleRate * 0.28;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.28);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.29);
  }
}

export const soundEngine = new StudioSoundEngine();
