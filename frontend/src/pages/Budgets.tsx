import React, { useEffect, useState } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchBudgets,
  createBudget,
  deleteBudget,
  Budget,
} from '../store/slices/budgetSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { format } from 'date-fns';

const Budgets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { budgets, isLoading, error } = useSelector(
    (state: RootState) => state.budgets
  );
  const { categories } = useSelector((state: RootState) => state.categories);
  const [open, setOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    amount: '',
    category_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    notification_threshold: '0.8',
  });

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCategories());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewBudget({
      amount: '',
      category_id: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      notification_threshold: '0.8',
    });
  };

  const handleSubmit = async () => {
    const budget = {
      ...newBudget,
      amount: parseFloat(newBudget.amount),
      category_id: parseInt(newBudget.category_id),
      notification_threshold: parseFloat(newBudget.notification_threshold),
    };
    const result = await dispatch(createBudget(budget));
    if (createBudget.fulfilled.match(result)) {
      handleClose();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await dispatch(deleteBudget(id));
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : '-';
  };

  const getProgress = (budget: Budget) => {
    return (budget.spent / budget.amount) * 100;
  };

  const getProgressColor = (budget: Budget) => {
    const progress = getProgress(budget);
    if (progress >= budget.notification_threshold * 100) return 'error';
    if (progress >= (budget.notification_threshold * 100) / 2) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add Budget
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Spent</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(budgets || []).map((budget: Budget) => (
              <TableRow key={budget.id}>
                <TableCell>{getCategoryName(budget.category_id)}</TableCell>
                <TableCell align="right">${budget.amount.toFixed(2)}</TableCell>
                <TableCell align="right">${budget.spent.toFixed(2)}</TableCell>
                <TableCell>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(getProgress(budget), 100)}
                      color={getProgressColor(budget)}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(budget.start_date), 'MMM dd')} -{' '}
                  {format(new Date(budget.end_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {budget.is_active ? (
                    <Alert severity="success" sx={{ py: 0 }}>
                      Active
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ py: 0 }}>
                      Inactive
                    </Alert>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(budget.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Budget</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newBudget.amount}
            onChange={(e) =>
              setNewBudget({ ...newBudget, amount: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Category"
            select
            fullWidth
            value={newBudget.category_id}
            onChange={(e) =>
              setNewBudget({ ...newBudget, category_id: e.target.value })
            }
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            value={newBudget.start_date}
            onChange={(e) =>
              setNewBudget({ ...newBudget, start_date: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            value={newBudget.end_date}
            onChange={(e) =>
              setNewBudget({ ...newBudget, end_date: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Notification Threshold"
            type="number"
            fullWidth
            value={newBudget.notification_threshold}
            onChange={(e) =>
              setNewBudget({
                ...newBudget,
                notification_threshold: e.target.value,
              })
            }
            helperText="Alert when spent reaches this percentage (0.0 - 1.0)"
            inputProps={{
              min: 0,
              max: 1,
              step: 0.1,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budgets;
