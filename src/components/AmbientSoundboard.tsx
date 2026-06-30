import { useState, useRef } from 'react';
import { Volume2, VolumeX, Music, CloudRain, Flame } from 'lucide-react';

export default function AmbientSoundboard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<'none' | 'sanctuary' | 'rain' | 'hearth'>('none');
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Oscillator/filter nodes references for real-time control or clean disposal
  const nodesRef = useRef<any[]>([]);

  const stopAllNodes = () => {
    nodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    nodesRef.current = [];
  };

  const startSound = (type: 'sanctuary' | 'rain' | 'hearth') => {
    stopAllNodes();
    
    // Lazy initialize AudioContext on user action
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'sanctuary') {
      // 1. Cozy Sanctuary Ambient Chimes (Slow, soothing synth pad)
      // We will generate a rolling sequence of peaceful notes
      const playMelody = () => {
        if (activeSound !== 'sanctuary' && type !== 'sanctuary') return;
        
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 440.00, 523.25]; // C4, E4, G4, A4, C5
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(randomNote, now);
        
        // Soft volume envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.04, now + 2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 8);
        
        // Lowpass filter for warm, cozy analog tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 8);
        
        nodesRef.current.push(osc);
        
        // Schedule next note randomly
        const nextTime = 4000 + Math.random() * 4000;
        const timerId = setTimeout(() => {
          if (isPlaying || activeSound === 'sanctuary') {
            playMelody();
          }
        }, nextTime);
        
        // Keep track of timeout to clean up
        (window as any)._sanctuaryTimer = timerId;
      };

      playMelody();
    } else if (type === 'rain') {
      // 2. Procedural Rain generator using White Noise + Lowpass filter
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450; // Rain sound is muffled and low-frequency

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      nodesRef.current.push(whiteNoise);
    } else if (type === 'hearth') {
      // 3. Cozy crackling fireplace (Low roar + randomized crackle pulses)
      // Low rumble base (Brown/Red noise style)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate loss of gain
      }

      const rumble = ctx.createBufferSource();
      rumble.buffer = noiseBuffer;
      rumble.loop = true;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 150;

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.45;

      rumble.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumble.start();
      nodesRef.current.push(rumble);

      // Crackling embers (procedural clicking pulses)
      const playCrackle = () => {
        if (activeSound !== 'hearth' && type !== 'hearth') return;
        
        const now = ctx.currentTime;
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();

        click.type = 'triangle';
        click.frequency.setValueAtTime(8000 + Math.random() * 4000, now);
        
        clickGain.gain.setValueAtTime(0.02, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(now);
        click.stop(now + 0.04);

        nodesRef.current.push(click);

        const nextCrackle = 50 + Math.random() * 400;
        const crackleTimer = setTimeout(playCrackle, nextCrackle);
        (window as any)._hearthTimer = crackleTimer;
      };

      playCrackle();
    }
  };

  const handleToggleSound = (type: 'sanctuary' | 'rain' | 'hearth') => {
    // Clear any pending timers
    if ((window as any)._sanctuaryTimer) clearTimeout((window as any)._sanctuaryTimer);
    if ((window as any)._hearthTimer) clearTimeout((window as any)._hearthTimer);

    if (activeSound === type) {
      stopAllNodes();
      setActiveSound('none');
      setIsPlaying(false);
    } else {
      setActiveSound(type);
      setIsPlaying(true);
      startSound(type);
    }
  };

  const handleStopAll = () => {
    if ((window as any)._sanctuaryTimer) clearTimeout((window as any)._sanctuaryTimer);
    if ((window as any)._hearthTimer) clearTimeout((window as any)._hearthTimer);
    stopAllNodes();
    setActiveSound('none');
    setIsPlaying(false);
  };

  return (
    <div className="bg-surface-container p-5 border border-outline-variant/30 rounded-lg shadow-sm" id="soundboard">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <h4 className="font-headline-md text-base font-bold text-on-surface tracking-tight">Cozy Soundboard</h4>
        </div>
        {isPlaying ? (
          <button 
            onClick={handleStopAll}
            className="flex items-center gap-1 text-xs font-label-sm text-primary uppercase hover:opacity-80 transition-all cursor-pointer"
          >
            <VolumeX size={14} className="inline" /> Stop
          </button>
        ) : (
          <span className="text-xs font-label-sm uppercase text-on-surface-variant/60">Silence is beautiful</span>
        )}
      </div>

      <p className="text-xs text-on-surface-variant mb-4 font-sans leading-relaxed">
        Let nature and music envelop your sanctuary workspace. Toggle procedural audio directly below:
      </p>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleToggleSound('sanctuary')}
          className={`flex flex-col items-center justify-center p-3 rounded border transition-all duration-300 cursor-pointer ${
            activeSound === 'sanctuary'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline/40'
          }`}
        >
          <Music size={18} className="mb-1" />
          <span className="text-[10px] font-label-sm uppercase tracking-wider text-center">Sanctuary</span>
        </button>

        <button
          onClick={() => handleToggleSound('rain')}
          className={`flex flex-col items-center justify-center p-3 rounded border transition-all duration-300 cursor-pointer ${
            activeSound === 'rain'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline/40'
          }`}
        >
          <CloudRain size={18} className="mb-1" />
          <span className="text-[10px] font-label-sm uppercase tracking-wider text-center">Rain Hum</span>
        </button>

        <button
          onClick={() => handleToggleSound('hearth')}
          className={`flex flex-col items-center justify-center p-3 rounded border transition-all duration-300 cursor-pointer ${
            activeSound === 'hearth'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline/40'
          }`}
        >
          <Flame size={18} className="mb-1" />
          <span className="text-[10px] font-label-sm uppercase tracking-wider text-center">Hearth</span>
        </button>
      </div>

      {isPlaying && (
        <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[11px] text-primary italic font-serif">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {activeSound === 'sanctuary' && "Chimes drift on morning mist..."}
          {activeSound === 'rain' && "Raindrops brush the greenhouse glass..."}
          {activeSound === 'hearth' && "Embers glow with steady warmth..."}
        </div>
      )}
    </div>
  );
}
