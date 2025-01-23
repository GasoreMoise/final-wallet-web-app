import React from 'react';
import { FormikProps } from 'formik';
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
import { CATEGORY_TYPES } from '../config';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface CategoryFormValues {
  name: string;
  type: typeof CATEGORY_TYPES[number];
  description: string;
  color: string;
  parent_id: number | undefined;
}

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  formik: FormikProps<CategoryFormValues>;
  isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onClose,
  formik,
  isSubmitting,
}) => {
  const { categories } = useSelector((state: RootState) => state.categories);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Category</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Category Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              id="type"
              name="type"
              select
              label="Category Type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            >
              {CATEGORY_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.toLowerCase()}
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
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            <TextField
              fullWidth
              id="color"
              name="color"
              label="Color"
              type="color"
              value={formik.values.color}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.color && Boolean(formik.errors.color)}
              helperText={formik.touched.color && formik.errors.color}
              sx={{ '& input': { p: 1, height: 40 } }}
            />
            <TextField
              fullWidth
              id="parent_id"
              name="parent_id"
              select
              label="Parent Category"
              value={formik.values.parent_id || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.parent_id && Boolean(formik.errors.parent_id)}
              helperText={formik.touched.parent_id && formik.errors.parent_id}
            >
              <MenuItem value="">None</MenuItem>
              {categories && categories
                .filter((cat) => cat.type === formik.values.type)
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;
