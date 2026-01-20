
export interface Category {
  id: string;
  name: string;
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  options: string[];
  colorTheme?: string;
  isDefault?: boolean;
  lastSelectedOption?: string;
  lastSelectedNote?: string;
  optionNotes?: Record<string, string>; // Key: option text, Value: note content
  categoryId?: string;
}

export type WheelSegment = {
  text: string;
  color: string;
};

export interface HistoryItem {
  id: string;
  result: string;
  templateTitle: string;
  timestamp: number;
}

export type ThemeColor = 'orange' | 'blue' | 'rose' | 'violet' | 'emerald' | 'amber';

export interface AppSettings {
  language: 'zh' | 'en';
  themeColor: ThemeColor;
}