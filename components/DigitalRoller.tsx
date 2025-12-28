import React, { useState, useEffect, useRef } from 'react';

interface DigitalRollerProps {
  options: string[];
  onSpinEnd: (winner: string) => void;
}

const DigitalRoller: React.FC<DigitalRollerProps> = ({ options, onSpinEnd }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize display list (duplicate options to allow scrolling)
  useEffect(() => {
    // We create a long list for the scrolling effect
    // 50 repetitions should be enough for the animation duration
    const repeated = Array(50).fill(options).flat();
    setDisplayOptions(repeated);
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
      
      // Deeper, mechanical click sound
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

  const handleSpin = () => {
    if (isSpinning || !scrollRef.current) return;
    initAudio();
    setIsSpinning(true);

    const winnerIndex = Math.floor(Math.random() * options.length);
    const winner = options[winnerIndex];
    
    // Calculate scroll target
    // Item height = 80px (h-20)
    // We want to land on the winner somewhere deep in the list
    // Let's pick an occurrence of the winner near the end of our repeated list
    const itemHeight = 80;
    const targetCycle = 35; // How many full loops to spin roughly
    // Find the index of the winner in the large array that corresponds to this cycle
    const targetIndex = (targetCycle * options.length) + winnerIndex;
    
    // Random offset to center the text slightly imperfectly then snap? 
    // No, simpler to just scroll to exact position for now.
    const scrollTarget = targetIndex * itemHeight;

    // Reset scroll to 0 immediately before starting
    scrollRef.current.style.transition = 'none';
    scrollRef.current.style.transform = 'translateY(0px)';
    
    // Force reflow
    scrollRef.current.offsetHeight;

    // Start Animation
    // Cubic-bezier for a "slot machine" pull effect: slow start, fast middle, bounce stop
    scrollRef.current.style.transition = 'transform 3s cubic-bezier(0.15, 0.5, 0.15, 1)'; 
    scrollRef.current.style.transform = `translateY(-${scrollTarget}px)`;

    // Audio clicks during spin
    let clickCount = 0;
    const maxClicks = 20;
    const clickInterval = setInterval(() => {
      clickCount++;
      playTickSound();
      if (clickCount >= maxClicks) clearInterval(clickInterval);
    }, 100);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(winner);
    }, 3200); // Wait for transition + a tiny buffer
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