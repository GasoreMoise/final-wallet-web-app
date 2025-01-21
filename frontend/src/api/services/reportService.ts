import { apiClient } from '../client';
import { API_ENDPOINTS } from '../../config';
import type { TransactionType } from '../../config';

export interface ReportParams {
  start_date: string;
  end_date: string;
  account_ids?: number[];
  category_ids?: number[];
  transaction_type?: TransactionType;
}

export interface CategoryBreakdown {
  labels: string[];
  data: number[];
}

export interface MonthlyTrends {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface ReportData {
  categoryBreakdown: CategoryBreakdown;
  monthlyTrends: MonthlyTrends;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
}

export const reportService = {
  async generateReport(params: ReportParams): Promise<ReportData> {
    const response = await apiClient.post<ReportData>(API_ENDPOINTS.REPORTS.GENERATE, params);
    return response;
  },
};
