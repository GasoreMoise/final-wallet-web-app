import React from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchBudgetNotifications } from '../store/slices/budgetSlice';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { DEFAULT_CURRENCY } from '../config';

const BudgetNotification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { notifications } = useSelector((state: RootState) => state.budgets);
  const { accounts } = useSelector((state: RootState) => state.accounts);
  
  const defaultCurrency = (accounts[0]?.currency || DEFAULT_CURRENCY) as "USD" | "EUR" | "GBP" | "JPY";

  React.useEffect(() => {
    const fetchNotifications = () => {
      dispatch(fetchBudgetNotifications());
    };

    fetchNotifications();
    // Fetch notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${notifications.length} budget notifications`}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '400px',
            width: '300px',
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <ListItemText primary="No budget alerts" />
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.budget_id} onClick={handleClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" color="error">
                  Budget Alert: {notification.category_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Spent: {formatCurrency(notification.spent, defaultCurrency)} of{' '}
                  {formatCurrency(notification.amount, defaultCurrency)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPercentage(notification.percentage)} of budget used
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default BudgetNotification;
