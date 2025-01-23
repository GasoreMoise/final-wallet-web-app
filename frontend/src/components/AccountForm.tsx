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
import { ACCOUNT_TYPES, SUPPORTED_CURRENCIES } from '../config';

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: {
    name: string;
    type: string;
    currency: string;
    description: string;
    balance: number;
  };
  title?: string;
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string().required('Type is required'),
  currency: yup.string().required('Currency is required'),
  balance: yup.number().required('Balance is required'),
  description: yup.string(),
});

const AccountForm: React.FC<AccountFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues = {
    name: '',
    type: 'bank',
    currency: 'USD',
    description: '',
    balance: 0,
  },
  title = 'Add Account',
}) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        balance: Number(values.balance),
        is_active: true,
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
              id="name"
              name="name"
              label="Account Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              id="type"
              name="type"
              select
              label="Account Type"
              value={formik.values.type}
              onChange={formik.handleChange}
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
              fullWidth
              id="currency"
              name="currency"
              select
              label="Currency"
              value={formik.values.currency}
              onChange={formik.handleChange}
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
              fullWidth
              id="balance"
              name="balance"
              label="Initial Balance"
              type="number"
              value={formik.values.balance}
              onChange={formik.handleChange}
              error={formik.touched.balance && Boolean(formik.errors.balance)}
              helperText={formik.touched.balance && formik.errors.balance}
            />
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

export default AccountForm;
