import React, { useState, useEffect, useRef } from 'react';
import { COLOR_THEMES } from '../constants';

interface GridSelectorProps {
  options: string[];
  colorTheme?: string;
  onSpinEnd: (winner: string) => void;
}

const GridSelector: React.FC<GridSelectorProps> = ({ options, colorTheme = 'default', onSpinEnd }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Resolve colors based on theme
  const themeColors = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES]?.colors || COLOR_THEMES.default.colors;
  // Use the first color of the theme as the primary active color to prevent the grid from looking too messy
  const activeColor = themeColors[0];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBeep = (freq: number = 600, duration: number = 0.05) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.01);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    if (isSpinning) return;
    initAudio();
    setIsSpinning(true);

    const winnerIndex = Math.floor(Math.random() * options.length);
    
    // Better approach: Calculate total steps
    // Ensure we go at least 3 full loops + difference to winner
    // We base the start index on the current activeIndex (or 0 if null)
    const startIdx = activeIndex === null ? 0 : activeIndex;
    const safeTotalSteps = (options.length * 3) + ((winnerIndex - startIdx + options.length) % options.length);
    
    const runStep = (currentStep: number) => {
       const nextIdx = (startIdx + currentStep) % options.length;
       setActiveIndex(nextIdx);
       playBeep(440, 0.04);
       
       if (currentStep < safeTotalSteps) {
         // Calculate delay - exponential ease out
         // Start fast (50ms), end slow (300ms)
         const progress = currentStep / safeTotalSteps;
         const delay = 50 + (300 * Math.pow(progress, 3)); 
         setTimeout(() => runStep(currentStep + 1), delay);
       } else {
         // Finished
         playBeep(880, 0.2); // Win sound
         setTimeout(() => {
             setIsSpinning(false);
             onSpinEnd(options[winnerIndex]);
         }, 500);
       }
    };

    runStep(1);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 p-2">
        {options.map((option, index) => {
           const isActive = activeIndex === index;
           
           return (
             <div 
               key={index}
               className={`
                 relative h-24 rounded-2xl flex items-center justify-center p-3 text-center font-bold text-lg transition-all duration-100
                 ${isActive 
                    ? 'scale-105 z-10 text-white' 
                    : 'bg-white text-slate-600 shadow-sm border border-slate-100/80 opacity-90'
                 }
               `}
               style={{
                 // Only use the theme color when active
                 backgroundColor: isActive ? activeColor : undefined,
                 boxShadow: isActive ? `0 10px 30px -8px ${activeColor}99` : undefined,
                 transform: isActive ? 'scale(1.05)' : 'scale(1)'
               }}
             >
               {option}
             </div>
           );
        })}
      </div>

      <button 
        onClick={handleStart}
        disabled={isSpinning}
        className="px-12 py-4 bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200 rounded-full font-bold text-xl shadow-lg shadow-orange-100/50 hover:shadow-orange-200 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:transform-none"
      >
        {isSpinning ? '...' : '选一张'}
      </button>
    </div>
  );
};

export default GridSelector;