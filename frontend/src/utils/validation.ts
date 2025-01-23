import * as yup from 'yup';
import {
  MIN_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
  MAX_AMOUNT,
  ERROR_MESSAGES,
  ACCOUNT_TYPES,
  CURRENCY_SYMBOLS,
} from '../config';
import { parseISO, isValid } from 'date-fns';

// Auth Types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends LoginFormValues {
  confirmPassword: string;
  fullName: string;
}

// Account Types
export interface AccountFormValues {
  name: string;
  type: typeof ACCOUNT_TYPES[number];
  currency: keyof typeof CURRENCY_SYMBOLS;
  description?: string;
  balance?: number;
}

// Transaction Types
export interface TransactionFormValues {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  description?: string;
  account_id: string;
  category_id: string;
}

// Category Types
export interface CategoryFormValues {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  color: string;
  parent_id: number | undefined;
}

// Budget Types
export interface BudgetFormValues {
  category_id: string | number;
  amount: string | number;
  period: string;
  start_date: string;
  end_date: string;
  notification_threshold: string | number;
}

// Auth Schemas
export const loginSchema: yup.ObjectSchema<LoginFormValues> = yup.object().shape({
  email: yup
    .string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  password: yup
    .string()
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
});

export const registerSchema: yup.ObjectSchema<RegisterFormValues> = yup.object().shape({
  email: yup
    .string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  password: yup
    .string()
    .min(MIN_PASSWORD_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  fullName: yup
    .string()
    .max(MAX_NAME_LENGTH)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
});

// Account Schema
export const accountSchema = yup.object().shape({
  name: yup
    .string()
    .required('Account name is required')
    .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`),
  type: yup
    .string()
    .required('Account type is required')
    .oneOf(ACCOUNT_TYPES, 'Invalid account type'),
  currency: yup
    .string()
    .required('Currency is required')
    .oneOf(Object.keys(CURRENCY_SYMBOLS), 'Invalid currency'),
  description: yup
    .string()
    .nullable()
    .max(255, 'Description must be at most 255 characters'),
  balance: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .min(0, 'Balance must be a positive number')
    .max(MAX_AMOUNT, `Balance must be at most ${MAX_AMOUNT}`),
});

// Transaction Schema
export const transactionSchema = yup.object({
  date: yup
    .string()
    .required('Date is required')
    .test('valid-date', 'Invalid date format', (value) => {
      if (!value) return false;
      return isValid(parseISO(value));
    }),
  type: yup
    .string()
    .required('Type is required')
    .oneOf(['income', 'expense'], 'Invalid transaction type'),
  amount: yup
    .string()
    .required('Amount is required')
    .test('valid-amount', 'Amount must be a positive number', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  description: yup
    .string()
    .transform((value) => value === null || value === undefined ? '' : value)
    .optional()
    .default(''),
  account_id: yup
    .string()
    .required('Account is required'),
  category_id: yup
    .string()
    .required('Category is required'),
});

// Category Schema
export const categorySchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  type: yup
    .string()
    .required('Type is required')
    .oneOf(['income', 'expense'], 'Invalid category type'),
  description: yup
    .string()
    .transform((value) => value === null || value === undefined ? '' : value)
    .default(''),
  color: yup
    .string()
    .required('Color is required')
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  parent_id: yup
    .number()
    .transform((value) => {
      if (value === '' || value === null || value === undefined || isNaN(value)) {
        return null;
      }
      return Number(value);
    })
    .nullable(),
});

// Budget Schema
export const budgetSchema: yup.ObjectSchema<BudgetFormValues> = yup.object().shape({
  category_id: yup
    .string()
    .test('category_id', ERROR_MESSAGES.INVALID_CATEGORY, (value): boolean | undefined => {
      if (!value) return false;
      const id = parseInt(value);
      return !isNaN(id) && id > 0;
    })
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  amount: yup
    .string()
    .test('amount', ERROR_MESSAGES.INVALID_AMOUNT, (value) => {
      if (!value) return false;
      const amount = parseFloat(value);
      return !isNaN(amount) && amount > 0 && amount <= MAX_AMOUNT;
    })
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  period: yup
    .string()
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  start_date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, ERROR_MESSAGES.INVALID_DATE_FORMAT)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  end_date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, ERROR_MESSAGES.INVALID_DATE_FORMAT)
    .min(yup.ref('start_date'), ERROR_MESSAGES.END_DATE_BEFORE_START)
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
  notification_threshold: yup
    .string()
    .test('notification_threshold', ERROR_MESSAGES.INVALID_AMOUNT, (value) => {
      if (!value) return false;
      const threshold = parseFloat(value);
      return !isNaN(threshold) && threshold > 0 && threshold <= MAX_AMOUNT;
    })
    .required(ERROR_MESSAGES.REQUIRED_FIELD),
});

export const validateRequired = (value: string | null | undefined): string | undefined => {
  if (!value || value.trim() === '') {
    return 'This field is required';
  }
  return undefined;
};

export const validateAmount = (value: string | null | undefined): string | undefined => {
  if (!value || value.trim() === '') {
    return 'Amount is required';
  }
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return 'Amount must be a positive number';
  }
  return undefined;
};

export const budgetSchemaTest = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  category_id: yup
    .string()
    .required('Category is required'),
  amount: yup
    .string()
    .required('Amount is required')
    .test('valid-amount', 'Amount must be a positive number', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  period: yup
    .string()
    .required('Period is required')
    .oneOf(['MONTHLY', 'YEARLY'], 'Invalid period'),
});
