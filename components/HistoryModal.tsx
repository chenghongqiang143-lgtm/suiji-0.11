import React, { useEffect } from 'react';
import { X, Trash2, Clock, Calendar } from 'lucide-react';
import { HistoryItem, AppSettings } from '../types';

interface HistoryModalProps {
  history: HistoryItem[];
  onClose: () => void;
  onClear: () => void;
  settings?: AppSettings;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClear, settings }) => {
  // Handle Back Gesture
  useEffect(() => {
    const stateId = 'history';
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

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(settings?.language === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-md h-[80vh] sm:h-[70vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden transform-gpu">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2 text-slate-800">
             <Clock size={20} className="text-orange-500"/>
             <h2 className="text-lg font-bold">{settings?.language === 'en' ? 'History' : '历史记录'}</h2>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
                <button 
                  onClick={onClear}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
                  title="清空"
                >
                  <Trash2 size={18} />
                </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Calendar size={48} className="opacity-20" />
              <p>{settings?.language === 'en' ? 'No history yet' : '暂无记录'}</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="font-bold text-slate-800 text-lg">{item.result}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                     <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">{item.templateTitle}</span>
                     <span>•</span>
                     <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;