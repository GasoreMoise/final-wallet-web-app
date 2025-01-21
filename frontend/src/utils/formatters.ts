import { format, parseISO } from 'date-fns';
import {
  CURRENCY_SYMBOLS,
  DATE_FORMAT,
  DATETIME_FORMAT,
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATETIME_FORMAT,
  MONTH_FORMAT,
} from '../config';

export const formatCurrency = (
  amount: number,
  currency: keyof typeof CURRENCY_SYMBOLS = 'USD',
  options: Intl.NumberFormatOptions = {}
): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr: string = DISPLAY_DATE_FORMAT): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, DISPLAY_DATETIME_FORMAT);
};

export const formatMonth = (date: string | Date): string => {
  return formatDate(date, MONTH_FORMAT);
};

export const formatApiDate = (date: Date): string => {
  return format(date, DATE_FORMAT);
};

export const formatApiDateTime = (date: Date): string => {
  return format(date, DATETIME_FORMAT);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}): string => {
  return new Intl.NumberFormat('en-US', options).format(value);
};
