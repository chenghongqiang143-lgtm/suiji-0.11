import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "确认",
  cancelText = "取消"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-bounce-in z-10 overflow-hidden border border-slate-100">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-rose-500" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 hover:shadow-xl transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;