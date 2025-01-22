// API Configuration
export const API_URL = 'https://final-wallet-web-app-1.onrender.com';
export const API_TIMEOUT = 10000; // 10 seconds

// Auth Configuration
export const TOKEN_KEY = 'access_token';
export const AUTH_HEADER = 'Authorization';
export const AUTH_SCHEME = 'Bearer';

// Chart Colors
export const CHART_COLORS = {
  GREEN: '#4CAF50',
  GREEN_ALPHA: 'rgba(76, 175, 80, 0.2)',
  RED: '#F44336',
  RED_ALPHA: 'rgba(244, 67, 54, 0.2)',
  BLUE: '#2196F3',
  BLUE_ALPHA: 'rgba(33, 150, 243, 0.2)',
  YELLOW: '#FFC107',
  YELLOW_ALPHA: 'rgba(255, 193, 7, 0.2)',
  PURPLE: '#9C27B0',
  PURPLE_ALPHA: 'rgba(156, 39, 176, 0.2)',
  COLORS: [
    '#2196F3',
    '#4CAF50',
    '#FFC107',
    '#F44336',
    '#9C27B0',
    '#00BCD4',
    '#FF9800',
    '#795548',
    '#607D8B',
    '#E91E63',
  ],
} as const;

// Currency Configuration
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY';
export const DEFAULT_CURRENCY: SupportedCurrency = 'USD';
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'JPY'];
export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const MONTH_FORMAT = 'MMM yyyy';

// Account Types
export const ACCOUNT_TYPES = ['CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

// Transaction Types
export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

// Category Types
export const CATEGORY_TYPES = TRANSACTION_TYPES;
export type CategoryType = TransactionType;

// Budget Periods
export const BUDGET_PERIODS = ['MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
export type BudgetPeriod = typeof BUDGET_PERIODS[number];

// Validation Constants
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_AMOUNT = 1000000000; // 1 billion

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

// Error Messages
export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Invalid password format',
  PASSWORD_TOO_SHORT: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Form Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_DATE: 'Invalid date',
  INVALID_DATE_FORMAT: 'Invalid date format. Use YYYY-MM-DD',
  INVALID_AMOUNT: 'Please enter a valid amount',
  POSITIVE_AMOUNT: 'Amount must be greater than 0',
  AMOUNT_TOO_LARGE: `Amount cannot exceed ${MAX_AMOUNT}`,
  
  // Type Validation
  INVALID_ACCOUNT_TYPE: 'Invalid account type',
  INVALID_TRANSACTION_TYPE: 'Invalid transaction type',
  INVALID_CATEGORY_TYPE: 'Invalid category type',
  INVALID_BUDGET_PERIOD: 'Invalid budget period',
  INVALID_CURRENCY: 'Invalid currency',
  
  // Reference Validation
  INVALID_ACCOUNT: 'Invalid account',
  INVALID_CATEGORY: 'Invalid category',
  INVALID_BUDGET: 'Invalid budget',
  
  // Date Range Validation
  END_DATE_BEFORE_START: 'End date must be after start date',
  
  // API Errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    PROFILE: '/users/profile',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: number) => `/transactions/${id}`,
  },
  ACCOUNTS: {
    BASE: '/accounts',
    BY_ID: (id: number) => `/accounts/${id}`,
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: number) => `/categories/${id}`,
  },
  BUDGETS: {
    BASE: '/budgets',
    BY_ID: (id: number) => `/budgets/${id}`,
  },
  REPORTS: {
    GENERATE: '/reports',
    MONTHLY: '/reports/monthly',
    CATEGORY: '/reports/category',
  },
} as const;
