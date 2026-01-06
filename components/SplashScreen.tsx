import React from 'react';
import { Dices, AlertTriangle } from 'lucide-react';

interface SplashScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ error, onRetry }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-orange-200/50 blur-xl rounded-full animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-orange-100 border border-orange-50">
          <Dices size={48} className="text-orange-500 animate-bounce" />
        </div>
      </div>
      
      <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">SpinDecide</h1>
      
      {error ? (
        <div className="flex flex-col items-center mt-4 animate-fade-in">
           <div className="flex items-center gap-2 text-rose-500 mb-2">
             <AlertTriangle size={18} />
             <span className="font-bold text-sm">Startup Error</span>
           </div>
           <p className="text-xs text-slate-400 mb-4">{error}</p>
           {onRetry && (
             <button onClick={onRetry} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-xs hover:bg-slate-50">
               Retry
             </button>
           )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 mt-4">
           <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-orange-400 w-1/3 animate-[loading_1.5s_ease-in-out_infinite]"></div>
           </div>
           <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Initializing</p>
        </div>
      )}
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;