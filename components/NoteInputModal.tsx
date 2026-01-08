import React, { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';

interface NoteInputModalProps {
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
  title?: string;
}

const NoteInputModal: React.FC<NoteInputModalProps> = ({ initialNote, onSave, onClose, title }) => {
  const [note, setNote] = useState(initialNote);

  // Handle Back Gesture
  useEffect(() => {
    const stateId = 'note';
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-xs sm:max-w-sm rounded-3xl shadow-2xl p-6 animate-modal-enter z-10 transform-gpu">
         <div className="flex items-center gap-2 mb-4 text-slate-800">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-full border border-orange-100">
               <StickyNote size={20} />
            </div>
            <h3 className="font-bold text-lg">{title || '结果备注'}</h3>
         </div>
         
         <div className="mb-4">
           <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none text-slate-700 font-medium text-sm leading-relaxed"
              placeholder="添加一些关于这个结果的备注..."
              autoFocus
           />
         </div>
         
         <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
            >
              取消
            </button>
            <button 
              onClick={() => onSave(note)} 
              className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-xl transition-all active:scale-95 text-sm"
            >
              保存备注
            </button>
         </div>
      </div>
    </div>
  );
};

export default NoteInputModal;