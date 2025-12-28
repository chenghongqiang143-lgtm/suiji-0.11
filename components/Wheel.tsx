import React, { useEffect, useRef, useState } from 'react';
import { COLOR_THEMES } from '../constants';

interface WheelProps {
  options: string[];
  colorTheme?: string;
  onSpinEnd: (winner: string) => void;
}

const Wheel: React.FC<WheelProps> = ({ options, colorTheme = 'default', onSpinEnd }) => {
  const rotateRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const numSegments = options.length;
  const anglePerSegment = 360 / numSegments;
  
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickIndexRef = useRef<number>(-1);

  // Resolve colors based on theme
  const themeColors = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES]?.colors || COLOR_THEMES.default.colors;

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
      
      // Softer, cleaner tick sound for modern UI
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const spin = () => {
    if (isSpinning) return;
    
    initAudio();
    setIsSpinning(true);
    
    velocityRef.current = 30 + Math.random() * 20; 
    
    const animate = () => {
      rotationRef.current += velocityRef.current;
      velocityRef.current *= 0.985; // Deceleration
      
      if (rotateRef.current) {
        rotateRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
      
      const currentTick = Math.floor(rotationRef.current / anglePerSegment);
      if (currentTick !== lastTickIndexRef.current) {
        playTickSound();
        lastTickIndexRef.current = currentTick;
      }

      if (velocityRef.current < 0.02) {
        setIsSpinning(false);
        velocityRef.current = 0;
        
        const normalizedRotation = rotationRef.current % 360;
        const effectiveAngle = (360 - normalizedRotation) % 360;
        const winningIndex = Math.floor(effectiveAngle / anglePerSegment);
        
        setTimeout(() => {
          onSpinEnd(options[winningIndex]);
        }, 300);
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative w-full max-w-[320px] md:max-w-[360px] mx-auto aspect-square flex items-center justify-center select-none my-6">
      
      {/* Modern Pointer - Minimalist Triangle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 pointer-events-none drop-shadow-md">
         <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 36L6 6H34L20 36Z" fill="#334155"/>
         </svg>
      </div>

      {/* Wheel Container - Clean Border */}
      <div className="w-full h-full rounded-full bg-white shadow-2xl p-1 relative overflow-hidden ring-4 ring-white/60">
           <div className="w-full h-full rounded-full overflow-hidden relative border-[6px] border-white/50 shadow-inner">
             <div
                ref={rotateRef}
                className="w-full h-full will-change-transform"
                style={{ transform: `rotate(${rotationRef.current}deg)` }}
              >
                <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90">
                  {options.map((option, index) => {
                    const startAngle = index * anglePerSegment;
                    const endAngle = (index + 1) * anglePerSegment;
                    
                    const [startX, startY] = getCoordinatesForPercent(endAngle / 360); 
                    const [endX, endY] = getCoordinatesForPercent(startAngle / 360); 
                    const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
                    
                    const pathData = `M 0 0 L ${startX * 100} ${startY * 100} A 100 100 0 ${largeArcFlag} 0 ${endX * 100} ${endY * 100} Z`;

                    const midAngle = startAngle + anglePerSegment / 2;
                    const textRadius = 68; // Slightly further out for cleaner look
                    const textX = Math.cos(midAngle * Math.PI / 180) * textRadius;
                    const textY = Math.sin(midAngle * Math.PI / 180) * textRadius;

                    return (
                      <g key={index}>
                        <path 
                          d={pathData} 
                          fill={themeColors[index % themeColors.length]} 
                          stroke="white" 
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize={options.length > 8 ? "6" : "7.5"}
                          fontWeight="700"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                          style={{ pointerEvents: 'none', fontFamily: 'Fredoka, sans-serif' }}
                        >
                          {option.length > 7 ? option.substring(0, 6) + '..' : option}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
      </div>

      {/* Modern Center Button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <button 
          onClick={spin}
          disabled={isSpinning}
          className="w-16 h-16 rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group ring-4 ring-slate-50/50"
        >
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
            <span className="text-white font-bold text-lg tracking-widest pl-0.5">GO</span>
          </div>
        </button>
      </div>

    </div>
  );
};

export default Wheel;