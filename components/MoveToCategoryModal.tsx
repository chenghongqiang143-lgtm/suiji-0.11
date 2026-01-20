import React, { useEffect } from 'react';
import { X, FolderInput } from 'lucide-react';
import { Category, ThemeColor } from '../types';

interface MoveToCategoryModalProps {
  categories: Category[];
  themeColor: ThemeColor;
  onSelect: (categoryId: string) => void;
  onClose: () => void;
  count: number;
}

const MoveToCategoryModal: React.FC<MoveToCategoryModalProps> = ({ categories, themeColor, onSelect, onClose, count }) => {
  useEffect(() => {
    const stateId = 'move-category';
    window.history.pushState({ modal: stateId }, '', window.location.href);
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === stateId) {
        window.history.back();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-modal-enter z-10 flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <FolderInput size={20} className={`text-${themeColor}-500`} />
             <h3 className="font-bold text-lg text-slate-800">移动 {count} 项到...</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
           {categories.map(cat => (
             <button
               key={cat.id}
               onClick={() => onSelect(cat.id)}
               className={`w-full text-left px-4 py-3.5 rounded-xl border border-slate-100 hover:border-${themeColor}-200 bg-slate-50 hover:bg-${themeColor}-50 transition-all font-bold text-slate-700 text-sm`}
             >
               {cat.name}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default MoveToCategoryModal;