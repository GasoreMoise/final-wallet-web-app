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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { Category } from '../types';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
} from '../store/slices/categorySlice';
import CategoryForm from '../components/CategoryForm';

const Categories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent_id: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE'
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewCategory({
      name: '',
      description: '',
      parent_id: '',
      type: 'EXPENSE'
    });
  };

  const handleSubmit = async (values: any) => {
    const category = {
      name: values.name,
      type: values.type,
      description: values.description,
      parent_id: values.parent_id || undefined,
    };
    
    const result = await dispatch(createCategory(category));
    if (createCategory.fulfilled.match(result)) {
      handleClose();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await dispatch(deleteCategory(id));
    }
  };

  const getParentName = (parentId?: number) => {
    if (!parentId) return '-';
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add Category
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
              <TableCell>Description</TableCell>
              <TableCell>Parent Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell>{getParentName(category.parent_id)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(category.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CategoryForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default Categories;
