import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { login as loginAction, logout as logoutAction } from '../store/slices/authSlice';
import { LoginCredentials } from '../api/services/authService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginAction(credentials)).unwrap();
      navigate('/');
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAction());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [dispatch, navigate]);

  return {
    isAuthenticated: !!token,
    user,
    isLoading,
    error,
    login,
    logout,
  };
};

export const useQuery = () => {
  const { search } = useLocation();
  return new URLSearchParams(search);
};

export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  paginatedItems: (items: T[]) => T[];
  totalPages: number;
}

export const usePagination = <T>(length: number, DEFAULT_PAGE_SIZE: number, {
  totalItems, itemsPerPage, initialPage = 0,
}: UsePaginationProps): UsePaginationReturn<T> => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= totalItems) {
      setPage(Math.max(0, Math.ceil(totalItems / rowsPerPage) - 1));
    }
  }, [totalItems, rowsPerPage, page]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const paginatedItems = useCallback(
    (items: T[]) => {
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return items.slice(startIndex, endIndex);
    },
    [page, rowsPerPage]
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    paginatedItems,
    totalPages: Math.ceil(totalItems / rowsPerPage),
  };
};
