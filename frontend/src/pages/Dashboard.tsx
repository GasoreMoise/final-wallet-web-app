import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchDashboardData,
  DashboardData,
} from '../store/slices/dashboardSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '../config';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { accounts } = useSelector((state: RootState) => state.accounts);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const defaultCurrency = accounts?.[0]?.currency || 'USD';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No dashboard data available.</Alert>
      </Box>
    );
  }

  const getChartOptions = (title: string) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  });

  const renderSummaryCard = (
    title: string,
    amount: number,
    color: string,
    additionalInfo?: string,
    icon?: React.ReactNode
  ) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper 
        elevation={2}
        sx={{ 
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: '50%',
                p: 1,
                mr: 2,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color} sx={{ mb: 1 }}>
          {formatCurrency(amount, defaultCurrency)}
        </Typography>
        {additionalInfo && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 'auto' }}
          >
            {additionalInfo}
          </Typography>
        )}
      </Paper>
    </Grid>
  );

  const monthlyTrendsData = {
    labels: data.monthlyTrends.labels,
    datasets: [
      {
        label: 'Income',
        data: data.monthlyTrends.income,
        borderColor: CHART_COLORS.GREEN,
        backgroundColor: CHART_COLORS.GREEN_ALPHA,
        fill: true,
      },
      {
        label: 'Expenses',
        data: data.monthlyTrends.expenses,
        borderColor: CHART_COLORS.RED,
        backgroundColor: CHART_COLORS.RED_ALPHA,
        fill: true,
      },
    ],
  };

  const categoryBreakdownData = {
    labels: data.categoryBreakdown.labels,
    datasets: [
      {
        data: data.categoryBreakdown.data,
        backgroundColor: data.categoryBreakdown.labels.map((_, index) => 
          Object.values(CHART_COLORS.COLORS)[index % CHART_COLORS.COLORS.length]
        ),
        borderWidth: 1,
      },
    ],
  } as ChartData<'doughnut'>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {renderSummaryCard(
          'Total Income',
          data.summary.totalIncome,
          'success.main'
        )}
        {renderSummaryCard(
          'Total Expenses',
          data.summary.totalExpenses,
          'error.main'
        )}
        {renderSummaryCard(
          'Net Savings',
          data.summary.netSavings,
          data.summary.netSavings >= 0 ? 'success.main' : 'error.main',
          `Savings Rate: ${formatPercentage(data.summary.savingsRate)}`
        )}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Line
              data={monthlyTrendsData}
              options={getChartOptions('Monthly Income vs Expenses')}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Doughnut
              data={categoryBreakdownData}
              options={getChartOptions('Expense Categories')}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
