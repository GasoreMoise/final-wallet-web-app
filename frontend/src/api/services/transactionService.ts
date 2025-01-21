import { apiClient } from '../client';
import { API_ENDPOINTS } from '../../config';

export interface Transaction {
  id: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  account_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionDTO {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  account_id: number;
  category_id: number;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: 'INCOME' | 'EXPENSE';
  account_id?: number;
  category_id?: number;
  page?: number;
  limit?: number;
}

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
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

  async update(id: number, data: Partial<CreateTransactionDTO>): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id), data);
    return response;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },
};
