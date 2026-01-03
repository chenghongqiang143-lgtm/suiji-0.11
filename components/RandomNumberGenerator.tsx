import React, { useState, useRef, useEffect } from 'react';
import { Hash, Zap } from 'lucide-react';

interface RandomNumberGeneratorProps {
  onSpinEnd: (result: string) => void;
  language: 'zh' | 'en';
}

const RandomNumberGenerator: React.FC<RandomNumberGeneratorProps> = ({ onSpinEnd, language }) => {
  const [digitCount, setDigitCount] = useState(4);
  const [currentNumbers, setCurrentNumbers] = useState<string[]>(Array(4).fill('0'));
  const [isGenerating, setIsGenerating] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // To track the animation frame
  const frameRef = useRef<number>(0);

  const t = {
    generate: language === 'zh' ? '生成随机数' : 'Generate',
    generating: language === 'zh' ? '生成中...' : 'Generating...',
    digits: language === 'zh' ? '位数字' : 'Digits',
  };

  useEffect(() => {
    // Reset display when count changes
    setCurrentNumbers(Array(digitCount).fill('0'));
  }, [digitCount]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playDataSound = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch(e) {}
  };

  const playSuccessSound = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    } catch(e) {}
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    initAudio();
    setIsGenerating(true);

    const startTime = Date.now();
    const duration = 1500; // 1.5s shuffle
    let lastSoundTime = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < duration) {
        // Shuffle effect
        const temp = Array(digitCount).fill(0).map(() => Math.floor(Math.random() * 10).toString());
        setCurrentNumbers(temp);
        
        // Play sound every 80ms
        if (now - lastSoundTime > 80) {
          playDataSound();
          lastSoundTime = now;
        }
        
        frameRef.current = requestAnimationFrame(animate);
      } else {
        // Finalize
        const finalNumbers = Array(digitCount).fill(0).map(() => Math.floor(Math.random() * 10).toString());
        setCurrentNumbers(finalNumbers);
        playSuccessSound();
        setIsGenerating(false);
        onSpinEnd(finalNumbers.join(''));
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full max-w-lg mx-auto animate-fade-in">
      
      {/* Number Display */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 h-32 perspective-[1000px]">
        {currentNumbers.map((num, idx) => (
          <div 
            key={idx}
            className="relative w-14 h-20 sm:w-20 sm:h-28 bg-slate-800 rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)] border-t border-slate-700 overflow-hidden"
          >
             {/* Glass shine */}
             <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
             
             <span className={`text-5xl sm:text-7xl font-mono font-bold text-white ${isGenerating ? 'blur-[1px]' : ''}`}>
               {num}
             </span>
             
             {/* Scanline effect */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,6px_100%] pointer-events-none opacity-40"></div>
          </div>
        ))}
      </div>

      {/* Digit Count Selector */}
      <div className="mb-8 w-full max-w-xs">
         <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <button
                key={count}
                onClick={() => !isGenerating && setDigitCount(count)}
                disabled={isGenerating}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  digitCount === count 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {count}
              </button>
            ))}
         </div>
         <div className="text-center mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
            {t.digits}
         </div>
      </div>

      {/* Generate Button */}
      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xl tracking-widest shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-2 transition-all disabled:opacity-80 disabled:active:translate-y-0 disabled:active:shadow-[0_8px_0_#c2410c] flex items-center justify-center gap-3"
      >
        {isGenerating ? (
           <Zap className="animate-pulse" size={24} />
        ) : (
           <Hash size={24} />
        )}
        {isGenerating ? t.generating : t.generate}
      </button>

    </div>
  );
};

export default RandomNumberGenerator;