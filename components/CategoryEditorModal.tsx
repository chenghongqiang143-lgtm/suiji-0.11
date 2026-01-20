import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Category, ThemeColor } from '../types';

interface CategoryEditorModalProps {
  category: Category | null; // null for creating new
  themeColor: ThemeColor;
  onSave: (name: string) => void;
  onDelete?: () => void; // Only available when editing
  onClose: () => void;
}

const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({ category, themeColor, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(category?.name || '');

  useEffect(() => {
    const stateId = 'category-editor';
    window.history.pushState({ modal: stateId }, '', window.location.href);
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === stateId) {
        window.history.back();
      }
    };
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 animate-modal-enter z-10 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">{category ? '编辑分类' : '新建分类'}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入分类名称..."
          autoFocus
          className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 transition-all text-sm font-medium text-slate-800 mb-6`}
        />

        <div className="flex gap-2">
          {category && onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-3 bg-white text-rose-500 border border-rose-100 rounded-xl font-bold shadow-sm hover:bg-rose-50 transition-all"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`flex-1 py-3 bg-${themeColor}-600 text-white rounded-xl font-bold shadow-lg shadow-${themeColor}-200 hover:bg-${themeColor}-700 transition-all disabled:opacity-50`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditorModal;