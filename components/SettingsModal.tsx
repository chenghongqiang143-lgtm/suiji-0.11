import React, { useState, useEffect } from 'react';
import { X, Globe, Check, Trash2, AlertTriangle } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onResetData, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  // Handle Back Gesture
  useEffect(() => {
    const stateId = 'settings';
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

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleResetClick = () => {
    if (confirmReset) {
      onResetData();
      onClose();
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-modal-enter flex flex-col max-h-[80vh] transform-gpu">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {localSettings.language === 'zh' ? '设置' : 'Settings'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Language Setting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Globe size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {localSettings.language === 'zh' ? '语言' : 'Language'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, language: 'zh' })}
                className={`relative px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  localSettings.language === 'zh'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                中文
                {localSettings.language === 'zh' && (
                  <div className="absolute top-2 right-2 text-orange-500">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, language: 'en' })}
                className={`relative px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  localSettings.language === 'en'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                English
                {localSettings.language === 'en' && (
                  <div className="absolute top-2 right-2 text-orange-500">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Trash2 size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {localSettings.language === 'zh' ? '数据管理' : 'Data'}
              </span>
            </div>
            
            {!confirmReset ? (
              <button
                onClick={handleResetClick}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-rose-500 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
              >
                {localSettings.language === 'zh' ? '清除所有数据 (重置应用)' : 'Clear All Data (Reset App)'}
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-600 font-bold mb-2">
                  <AlertTriangle size={18} />
                  <span>{localSettings.language === 'zh' ? '确认重置？' : 'Confirm Reset?'}</span>
                </div>
                <p className="text-xs text-rose-500/80 mb-3 leading-relaxed">
                  {localSettings.language === 'zh' 
                    ? '此操作将清除所有自定义转盘、历史记录和设置。无法撤销。' 
                    : 'This will erase all custom templates, history, and settings. Cannot be undone.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 bg-white border border-rose-100 text-rose-600 rounded-lg text-xs font-bold"
                  >
                    {localSettings.language === 'zh' ? '取消' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleResetClick}
                    className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 shadow-sm"
                  >
                    {localSettings.language === 'zh' ? '确认清除' : 'Confirm Clear'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:bg-orange-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            {localSettings.language === 'zh' ? '保存设置' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;