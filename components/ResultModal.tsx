import React, { useEffect } from 'react';
import { X, RefreshCw, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultModalProps {
  result: string;
  onClose: () => void;
  onSpinAgain: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose, onSpinAgain }) => {
  
  const playWinSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; 
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = now + i * 0.08;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
        
        osc.start(startTime);
        osc.stop(startTime + 0.8);
      });
      
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    playWinSound();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-bounce-in z-10 overflow-hidden border border-white/50">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-50 to-transparent pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-2 rounded-full transition-colors z-20"
        >
          <X size={24} />
        </button>

        <div className="relative z-10 mt-4">
          <h3 className="text-orange-900/50 uppercase tracking-widest text-[10px] font-bold mb-6 flex items-center justify-center gap-3">
            <span className="w-6 h-[2px] bg-orange-200 rounded-full"></span>
            THE UNIVERSE SAYS
            <span className="w-6 h-[2px] bg-orange-200 rounded-full"></span>
          </h3>
          
          <div className="min-h-[120px] flex items-center justify-center">
            <div className="text-4xl md:text-5xl font-black text-slate-800 mb-8 break-words leading-tight drop-shadow-sm p-2">
              {result}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-orange-600 text-white font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check size={20} strokeWidth={3} />
              就它了！
            </button>
            <button
              onClick={onSpinAgain}
              className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} strokeWidth={2.5} />
              再转一次
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;