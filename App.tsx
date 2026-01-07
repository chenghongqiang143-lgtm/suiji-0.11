import React, { useState, useEffect } from 'react';
import { Plus, Dices, LayoutGrid, PlayCircle, Settings2, Disc, Monitor, History, RotateCcw, UserCog, Hash } from 'lucide-react';
import { Template, HistoryItem, AppSettings } from './types';
import { DEFAULT_TEMPLATES } from './constants';
import TemplateCard from './components/TemplateCard';
import TemplateEditor from './components/TemplateEditor';
import OptionPickerModal from './components/OptionPickerModal';
import NoteInputModal from './components/NoteInputModal';
import Wheel from './components/Wheel';
import DigitalRoller from './components/DigitalRoller';
import RandomNumberGenerator from './components/RandomNumberGenerator';
import ResultModal from './components/ResultModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';
import SettingsModal from './components/SettingsModal';
import SplashScreen from './components/SplashScreen';

type DisplayMode = 'wheel' | 'roller' | 'number';

function App() {
  // --- Startup State ---
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // --- Settings ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return { language: 'zh' };
  });

  useEffect(() => {
    localStorage.setItem('spinDecide_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Data ---
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_templates');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return DEFAULT_TEMPLATES;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_history');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
     return templates.length > 0 ? templates[0].id : null;
  });

  // --- UI State ---
  const [currentTab, setCurrentTab] = useState<'execute' | 'templates'>('execute');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('wheel');
  
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // Manual Selection State
  const [manualSelectTemplate, setManualSelectTemplate] = useState<Template | null>(null);
  
  // Note Editing State
  const [noteModal, setNoteModal] = useState<{show: boolean, templateId: string | null, initialNote: string}>({
    show: false, templateId: null, initialNote: ''
  });

  const [spinResult, setSpinResult] = useState<string | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, templateId: string | null}>({ show: false, templateId: null });
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false);

  // --- Startup Effect ---
  useEffect(() => {
    const initApp = async () => {
      try {
        // Minimum display time for splash screen to prevent flicker
        const minLoadPromise = new Promise(resolve => setTimeout(resolve, 800));
        
        // Wait for fonts to load if browser supports it
        const fontReadyPromise = document.fonts ? document.fonts.ready : Promise.resolve();
        
        await Promise.all([minLoadPromise, fontReadyPromise]);
        
        setIsReady(true);
      } catch (err) {
        console.error("Initialization error:", err);
        // On error, we still try to proceed after a moment, or set error state
        setIsReady(true);
      }
    };

    // Timeout protection: If app takes too long (e.g. 5s), force load
    const timeoutId = setTimeout(() => {
      if (!isReady) {
        console.warn("App load timed out, forcing render.");
        setIsReady(true);
      }
    }, 5000);

    initApp();

    return () => clearTimeout(timeoutId);
  }, []);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('spinDecide_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('spinDecide_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (templates.length > 0 && !templates.find(t => t.id === activeTemplateId)) {
      setActiveTemplateId(templates[0].id);
    } else if (templates.length === 0) {
      setActiveTemplateId(null);
    }
  }, [templates, activeTemplateId]);

  // --- Handlers ---
  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const handleSelectTemplate = (template: Template) => {
    setActiveTemplateId(template.id);
    setSpinResult(null);
    setCurrentTab('execute');
    // If we were on number mode, switch back to wheel to show the template
    if (displayMode === 'number') {
      setDisplayMode('wheel');
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };
  
  const handleOpenManualSelect = (template: Template) => {
    setManualSelectTemplate(template);
  };

  const handleOpenNoteModal = (template: Template) => {
    setNoteModal({
      show: true,
      templateId: template.id,
      initialNote: template.lastSelectedNote || ''
    });
  };

  const handleSaveNote = (note: string) => {
    if (noteModal.templateId) {
      setTemplates(prev => prev.map(t => 
        t.id === noteModal.templateId ? { ...t, lastSelectedNote: note } : t
      ));
    }
    setNoteModal({ show: false, templateId: null, initialNote: '' });
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirm({ show: true, templateId: id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.templateId) {
      const id = deleteConfirm.templateId;
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (showEditor && editingTemplate?.id === id) {
        setShowEditor(false);
      }
    }
    setDeleteConfirm({ show: false, templateId: null });
  };

  const handleConfirmRestoreDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
    setActiveTemplateId(DEFAULT_TEMPLATES[0].id);
    setCurrentTab('execute');
    setRestoreConfirm(false);
  };

  const handleSaveTemplate = (template: Template) => {
    setTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [...prev, template];
    });
    setShowEditor(false);
    if (!templates.find(t => t.id === template.id)) {
      setActiveTemplateId(template.id);
      setCurrentTab('execute');
    }
  };

  const recordResult = (result: string, titleOverride?: string, templateId?: string) => {
     // Title determination
    let finalTitle = titleOverride || 'Unknown';
    if (!titleOverride && activeTemplate) finalTitle = activeTemplate.title;
    if (displayMode === 'number') finalTitle = settings.language === 'zh' ? '随机数' : 'RNG';

    // Update History
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      result,
      templateTitle: finalTitle,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));

    // Update Template's "Last Selected" state if applicable
    // IMPORTANT: Clear the note when a new result is generated/selected
    const targetTemplateId = templateId || activeTemplateId;
    if (targetTemplateId && displayMode !== 'number') {
      setTemplates(prev => prev.map(t => 
        t.id === targetTemplateId ? { ...t, lastSelectedOption: result, lastSelectedNote: undefined } : t
      ));
    }
  };

  const handleSpinEnd = (result: string, titleOverride?: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
    
    // For Wheel/Roller, we show the modal.
    // For Number, visual feedback is on screen, so no modal, but we record history.
    if (displayMode === 'wheel' || displayMode === 'roller') {
      setSpinResult(result);
    }
    
    recordResult(result, titleOverride);
  };

  const handleManualOptionSelect = (option: string) => {
    if (manualSelectTemplate) {
      recordResult(option, manualSelectTemplate.title, manualSelectTemplate.id);
      setManualSelectTemplate(null);
    }
  };

  const handleConfirmClearHistory = () => {
    setHistory([]);
    setClearHistoryConfirm(false);
  };
  
  // Total Reset
  const handleResetApp = () => {
    // Clear localStorage
    localStorage.removeItem('spinDecide_templates');
    localStorage.removeItem('spinDecide_history');
    localStorage.removeItem('spinDecide_settings');
    
    // Reset state
    setTemplates(DEFAULT_TEMPLATES);
    setHistory([]);
    setSettings({ language: 'zh' }); // Default back to Chinese as per request context
    setActiveTemplateId(DEFAULT_TEMPLATES[0].id);
    setCurrentTab('execute');
    setDisplayMode('wheel');
    
    // Close modal handled in modal itself or parent state
    setShowSettings(false);
  };

  // --- Text Resources ---
  const t = {
    decision: settings.language === 'zh' ? 'DECISION' : 'DECISION',
    collection: settings.language === 'zh' ? 'COLLECTION' : 'LIBRARY',
    unselected: settings.language === 'zh' ? '未选择' : 'No Selection',
    library: settings.language === 'zh' ? '决定库' : 'Library',
    new: settings.language === 'zh' ? '新建' : 'New',
    wheel: settings.language === 'zh' ? '幸运转盘' : 'Wheel',
    roller: settings.language === 'zh' ? '老虎机' : 'Slots',
    number: settings.language === 'zh' ? '随机数' : 'RNG',
    ready: settings.language === 'zh' ? '准备好做决定了吗？' : 'Ready to decide?',
    emptyDesc: settings.language === 'zh' 
      ? '你的决定库现在是空的，创建一个新转盘或者恢复默认设置来开始吧！' 
      : 'Your library is empty. Create a new wheel or restore defaults to start!',
    createFirst: settings.language === 'zh' ? '创建第一个转盘' : 'Create First Wheel',
    restore: settings.language === 'zh' ? '恢复默认模板' : 'Restore Defaults',
    addTopic: settings.language === 'zh' ? '添加新主题' : 'Add New Topic',
    startDecide: settings.language === 'zh' ? '开始决定' : 'Decide',
    deleteTitle: settings.language === 'zh' ? '删除决定' : 'Delete Wheel',
    deleteMsg: settings.language === 'zh' ? '确定要删除这个转盘吗？' : 'Are you sure you want to delete this wheel?',
    confirmDelete: settings.language === 'zh' ? '确认删除' : 'Delete',
    restoreTitle: settings.language === 'zh' ? '恢复默认' : 'Restore Defaults',
    restoreMsg: settings.language === 'zh' ? '确定要重置所有模板吗？' : 'Are you sure you want to reset all templates?',
    confirmRestore: settings.language === 'zh' ? '确认恢复' : 'Restore',
    clearHistoryTitle: settings.language === 'zh' ? '清空历史' : 'Clear History',
    clearHistoryMsg: settings.language === 'zh' ? '所有的转动历史都将被永久清除。' : 'All history will be permanently deleted.',
    confirmClear: settings.language === 'zh' ? '确认清空' : 'Clear',
    genericTitle: settings.language === 'zh' ? '常用工具' : 'Tools',
  };

  const isGenericTool = displayMode === 'number';

  // Header Title Logic
  const getHeaderTitle = () => {
    if (currentTab === 'templates') return t.library;
    if (displayMode === 'number') return t.number;
    return activeTemplate ? activeTemplate.title : t.unselected;
  };

  const renderVisualizer = () => {
    // Generic tools don't need a template
    if (displayMode === 'number') {
      return <RandomNumberGenerator onSpinEnd={(res) => handleSpinEnd(res)} language={settings.language} />;
    }

    // Template-based tools
    if (!activeTemplate) return null;
    switch (displayMode) {
      case 'roller':
        return <DigitalRoller options={activeTemplate.options} onSpinEnd={(res) => handleSpinEnd(res)} />;
      case 'wheel':
      default:
        return <Wheel options={activeTemplate.options} colorTheme={activeTemplate.colorTheme} onSpinEnd={(res) => handleSpinEnd(res)} />;
    }
  };

  if (!isReady) {
    return <SplashScreen error={initError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      <div className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-200/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Header with Enhanced Safe Area Padding */}
      <header className="px-6 pb-5 z-20 flex items-center justify-between flex-none backdrop-blur-md bg-white/40 border-b border-white/50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.75rem)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white shadow-sm border border-orange-100 text-orange-500">
            {isGenericTool ? <Hash size={20} /> : <Dices size={20} />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              {currentTab === 'execute' ? (isGenericTool ? t.genericTitle : t.decision) : t.collection}
            </span>
            <h1 className="text-base font-black text-slate-800 tracking-tight truncate max-w-[150px] sm:max-w-[240px] leading-tight">
              {getHeaderTitle()}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <button
             onClick={() => setShowSettings(true)}
             className="p-2 text-slate-500 hover:text-orange-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-orange-100"
          >
            <UserCog size={18} />
          </button>

          {currentTab === 'templates' && (
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:bg-orange-600 transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>{t.new}</span>
            </button>
          )}

          {currentTab === 'execute' && (
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowHistory(true)}
                 className="p-2 text-slate-500 hover:text-orange-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-orange-100"
                 title="历史"
               >
                 <History size={18} />
               </button>
               {!isGenericTool && activeTemplate && (
                 <button 
                   onClick={() => handleEdit(activeTemplate)}
                   className="p-2 text-slate-500 hover:text-orange-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-orange-100"
                   title="编辑"
                 >
                   <Settings2 size={18} />
                 </button>
               )}
             </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-32 pt-6 scroll-smooth">
        <div className="max-w-4xl mx-auto h-full">
          {currentTab === 'execute' ? (
              <div className="flex-1 flex flex-col h-full">
                {/* Mode Selector */}
                <div className="flex justify-center mb-6 animate-fade-in flex-none">
                  <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-white flex gap-2 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
                    <button
                      onClick={() => setDisplayMode('wheel')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-none ${displayMode === 'wheel' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Disc size={18} />
                      <span className="text-xs font-bold">{t.wheel}</span>
                    </button>
                    <button
                      onClick={() => setDisplayMode('roller')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-none ${displayMode === 'roller' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Monitor size={18} />
                      <span className="text-xs font-bold">{t.roller}</span>
                    </button>
                    <button
                      onClick={() => setDisplayMode('number')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-none ${displayMode === 'number' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Hash size={18} />
                      <span className="text-xs font-bold">{t.number}</span>
                    </button>
                  </div>
                </div>

                {(!activeTemplate && !isGenericTool) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-fade-in">
                    <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-orange-100 border border-orange-50/50">
                      <Dices size={48} className="text-orange-200" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">{t.ready}</h2>
                    <p className="text-slate-400 mb-8 max-w-[240px] mx-auto text-xs leading-relaxed">{t.emptyDesc}</p>
                    <div className="flex flex-col gap-3 w-full max-w-xs px-6">
                        <button 
                          onClick={handleCreateNew} 
                          className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-1 text-sm"
                        >
                          {t.createFirst}
                        </button>
                        <button 
                          onClick={() => setRestoreConfirm(true)}
                          className="w-full px-6 py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <RotateCcw size={16} />
                          {t.restore}
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in min-h-[350px]">
                    {renderVisualizer()}
                  </div>
                )}
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in pb-10">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onManualSelect={handleOpenManualSelect}
                  onEditNote={handleOpenNoteModal}
                />
              ))}
              
              <button
                onClick={handleCreateNew}
                className="group relative w-full h-[140px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white/40 hover:bg-orange-50/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-orange-600"
              >
                <div className="p-2 rounded-lg bg-slate-100/50 group-hover:bg-orange-100 transition-colors">
                  <Plus size={20} />
                </div>
                <span className="font-bold text-xs tracking-wide">{t.addTopic}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none px-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
        <nav className="bg-white/90 backdrop-blur-xl px-1.5 py-1.5 rounded-[20px] flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] pointer-events-auto gap-1 border border-slate-200/50 max-w-sm w-full">
          <button 
            onClick={() => setCurrentTab('execute')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${currentTab === 'execute' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
             <PlayCircle size={18} />
            <span className="text-xs font-black tracking-wide">{t.startDecide}</span>
          </button>
          
          <button 
            onClick={() => setCurrentTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${currentTab === 'templates' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutGrid size={18} />
            <span className="text-xs font-black tracking-wide">{t.library}</span>
          </button>
        </nav>
      </div>

      {showEditor && (
        <TemplateEditor
          initialTemplate={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => setShowEditor(false)}
          onDelete={handleDeleteRequest}
        />
      )}
      
      {manualSelectTemplate && (
        <OptionPickerModal
          template={manualSelectTemplate}
          onSelect={handleManualOptionSelect}
          onClose={() => setManualSelectTemplate(null)}
        />
      )}

      {noteModal.show && (
        <NoteInputModal
          initialNote={noteModal.initialNote}
          onSave={handleSaveNote}
          onClose={() => setNoteModal({ show: false, templateId: null, initialNote: '' })}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
          onResetData={handleResetApp}
        />
      )}

      {spinResult && (
        <ResultModal
          result={spinResult}
          onClose={() => setSpinResult(null)}
          onSpinAgain={() => setSpinResult(null)}
        />
      )}

      {showHistory && (
        <HistoryModal 
          history={history}
          onClose={() => setShowHistory(false)}
          onClear={() => setClearHistoryConfirm(true)}
          settings={settings}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title={t.deleteTitle}
        message={t.deleteMsg}
        confirmText={t.confirmDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, templateId: null })}
      />

      <ConfirmModal
        isOpen={restoreConfirm}
        title={t.restoreTitle}
        message={t.restoreMsg}
        confirmText={t.confirmRestore}
        onConfirm={handleConfirmRestoreDefaults}
        onCancel={() => setRestoreConfirm(false)}
      />

      <ConfirmModal
        isOpen={clearHistoryConfirm}
        title={t.clearHistoryTitle}
        message={t.clearHistoryMsg}
        confirmText={t.confirmClear}
        onConfirm={handleConfirmClearHistory}
        onCancel={() => setClearHistoryConfirm(false)}
      />
    </div>
  );
}

export default App;