import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { budgetApi } from '../../api/services/budgetService';
import { showNotification } from './notificationSlice';

export interface Budget {
  id: number;
  amount: number;
  spent: number;
  start_date: string;
  end_date: string;
  category_id: number;
  notification_threshold: number;
  is_active: boolean;
  category: {
    id: number;
    name: string;
  };
}

export interface BudgetNotification {
  budget_id: number;
  category_name: string;
  amount: number;
  spent: number;
  percentage: number;
}

interface BudgetState {
  budgets: Budget[];
  notifications: BudgetNotification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  notifications: [],
  isLoading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetApi.getBudgets();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

export const fetchBudgetNotifications = createAsyncThunk(
  'budgets/fetchNotifications',
  async (_, { dispatch }) => {
    const response = await budgetApi.getBudgetNotifications();
    // Show notification if there are any alerts
    if (response.data.length > 0) {
      dispatch(
        showNotification({
          message: `You have ${response.data.length} budget alert(s)`,
          type: 'warning',
        })
      );
    }
    return response.data;
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budget: Partial<Budget>) => {
    const response = await budgetApi.createBudget(budget);
    return response.data;
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budget }: { id: number; budget: Partial<Budget> }) => {
    const response = await budgetApi.updateBudget(id, budget);
    return response.data;
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: number) => {
    await budgetApi.deleteBudget(id);
    return id;
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload || [];
        state.error = null;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.budgets = [];
        state.error = action.payload as string || 'An error occurred';
      })
      // Fetch Notifications
      .addCase(fetchBudgetNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      // Create Budget
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload);
      })
      // Update Budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      // Delete Budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      });
  },
});

export const { clearError } = budgetSlice.actions;
export default budgetSlice.reducer;
