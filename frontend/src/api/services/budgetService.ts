import axios from '../axios';
import { Budget } from '../../store/slices/budgetSlice';

export const budgetApi = {
  getBudgets: () => axios.get('/budgets'),
  
  getBudgetNotifications: () => axios.get('/budgets/notifications'),
  
  getBudgetSummary: () => axios.get('/budgets/summary'),
  
  createBudget: (budget: Partial<Budget>) => axios.post('/budgets', budget),
  
  updateBudget: (id: number, budget: Partial<Budget>) =>
    axios.put(`/budgets/${id}`, budget),
  
  deleteBudget: (id: number) => axios.delete(`/budgets/${id}`),
};
