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
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { TextFieldProps } from '@mui/material';
import { TRANSACTION_TYPES } from '../config';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { format, parseISO } from 'date-fns';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    amount: number;
    description: string;
    date: string;
    type: string;
    category_id: number;
    account_id: number;
  }) => void;
  initialValues?: {
    amount: string;
    description: string;
    date: string;
    type: string;
    category_id: string;
    account_id: string;
  };
  title?: string;
}

const validationSchema = yup.object().shape({
  amount: yup.number().required('Amount is required').moreThan(0, 'Amount must be greater than 0'),
  description: yup.string().required('Description is required').trim(),
  date: yup.string().required('Date is required'),
  type: yup.string().oneOf(['expense', 'income'], 'Invalid transaction type').required('Type is required'),
  category_id: yup.number().required('Category is required').moreThan(0, 'Please select a category'),
  account_id: yup.number().required('Account is required').moreThan(0, 'Please select an account'),
});

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues = {
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
    category_id: '',
    account_id: '',
  },
  title = 'Add Transaction',
}) => {
  const { categories } = useSelector((state: RootState) => state.categories);
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const { error } = useSelector((state: RootState) => state.transactions);

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      // Format the date as ISO string with time component and timezone
      const dateWithTime = new Date(values.date);
      dateWithTime.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      // Format to match backend's expected format: YYYY-MM-DDTHH:mm:ss
      const formattedDate = format(dateWithTime, "yyyy-MM-dd'T'HH:mm:ss");
      
      const submissionValues = {
        amount: Number(values.amount),
        description: values.description.trim(),
        date: formattedDate,
        type: values.type.toLowerCase(),
        category_id: Number(values.category_id),
        account_id: Number(values.account_id),
      };
      
      // Log the submission values for debugging
      console.log('Submitting transaction with values:', submissionValues);
      
      // Validate that we have valid numbers before submitting
      if (isNaN(submissionValues.amount) || 
          isNaN(submissionValues.category_id) || 
          isNaN(submissionValues.account_id)) {
        console.error('Invalid numeric values:', {
          amount: submissionValues.amount,
          category_id: submissionValues.category_id,
          account_id: submissionValues.account_id
        });
        return;
      }
      
      onSubmit(submissionValues);
    },
  });

  // Filter categories based on transaction type
  const filteredCategories = React.useMemo(() => {
    console.log('Filtering categories:', { 
      allCategories: categories,
      currentType: formik.values.type,
      filtered: categories.filter(cat => cat.type.toLowerCase() === formik.values.type.toLowerCase())
    });
    return categories.filter(cat => cat.type.toLowerCase() === formik.values.type.toLowerCase());
  }, [categories, formik.values.type]);

  // Reset category when type changes
  React.useEffect(() => {
    if (formik.values.category_id) {
      const selectedCategory = categories.find(cat => String(cat.id) === String(formik.values.category_id));
      if (!selectedCategory || selectedCategory.type.toLowerCase() !== formik.values.type.toLowerCase()) {
        console.log('Resetting category_id due to type mismatch:', {
          selectedCategory,
          currentType: formik.values.type
        });
        formik.setFieldValue('category_id', '');
      }
    }
  }, [formik.values.type, categories, formik.values.category_id]);

  // Ensure categories and accounts are loaded
  React.useEffect(() => {
    console.log('Current form state:', {
      categories: categories.length,
      accounts: accounts.length,
      values: formik.values,
      errors: formik.errors
    });
  }, [categories.length, accounts.length, formik.values, formik.errors]);

  // Show validation messages for empty required fields
  const showValidationError = (fieldName: keyof typeof formik.values) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="type"
              name="type"
              label="Type"
              select
              value={formik.values.type}
              onChange={(e) => {
                formik.setFieldValue('type', e.target.value);
                // Reset category when type changes
                formik.setFieldValue('category_id', '');
              }}
              error={Boolean(showValidationError('type'))}
              helperText={showValidationError('type') ? formik.errors.type : ''}
            >
              {TRANSACTION_TYPES.map((type) => (
                <MenuItem key={type} value={type.toLowerCase()}>
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
              error={Boolean(showValidationError('amount'))}
              helperText={showValidationError('amount') ? formik.errors.amount : ''}
              inputProps={{ step: '0.01', min: '0' }}
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={Boolean(showValidationError('description'))}
              helperText={showValidationError('description') ? formik.errors.description : ''}
            />

            <DatePicker
              label="Date"
              value={formik.values.date ? new Date(formik.values.date) : null}
              onChange={(newValue) => {
                // Store only the date part in the form
                formik.setFieldValue('date', newValue ? format(newValue, 'yyyy-MM-dd') : '');
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(showValidationError('date')),
                  helperText: showValidationError('date') ? formik.errors.date : ''
                }
              }}
            />

            <TextField
              fullWidth
              id="category_id"
              name="category_id"
              label="Category"
              select
              value={formik.values.category_id}
              onChange={formik.handleChange}
              error={Boolean(showValidationError('category_id'))}
              helperText={
                showValidationError('category_id')
                  ? formik.errors.category_id
                  : filteredCategories.length === 0
                  ? `No categories available for ${formik.values.type}. Please create one first.`
                  : ''
              }
              disabled={filteredCategories.length === 0}
            >
              {filteredCategories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="account_id"
              name="account_id"
              label="Account"
              select
              value={formik.values.account_id}
              onChange={formik.handleChange}
              error={Boolean(showValidationError('account_id'))}
              helperText={
                showValidationError('account_id')
                  ? formik.errors.account_id
                  : accounts.length === 0
                  ? 'No accounts available. Please create one first.'
                  : ''
              }
              disabled={accounts.length === 0}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={String(account.id)}>
                  {account.name} ({account.currency})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionForm;
