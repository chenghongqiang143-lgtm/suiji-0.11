import React, { useState, useEffect, useRef } from 'react';

interface DigitalRollerProps {
  options: string[];
  onSpinEnd: (winner: string) => void;
}

const DigitalRoller: React.FC<DigitalRollerProps> = ({ options, onSpinEnd }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null); // Ref to measure actual height
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const lastWinnerIndexRef = useRef<number>(1);

  useEffect(() => {
    // 60 repetitions
    const repeated = Array(60).fill(options).flat();
    setDisplayOptions(repeated);
    
    lastWinnerIndexRef.current = 1;
    
    if (scrollRef.current) {
       scrollRef.current.style.transition = 'none';
       scrollRef.current.style.transform = 'translateY(0px)';
    }
  }, [options]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTickSound = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.error(e);
    }
  };

  const getItemHeight = () => {
    if (firstItemRef.current) {
      return firstItemRef.current.getBoundingClientRect().height;
    }
    return 80; // Fallback
  };

  const handleSpin = () => {
    if (isSpinning || !scrollRef.current || options.length === 0) return;
    initAudio();
    setIsSpinning(true);

    const winnerIndex = Math.floor(Math.random() * options.length);
    const winner = options[winnerIndex];
    
    // Dynamically measure the item height to ensure pixel-perfect alignment
    // This fixes issues where scaling/zooming causes the hardcoded 80px to be off.
    const itemHeight = getItemHeight();
    
    // 1. SETUP START POSITION
    const startCycle = 2;
    const safeLastIndex = lastWinnerIndexRef.current % options.length;
    const startIndex = (startCycle * options.length) + safeLastIndex;
    
    const startPos = (startIndex * itemHeight) - itemHeight;
    
    scrollRef.current.style.transition = 'none';
    scrollRef.current.style.transform = `translateY(-${startPos}px)`;
    
    scrollRef.current.offsetHeight; // force reflow

    // 2. CALCULATE TARGET POSITION
    const targetCycle = 35 + Math.floor(Math.random() * 5); 
    const targetIndex = (targetCycle * options.length) + winnerIndex;
    
    const targetPos = (targetIndex * itemHeight) - itemHeight;

    // 3. ANIMATE
    scrollRef.current.style.transition = 'transform 3s cubic-bezier(0.15, 0.5, 0.15, 1)'; 
    scrollRef.current.style.transform = `translateY(-${targetPos}px)`;

    let clickCount = 0;
    const maxClicks = 20;
    const clickInterval = setInterval(() => {
      clickCount++;
      playTickSound();
      if (clickCount >= maxClicks) clearInterval(clickInterval);
    }, 100);

    lastWinnerIndexRef.current = winnerIndex;

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(winner);
    }, 3200);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
      {/* Machine Frame */}
      <div className="relative w-full h-[240px] bg-slate-800 rounded-3xl p-4 shadow-[0_20px_40px_-10px_rgba(251,146,60,0.3)] border-4 border-slate-700 ring-4 ring-orange-200/50 overflow-hidden">
        {/* Glass Reflection/Glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent z-20 pointer-events-none rounded-2xl"></div>
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"></div>

        {/* Selection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-20 -translate-y-1/2 bg-orange-500/10 border-y-2 border-orange-500/50 z-10 flex items-center justify-between px-2">
           <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-orange-500 border-b-[8px] border-b-transparent"></div>
           <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-orange-500 border-b-[8px] border-b-transparent"></div>
        </div>

        {/* Scrolling Content */}
        <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
          <div 
            ref={scrollRef}
            className="w-full flex flex-col items-center"
            style={{ willChange: 'transform' }}
          >
            {displayOptions.map((opt, i) => (
              <div 
                key={i} 
                ref={i === 0 ? firstItemRef : null}
                className="h-20 w-full flex items-center justify-center flex-none border-b border-slate-100 text-slate-800 font-bold text-2xl px-4 text-center"
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button */}
      <button 
        onClick={handleSpin}
        disabled={isSpinning}
        className="group relative w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xl tracking-widest shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-2 transition-all disabled:opacity-80 disabled:active:translate-y-0 disabled:active:shadow-[0_8px_0_#c2410c] overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        {isSpinning ? 'SPINNING...' : '开始滚动'}
      </button>
    </div>
  );
};

export default DigitalRoller;