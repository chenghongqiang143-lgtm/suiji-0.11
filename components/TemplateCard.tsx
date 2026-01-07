import React from 'react';
import { Template } from '../types';
import { Trash2, Edit, ChevronRight, MousePointerClick, Trophy, Sparkles, StickyNote } from 'lucide-react';
import { COLOR_THEMES } from '../constants';

interface TemplateCardProps {
  template: Template;
  onSelect: (t: Template) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Template) => void;
  onManualSelect: (t: Template) => void;
  onEditNote: (t: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onDelete, onEdit, onManualSelect, onEditNote }) => {
  const theme = COLOR_THEMES[template.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
  const primaryColor = theme.colors[0];

  return (
    <div 
      className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 border border-slate-100 hover:border-orange-100 cursor-pointer overflow-hidden flex flex-col h-[140px]"
      onClick={() => onSelect(template)}
    >
      {/* Subtle Accent Line */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Section: Title & Actions */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0 pr-24">
          <h3 className="font-bold text-sm text-slate-800 tracking-tight truncate leading-tight">
            {template.title}
          </h3>
          
          {/* Small description display when result is showing (limited space) */}
          {template.lastSelectedOption && template.description && (
             <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium leading-tight">
               {template.description}
             </p>
          )}

          <div className="flex gap-0.5 mt-1.5">
             {theme.colors.slice(0, 4).map((c, i) => (
               <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
             ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onManualSelect(template); }}
            className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm"
            title="手动选择结果"
          >
            <MousePointerClick size={16} />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(template); }}
            className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 hover:bg-white rounded-lg transition-all border border-transparent hover:border-orange-100 hover:shadow-sm"
            title="编辑"
          >
            <Edit size={16} />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-white rounded-lg transition-all border border-transparent hover:border-rose-100 hover:shadow-sm"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Middle Content: Last Result OR Description */}
      <div className="mt-1 flex-1 min-h-0">
        {template.lastSelectedOption ? (
           <div className="h-full flex flex-col gap-1">
             <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-2 flex items-center gap-2 relative group/result">
                <div className="p-1 bg-white rounded-full text-orange-500 shadow-sm flex-none">
                   <Trophy size={12} />
                </div>
                <div className="min-w-0 flex-1">
                   <div className="text-[9px] text-orange-400 font-bold uppercase tracking-wider leading-none mb-0.5">最近结果</div>
                   <div className="text-sm font-bold text-slate-700 truncate">{template.lastSelectedOption}</div>
                </div>
                
                {/* Edit Note Button inside Result Box */}
                <button
                  onClick={(e) => { e.stopPropagation(); onEditNote(template); }}
                  className="p-1.5 text-orange-300 hover:text-orange-600 hover:bg-orange-100/50 rounded-md transition-colors"
                  title="添加/编辑备注"
                >
                  <StickyNote size={14} />
                </button>
             </div>
             
             {/* Note Display (if exists) */}
             {template.lastSelectedNote && (
               <div className="px-1.5 py-0.5">
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 italic flex items-center gap-1">
                    <span className="w-0.5 h-2 bg-orange-300 rounded-full inline-block"></span>
                    {template.lastSelectedNote}
                  </p>
               </div>
             )}
           </div>
        ) : (
           <div className="h-full flex flex-col justify-center">
             {template.description ? (
               <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                 {template.description}
               </p>
             ) : (
               <div className="flex items-center gap-2 opacity-50 group-hover:opacity-80 transition-opacity">
                  <div className="p-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <Sparkles size={14} className="text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">准备就绪</span>
               </div>
             )}
           </div>
        )}
      </div>

      {/* Bottom Section: Footer */}
      <div className="mt-auto flex items-center justify-end pt-1">        
        <div className="text-slate-200 group-hover:text-orange-300 transition-all duration-300">
          <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;