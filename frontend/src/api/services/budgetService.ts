import axios from '../axios';
import { Budget } from '../../store/slices/budgetSlice';

export const budgetApi = {
  getBudgets: () => axios.get('/api/budgets'),
  
  getBudgetNotifications: () => axios.get('/api/budgets/notifications'),
  
  getBudgetSummary: () => axios.get('/api/budgets/summary'),
  
  createBudget: (budget: Partial<Budget>) => axios.post('/api/budgets', budget),
  
  updateBudget: (id: number, budget: Partial<Budget>) =>
    axios.put(`/api/budgets/${id}`, budget),
  
  deleteBudget: (id: number) => axios.delete(`/api/budgets/${id}`),
};
