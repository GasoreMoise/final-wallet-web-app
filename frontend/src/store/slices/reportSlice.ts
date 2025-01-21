import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { Transaction } from './transactionSlice';

export interface ReportData {
  categoryBreakdown: {
    labels: string[];
    data: number[];
  };
  monthlyTrends: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  transactions: Transaction[];
}

export interface ReportParams {
  start_date: string;
  end_date: string;
  account_ids?: number[];
  category_ids?: number[];
  transaction_type?: 'INCOME' | 'EXPENSE';
}

interface ReportState {
  data: ReportData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: null,
  isLoading: false,
  error: null,
};

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (params: ReportParams, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reports', params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate report');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearData } = reportSlice.actions;
export default reportSlice.reducer;
