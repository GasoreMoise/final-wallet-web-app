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
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { Transaction } from '../types';
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '../store/slices/transactionSlice';
import { fetchAccounts } from '../store/slices/accountSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { format } from 'date-fns';
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from '../config';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { usePagination } from '../utils/hooks';
import TransactionForm from '../components/TransactionForm';

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
    totalPages,
  } = usePagination<Transaction>(transactions.length, DEFAULT_PAGE_SIZE, {
    totalItems: transactions.length,
    itemsPerPage: DEFAULT_PAGE_SIZE,
  });

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        date: values.date,
        type: values.type.toLowerCase(),
        amount: Number(values.amount),
        description: values.description?.trim() || '',
        account_id: Number(values.account_id),
        category_id: Number(values.category_id)
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
    } catch (error: any) {
      console.error('Transaction operation failed:', error);
      // Don't close the form on error so user can fix the issue
      if (error.message) {
        // Keep the form open but don't handle the error here
        // The error will be shown through the Redux state
        return;
      }
    }
  };

  React.useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleClickOpen = () => {
    setSelectedTransaction(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTransaction(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await dispatch(deleteTransaction(id)).unwrap();
      } catch (error: any) {
        console.error('Failed to delete transaction:', error?.response?.data?.detail || error?.message || 'Unknown error');
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

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
            {paginatedItems(transactions as Transaction[]).map((transaction) => {
              const account = accounts.find((a) => a.id === transaction.account_id);
              const category = categories.find((c) => c.id === transaction.category_id);

              return (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDateTime(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{category?.name}</TableCell>
                  <TableCell>{account?.name}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: transaction.type === 'income' ? 'success.main' : 'error.main',
                    }}
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(transaction)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(transaction.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TransactionForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialValues={
          selectedTransaction
            ? {
                date: selectedTransaction.date,
                type: selectedTransaction.type,
                amount: selectedTransaction.amount.toString(),
                description: selectedTransaction.description || '',
                account_id: selectedTransaction.account_id.toString(),
                category_id: selectedTransaction.category_id.toString(),
              }
            : undefined
        }
        title={selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
      />
    </Box>
  );
};

export default Transactions;
