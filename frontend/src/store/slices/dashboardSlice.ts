import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export interface DashboardData {
  totalBalance: number;
  recentTransactions: Array<{
    id: number;
    amount: number;
    description: string;
    date: string;
    type: string;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
  }>;
  monthlyTrends: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
  categoryBreakdown: {
    labels: string[];
    data: number[];
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Dashboard] Fetching data...');
      const response = await axios.get('/reports/dashboard');
      console.log('[Dashboard] Data received:', response);
      return response;
    } catch (error: any) {
      console.error('[Dashboard] Error:', error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export default dashboardSlice.reducer;
