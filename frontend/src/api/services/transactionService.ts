import { apiClient } from '../client';
import { API_ENDPOINTS } from '../../config';

export interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  account_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionDTO {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id: number;
  account_id: number;
}

export interface UpdateTransactionDTO {
  date?: string;
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category_id?: number;
  account_id?: number;
}

export interface GetTransactionsParams {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  categoryId?: number;
  accountId?: number;
  page?: number;
  limit?: number;
}

export const transactionService = {
  async getAll(filters?: GetTransactionsParams): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(API_ENDPOINTS.TRANSACTIONS.BASE, {
      params: filters,
    });
    return response;
  },

  async getById(id: number): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id));
    return response;
  },

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(API_ENDPOINTS.TRANSACTIONS.BASE, data);
    return response;
  },

  async update(id: number, data: UpdateTransactionDTO): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id), data);
    return response;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },
};
