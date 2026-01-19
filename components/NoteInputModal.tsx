import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, CheckSquare, List, Type, Plus, X as XIcon, Trash2 } from 'lucide-react';
import { ThemeColor } from '../types';

interface NoteInputModalProps {
  initialNote: string;
  themeColor?: ThemeColor;
  onSave: (note: string, persist: boolean) => void;
  onClose: () => void;
  title?: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

const NoteInputModal: React.FC<NoteInputModalProps> = ({ initialNote, themeColor = 'orange', onSave, onClose, title }) => {
  const [mode, setMode] = useState<'text' | 'checklist'>('text');
  const [textNote, setTextNote] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Refs for managing focus
  const itemInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize state based on content
  useEffect(() => {
    const hasChecklistFormat = initialNote.includes('[ ]') || initialNote.includes('[x]');
    
    if (hasChecklistFormat) {
      setMode('checklist');
      const lines = initialNote.split('\n');
      const items = lines.map((line, idx) => {
        const checked = line.trim().startsWith('[x]');
        // Remove the [ ] or [x] prefix to get clean text
        const text = line.replace(/^\s*\[[ x]\]\s*/, '');
        return { id: Date.now() + '_' + idx, text, checked };
      }).filter(i => i.text.trim() !== '' || lines.length === 1); // Keep empty if it's the only one
      
      setChecklistItems(items.length > 0 ? items : [{ id: Date.now().toString(), text: '', checked: false }]);
      setTextNote(initialNote);
    } else {
      setMode('text');
      setTextNote(initialNote);
      // Pre-populate checklist items in case user switches
      const lines = initialNote.split('\n').filter(l => l.trim());
      setChecklistItems(lines.length 
        ? lines.map((l, i) => ({ id: Date.now() + '_' + i, text: l, checked: false }))
        : [{ id: Date.now().toString(), text: '', checked: false }]
      );
    }
  }, []);

  const handleSave = () => {
    let finalContent = '';
    if (mode === 'text') {
      finalContent = textNote;
    } else {
      finalContent = checklistItems
        .filter(i => i.text.trim() !== '') // Filter empty items
        .map(i => `[${i.checked ? 'x' : ' '}] ${i.text}`)
        .join('\n');
    }
    // Always persist = true as requested
    onSave(finalContent, true);
  };

  const toggleMode = () => {
    if (mode === 'text') {
      // Switch to Checklist
      setMode('checklist');
      // Parse current text to items
      const lines = textNote.split('\n');
      const items = lines.map((line, idx) => {
        // Check if line already has markdown format
        const isChecked = line.trim().startsWith('[x]');
        const hasBox = line.trim().startsWith('[ ]') || isChecked;
        const text = hasBox ? line.replace(/^\s*\[[ x]\]\s*/, '') : line;
        return { id: Date.now() + '_' + idx, text, checked: isChecked };
      }).filter(i => i.text.trim() !== '');

      setChecklistItems(items.length ? items : [{ id: Date.now().toString(), text: '', checked: false }]);
    } else {
      // Switch to Text
      setMode('text');
      // Convert items back to text (preserving markdown format)
      const text = checklistItems
        .filter(i => i.text.trim() !== '')
        .map(i => `[${i.checked ? 'x' : ' '}] ${i.text}`)
        .join('\n');
      setTextNote(text);
    }
  };

  // Checklist Handlers
  const handleItemChange = (id: string, text: string) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleItemCheck = (id: string) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAddItem = (afterId?: string) => {
    const newItem = { id: Date.now().toString(), text: '', checked: false };
    if (afterId) {
      const index = checklistItems.findIndex(i => i.id === afterId);
      const newItems = [...checklistItems];
      newItems.splice(index + 1, 0, newItem);
      setChecklistItems(newItems);
      // Focus logic would ideally go here with useEffect
    } else {
      setChecklistItems(prev => [...prev, newItem]);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (checklistItems.length <= 1) {
      setChecklistItems([{ id: Date.now().toString(), text: '', checked: false }]);
      return;
    }
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(id);
    } else if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '') {
      e.preventDefault();
      handleDeleteItem(id);
    }
  };

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
      
      <div className="relative bg-white w-full max-w-xs sm:max-w-sm rounded-3xl shadow-2xl p-6 animate-modal-enter z-10 flex flex-col max-h-[85dvh] overflow-hidden">
         {/* Header */}
         <div className="flex items-center justify-between mb-4 text-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`p-2 bg-${themeColor}-50 text-${themeColor}-500 rounded-full border border-${themeColor}-100`}>
                 <StickyNote size={20} />
              </div>
              <h3 className="font-bold text-lg">{title || '结果备注'}</h3>
            </div>
            
            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
            >
              {mode === 'text' ? <List size={14} /> : <Type size={14} />}
              {mode === 'text' ? '清单模式' : '文本模式'}
            </button>
         </div>
         
         {/* Editor Content - Flexible Height */}
         <div className="flex-1 overflow-y-auto mb-4 min-h-0">
           {mode === 'text' ? (
             <textarea
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
                className={`w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 resize-none text-slate-700 font-medium text-sm leading-relaxed`}
                placeholder="添加一些关于这个结果的备注..."
                autoFocus
                style={{ minHeight: '100px' }}
             />
           ) : (
             <div className="space-y-2 pb-2">
                {checklistItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 animate-fade-in">
                    <button 
                      onClick={() => handleItemCheck(item.id)}
                      className={`flex-shrink-0 transition-colors ${item.checked ? `text-${themeColor}-500` : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      {item.checked ? <CheckSquare size={20} /> : <div className="w-5 h-5 border-2 border-current rounded-[4px]" />}
                    </button>
                    <input
                      ref={el => itemInputRefs.current[index] = el}
                      type="text"
                      value={item.text}
                      onChange={(e) => handleItemChange(item.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className={`flex-1 bg-transparent border-b border-transparent focus:border-${themeColor}-200 focus:outline-none py-1 text-sm font-medium transition-all ${item.checked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}
                      placeholder="输入事项..."
                      autoFocus={index === checklistItems.length - 1 && checklistItems.length > 1}
                    />
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => handleAddItem()}
                  className={`w-full py-2 mt-2 flex items-center justify-center gap-1 text-xs font-bold text-slate-400 hover:text-${themeColor}-500 border border-dashed border-slate-200 hover:border-${themeColor}-300 rounded-xl transition-all`}
                >
                  <Plus size={14} />
                  添加项目
                </button>
             </div>
           )}
         </div>

         {/* Info Text */}
         <div className="mb-4 flex items-center gap-2 text-xs text-slate-400 px-1 flex-shrink-0">
            <CheckSquare size={14} className={`text-${themeColor}-500`} />
            <span>备注将自动绑定到此选项</span>
         </div>
         
         {/* Actions */}
         <div className="flex gap-3 flex-shrink-0">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
            >
              取消
            </button>
            <button 
              onClick={handleSave} 
              className={`flex-1 py-3 bg-${themeColor}-600 text-white font-bold rounded-xl shadow-lg shadow-${themeColor}-200 hover:bg-${themeColor}-700 hover:shadow-xl transition-all active:scale-95 text-sm`}
            >
              保存备注
            </button>
         </div>
      </div>
    </div>
  );
};

export default NoteInputModal;