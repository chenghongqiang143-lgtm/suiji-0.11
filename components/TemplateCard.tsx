import React from 'react';
import { Template } from '../types';
import { Trash2, Edit, ChevronRight } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onSelect: (t: Template) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onDelete, onEdit }) => {
  return (
    <div 
      className="group relative bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-slate-100/50 hover:border-orange-100 cursor-pointer overflow-hidden"
      onClick={() => onSelect(template)}
    >
      {/* Actions Container - High Z-Index, pointer-events-auto */}
      <div className="absolute top-3 right-3 flex gap-2 z-30 pointer-events-auto">
        <button 
          type="button"
          onClick={(e) => { 
            e.stopPropagation(); 
            onEdit(template); 
          }}
          className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-orange-600 rounded-full shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
          title="编辑"
        >
          <Edit size={18} />
        </button>
        <button 
          type="button"
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(template.id); 
          }}
          className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
          title="删除"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0 pr-24"> 
          <h3 className="font-bold text-lg text-slate-800 mb-2 truncate">{template.title}</h3>
          <div className="flex flex-wrap gap-1.5">
            {template.options.slice(0, 5).map((opt, i) => (
              <span key={i} className="text-[11px] px-2 py-1 bg-slate-50 text-slate-500 rounded-md font-medium truncate max-w-[100px]">
                {opt}
              </span>
            ))}
            {template.options.length > 5 && (
              <span className="text-[11px] px-2 py-1 bg-orange-50 text-orange-500 rounded-md font-bold">
                +{template.options.length - 5}
              </span>
            )}
          </div>
        </div>
        
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 flex-none shadow-inner group-hover:shadow-lg group-hover:shadow-orange-200 mt-2">
          <ChevronRight size={20} className="ml-0.5" />
        </div>
      </div>
      
      {/* Subtle Progress Bar-like decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    </div>
  );
};

export default TemplateCard;