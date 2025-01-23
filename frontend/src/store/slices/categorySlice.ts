import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { TransactionType } from '../../config';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  description?: string;
  color?: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  owner_id: number;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export type CreateCategoryDto = Omit<Category, 'id' | 'created_at' | 'updated_at' | 'owner_id'>;

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/categories');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Create a new category
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (category: CreateCategoryDto, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/api/categories', category);
      return response.data;
    } catch (error: any) {
      console.error('[Create category error]', error.response?.data);
      
      // Handle the specific error structure from the API
      const apiError = error.response?.data;
      let errorMessage = 'Failed to create category';
      
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

// Delete a category
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      await dispatch(fetchCategories());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Update a category
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, category }: { id: number; category: Partial<Category> }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/categories/${id}`, category);
      await dispatch(fetchCategories());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to create category';
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        console.error('Failed to update category:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update category';
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        console.error('Failed to delete category:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to delete category';
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
