import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { TextFieldProps } from '@mui/material';
import { TRANSACTION_TYPES } from '../config';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { format } from 'date-fns';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: {
    amount: number;
    description: string;
    date: string;
    type: string;
    category_id: number;
    account_id: number;
  };
  title?: string;
}

const validationSchema = yup.object({
  amount: yup.number().required('Amount is required').moreThan(0, 'Amount must be greater than 0'),
  description: yup.string().required('Description is required'),
  date: yup.string().required('Date is required'),
  type: yup.string().required('Type is required'),
  category_id: yup.number().required('Category is required'),
  account_id: yup.number().required('Account is required'),
});

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues = {
    amount: 0,
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'EXPENSE',
    category_id: 0,
    account_id: 0,
  },
  title = 'Add Transaction',
}) => {
  const { categories } = useSelector((state: RootState) => state.categories);
  const { accounts } = useSelector((state: RootState) => state.accounts);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        amount: Number(values.amount),
      });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="type"
              name="type"
              select
              label="Transaction Type"
              value={formik.values.type}
              onChange={formik.handleChange}
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
              fullWidth
              id="amount"
              name="amount"
              label="Amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />
            <DatePicker
              label="Date"
              value={new Date(formik.values.date)}
              onChange={(date) => {
                if (date) {
                  formik.setFieldValue('date', format(date, 'yyyy-MM-dd'));
                }
              }}
              slots={{
                textField: (params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    helperText={formik.touched.date && formik.errors.date}
                  />
                ),
              }}
            />
            <TextField
              fullWidth
              id="account_id"
              name="account_id"
              select
              label="Account"
              value={formik.values.account_id}
              onChange={formik.handleChange}
              error={formik.touched.account_id && Boolean(formik.errors.account_id)}
              helperText={formik.touched.account_id && formik.errors.account_id}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              id="category_id"
              name="category_id"
              select
              label="Category"
              value={formik.values.category_id}
              onChange={formik.handleChange}
              error={formik.touched.category_id && Boolean(formik.errors.category_id)}
              helperText={formik.touched.category_id && formik.errors.category_id}
            >
              {categories
                .filter((cat) => cat.type === formik.values.type)
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionForm;
