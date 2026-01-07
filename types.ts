
export interface Template {
  id: string;
  title: string;
  description?: string;
  options: string[];
  colorTheme?: string;
  isDefault?: boolean;
  lastSelectedOption?: string;
  lastSelectedNote?: string;
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

export interface AppSettings {
  language: 'zh' | 'en';
}
