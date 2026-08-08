/**
 * Web Audio API synth engine for soothing ambient nature sounds and interactive eco-chimes.
 * Generates an organic, meditative harmonic pad with LFO filter sweeps and ambient crystal bell chimes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGainNode: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  private chimeTimer: ReturnType<typeof setInterval> | null = null;
  private isAmbientPlaying = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play pleasant eco success chime on action
  playChime(type: 'waste' | 'water' | 'energy' | 'nature' | 'community' | 'heal' = 'heal') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      let freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      if (type === 'water') freqs = [440, 554.37, 659.25, 880];
      if (type === 'energy') freqs = [587.33, 739.99, 880, 1174.66];
      if (type === 'nature') freqs = [392.00, 493.88, 587.33, 783.99];

      freqs.forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.08);

        g.gain.setValueAtTime(0.12, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

        o.connect(g);
        g.connect(this.ctx!.destination);

        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.6);
      });
    } catch {
      // Audio fallback
    }
  }

  // Play a soft, soothing crystal bell note
  private playAmbientBellNote() {
    if (!this.ctx || !this.isAmbientPlaying || !this.ambientGain) return;

    try {
      const now = this.ctx.currentTime;
      // Soft pentatonic frequencies (A4, C#5, E5, F#5, A5)
      const bellFreqs = [440.00, 554.37, 659.25, 739.99, 880.00, 1108.73];
      const freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      osc.stop(now + 3.6);
    } catch {
      // Ignore
    }
  }

  // Toggle ambient peaceful nature synthesizer pad
  toggleAmbient(enable: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!enable) {
        if (this.chimeTimer) {
          clearInterval(this.chimeTimer);
          this.chimeTimer = null;
        }

        if (this.ambientGain) {
          const now = this.ctx.currentTime;
          this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
          
          setTimeout(() => {
            this.oscs.forEach(o => {
              try { o.stop(); } catch {}
            });
            this.oscs = [];
            try { this.lfoNode?.stop(); } catch {}
            this.lfoNode = null;
            this.isAmbientPlaying = false;
          }, 1300);
        }
        return;
      }

      if (this.isAmbientPlaying) return;

      const now = this.ctx.currentTime;

      // 1. Create Main Master Ambient Gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.08, now + 2.5); // Soft, soothing volume

      // 2. Create Low-pass Filter with LFO for slow "breathing" atmosphere
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(450, now);

      // LFO for filter frequency modulation (0.1 Hz breathing curve)
      this.lfoNode = this.ctx.createOscillator();
      this.lfoGainNode = this.ctx.createGain();
      this.lfoNode.frequency.setValueAtTime(0.12, now); // 12-second slow wave
      this.lfoGainNode.gain.setValueAtTime(220, now); // Swing filter between 230Hz and 670Hz

      this.lfoNode.connect(this.lfoGainNode);
      this.lfoGainNode.connect(this.filterNode.frequency);
      this.lfoNode.start(now);

      // 3. Create Harmonic Cord Oscillators (A-Major 9 / F#m7 meditative drone)
      // A2 (110Hz), E3 (164.81Hz), A3 (220Hz), C#4 (277.18Hz), E4 (329.63Hz)
      const padConfig = [
        { freq: 110.00, type: 'sine' as OscillatorType, gain: 0.18 },
        { freq: 164.81, type: 'sine' as OscillatorType, gain: 0.14 },
        { freq: 220.00, type: 'triangle' as OscillatorType, gain: 0.10 },
        { freq: 277.18, type: 'sine' as OscillatorType, gain: 0.12 },
        { freq: 329.63, type: 'sine' as OscillatorType, gain: 0.08 },
      ];

      this.oscs = [];

      padConfig.forEach(cfg => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();

        o.type = cfg.type;
        o.frequency.setValueAtTime(cfg.freq, now);

        // Micro detune for organic acoustic warmth
        const detune = (Math.random() - 0.5) * 6;
        o.detune.setValueAtTime(detune, now);

        g.gain.setValueAtTime(cfg.gain, now);

        o.connect(g);
        g.connect(this.filterNode!);

        o.start(now);
        this.oscs.push(o);
      });

      // Connect Filter -> Ambient Gain -> Destination
      this.filterNode.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.isAmbientPlaying = true;

      // Play introductory gentle harp/chime sweep
      this.playChime('nature');

      // Schedule periodic random crystal bell chimes every 4-7 seconds
      this.chimeTimer = setInterval(() => {
        this.playAmbientBellNote();
      }, 5000);

    } catch {
      // Fallback
    }
  }
}

export const soundEngine = new SoundEngine();

