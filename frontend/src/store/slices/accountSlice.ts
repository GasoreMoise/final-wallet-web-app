import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { AccountType, SupportedCurrency } from '../../config';

export interface Account {
  id: number;
  name: string;
  balance: number;
  currency: SupportedCurrency;
  type: AccountType;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accounts: [],
  isLoading: false,
  error: null,
};

export type CreateAccountDto = Omit<Account, 'id' | 'created_at'>;

// Fetch all accounts
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Fetching accounts]');
      const response = await axios.get('/api/accounts/');
      console.log('[Fetch accounts response]', response);
      return response.data;
    } catch (error: any) {
      console.error('[Fetch accounts error]', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

// Create a new account
export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (account: CreateAccountDto, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/api/accounts/', account);
      await dispatch(fetchAccounts());
      return response.data;
    } catch (error: any) {
      console.error('[Create account error]', error.response?.data);
      
      // Handle the specific error structure from the API
      const apiError = error.response?.data;
      let errorMessage = 'Failed to create account';
      
      if (apiError) {
        if (Array.isArray(apiError)) {
          errorMessage = apiError[0]?.msg || errorMessage;
        } else if (typeof apiError === 'object' && apiError.msg) {
          errorMessage = apiError.msg;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete an account
export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`/api/accounts/${id}`);
      // After deleting an account, fetch all accounts to ensure we have the latest data
      dispatch(fetchAccounts());
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Failed to delete account'
      );
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch accounts';
      })
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts.push(action.payload);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to create account';
      })
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = state.accounts.filter((account) => account.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to delete account';
      });
  },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;
