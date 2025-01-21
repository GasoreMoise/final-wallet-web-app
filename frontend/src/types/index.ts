import { AccountType, TransactionType, CURRENCY_SYMBOLS } from '../config';

// Auth Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Account Types
export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: keyof typeof CURRENCY_SYMBOLS;
  balance: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

// Transaction Types
export interface Transaction {
  id: number;
  date: string;
  type: TransactionType;
  amount: number;
  description?: string;
  account_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  parent_id: number | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

// Budget Types
export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  spent: number;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
}

// Report Types
export interface MonthlyTrends {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface CategoryBreakdown {
  labels: string[];
  data: number[];
}

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

export interface ReportData {
  monthlyTrends: MonthlyTrends;
  categoryBreakdown: CategoryBreakdown;
  summary: ReportSummary;
}

export interface ReportState {
  data: ReportData | null;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
