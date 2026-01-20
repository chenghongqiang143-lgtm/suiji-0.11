import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Plus, Dices, LayoutGrid, PlayCircle, Disc, Monitor, History, RotateCcw, UserCog, Hash, Loader2, Trash2, X, FolderInput } from 'lucide-react';
import { Template, HistoryItem, AppSettings, Category } from './types';
import { DEFAULT_TEMPLATES, DEFAULT_CATEGORIES } from './constants';
import TemplateCard from './components/TemplateCard';
import SplashScreen from './components/SplashScreen';

// Lazy load heavy components
const TemplateEditor = React.lazy(() => import('./components/TemplateEditor'));
const OptionPickerModal = React.lazy(() => import('./components/OptionPickerModal'));
const NoteInputModal = React.lazy(() => import('./components/NoteInputModal'));
const Wheel = React.lazy(() => import('./components/Wheel'));
const DigitalRoller = React.lazy(() => import('./components/DigitalRoller'));
const RandomNumberGenerator = React.lazy(() => import('./components/RandomNumberGenerator'));
const ResultModal = React.lazy(() => import('./components/ResultModal'));
const HistoryModal = React.lazy(() => import('./components/HistoryModal'));
const ConfirmModal = React.lazy(() => import('./components/ConfirmModal'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const CategoryEditorModal = React.lazy(() => import('./components/CategoryEditorModal'));
const MoveToCategoryModal = React.lazy(() => import('./components/MoveToCategoryModal'));

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
    return { language: 'zh', themeColor: 'orange' };
  });

  const themeColor = settings.themeColor || 'orange';

  useEffect(() => {
    localStorage.setItem('spinDecide_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Data: Categories & Templates ---
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return DEFAULT_CATEGORIES;
  });
  
  // Set initial active category
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
     return categories.length > 0 ? categories[0].id : 'daily';
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_templates');
      if (saved) {
         let loaded: Template[] = JSON.parse(saved);
         // Migration: Assign a category if missing
         loaded = loaded.map(t => ({
             ...t,
             categoryId: t.categoryId || DEFAULT_CATEGORIES[0].id
         }));
         return loaded;
      }
    } catch (e) { console.error(e); }
    return DEFAULT_TEMPLATES;
  });

  // Persist Categories & Templates
  useEffect(() => {
    localStorage.setItem('spinDecide_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('spinDecide_templates', JSON.stringify(templates));
  }, [templates]);

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

  // Ensure active category is valid (fallback if deleted)
  useEffect(() => {
     if (!categories.find(c => c.id === activeCategoryId) && categories.length > 0) {
         setActiveCategoryId(categories[0].id);
     }
  }, [categories]);

  // --- UI State ---
  const [currentTab, setCurrentTab] = useState<'execute' | 'templates'>('execute');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('wheel');
  
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // Category UI State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // For add/edit category
  const [categoryPressTimer, setCategoryPressTimer] = useState<any>(null);
  
  // Selection / Bulk Action State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);

  // Manual Selection State
  const [manualSelectTemplate, setManualSelectTemplate] = useState<Template | null>(null);
  
  // Note Editing State
  const [noteModal, setNoteModal] = useState<{show: boolean, templateId: string | null, initialNote: string}>({
    show: false, templateId: null, initialNote: ''
  });

  const [spinResult, setSpinResult] = useState<string | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, templateId: string | null, isBulk?: boolean}>({ show: false, templateId: null });
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false);

  // --- Startup Effect ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const minLoadPromise = new Promise(resolve => setTimeout(resolve, 300));
        const fontReadyPromise = document.fonts ? document.fonts.ready : Promise.resolve();
        await Promise.all([minLoadPromise, fontReadyPromise]);
        setIsReady(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setIsReady(true);
      }
    };
    const timeoutId = setTimeout(() => {
      if (!isReady) setIsReady(true);
    }, 3000);
    initApp();
    return () => clearTimeout(timeoutId);
  }, []);

  // --- Handlers ---
  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const handleSelectTemplate = (template: Template) => {
    setActiveTemplateId(template.id);
    setSpinResult(null);
    setCurrentTab('execute');
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

  // --- Category Logic ---
  const handleCategoryPressStart = (cat: Category) => {
    const timer = setTimeout(() => {
      setEditingCategory(cat);
      setShowCategoryModal(true);
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
    setCategoryPressTimer(timer);
  };
  const handleCategoryPressEnd = () => {
    if (categoryPressTimer) clearTimeout(categoryPressTimer);
  };

  const handleSaveCategory = (name: string) => {
    if (editingCategory) {
      // Edit
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name } : c));
    } else {
      // Add
      const newCat = { id: Date.now().toString(), name };
      setCategories(prev => [...prev, newCat]);
      setActiveCategoryId(newCat.id); // Switch to new
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = () => {
    if (!editingCategory) return;
    if (categories.length <= 1) {
      alert("至少保留一个分类");
      return;
    }
    
    // Find backup category (first one that isn't the deleted one)
    const backupCategory = categories.find(c => c.id !== editingCategory.id) || categories[0];
    
    // Move items
    setTemplates(prev => prev.map(t => 
      t.categoryId === editingCategory.id ? { ...t, categoryId: backupCategory.id } : t
    ));

    // Remove category
    setCategories(prev => prev.filter(c => c.id !== editingCategory.id));
    setActiveCategoryId(backupCategory.id);
    
    setShowCategoryModal(false);
    setEditingCategory(null);
  };
  
  // --- Move Items Logic ---
  const handleMoveSelected = (targetCatId: string) => {
    setTemplates(prev => prev.map(t => 
        selectedTemplateIds.has(t.id) ? { ...t, categoryId: targetCatId } : t
    ));
    setShowMoveModal(false);
    handleExitSelectionMode();
  };
  
  const handleOpenManualSelect = (template: Template) => {
    setManualSelectTemplate(template);
  };

  const handleOpenNoteModal = (template: Template) => {
    const currentOption = template.lastSelectedOption || '';
    const currentNote = template.lastSelectedNote || '';
    const savedNote = template.optionNotes?.[currentOption];
    const noteToShow = currentNote || savedNote || '';

    setNoteModal({
      show: true,
      templateId: template.id,
      initialNote: noteToShow
    });
  };

  const handleSaveNote = (note: string, persist: boolean) => {
    if (noteModal.templateId) {
      setTemplates(prev => prev.map(t => {
        if (t.id === noteModal.templateId) {
          const currentOption = t.lastSelectedOption;
          let newOptionNotes = { ...(t.optionNotes || {}) };
          
          if (currentOption) {
            if (persist) {
              newOptionNotes[currentOption] = note;
            } else {
              delete newOptionNotes[currentOption];
            }
          }

          return { 
            ...t, 
            lastSelectedNote: note,
            optionNotes: newOptionNotes
          };
        }
        return t;
      }));
    }
    setNoteModal({ show: false, templateId: null, initialNote: '' });
  };

  // --- Selection Mode Handlers ---
  const handleLongPress = (template: Template) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      const newSet = new Set<string>();
      newSet.add(template.id);
      setSelectedTemplateIds(newSet);
    }
  };

  const handleToggleSelect = (template: Template) => {
    if (isSelectionMode) {
      const newSet = new Set(selectedTemplateIds);
      if (newSet.has(template.id)) {
        newSet.delete(template.id);
      } else {
        newSet.add(template.id);
      }
      setSelectedTemplateIds(newSet);
    }
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedTemplateIds(new Set());
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirm({ show: true, templateId: id, isBulk: false });
  };

  const handleBulkDeleteRequest = () => {
    if (selectedTemplateIds.size === 0) return;
    setDeleteConfirm({ show: true, templateId: null, isBulk: true });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.isBulk) {
      // Bulk Delete
      setTemplates(prev => prev.filter(t => !selectedTemplateIds.has(t.id)));
      handleExitSelectionMode();
    } else if (deleteConfirm.templateId) {
      // Single Delete (from editor)
      const id = deleteConfirm.templateId;
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (showEditor && editingTemplate?.id === id) {
        setShowEditor(false);
      }
    }
    setDeleteConfirm({ show: false, templateId: null, isBulk: false });
  };

  const handleConfirmRestoreDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    setActiveCategoryId(DEFAULT_CATEGORIES[0].id);
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
    let finalTitle = titleOverride || 'Unknown';
    if (!titleOverride && activeTemplate) finalTitle = activeTemplate.title;
    if (displayMode === 'number') finalTitle = settings.language === 'zh' ? '随机数' : 'RNG';

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      result,
      templateTitle: finalTitle,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));

    const targetTemplateId = templateId || activeTemplateId;
    if (targetTemplateId && displayMode !== 'number') {
      setTemplates(prev => prev.map(t => {
        if (t.id === targetTemplateId) {
          const persistentNote = t.optionNotes?.[result];
          return { 
            ...t, 
            lastSelectedOption: result, 
            lastSelectedNote: persistentNote || undefined 
          };
        }
        return t;
      }));
    }
  };

  const handleSpinEnd = (result: string, titleOverride?: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
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
  
  const handleResetApp = () => {
    setHistory([]);
    setTemplates(prev => prev.map(t => ({
      ...t,
      lastSelectedOption: undefined,
      lastSelectedNote: undefined
    })));
    setShowSettings(false);
  };

  const handleExportData = () => {
    const data = { version: 2, timestamp: Date.now(), templates, history, settings, categories };
    return JSON.stringify(data, null, 2);
  };

  const handleImportData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.templates && Array.isArray(data.templates)) setTemplates(data.templates);
      if (data.history && Array.isArray(data.history)) setHistory(data.history);
      if (data.settings) setSettings(data.settings);
      alert(settings.language === 'zh' ? '数据恢复成功' : 'Data restored successfully');
      setShowSettings(false);
      return true;
    } catch (e) {
      alert(settings.language === 'zh' ? '数据格式无效' : 'Invalid data format');
      return false;
    }
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
    bulkDeleteTitle: settings.language === 'zh' ? '批量删除' : 'Bulk Delete',
    bulkDeleteMsg: settings.language === 'zh' ? `确定要删除选中的 ${selectedTemplateIds.size} 个转盘吗？` : `Are you sure you want to delete ${selectedTemplateIds.size} selected wheels?`,
    restoreTitle: settings.language === 'zh' ? '恢复默认' : 'Restore Defaults',
    restoreMsg: settings.language === 'zh' ? '确定要重置所有模板吗？' : 'Are you sure you want to reset all templates?',
    confirmRestore: settings.language === 'zh' ? '确认恢复' : 'Restore',
    clearHistoryTitle: settings.language === 'zh' ? '清空历史' : 'Clear History',
    clearHistoryMsg: settings.language === 'zh' ? '所有的转动历史都将被永久清除。' : 'All history will be permanently deleted.',
    confirmClear: settings.language === 'zh' ? '确认清空' : 'Clear',
    genericTitle: settings.language === 'zh' ? '常用工具' : 'Tools',
    cancel: settings.language === 'zh' ? '取消' : 'Cancel',
    move: settings.language === 'zh' ? '移动到' : 'Move to',
  };

  const isGenericTool = displayMode === 'number';

  const getHeaderTitle = () => {
    if (currentTab === 'templates') return t.library;
    if (displayMode === 'number') return t.number;
    return activeTemplate ? activeTemplate.title : t.unselected;
  };

  const LoadingFallback = () => (
    <div className="w-full h-full flex items-center justify-center min-h-[300px]">
      <Loader2 className={`animate-spin text-${themeColor}-500 opacity-50`} size={32} />
    </div>
  );

  const renderVisualizer = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {(() => {
          if (displayMode === 'number') {
            return <RandomNumberGenerator onSpinEnd={(res) => handleSpinEnd(res)} language={settings.language} />;
          }
          if (!activeTemplate) return null;
          switch (displayMode) {
            case 'roller':
              return <DigitalRoller options={activeTemplate.options} onSpinEnd={(res) => handleSpinEnd(res)} />;
            case 'wheel':
            default:
              return <Wheel options={activeTemplate.options} colorTheme={activeTemplate.colorTheme} onSpinEnd={(res) => handleSpinEnd(res)} />;
          }
        })()}
      </Suspense>
    );
  };
  
  const displayedTemplates = templates.filter(t => t.categoryId === activeCategoryId);

  if (!isReady) {
    return <SplashScreen error={initError} onRetry={() => window.location.reload()} />;
  }

  // --- Theme Background Logic ---
  const bgGradientClass = {
    orange: 'from-orange-50/50 via-white to-amber-50/50',
    blue: 'from-blue-50/50 via-white to-cyan-50/50',
    rose: 'from-rose-50/50 via-white to-pink-50/50',
    violet: 'from-violet-50/50 via-white to-purple-50/50',
    emerald: 'from-emerald-50/50 via-white to-teal-50/50',
    amber: 'from-amber-50/50 via-white to-yellow-50/50',
  }[themeColor] || 'from-orange-50/50 via-white to-amber-50/50';

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden bg-gradient-to-br ${bgGradientClass}`}>
      {/* Background Orbs */}
      <div className={`fixed top-[-20%] right-[-10%] w-[500px] h-[500px] bg-${themeColor}-200/20 rounded-full blur-[100px] pointer-events-none`} />
      <div className={`fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-${themeColor === 'orange' ? 'yellow' : themeColor}-200/20 rounded-full blur-[80px] pointer-events-none`} />

      {/* Header */}
      <header className="px-6 pb-5 z-20 flex items-center justify-between flex-none backdrop-blur-md bg-white/40 border-b border-white/50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.75rem)' }}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-white shadow-sm border border-${themeColor}-100 text-${themeColor}-500`}>
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
          {!isSelectionMode && (
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 text-slate-500 hover:text-${themeColor}-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-${themeColor}-100`}
            >
              <UserCog size={18} />
            </button>
          )}
          
          {isSelectionMode && (
            <div className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold animate-fade-in">
              已选 {selectedTemplateIds.size} 项
            </div>
          )}

          {currentTab === 'execute' && (
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowHistory(true)}
                 className={`p-2 text-slate-500 hover:text-${themeColor}-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-${themeColor}-100`}
                 title="历史"
               >
                 <History size={18} />
               </button>
               {!isGenericTool && activeTemplate && (
                 <button 
                   onClick={() => handleEdit(activeTemplate)}
                   className={`p-2 text-slate-500 hover:text-${themeColor}-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-${themeColor}-100`}
                   title="编辑"
                 >
                   <span className="sr-only">编辑</span>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                 </button>
               )}
             </div>
          )}
        </div>
      </header>
      
      {/* Category Bar (Only visible in Templates tab) */}
      {currentTab === 'templates' && (
        <div className="px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 items-center flex-none z-10 bg-white/20 backdrop-blur-sm border-b border-white/40">
           {categories.map(cat => (
             <button
               key={cat.id}
               onClick={() => setActiveCategoryId(cat.id)}
               onMouseDown={() => handleCategoryPressStart(cat)}
               onMouseUp={handleCategoryPressEnd}
               onMouseLeave={handleCategoryPressEnd}
               onTouchStart={() => handleCategoryPressStart(cat)}
               onTouchEnd={handleCategoryPressEnd}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                 activeCategoryId === cat.id 
                   ? `bg-${themeColor}-500 text-white border-${themeColor}-500 shadow-sm` 
                   : 'bg-white/60 text-slate-500 border-transparent hover:bg-white hover:text-slate-700'
               }`}
             >
               {cat.name}
             </button>
           ))}
           <button
             onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
             className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors flex-none"
           >
             <Plus size={16} />
           </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-32 pt-6 scroll-smooth">
        <div className="max-w-4xl mx-auto h-full">
          {currentTab === 'execute' ? (
              <div className="flex-1 flex flex-col h-full">
                {/* Mode Selector */}
                <div className="flex justify-center mb-6 animate-fade-in flex-none">
                  <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-white flex gap-2 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
                    <button
                      onClick={() => setDisplayMode('wheel')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-none ${displayMode === 'wheel' ? `bg-${themeColor}-500 text-white shadow-md` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Disc size={18} />
                      <span className="text-xs font-bold">{t.wheel}</span>
                    </button>
                    <button
                      onClick={() => setDisplayMode('roller')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-none ${displayMode === 'roller' ? `bg-${themeColor}-500 text-white shadow-md` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Monitor size={18} />
                      <span className="text-xs font-bold">{t.roller}</span>
                    </button>
                    <button
                      onClick={() => setDisplayMode('number')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-none ${displayMode === 'number' ? `bg-${themeColor}-500 text-white shadow-md` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Hash size={18} />
                      <span className="text-xs font-bold">{t.number}</span>
                    </button>
                  </div>
                </div>

                {(!activeTemplate && !isGenericTool) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-fade-in">
                    <div className={`w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-${themeColor}-100 border border-${themeColor}-50/50`}>
                      <Dices size={48} className={`text-${themeColor}-200`} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">{t.ready}</h2>
                    <p className="text-slate-400 mb-8 max-w-[240px] mx-auto text-xs leading-relaxed">{t.emptyDesc}</p>
                    <div className="flex flex-col gap-3 w-full max-w-xs px-6">
                        <button 
                          onClick={() => { setCurrentTab('templates'); handleCreateNew(); }} 
                          className={`w-full px-6 py-3 bg-${themeColor}-500 text-white rounded-xl font-bold shadow-xl shadow-${themeColor}-200 hover:bg-${themeColor}-600 transition-all hover:-translate-y-1 text-sm`}
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
              {displayedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  themeColor={themeColor}
                  onSelect={handleSelectTemplate}
                  onEdit={handleEdit}
                  onManualSelect={handleOpenManualSelect}
                  onEditNote={handleOpenNoteModal}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedTemplateIds.has(template.id)}
                  onLongPress={handleLongPress}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
              
              {!isSelectionMode && (
                <button
                  onClick={handleCreateNew}
                  className={`group relative w-full h-auto min-h-[110px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-${themeColor}-400 bg-white/40 hover:bg-${themeColor}-50/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-${themeColor}-600`}
                >
                  <div className={`p-2 rounded-lg bg-slate-100/50 group-hover:bg-${themeColor}-100 transition-colors`}>
                    <Plus size={20} />
                  </div>
                  <span className="font-bold text-xs tracking-wide">{t.addTopic}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Nav Bar / Bulk Actions */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none px-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
        {isSelectionMode ? (
          <div className="bg-white/90 backdrop-blur-xl px-1.5 py-1.5 rounded-[20px] flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] pointer-events-auto gap-1 max-w-sm w-full border border-slate-200/50 animate-modal-enter">
            <button 
              onClick={handleExitSelectionMode}
              className="px-4 flex items-center justify-center gap-2 py-3 rounded-[14px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
               <X size={18} />
            </button>
            <button 
              onClick={() => setShowMoveModal(true)}
              disabled={selectedTemplateIds.size === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${
                selectedTemplateIds.size > 0 
                  ? 'bg-slate-800 text-white shadow-lg hover:bg-slate-900' 
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              <FolderInput size={18} />
              <span className="text-xs font-black tracking-wide">{t.move}</span>
            </button>
            <button 
              onClick={handleBulkDeleteRequest}
              disabled={selectedTemplateIds.size === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${
                selectedTemplateIds.size > 0 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600' 
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Trash2 size={18} />
              <span className="text-xs font-black tracking-wide">{t.confirmDelete} ({selectedTemplateIds.size})</span>
            </button>
          </div>
        ) : (
          <nav className="bg-white/90 backdrop-blur-xl px-1.5 py-1.5 rounded-[20px] flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] pointer-events-auto gap-1 border border-slate-200/50 max-w-sm w-full">
            <button 
              onClick={() => setCurrentTab('execute')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${currentTab === 'execute' ? `bg-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-200` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
               <PlayCircle size={18} />
              <span className="text-xs font-black tracking-wide">{t.startDecide}</span>
            </button>
            
            <button 
              onClick={() => setCurrentTab('templates')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${currentTab === 'templates' ? `bg-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-200` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} />
              <span className="text-xs font-black tracking-wide">{t.library}</span>
            </button>
          </nav>
        )}
      </div>

      <Suspense fallback={null}>
        {showEditor && (
          <TemplateEditor
            initialTemplate={editingTemplate}
            categories={categories}
            initialCategoryId={activeCategoryId}
            themeColor={themeColor}
            onSave={handleSaveTemplate}
            onCancel={() => setShowEditor(false)}
            onDelete={handleDeleteRequest}
          />
        )}
        
        {showCategoryModal && (
          <CategoryEditorModal
             category={editingCategory}
             themeColor={themeColor}
             onSave={handleSaveCategory}
             onDelete={handleDeleteCategory}
             onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
          />
        )}

        {showMoveModal && (
           <MoveToCategoryModal
              categories={categories}
              themeColor={themeColor}
              count={selectedTemplateIds.size}
              onSelect={handleMoveSelected}
              onClose={() => setShowMoveModal(false)}
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
            themeColor={themeColor}
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
            onExport={handleExportData}
            onImport={handleImportData}
          />
        )}

        {spinResult && (
          <ResultModal
            result={spinResult}
            themeColor={themeColor}
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
          title={deleteConfirm.isBulk ? t.bulkDeleteTitle : t.deleteTitle}
          message={deleteConfirm.isBulk ? t.bulkDeleteMsg : t.deleteMsg}
          confirmText={t.confirmDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, templateId: null, isBulk: false })}
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
      </Suspense>
    </div>
  );
}

export default App;