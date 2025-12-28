export interface Template {
  id: string;
  title: string;
  options: string[];
  colorTheme?: string;
  isDefault?: boolean;
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