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
  IconButton,
  Alert,
  TablePagination,
  LinearProgress,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  Category,
} from '../store/slices/categorySlice';
import CategoryForm from '../components/CategoryForm';
import { useFormik } from 'formik';
import { usePagination } from '../utils/hooks';
import { categorySchema } from '../utils/validation';
import { CATEGORY_TYPES, TransactionType } from '../config';

const PAGE_SIZE_OPTIONS: readonly number[] = [5, 10, 25, 50] as const;

interface CategoryFormValues {
  name: string;
  type: TransactionType;
  description: string;
  color: string;
  parent_id: number | undefined;
}

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories = [], isLoading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const [open, setOpen] = useState(false);

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination(categories.length, PAGE_SIZE_OPTIONS[0], {
    totalItems: categories.length,
    itemsPerPage: PAGE_SIZE_OPTIONS[0],
    initialPage: 0
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      const category = {
        name: values.name,
        type: values.type as TransactionType,
        description: values.description || '',
        color: values.color,
        parent_id: values.parent_id,
      };
      
      const result = await dispatch(createCategory(category));
      if (createCategory.fulfilled.match(result)) {
        handleClose();
        formik.resetForm();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const formik = useFormik<CategoryFormValues>({
    initialValues: {
      name: '',
      type: 'expense' as TransactionType,
      description: '',
      color: '#000000',
      parent_id: undefined,
    },
    validationSchema: categorySchema,
    onSubmit: handleSubmit,
  });

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      if (window.confirm('Are you sure you want to delete this category?')) {
        const result = await dispatch(deleteCategory(id));
        if (result.meta.requestStatus !== 'fulfilled') {
          throw new Error('Failed to delete category');
        }
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const displayedCategories = React.useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return categories.slice(start, end);
  }, [categories, page, rowsPerPage]);

  const getParentCategoryName = (parentId: number | null | undefined): string => {
    if (!parentId) return '-';
    const parent = categories.find((cat) => cat.id === parentId);
    return parent ? parent.name : '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={isLoading || formik.isSubmitting}
        >
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' 
            ? error 
            : (error as { msg?: string })?.msg || 'An error occurred'}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table aria-label="categories table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Parent Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.type}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{getParentCategoryName(category.parent_id)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={categories.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        />
      </Paper>

      <CategoryForm
        open={open}
        onClose={handleClose}
        formik={formik}
        isSubmitting={formik.isSubmitting}
      />
    </Box>
  );
};

export default Categories;
