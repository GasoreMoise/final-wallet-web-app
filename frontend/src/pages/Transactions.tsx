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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { Transaction } from '../types';
import { Category as ReduxCategory } from '../store/slices/categorySlice';
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '../store/slices/transactionSlice';
import { format } from 'date-fns';
import {
  TRANSACTION_TYPES,
  DATE_FORMAT,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../config';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { transactionSchema } from '../utils/validation';
import { usePagination } from '../utils/hooks';
import { useFormik } from 'formik';

interface TransactionFormValues {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  description: string;
  account_id: string;
  category_id: string;
}

const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, isLoading, error } = useSelector(
    (state: RootState) => state.transactions
  );
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const { categories } = useSelector((state: RootState) => state.categories);

  const [open, setOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    paginatedItems,
  } = usePagination(transactions.length, DEFAULT_PAGE_SIZE, { totalItems: transactions.length, itemsPerPage: DEFAULT_PAGE_SIZE, initialPage: 0 });

  const formik = useFormik<TransactionFormValues>({
    initialValues: {
      date: format(new Date(), DATE_FORMAT),
      type: TRANSACTION_TYPES[0] as 'INCOME' | 'EXPENSE',
      amount: '',
      description: '',
      account_id: '',
      category_id: '',
    },
    validationSchema: transactionSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          amount: parseFloat(values.amount),
          account_id: parseInt(values.account_id),
          category_id: parseInt(values.category_id),
          type: values.type as 'INCOME' | 'EXPENSE'
        };

        if (selectedTransaction) {
          await dispatch(updateTransaction({ 
            id: selectedTransaction.id, 
            transaction: payload 
          })).unwrap();
        } else {
          await dispatch(createTransaction(payload)).unwrap();
        }

        handleClose();
        resetForm();
      } catch (error) {
        console.error('Failed to save transaction:', error);
      }
    },
  });

  React.useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await dispatch(deleteTransaction(id));
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    formik.setValues({
      date: transaction.date,
      type: transaction.type as 'INCOME' | 'EXPENSE',
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      account_id: transaction.account_id.toString(),
      category_id: transaction.category_id.toString(),
    });
    setOpen(true);
  };

  const displayedTransactions = paginatedItems(transactions);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={isLoading}
        >
          Add Transaction
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
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Account</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems(transactions).map((item: unknown) => {
              const transaction = item as Transaction;
              const account = accounts.find((a) => a.id === transaction.account_id);
              const category = categories.find((c) => c.id === transaction.category_id);

              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {formatDateTime(transaction.date)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{category?.name}</TableCell>
                  <TableCell>{account?.name}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: transaction.type === 'INCOME' ? 'success.main' : 'error.main',
                    }}
                  >
                    {formatCurrency(
                      transaction.amount,
                      account?.currency || 'USD'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(transaction)}
                      disabled={isLoading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="date"
              label="Date"
              type="date"
              fullWidth
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{
                shrink: true,
              }}
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
              {TRANSACTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="amount"
              label="Amount"
              type="number"
              fullWidth
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              inputProps={{
                step: '0.01',
                min: '0',
              }}
            />
            <TextField
              margin="dense"
              name="account_id"
              label="Account"
              select
              fullWidth
              value={formik.values.account_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.account_id && Boolean(formik.errors.account_id)}
              helperText={formik.touched.account_id && formik.errors.account_id}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="category_id"
              label="Category"
              select
              fullWidth
              value={formik.values.category_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category_id && Boolean(formik.errors.category_id)}
              helperText={formik.touched.category_id && formik.errors.category_id}
            >
              {categories.filter(
                (category) => !formik.values.type || category.type === formik.values.type
              ).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
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

export default Transactions;
