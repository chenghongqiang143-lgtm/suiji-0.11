import React, { useState, useRef, useEffect } from 'react';
import { COLOR_THEMES } from '../constants';

interface PulseSelectorProps {
  options: string[];
  colorTheme?: string;
  onSpinEnd: (winner: string) => void;
}

const PulseSelector: React.FC<PulseSelectorProps> = ({ options, colorTheme = 'berry', onSpinEnd }) => {
  const [currentOption, setCurrentOption] = useState<string>(options[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Fixed: Use number instead of NodeJS.Timeout for browser environment compatibility
  const timerRef = useRef<number | null>(null);

  // Resolve colors based on theme
  const themeColors = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES]?.colors || COLOR_THEMES.berry.colors;
  const primaryColor = themeColors[0];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTick = (freq: number, vol: number) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    if (isSpinning) return;
    initAudio();
    setIsSpinning(true);
    setHighlight(false);

    let speed = 50; // Initial speed (ms)
    let totalTime = 0;
    const minSpeed = 50;
    const maxSpeed = 400; // Slowest speed before stop
    const duration = 2500; // Minimum spin duration

    const tick = () => {
      // Pick random option
      const randomIndex = Math.floor(Math.random() * options.length);
      setCurrentOption(options[randomIndex]);
      
      // Play sound
      const progress = Math.min(1, totalTime / (duration + 1000));
      const freq = 800 - (progress * 400); // Pitch drops as it slows
      playTick(freq, 0.1);

      // Animation loop logic
      totalTime += speed;

      if (totalTime > duration && speed > 300) {
        // STOP
        const winnerIndex = Math.floor(Math.random() * options.length);
        const winner = options[winnerIndex];
        setCurrentOption(winner);
        
        playTick(1200, 0.3); // Win sound
        setHighlight(true);
        
        setTimeout(() => {
          setIsSpinning(false);
          onSpinEnd(winner);
        }, 800);
      } else {
        // Continue spinning
        // Deceleration logic: increase speed (delay) exponentially after a certain point
        if (totalTime > duration * 0.4) {
             speed *= 1.1; 
        }
        timerRef.current = window.setTimeout(tick, speed);
      }
    };

    tick();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 relative">
      {/* Pulse Effect Background */}
      {isSpinning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full animate-ping opacity-20" 
             style={{ backgroundColor: primaryColor }} />
      )}
      
      {/* Main Display Container */}
      <div 
        className={`
          relative z-10 w-72 h-72 sm:w-80 sm:h-80 bg-white rounded-full flex items-center justify-center p-8
          shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border-[8px] transition-all duration-300
          ${highlight ? 'scale-110 shadow-[0_20px_60px_-12px_rgba(251,146,60,0.4)]' : ''}
        `}
        style={{ borderColor: highlight ? primaryColor : '#f1f5f9' }}
      >
        <div className="text-center overflow-hidden w-full">
           <h2 
             className="text-4xl sm:text-5xl font-black text-slate-800 break-words leading-tight transition-all duration-75"
             style={{ 
               transform: isSpinning ? 'scale(0.95)' : 'scale(1)',
               opacity: isSpinning ? 0.8 : 1
             }}
           >
             {currentOption}
           </h2>
        </div>

        {/* Decorative Ring */}
        <div className={`absolute inset-0 rounded-full border-4 border-dashed border-slate-200 ${isSpinning ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '3s' }} />
      </div>

      {/* Action Button */}
      <div className="mt-12 z-20">
        <button 
          onClick={handleStart}
          disabled={isSpinning}
          className="px-12 py-4 bg-orange-600 text-white rounded-full font-bold text-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
        >
           {isSpinning ? '抽取中...' : '闪电抽取'}
        </button>
      </div>
    </div>
  );
};

export default PulseSelector;