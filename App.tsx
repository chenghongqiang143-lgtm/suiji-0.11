import React, { useState, useEffect } from 'react';
import { Plus, Dices, LayoutGrid, PlayCircle, Settings2, Disc, Monitor, History, RotateCcw } from 'lucide-react';
import { Template, HistoryItem } from './types';
import { DEFAULT_TEMPLATES } from './constants';
import TemplateCard from './components/TemplateCard';
import TemplateEditor from './components/TemplateEditor';
import Wheel from './components/Wheel';
import DigitalRoller from './components/DigitalRoller';
import ResultModal from './components/ResultModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';

type DisplayMode = 'wheel' | 'roller';

function App() {
  // Initialize from LocalStorage or use defaults
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_templates');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load templates", e);
    }
    return DEFAULT_TEMPLATES;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('spinDecide_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [];
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
     return templates.length > 0 ? templates[0].id : null;
  });

  const [currentTab, setCurrentTab] = useState<'execute' | 'templates'>('execute');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('wheel');
  
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, templateId: string | null}>({ show: false, templateId: null });
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false);

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

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const handleSelectTemplate = (template: Template) => {
    setActiveTemplateId(template.id);
    setSpinResult(null);
    setCurrentTab('execute');
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
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

  const handleSpinEnd = (result: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
    setSpinResult(result);
    if (activeTemplate) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        result,
        templateTitle: activeTemplate.title,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50));
    }
  };

  const handleConfirmClearHistory = () => {
    setHistory([]);
    setClearHistoryConfirm(false);
  };

  const renderVisualizer = () => {
    if (!activeTemplate) return null;
    switch (displayMode) {
      case 'roller':
        return <DigitalRoller options={activeTemplate.options} onSpinEnd={handleSpinEnd} />;
      case 'wheel':
      default:
        return <Wheel options={activeTemplate.options} colorTheme={activeTemplate.colorTheme} onSpinEnd={handleSpinEnd} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      <div className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-200/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Header with Safe Area Padding */}
      <header className="px-6 pb-5 z-20 flex items-center justify-between flex-none backdrop-blur-md bg-white/40 border-b border-white/50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white shadow-sm border border-orange-100 text-orange-500">
            <Dices size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {currentTab === 'execute' ? 'DECISION' : 'COLLECTION'}
            </span>
            <h1 className="text-base font-black text-slate-800 tracking-tight truncate max-w-[150px] sm:max-w-[300px] leading-tight">
              {currentTab === 'execute' 
                ? (activeTemplate ? activeTemplate.title : '未选择') 
                : '决定库'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {currentTab === 'templates' && (
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:bg-orange-600 transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>新建</span>
            </button>
          )}

          {currentTab === 'execute' && activeTemplate && (
             <div className="flex gap-1">
               <button 
                 onClick={() => setShowHistory(true)}
                 className="p-2 text-slate-500 hover:text-orange-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-orange-100"
                 title="历史"
               >
                 <History size={18} />
               </button>
               <button 
                 onClick={() => handleEdit(activeTemplate)}
                 className="p-2 text-slate-500 hover:text-orange-600 bg-white/80 rounded-lg transition-all border border-transparent hover:border-orange-100"
                 title="设置"
               >
                 <Settings2 size={18} />
               </button>
             </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-32 pt-6 scroll-smooth">
        <div className="max-w-4xl mx-auto h-full">
          {currentTab === 'execute' ? (
            activeTemplate ? (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-center mb-10 animate-fade-in">
                  <div className="bg-white/80 backdrop-blur-md p-1 rounded-xl border border-white flex shadow-sm">
                    <button
                      onClick={() => setDisplayMode('wheel')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${displayMode === 'wheel' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Disc size={16} />
                      <span className="text-[10px] font-bold">幸运转盘</span>
                    </button>
                    <button
                      onClick={() => setDisplayMode('roller')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${displayMode === 'roller' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Monitor size={16} />
                      <span className="text-[10px] font-bold">老虎机</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in min-h-[400px]">
                  {renderVisualizer()}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-orange-100 border border-orange-50/50">
                  <Dices size={48} className="text-orange-200" />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-2">准备好做决定了吗？</h2>
                <p className="text-slate-400 mb-8 max-w-[240px] mx-auto text-xs leading-relaxed">你的决定库现在是空的，创建一个新转盘或者恢复默认设置来开始吧！</p>
                <div className="flex flex-col gap-3 w-full max-w-xs px-6">
                    <button 
                      onClick={handleCreateNew} 
                      className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-1 text-sm"
                    >
                      创建第一个转盘
                    </button>
                    <button 
                      onClick={() => setRestoreConfirm(true)}
                      className="w-full px-6 py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <RotateCcw size={16} />
                      恢复默认模板
                    </button>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in pb-10">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              ))}
              
              <button
                onClick={handleCreateNew}
                className="group relative w-full h-[110px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white/40 hover:bg-orange-50/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-orange-600"
              >
                <div className="p-2 rounded-lg bg-slate-100/50 group-hover:bg-orange-100 transition-colors">
                  <Plus size={20} />
                </div>
                <span className="font-bold text-xs tracking-wide">添加新主题</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Optimized Bottom Nav - White Background with Safe Area Padding */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none px-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
        <nav className="bg-white/90 backdrop-blur-xl px-1.5 py-1.5 rounded-[20px] flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] pointer-events-auto gap-1 border border-slate-200/50 max-w-sm w-full">
          <button 
            onClick={() => setCurrentTab('execute')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${currentTab === 'execute' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
             <PlayCircle size={18} />
            <span className="text-xs font-black tracking-wide">开始决定</span>
          </button>
          
          <button 
            onClick={() => setCurrentTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] transition-all duration-300 ${currentTab === 'templates' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutGrid size={18} />
            <span className="text-xs font-black tracking-wide">决定库</span>
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
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="删除决定"
        message="确定要删除这个转盘吗？"
        confirmText="确认删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, templateId: null })}
      />

      <ConfirmModal
        isOpen={restoreConfirm}
        title="恢复默认"
        message="确定要重置所有模板吗？"
        confirmText="确认恢复"
        onConfirm={handleConfirmRestoreDefaults}
        onCancel={() => setRestoreConfirm(false)}
      />

      <ConfirmModal
        isOpen={clearHistoryConfirm}
        title="清空历史"
        message="所有的转动历史都将被永久清除。"
        confirmText="确认清空"
        onConfirm={handleConfirmClearHistory}
        onCancel={() => setClearHistoryConfirm(false)}
      />
    </div>
  );
}

export default App;