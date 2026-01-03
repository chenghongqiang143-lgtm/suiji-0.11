import React, { useState, useRef } from 'react';

interface CoinFlipperProps {
  onSpinEnd: (result: string) => void;
  language: 'zh' | 'en';
}

const CoinFlipper: React.FC<CoinFlipperProps> = ({ onSpinEnd, language }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const t = {
    flip: language === 'zh' ? '抛硬币' : 'Flip Coin',
    flipping: language === 'zh' ? '...' : '...',
    heads: language === 'zh' ? '正面' : 'Heads',
    tails: language === 'zh' ? '反面' : 'Tails',
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSoundEffect = (type: 'ping' | 'land') => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      
      if (type === 'ping') {
        // High metallic ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(2200, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      } else {
        // Landing clatter (simulated with noise and low tones)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);

        // Second click for clatter
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(200, t + 0.08);
        gain2.gain.setValueAtTime(0.1, t + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t + 0.08);
        osc2.stop(t + 0.25);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFlip = () => {
    if (isFlipping) return;
    initAudio();
    setIsFlipping(true);
    playSoundEffect('ping');

    // Random result
    const resultIsHeads = Math.random() > 0.5;
    
    // Calculate rotation:
    // Current rotation + Minimum spins (5 * 360) + Result adjustment
    // If heads: align to 0 (mod 360), If tails: align to 180 (mod 360)
    // We want the final rotation to be additive to preserve direction
    const minSpins = 5;
    const currentBase = Math.ceil(rotation / 360) * 360; 
    const targetBase = currentBase + (minSpins * 360);
    const targetRotation = targetBase + (resultIsHeads ? 0 : 180);

    setRotation(targetRotation);

    // Animation duration should match transition
    setTimeout(() => {
      playSoundEffect('land');
      setIsFlipping(false);
      onSpinEnd(resultIsHeads ? t.heads : t.tails);
    }, 2000); 
  };

  // Determine which side is visual "front" based on rotation
  // This is purely for rendering 
  const isHeadsVisual = Math.abs(rotation % 360) < 90 || Math.abs(rotation % 360) > 270;

  return (
    <div className="flex flex-col items-center justify-center py-10 w-full overflow-hidden">
      {/* Container for the toss (up/down) animation */}
      <div 
        className="relative mb-12"
        style={{
           transition: 'transform 2s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
           transform: isFlipping ? 'translateY(-200px) scale(1.3)' : 'translateY(0) scale(1)'
        }}
      >
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 perspective-[1000px]">
          <div 
            className="w-full h-full relative preserve-3d"
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 2s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `rotateY(${rotation}deg)`
            }}
          >
            {/* Heads Side (Front at 0deg) */}
            <div 
              className="absolute w-full h-full rounded-full backface-hidden flex items-center justify-center bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-[inset_0_0_20px_rgba(251,191,36,0.6)] border-[6px] border-yellow-200"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
            >
               <div className="w-[85%] h-[85%] rounded-full border-2 border-dashed border-yellow-200/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse"></div>
                  <span className="relative text-4xl font-black text-yellow-50 drop-shadow-md tracking-widest">{t.heads}</span>
               </div>
            </div>

            {/* Tails Side (Back at 180deg) */}
            <div 
              className="absolute w-full h-full rounded-full backface-hidden flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[inset_0_0_20px_rgba(148,163,184,0.6)] border-[6px] border-slate-200"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="w-[85%] h-[85%] rounded-full border-2 border-dashed border-slate-200/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-400/20 rounded-full animate-pulse"></div>
                  <span className="relative text-4xl font-black text-slate-100 drop-shadow-md tracking-widest">{t.tails}</span>
               </div>
            </div>
            
            {/* Thickness (Edge) - Simplified simulation */}
            <div 
               className="absolute top-0 left-1/2 w-4 h-full bg-yellow-600 -translate-x-1/2"
               style={{ 
                 transform: 'rotateY(90deg)', 
                 width: '10px' 
               }} 
            />
          </div>
        </div>
        
        {/* Shadow */}
        <div 
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/20 blur-xl rounded-full transition-all duration-[2000ms]"
          style={{
            width: isFlipping ? '80px' : '160px',
            height: isFlipping ? '20px' : '40px',
            opacity: isFlipping ? 0.2 : 0.4
          }}
        ></div>
      </div>

      <button 
        onClick={handleFlip}
        disabled={isFlipping}
        className="w-full max-w-xs py-4 bg-orange-500 text-white rounded-2xl font-black text-xl tracking-widest shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-2 transition-all disabled:opacity-80 disabled:active:translate-y-0 disabled:active:shadow-[0_8px_0_#c2410c]"
      >
        {isFlipping ? t.flipping : t.flip}
      </button>
    </div>
  );
};

export default CoinFlipper;