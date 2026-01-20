import React, { useRef, useState } from 'react';
import { Template, ThemeColor } from '../types';
import { Edit, MousePointerClick, Trophy, StickyNote, CheckSquare, Square, Plus, Check, GripVertical } from 'lucide-react';
import { COLOR_THEMES } from '../constants';

interface TemplateCardProps {
  template: Template;
  themeColor: ThemeColor;
  onSelect: (t: Template) => void;
  onEdit: (t: Template) => void;
  onManualSelect: (t: Template) => void;
  onEditNote: (t: Template) => void;
  
  // Selection Mode Props
  isSelectionMode: boolean;
  isSelected: boolean;
  onLongPress: (t: Template) => void;
  onToggleSelect: (t: Template) => void;
  
  // Drag and Drop
  onDragStart?: (e: React.DragEvent, t: Template) => void;
  onDragOver?: (e: React.DragEvent, t: Template) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  themeColor, 
  onSelect, 
  onEdit, 
  onManualSelect, 
  onEditNote,
  isSelectionMode,
  isSelected,
  onLongPress,
  onToggleSelect,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  const wheelTheme = COLOR_THEMES[template.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
  const accentColor = wheelTheme.colors[0];
  const timerRef = useRef<any>(null);
  const [isPressing, setIsPressing] = useState(false);

  // Parse note content to check for checklist format
  const parseNote = (note: string) => {
    if (!note) return null;
    const lines = note.split('\n');
    const isChecklist = lines.some(l => l.trim().startsWith('[ ]') || l.trim().startsWith('[x]'));
    
    if (!isChecklist) return { type: 'text' as const, content: note };

    const items = lines
      .filter(l => l.trim().startsWith('[ ]') || l.trim().startsWith('[x]'))
      .map(l => ({
        checked: l.trim().startsWith('[x]'),
        text: l.replace(/^\s*\[[ x]\]\s*/, '')
      }));
    
    return { type: 'checklist' as const, items };
  };

  const noteData = parseNote(template.lastSelectedNote || '');

  // --- Long Press Logic ---
  const startPress = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress(template);
      setIsPressing(false); // Reset pressing state after trigger
    }, 500); // 500ms for long press
  };

  const cancelPress = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.stopPropagation();
      onToggleSelect(template);
    } else {
      onSelect(template);
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-2xl p-4 transition-all duration-300 border cursor-pointer flex flex-col h-auto select-none
        ${isSelectionMode 
          ? (isSelected 
              ? `border-${themeColor}-500 bg-${themeColor}-50/30 shadow-md` 
              : 'border-slate-200 opacity-80 scale-[0.98]') 
          : `border-slate-100 hover:border-${themeColor}-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] active:scale-[0.98]`
        }
        ${isPressing ? 'scale-[0.98]' : ''}
      `}
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      
      draggable={isSelectionMode}
      onDragStart={(e) => onDragStart && onDragStart(e, template)}
      onDragOver={(e) => onDragOver && onDragOver(e, template)}
      onDragEnd={onDragEnd}
    >
      {/* Accent Indicator (Hidden in Selection Mode) */}
      {!isSelectionMode && (
        <div 
          className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-300 opacity-60 group-hover:opacity-100`}
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Drag Handle Indicator (Selection Mode Only) */}
      {isSelectionMode && (
         <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 cursor-grab active:cursor-grabbing">
            <GripVertical size={20} />
         </div>
      )}

      {/* Selection Checkbox Overlay */}
      {isSelectionMode && (
        <div className={`absolute top-4 right-4 z-20 transition-all duration-300 ${isSelected ? 'scale-110' : 'scale-100'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected 
              ? `bg-${themeColor}-500 border-${themeColor}-500` 
              : 'bg-white border-slate-300'
          }`}>
            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`pl-3 flex flex-col gap-3 ${isSelectionMode ? 'ml-4' : ''} transition-all`}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2">
          {/* Title */}
          <h3 className={`font-bold text-lg text-slate-800 tracking-tight leading-snug mb-0 line-clamp-2 transition-colors ${!isSelectionMode && 'group-hover:text-slate-900'}`}>
            {template.title}
          </h3>

          {/* Action Buttons (Hidden in Selection Mode) */}
          {!isSelectionMode && (
            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 -mt-1 -mr-1">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onManualSelect(template); }}
                className={`p-2 text-slate-400 hover:text-${themeColor}-600 bg-slate-50 hover:bg-${themeColor}-50 rounded-xl transition-colors`}
                title="手动选择"
              >
                <MousePointerClick size={18} />
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(template); }}
                className={`p-2 text-slate-400 hover:text-${themeColor}-600 bg-slate-50 hover:bg-${themeColor}-50 rounded-xl transition-colors`}
                title="编辑"
              >
                <Edit size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* Bottom Row: Result (Left) & Note (Right) */}
        <div className="flex items-end justify-between gap-3 min-h-[26px]">
            {/* Result Display */}
            <div className="flex-1 min-w-0">
                {template.lastSelectedOption ? (
                    <div className={`inline-flex items-center gap-2 bg-${themeColor}-50/60 border border-${themeColor}-100 rounded-lg px-2.5 py-1.5 max-w-full w-fit animate-fade-in`}>
                        <Trophy size={12} className={`text-${themeColor}-500 flex-shrink-0`} />
                        <span className={`text-sm font-bold text-slate-700 truncate`}>
                        {template.lastSelectedOption}
                        </span>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 font-medium pl-1 mb-1">
                    {template.options.length} 个选项
                    </p>
                )}
            </div>

            {/* Note Display (Disable interaction in selection mode) */}
            {template.lastSelectedOption && (
                <div className={`flex-shrink-0 max-w-[50%] flex justify-end animate-fade-in relative z-10 ${isSelectionMode ? 'pointer-events-none opacity-60' : ''}`}>
                    {noteData ? (
                        <div 
                        onClick={(e) => { e.stopPropagation(); onEditNote(template); }}
                        className="cursor-pointer hover:opacity-75 transition-opacity"
                        >
                            {noteData.type === 'checklist' ? (
                            <div className="flex flex-col items-end gap-1.5">
                                {noteData.items.slice(0, 1).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100/80 shadow-sm">
                                    {item.checked ? (
                                    <CheckSquare size={11} className={`text-${themeColor}-500 flex-shrink-0`} />
                                    ) : (
                                    <Square size={11} className="text-slate-300 flex-shrink-0" />
                                    )}
                                    <span className={`text-[10px] leading-tight truncate max-w-[120px] font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                    {item.text}
                                    </span>
                                </div>
                                ))}
                                {noteData.items.length > 1 && (
                                <span className="text-[9px] text-slate-400 font-bold pr-1">
                                    +{noteData.items.length - 1} 项更多...
                                </span>
                                )}
                            </div>
                            ) : (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100/80">
                                <StickyNote size={11} className="text-slate-400 flex-shrink-0" />
                                <p className="text-[10px] text-slate-500 italic line-clamp-1 leading-snug text-right font-medium max-w-[120px]">
                                {noteData.content}
                                </p>
                            </div>
                            )}
                        </div>
                    ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEditNote(template); }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-${themeColor}-50 transition-colors group/add-note border border-transparent hover:border-${themeColor}-100`}
                    >
                        <span className={`text-[10px] font-bold text-slate-300 group-hover/add-note:text-${themeColor}-600 transition-colors`}>备注</span>
                        <Plus size={12} className={`text-slate-300 group-hover/add-note:text-${themeColor}-500 transition-colors`} />
                    </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;