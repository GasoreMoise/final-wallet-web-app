import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  MenuItem,
  TablePagination,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchAccounts,
  createAccount,
  deleteAccount,
  clearError,
  Account,
} from '../store/slices/accountSlice';
import {
  ACCOUNT_TYPES,
  SUPPORTED_CURRENCIES,
  DEFAULT_PAGE_SIZE,
} from '../config';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { accountSchema } from '../utils/validation';
import { usePagination } from '../utils/hooks';
import { useFormik } from 'formik';
import { CreateAccountDto } from '../types/account.types';

const PAGE_SIZE_OPTIONS: number[] = [5, 10, 25, 50];

const Accounts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, isLoading, error } = useSelector(
    (state: RootState) => state.accounts
  );
  const [open, setOpen] = React.useState(false);

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination(accounts?.length || 0, DEFAULT_PAGE_SIZE, {
    totalItems: accounts?.length || 0,
    itemsPerPage: DEFAULT_PAGE_SIZE
  });

  const handleSubmit = async (values: any) => {
    const account: CreateAccountDto = {
      name: values.name,
      type: values.type,
      currency: values.currency,
      description: values.description,
      balance: Number(values.balance) || 0,
      is_active: true,
    };
    
    try {
      await dispatch(createAccount(account)).unwrap();
      handleClose();
      formik.resetForm();
    } catch (err) {
      // The error is already handled by the slice
      console.error('Failed to create account:', err);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      type: ACCOUNT_TYPES[0],
      currency: SUPPORTED_CURRENCIES[0],
      description: '',
      balance: 0,
    },
    validationSchema: accountSchema,
    onSubmit: handleSubmit,
  });

  React.useEffect(() => {
    console.log('[Accounts] Fetching accounts...');
    dispatch(fetchAccounts());
  }, [dispatch]);

  React.useEffect(() => {
    console.log('[Accounts] Accounts state updated:', accounts);
  }, [accounts]);

  React.useEffect(() => {
    if (error) {
      // Clear error after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      await dispatch(deleteAccount(id));
    }
  };

  const displayedAccounts = React.useMemo(() => {
    console.log('[Accounts] Calculating displayed accounts:', {
      accounts,
      page,
      rowsPerPage
    });
    
    if (!Array.isArray(accounts) || accounts.length === 0) {
      return [];
    }
    
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return accounts
      .slice(start, end)
      .filter(account => account !== null && account !== undefined);
  }, [accounts, page, rowsPerPage]);

  if (isLoading && (!accounts || accounts.length === 0)) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading accounts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={isLoading}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading && (!displayedAccounts || displayedAccounts.length === 0) ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading accounts...
                </TableCell>
              </TableRow>
            ) : (
              displayedAccounts.map((account) => 
                account ? (
                  <TableRow key={account.id}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>{account.currency}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(account.balance, account.currency)}
                    </TableCell>
                    <TableCell>{account.description || '-'}</TableCell>
                    <TableCell>{formatDateTime(account.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(account.id)}
                        disabled={isLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : null
              )
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          component="div"
          count={accounts?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="name"
              label="Name"
              fullWidth
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              margin="dense"
              name="type"
              label="Type"
              select
              fullWidth
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            >
              {ACCOUNT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="currency"
              label="Currency"
              select
              fullWidth
              value={formik.values.currency}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.currency && Boolean(formik.errors.currency)}
              helperText={formik.touched.currency && formik.errors.currency}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="balance"
              label="Balance"
              fullWidth
              type="number"
              value={formik.values.balance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.balance && Boolean(formik.errors.balance)}
              helperText={formik.touched.balance && formik.errors.balance}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isLoading || formik.isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || formik.isSubmitting || !formik.isValid}
            >
              {formik.isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Accounts;
