import { useEffect, useRef, useState } from 'react';

export type MythologyType = 'greek' | 'norse' | 'egyptian' | 'japanese';

export function useSynthAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMyth, setActiveMyth] = useState<MythologyType>('greek');
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Gain nodes for each channel to crossfade
  const greekGainRef = useRef<GainNode | null>(null);
  const norseGainRef = useRef<GainNode | null>(null);
  const egyptianGainRef = useRef<GainNode | null>(null);
  const japaneseGainRef = useRef<GainNode | null>(null);
  
  // References to active sound generators to stop/cleanup
  const oscillatorsRef = useRef<Array<OscillatorNode | BiquadFilterNode>>([]);
  const lightningIntervalRef = useRef<number | null>(null);
  const windChimeIntervalRef = useRef<number | null>(null);

  // Sync state to ref to avoid stale closures in Web Audio timers
  const activeMythRef = useRef<MythologyType>(activeMyth);
  useEffect(() => {
    activeMythRef.current = activeMyth;
  }, [activeMyth]);
  
  // Initialize Audio
  const initAudio = () => {
    if (audioCtxRef.current) return;

    // Create context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Create channels
    const gGain = ctx.createGain();
    const nGain = ctx.createGain();
    const eGain = ctx.createGain();
    const jGain = ctx.createGain();

    gGain.gain.value = 0;
    nGain.gain.value = 0;
    eGain.gain.value = 0;
    jGain.gain.value = 0;

    gGain.connect(masterGain);
    nGain.connect(masterGain);
    eGain.connect(masterGain);
    jGain.connect(masterGain);

    greekGainRef.current = gGain;
    norseGainRef.current = nGain;
    egyptianGainRef.current = eGain;
    japaneseGainRef.current = jGain;

    // ----------------------------------------------------
    // 1. Greek Channel - Zeus's Storm & Low Rumbling Drone
    // ----------------------------------------------------
    // Deep thunder rumble oscillator
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(55, ctx.currentTime); // A1

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(80, ctx.currentTime);

    rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(gGain);
    rumbleOsc.start();
    oscillatorsRef.current.push(rumbleOsc, rumbleFilter);

    // Dynamic lightning crackle function (triggered at random intervals)
    const triggerLightning = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
      if (activeMythRef.current !== 'greek') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(gGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    };

    // ----------------------------------------------------
    // 2. Norse Channel - Odin's Cosmic Auroral Pads (Sine Chimes)
    // ----------------------------------------------------
    // E minor 9 chord drone: E2 (82Hz), G3 (196Hz), B3 (247Hz), D4 (293Hz), F#4 (370Hz)
    const chords = [82.41, 196.00, 246.94, 293.66, 369.99];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Create an LFO to modulate volume gently (breathing effect)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.05 + idx * 0.02, ctx.currentTime); // Very slow
      lfoGain.gain.setValueAtTime(0.08, ctx.currentTime); // volume depth

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime); // Base volume
      
      osc.connect(gain);
      gain.connect(nGain);
      
      osc.start();
      lfo.start();
      oscillatorsRef.current.push(osc, lfo);
    });

    // ----------------------------------------------------
    // 3. Egyptian Channel - Anubis's Phrygian Desert Wind
    // ----------------------------------------------------
    // Low Phrygian base drone: D2 (73.4Hz) and A2 (110Hz)
    const egyptBase = [73.42, 110.00, 146.83];
    egyptBase.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, ctx.currentTime);

      // Slow wind-like modulation of filter cutoff
      const windLfo = ctx.createOscillator();
      const windGain = ctx.createGain();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.08 + idx * 0.04, ctx.currentTime);
      windGain.gain.setValueAtTime(40, ctx.currentTime); // sweep depth in Hz

      windLfo.connect(windGain);
      windGain.connect(filter.frequency);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.gain.setValueAtTime(0.06, ctx.currentTime);
      oscGain.connect(eGain);

      osc.start();
      windLfo.start();
      oscillatorsRef.current.push(osc, windLfo);
    });

    // ----------------------------------------------------
    // 4. Japanese Channel - Amaterasu's Sunbeams (Yo Scale Drone)
    // ----------------------------------------------------
    // Yo scale chord drone (D major pentatonic): D3 (146.83Hz), F#3 (185.00Hz), A3 (220.00Hz), D4 (293.66Hz), E4 (329.63Hz)
    const japaneseChords = [146.83, 185.00, 220.00, 293.66, 329.63];
    japaneseChords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      // Slow warm LFO for solar breathing filter modulation
      const sunLfo = ctx.createOscillator();
      const sunGain = ctx.createGain();
      sunLfo.type = 'sine';
      sunLfo.frequency.setValueAtTime(0.06 + idx * 0.03, ctx.currentTime);
      sunGain.gain.setValueAtTime(55, ctx.currentTime);

      sunLfo.connect(sunGain);
      sunGain.connect(filter.frequency);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.gain.setValueAtTime(0.07, ctx.currentTime);
      oscGain.connect(jGain);

      osc.start();
      sunLfo.start();
      oscillatorsRef.current.push(osc, sunLfo);
    });

    const triggerWindChime = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
      if (activeMythRef.current !== 'japanese') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // High-pitched crystal clear sine wave for chime (Japanese Furin style)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100 + Math.random() * 800, ctx.currentTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(jGain);

      osc.start();
      osc.stop(ctx.currentTime + 1.7);
    };

    // Set up active loops
    const lightningTimer = window.setInterval(triggerLightning, 3000);
    lightningIntervalRef.current = lightningTimer;

    const windChimeTimer = window.setInterval(triggerWindChime, 4500);
    windChimeIntervalRef.current = windChimeTimer;
  };

  // Handle Play/Pause
  const togglePlay = async () => {
    if (!audioCtxRef.current) {
      initAudio();
    }

    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (isPlaying) {
      // Fade out master volume
      masterGainRef.current?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => {
        if (ctx.state === 'running') ctx.suspend();
      }, 350);
      setIsPlaying(false);
    } else {
      // Fade in master volume
      if (ctx.state === 'suspended') await ctx.resume();
      masterGainRef.current?.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);
      setIsPlaying(true);
    }
  };

  // Crossfade channels when mythology changes
  useEffect(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;

    const gGain = greekGainRef.current;
    const nGain = norseGainRef.current;
    const eGain = egyptianGainRef.current;
    const jGain = japaneseGainRef.current;

    const time = ctx.currentTime;

    if (activeMyth === 'greek') {
      gGain?.gain.linearRampToValueAtTime(0.7, time + 0.8);
      nGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      eGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      jGain?.gain.linearRampToValueAtTime(0, time + 0.8);
    } else if (activeMyth === 'norse') {
      gGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      nGain?.gain.linearRampToValueAtTime(0.6, time + 0.8);
      eGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      jGain?.gain.linearRampToValueAtTime(0, time + 0.8);
    } else if (activeMyth === 'egyptian') {
      gGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      nGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      eGain?.gain.linearRampToValueAtTime(0.7, time + 0.8);
      jGain?.gain.linearRampToValueAtTime(0, time + 0.8);
    } else if (activeMyth === 'japanese') {
      gGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      nGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      eGain?.gain.linearRampToValueAtTime(0, time + 0.8);
      jGain?.gain.linearRampToValueAtTime(0.7, time + 0.8);
    }
  }, [activeMyth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lightningIntervalRef.current) {
        clearInterval(lightningIntervalRef.current);
      }
      if (windChimeIntervalRef.current) {
        clearInterval(windChimeIntervalRef.current);
      }
      oscillatorsRef.current.forEach(node => {
        try {
          (node as any).stop();
        } catch (e) {
          // Node might not have stop (like filter nodes)
        }
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Sound effect synthesizers connected directly to audio destination
  const playClickSound = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  };

  const playSuccessChime = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const playNote = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    // Beautiful ascending chime: E5 (659Hz), A5 (880Hz), C#6 (1109Hz), E6 (1318Hz)
    playNote(659.25, 0.0, 0.2);
    playNote(880.00, 0.06, 0.2);
    playNote(1109.73, 0.12, 0.2);
    playNote(1318.51, 0.18, 0.35);
  };

  const playErrorBuzzer = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  };

  return {
    isPlaying,
    togglePlay,
    activeMyth,
    setMythology: setActiveMyth,
    playClickSound,
    playSuccessChime,
    playErrorBuzzer
  };
}
