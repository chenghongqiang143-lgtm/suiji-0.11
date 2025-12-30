import React from 'react';
import { Template } from '../types';
import { Trash2, Edit, ChevronRight } from 'lucide-react';
import { COLOR_THEMES } from '../constants';

interface TemplateCardProps {
  template: Template;
  onSelect: (t: Template) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onDelete, onEdit }) => {
  const theme = COLOR_THEMES[template.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
  const primaryColor = theme.colors[0];

  return (
    <div 
      className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 border border-slate-100 hover:border-orange-100 cursor-pointer overflow-hidden flex flex-col h-[110px] sm:h-[120px]"
      onClick={() => onSelect(template)}
    >
      {/* Subtle Accent Line */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Section: Title & Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="font-bold text-sm text-slate-800 tracking-tight truncate leading-tight">
            {template.title}
          </h3>
          <div className="flex gap-0.5 mt-1">
             {theme.colors.slice(0, 4).map((c, i) => (
               <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
             ))}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(template); }}
            className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg border border-slate-100 transition-all"
          >
            <Edit size={12} />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
            className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg border border-slate-100 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Compact Preview Tags */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5 overflow-hidden">
          {template.options.slice(0, 2).map((opt, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md font-bold truncate max-w-[70px] border border-slate-100">
              {opt}
            </span>
          ))}
          {template.options.length > 2 && (
            <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-md font-black">
              +{template.options.length - 2}
            </span>
          )}
        </div>
        
        <div className="text-slate-200 group-hover:text-orange-300 transition-all duration-300">
          <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;