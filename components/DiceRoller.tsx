import React, { useState, useRef } from 'react';
import { Minus, Plus, Dices } from 'lucide-react';

interface DiceRollerProps {
  onSpinEnd: (result: string) => void;
  language: 'zh' | 'en';
}

const DiceRoller: React.FC<DiceRollerProps> = ({ onSpinEnd, language }) => {
  const [numDice, setNumDice] = useState(1);
  const [diceValues, setDiceValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const t = {
    roll: language === 'zh' ? '掷骰子' : 'Roll Dice',
    rolling: language === 'zh' ? '...' : '...',
    total: language === 'zh' ? '点数' : 'Total',
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playShakeSound = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      // Filtered noise for a more "plastic cup shake" sound
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800 + Math.random() * 400;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) { console.error(e); }
  };

  const playKnockSound = () => {
     if (!audioCtxRef.current) return;
     try {
       const ctx = audioCtxRef.current;
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       
       osc.frequency.setValueAtTime(150, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
       
       gain.gain.setValueAtTime(0.3, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
       
       osc.connect(gain);
       gain.connect(ctx.destination);
       osc.start();
       osc.stop(ctx.currentTime + 0.1);
     } catch(e) { console.error(e); }
  };

  const handleRoll = () => {
    if (isRolling) return;
    initAudio();
    setIsRolling(true);

    // Animation interval
    let ticks = 0;
    const maxTicks = 12; // About 1 second
    const interval = setInterval(() => {
      ticks++;
      playShakeSound();
      
      // Randomize intermediate values
      setDiceValues(prev => prev.map(() => Math.floor(Math.random() * 6) + 1));
      
      if (ticks >= maxTicks) {
        clearInterval(interval);
        playKnockSound();
        
        // Final Result
        const finalValues = Array(numDice).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
        setDiceValues(finalValues);
        setIsRolling(false);
        
        const sum = finalValues.reduce((a, b) => a + b, 0);
        const resultText = numDice > 1 
          ? `${sum} (${finalValues.join('+')})` 
          : `${sum}`;
          
        onSpinEnd(resultText);
      }
    }, 100);
  };

  const adjustDiceCount = (delta: number) => {
    setNumDice(prev => {
      const next = Math.max(1, Math.min(4, prev + delta));
      setDiceValues(Array(next).fill(1));
      return next;
    });
  };

  const renderDot = (visible: boolean) => (
    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-800 ${visible ? 'opacity-100' : 'opacity-0'}`} />
  );

  const renderFace = (value: number, index: number) => {
    // Generate random rotation transform strings when rolling
    // When not rolling, reset to clean state (or maybe slight offset for natural look)
    const rotationStyle = isRolling ? {
      transform: `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg) translateZ(10px)`
    } : {
      transform: `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`
    };

    return (
      <div 
        key={index}
        style={{
           perspective: '500px'
        }}
      >
        <div 
            className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-[0_8px_0_#cbd5e1] border-2 border-slate-200 flex flex-col justify-between p-3 sm:p-4 transition-transform duration-100 ease-linear"
            style={rotationStyle}
        >
          {/* Row 1 */}
          <div className="flex justify-between">
              {renderDot(value > 1)}
              {renderDot(value > 3)}
          </div>
          {/* Row 2 */}
          <div className="flex justify-between items-center h-full">
              {renderDot(value === 6)}
              {renderDot(value % 2 === 1)}
              {renderDot(value === 6)}
          </div>
          {/* Row 3 */}
          <div className="flex justify-between">
              {renderDot(value > 3)}
              {renderDot(value > 1)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full max-w-lg mx-auto">
      
      {/* Dice Display Area */}
      <div className="min-h-[200px] flex items-center justify-center mb-8 w-full">
         <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {diceValues.map((val, idx) => renderFace(val, idx))}
         </div>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col gap-6">
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-center gap-6 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-white mx-auto">
           <button 
             onClick={() => adjustDiceCount(-1)}
             disabled={isRolling || numDice <= 1}
             className="p-3 bg-white text-slate-500 rounded-lg shadow-sm hover:text-orange-500 disabled:opacity-50 disabled:hover:text-slate-500"
           >
             <Minus size={20} />
           </button>
           <div className="flex flex-col items-center w-16">
              <span className="text-2xl font-black text-slate-700 leading-none">{numDice}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">DICE</span>
           </div>
           <button 
             onClick={() => adjustDiceCount(1)}
             disabled={isRolling || numDice >= 4}
             className="p-3 bg-white text-slate-500 rounded-lg shadow-sm hover:text-orange-500 disabled:opacity-50 disabled:hover:text-slate-500"
           >
             <Plus size={20} />
           </button>
        </div>

        {/* Roll Button */}
        <button 
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xl tracking-widest shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-2 transition-all disabled:opacity-80 disabled:active:translate-y-0 disabled:active:shadow-[0_8px_0_#c2410c] flex items-center justify-center gap-3"
        >
          <Dices size={24} />
          {isRolling ? t.rolling : t.roll}
        </button>
      </div>

    </div>
  );
};

export default DiceRoller;