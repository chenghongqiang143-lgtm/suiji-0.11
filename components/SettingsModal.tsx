import React, { useState, useEffect } from 'react';
import { X, Globe, Check, Trash2, AlertTriangle, Copy, Upload, Download, ClipboardCheck, Palette } from 'lucide-react';
import { AppSettings, ThemeColor } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onResetData: () => void;
  onExport: () => string;
  onImport: (data: string) => boolean;
  onClose: () => void;
}

const THEME_COLORS: { id: ThemeColor; color: string; nameZh: string; nameEn: string }[] = [
  { id: 'orange', color: '#f97316', nameZh: '活力橙', nameEn: 'Orange' },
  { id: 'blue', color: '#3b82f6', nameZh: '天空蓝', nameEn: 'Blue' },
  { id: 'rose', color: '#f43f5e', nameZh: '玫瑰红', nameEn: 'Rose' },
  { id: 'violet', color: '#8b5cf6', nameZh: '梦幻紫', nameEn: 'Violet' },
  { id: 'emerald', color: '#10b981', nameZh: '翡翠绿', nameEn: 'Emerald' },
  { id: 'amber', color: '#f59e0b', nameZh: '琥珀黄', nameEn: 'Amber' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onResetData, onExport, onImport, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const theme = localSettings.themeColor || 'orange';

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
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  const handleExportClick = () => {
    const data = onExport();
    setBackupText(data);
    navigator.clipboard.writeText(data).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleImportClick = () => {
    if (!backupText.trim()) return;
    const success = onImport(backupText);
    if (success) {
      setBackupText('');
    }
  };

  const isZh = localSettings.language === 'zh';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-modal-enter flex flex-col max-h-[85vh] transform-gpu">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {isZh ? '设置' : 'Settings'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Theme Color Setting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Palette size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isZh ? '主题颜色' : 'Theme Color'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {THEME_COLORS.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => setLocalSettings({ ...localSettings, themeColor: tc.id })}
                  className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    theme === tc.id
                      ? `border-${tc.id}-500 bg-${tc.id}-50 text-${tc.id}-600`
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm border border-black/5" 
                    style={{ backgroundColor: tc.color }}
                  />
                  <span className="text-[10px] font-bold">{isZh ? tc.nameZh : tc.nameEn}</span>
                  {theme === tc.id && (
                    <div className={`absolute top-1 right-1 text-${tc.id}-500`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Language Setting */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Globe size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isZh ? '语言' : 'Language'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, language: 'zh' })}
                className={`relative px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  localSettings.language === 'zh'
                    ? `border-${theme}-500 bg-${theme}-50 text-${theme}-600`
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                中文
                {localSettings.language === 'zh' && (
                  <div className={`absolute top-2 right-2 text-${theme}-500`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, language: 'en' })}
                className={`relative px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  localSettings.language === 'en'
                    ? `border-${theme}-500 bg-${theme}-50 text-${theme}-600`
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                English
                {localSettings.language === 'en' && (
                  <div className={`absolute top-2 right-2 text-${theme}-500`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Download size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isZh ? '备份与恢复' : 'Backup & Restore'}
              </span>
            </div>
            
            <textarea 
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              placeholder={isZh ? '在此处粘贴备份数据，或点击导出生成...' : 'Paste backup data here, or click Export...'}
              className={`w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:border-${theme}-500 resize-none`}
            />

            <div className="flex gap-2">
              <button
                onClick={handleExportClick}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                {copySuccess ? <ClipboardCheck size={14} className="text-emerald-500"/> : <Copy size={14} />}
                {isZh ? (copySuccess ? '已复制' : '导出并复制') : (copySuccess ? 'Copied' : 'Export & Copy')}
              </button>
              <button
                onClick={handleImportClick}
                className={`flex-1 py-2.5 bg-${theme}-50 text-${theme}-600 border border-${theme}-100 rounded-xl font-bold text-xs hover:bg-${theme}-100 transition-colors flex items-center justify-center gap-2`}
              >
                <Upload size={14} />
                {isZh ? '导入恢复' : 'Import'}
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Trash2 size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isZh ? '数据清理' : 'Clear Data'}
              </span>
            </div>
            
            {!confirmReset ? (
              <button
                onClick={handleResetClick}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-rose-500 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
              >
                {isZh ? '清理历史记录 (保留模板)' : 'Clear History (Keep Templates)'}
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-600 font-bold mb-2">
                  <AlertTriangle size={18} />
                  <span>{isZh ? '确认清理？' : 'Confirm Clear?'}</span>
                </div>
                <p className="text-xs text-rose-500/80 mb-3 leading-relaxed">
                  {isZh 
                    ? '此操作将清空历史记录和转盘选中状态，但会保留您的自定义模板。' 
                    : 'This will clear history and selection states, but will KEEP your custom templates.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 bg-white border border-rose-100 text-rose-600 rounded-lg text-xs font-bold"
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleResetClick}
                    className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 shadow-sm"
                  >
                    {isZh ? '确认清理' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSave}
            className={`w-full py-3.5 bg-${theme}-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-${theme}-200 hover:shadow-2xl hover:bg-${theme}-700 hover:-translate-y-0.5 active:translate-y-0 transition-all`}
          >
            {isZh ? '保存设置' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;