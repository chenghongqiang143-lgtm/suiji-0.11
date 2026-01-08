import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Template } from '../types';

interface OptionPickerModalProps {
  template: Template;
  onSelect: (option: string) => void;
  onClose: () => void;
}

const OptionPickerModal: React.FC<OptionPickerModalProps> = ({ template, onSelect, onClose }) => {
  
  // Handle Back Gesture
  useEffect(() => {
    const stateId = 'picker';
    window.history.pushState({ modal: stateId }, '', window.location.href);

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === stateId) {
        window.history.back();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-modal-enter overflow-hidden transform-gpu">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">手动选择</span>
            <h2 className="text-lg font-black text-slate-800 tracking-tight truncate max-w-[200px]">
              {template.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Options List */}
        <div className="p-4 overflow-y-auto space-y-2 bg-slate-50/50">
          {template.options.map((option, index) => {
            const isSelected = template.lastSelectedOption === option;
            return (
              <button
                key={index}
                onClick={() => onSelect(option)}
                className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-500 ring-offset-2' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <span className="truncate">{option}</span>
                {isSelected ? (
                   <CheckCircle2 size={18} className="text-white" />
                ) : (
                   <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-orange-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OptionPickerModal;