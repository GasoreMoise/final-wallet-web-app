import { apiClient } from '../client';
import { API_ENDPOINTS } from '../../config';
import type { AccountType } from '../../config';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  currency: string;
  description?: string;
}

export interface AccountFilters {
  type?: AccountType;
  currency?: string;
  page?: number;
  limit?: number;
}

export const accountService = {
  async getAll(filters?: AccountFilters): Promise<Account[]> {
    const response = await apiClient.get<Account[]>(API_ENDPOINTS.ACCOUNTS.BASE, {
      params: filters,
    });
    return response;
  },

  async getById(id: number): Promise<Account> {
    const response = await apiClient.get<Account>(API_ENDPOINTS.ACCOUNTS.BY_ID(id));
    return response;
  },

  async create(data: CreateAccountDTO): Promise<Account> {
    const response = await apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS.BASE, data);
    return response;
  },

  async update(id: number, data: Partial<CreateAccountDTO>): Promise<Account> {
    const response = await apiClient.put<Account>(API_ENDPOINTS.ACCOUNTS.BY_ID(id), data);
    return response;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ACCOUNTS.BY_ID(id));
  },
};
