import React, { useState, useEffect } from 'react';
import { Template, ThemeColor, Category } from '../types';
import { COLOR_THEMES } from '../constants';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface TemplateEditorProps {
  initialTemplate?: Template | null;
  categories: Category[];
  initialCategoryId?: string;
  themeColor?: ThemeColor;
  onSave: (template: Template) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  initialTemplate, 
  categories, 
  initialCategoryId, 
  themeColor = 'orange', 
  onSave, 
  onCancel, 
  onDelete 
}) => {
  const [title, setTitle] = useState(initialTemplate?.title || '');
  const [options, setOptions] = useState<string[]>(initialTemplate?.options || ['', '', '']);
  
  // Ensure valid theme fallback since 'default' was removed
  const getInitialTheme = () => {
    if (initialTemplate?.colorTheme && COLOR_THEMES[initialTemplate.colorTheme as keyof typeof COLOR_THEMES]) {
      return initialTemplate.colorTheme;
    }
    return 'berry';
  };
  const [colorTheme, setColorTheme] = useState<string>(getInitialTheme());

  const [categoryId, setCategoryId] = useState<string>(
    initialTemplate?.categoryId || initialCategoryId || (categories.length > 0 ? categories[0].id : '')
  );

  // Handle Back Gesture
  useEffect(() => {
    // Unique ID for this modal state to ensure we only pop our own state
    const stateId = 'editor';
    window.history.pushState({ modal: stateId }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      onCancel();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If we are still in the state we pushed (meaning we closed via UI button), go back to clean up history
      if (window.history.state?.modal === stateId) {
        window.history.back();
      }
    };
  }, []); // Run once on mount

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }
    const validOptions = options.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      alert('请至少添加2个选项');
      return;
    }

    const template: Template = {
      id: initialTemplate?.id || Date.now().toString(),
      title,
      options: validOptions,
      colorTheme,
      categoryId,
      isDefault: false, // Edited templates are no longer default protected
    };

    onSave(template);
  };
  
  const handleDeleteClick = () => {
    if (initialTemplate && onDelete) {
        onDelete(initialTemplate.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      
      <div className="relative bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden transform-gpu">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialTemplate ? '编辑转盘' : '新建转盘'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              主题 / 问题
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：周末去哪儿玩？"
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 transition-all font-medium text-slate-800`}
              />
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              所属分类
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 transition-all font-medium text-slate-800 appearance-none`}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Theme Selection Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              配色主题
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {Object.values(COLOR_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={`flex-none p-1 rounded-xl border-2 transition-all ${
                    colorTheme === theme.id ? `border-${themeColor}-500 scale-105` : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="w-20 h-12 rounded-lg flex overflow-hidden shadow-sm">
                    {theme.colors.slice(0, 4).map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="text-[10px] text-center mt-1 text-slate-600 font-medium">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                选项列表
              </label>
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
                {options.length} 个选项
              </span>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <span className="text-xs font-bold text-slate-300 w-4 text-center">{index + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`选项 ${index + 1}`}
                    className={`flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 transition-all text-sm`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    disabled={options.length <= 2}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addOption}
              className={`w-full py-3 mt-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold hover:border-${themeColor}-400 hover:text-${themeColor}-500 hover:bg-${themeColor}-50 transition-all flex items-center justify-center gap-2`}
            >
              <Plus size={18} />
              添加选项
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex gap-3">
          {initialTemplate && onDelete && (
             <button
               onClick={handleDeleteClick}
               className="px-4 py-3.5 bg-white text-rose-500 border border-rose-100 rounded-xl font-bold text-lg shadow-sm hover:bg-rose-50 transition-all"
               title="删除此转盘"
             >
               <Trash2 size={20} />
             </button>
          )}
          <button
            onClick={handleSave}
            className={`flex-1 py-3.5 bg-${themeColor}-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-${themeColor}-200 hover:shadow-2xl hover:bg-${themeColor}-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2`}
          >
            <Save size={20} />
            保存决定
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;