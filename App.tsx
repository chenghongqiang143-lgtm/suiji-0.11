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
     // Optional: Restore last active template
     return templates.length > 0 ? templates[0].id : null;
  });

  const [currentTab, setCurrentTab] = useState<'execute' | 'templates'>('execute');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('wheel');
  
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  
  // Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, templateId: string | null}>({ show: false, templateId: null });
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('spinDecide_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('spinDecide_history', JSON.stringify(history));
  }, [history]);

  // Ensure active template is valid
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
      
      // If we are currently editing this template, close the editor
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
    
    // If it's a new template, switch to it
    if (!templates.find(t => t.id === template.id)) {
      setActiveTemplateId(template.id);
      setCurrentTab('execute');
    }
  };

  const handleSpinEnd = (result: string) => {
    // Trigger vibration
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
      setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
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
        return (
          <DigitalRoller
            options={activeTemplate.options}
            onSpinEnd={handleSpinEnd}
          />
        );
      case 'wheel':
      default:
        return (
          <Wheel 
            options={activeTemplate.options} 
            colorTheme={activeTemplate.colorTheme}
            onSpinEnd={handleSpinEnd} 
          />
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Decorative Background Blobs */}
      <div className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-200/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-5 z-10 flex items-center justify-between flex-none backdrop-blur-[2px]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/50 text-orange-500">
            <Dices size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentTab === 'execute' ? '当前决定' : '管理'}
            </span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight truncate max-w-[200px] leading-tight">
              {currentTab === 'execute' 
                ? (activeTemplate ? activeTemplate.title : '未选择') 
                : '我的模板'}
            </h1>
          </div>
        </div>
        
        {currentTab === 'templates' && (
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>新建</span>
          </button>
        )}

        {currentTab === 'execute' && activeTemplate && (
           <div className="flex gap-2">
             <button 
               onClick={() => setShowHistory(true)}
               className="p-2.5 text-slate-400 hover:text-orange-600 bg-white/50 hover:bg-white rounded-full transition-all border border-transparent hover:border-orange-100 hover:shadow-md"
               title="历史记录"
             >
               <History size={22} />
             </button>
             <button 
               onClick={() => handleEdit(activeTemplate)}
               className="p-2.5 text-slate-400 hover:text-orange-600 bg-white/50 hover:bg-white rounded-full transition-all border border-transparent hover:border-orange-100 hover:shadow-md"
               title="编辑当前模板"
             >
               <Settings2 size={22} />
             </button>
           </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 pt-2 scroll-smooth">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          {currentTab === 'execute' ? (
            // Execute View
            activeTemplate ? (
              <div className="flex-1 flex flex-col">
                {/* Visualizer Mode Switcher */}
                <div className="flex justify-center mb-6 animate-fade-in">
                  <div className="bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/60 flex shadow-sm">
                    <button
                      onClick={() => setDisplayMode('wheel')}
                      className={`p-2.5 rounded-xl transition-all ${displayMode === 'wheel' ? 'bg-white text-orange-500 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      title="幸运转盘"
                    >
                      <Disc size={20} />
                    </button>
                    <button
                      onClick={() => setDisplayMode('roller')}
                      className={`p-2.5 rounded-xl transition-all ${displayMode === 'roller' ? 'bg-white text-orange-500 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      title="数字滚动"
                    >
                      <Monitor size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in py-2 min-h-[400px]">
                  {renderVisualizer()}
                  
                  {displayMode === 'wheel' && (
                    <div className="mt-8 text-center md:hidden animate-fade-in opacity-70" style={{ animationDelay: '300ms' }}>
                       <p className="text-sm font-medium text-slate-400 tracking-widest uppercase">— 点击 GO 开始 —</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-fade-in">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-100">
                  <Dices size={48} className="text-orange-200" />
                </div>
                <p className="text-xl font-bold text-slate-600 mb-2">空空如也</p>
                <p className="text-slate-400 mb-8">还没有可以使用的转盘</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                      onClick={handleCreateNew} 
                      className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-0.5"
                    >
                      创建第一个转盘
                    </button>
                    <button 
                      onClick={() => setRestoreConfirm(true)}
                      className="px-8 py-3 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={18} />
                      恢复默认模板
                    </button>
                </div>
              </div>
            )
          ) : (
            // Templates List View
            <div className="grid grid-cols-1 gap-4 animate-fade-in pb-10">
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
                className="group w-full h-24 rounded-3xl border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white/50 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 text-slate-400 hover:text-orange-600"
              >
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-orange-100 transition-colors">
                  <Plus size={20} />
                </div>
                <span className="font-bold">创建新主题</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modern Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <nav className="bg-white/90 backdrop-blur-xl border border-white/50 px-2 py-2 rounded-full flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto gap-1">
          <button 
            onClick={() => setCurrentTab('execute')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${currentTab === 'execute' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
             <PlayCircle size={20} strokeWidth={2.5} />
            <span className="text-sm font-bold">开始决定</span>
          </button>
          
          <button 
            onClick={() => setCurrentTab('templates')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${currentTab === 'templates' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            <LayoutGrid size={20} strokeWidth={2.5} />
            <span className="text-sm font-bold">模板列表</span>
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

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="删除模板"
        message="确定要删除这个转盘模板吗？删除后将无法恢复。"
        confirmText="确认删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, templateId: null })}
      />

      <ConfirmModal
        isOpen={restoreConfirm}
        title="恢复默认"
        message="确定要恢复所有默认模板吗？这将覆盖当前的列表。"
        confirmText="恢复默认"
        onConfirm={handleConfirmRestoreDefaults}
        onCancel={() => setRestoreConfirm(false)}
      />

      <ConfirmModal
        isOpen={clearHistoryConfirm}
        title="清空历史"
        message="确定要清空所有的历史记录吗？"
        confirmText="确认清空"
        onConfirm={handleConfirmClearHistory}
        onCancel={() => setClearHistoryConfirm(false)}
      />
    </div>
  );
}

export default App;