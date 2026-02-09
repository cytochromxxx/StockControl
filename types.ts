
export type Category = string;

export interface CategoryDef {
  id: string;
  key: string;
  label: string;
  defaultThreshold: number; // Added default threshold for categories
}

export interface HistoryEntry {
  id: string;
  date: string;
  amount: number; // Negative for withdrawal, positive for refill
  person: string;
  comment: string;
}

export interface Kit {
  id: string;
  name: string;
  category: Category;
  description: string;
  linkedProducts: string; // New field for linked products
  startVolume: number;
  currentVolume: number;
  criticalThreshold: number;
  history: HistoryEntry[];
}

export interface DashboardStats {
  category: Category;
  label: string;
  totalVolume: number;
  avgCapacity: number;
  status: 'green' | 'yellow' | 'red';
  count: number;
}

export type SortOption = 'name' | 'volume' | 'recent' | 'status';
