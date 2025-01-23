import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { TransactionType } from '../../config';
import { API_ENDPOINTS } from '../../config';

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  category_id: number;
  account_id: number;
  category?: {
    id: number;
    name: string;
  };
  account?: {
    id: number;
    name: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
  owner_id: number;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.TRANSACTIONS.BASE);
      console.log('Fetched transactions:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch transactions:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const apiError = error.response?.data;
      let errorMessage = 'Failed to fetch transactions';
      
      if (apiError) {
        if (Array.isArray(apiError?.detail)) {
          errorMessage = apiError.detail[0]?.msg || errorMessage;
        } else if (typeof apiError === 'object' && 'detail' in apiError) {
          errorMessage = apiError.detail;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'owner_id'>, { dispatch, rejectWithValue }) => {
    try {
      console.log('Creating transaction with data:', transaction);
      const response = await axios.post(API_ENDPOINTS.TRANSACTIONS.BASE, transaction);
      console.log('Transaction created:', response.data);
      
      // Refresh the transactions list after creating a new one
      await dispatch(fetchTransactions());
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to create transaction:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: transaction
      });
      
      const apiError = error.response?.data;
      let errorMessage = 'Failed to create transaction';
      
      if (apiError) {
        if (Array.isArray(apiError?.detail)) {
          errorMessage = apiError.detail[0]?.msg || errorMessage;
        } else if (typeof apiError === 'object' && 'detail' in apiError) {
          errorMessage = apiError.detail;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transaction }: { id: number; transaction: Partial<Transaction> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(API_ENDPOINTS.TRANSACTIONS.BY_ID(id), transaction);
      return response.data;
    } catch (error: any) {
      console.error('API Error Details:', error.response?.data);
      const apiError = error.response?.data;
      let errorMessage = 'Failed to update transaction';
      
      if (apiError) {
        if (Array.isArray(apiError)) {
          errorMessage = apiError[0]?.msg || errorMessage;
        } else if (typeof apiError === 'object' && 'msg' in apiError) {
          errorMessage = apiError.msg;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(API_ENDPOINTS.TRANSACTIONS.BY_ID(id));
      return id;
    } catch (error: any) {
      console.error('API Error Details:', error.response?.data);
      const apiError = error.response?.data;
      let errorMessage = 'Failed to delete transaction';
      
      if (apiError) {
        if (Array.isArray(apiError)) {
          errorMessage = apiError[0]?.msg || errorMessage;
        } else if (typeof apiError === 'object' && 'msg' in apiError) {
          errorMessage = apiError.msg;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload || [];
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.transactions = [];
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch transactions';
      })
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.push(action.payload);
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to create transaction';
      })
      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to update transaction';
      })
      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to delete transaction';
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
