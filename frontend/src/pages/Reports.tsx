import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
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
  ArcElement,
  ChartOptions,
  Scale,
  Tick,
  ChartData,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { generateReport } from '../store/slices/reportSlice';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  CHART_COLORS,
  DATE_FORMAT,
  DISPLAY_DATE_FORMAT,
  SupportedCurrency,
  TRANSACTION_TYPES,
} from '../config';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { isWithinInterval, parseISO } from 'date-fns';

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

interface Category {
  id: number;
  name: string;
}

interface Account {
  id: number;
  name: string;
}

interface TransactionWithDetails {
  id: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: Category;
  account: Account;
}

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const { data: reportData, isLoading, error } = useSelector(
    (state: RootState) => state.reports
  );

  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(
    format(startOfMonth(subMonths(new Date(), 1)), DATE_FORMAT)
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), DATE_FORMAT)
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState<string>('');
  const [timeRange, setTimeRange] = useState('1M');

  const defaultCurrency = accounts?.[0]?.currency || 'USD';

  useEffect(() => {
    if (!reportData) {
      handleGenerateReport();
    }
  }, []); // Initial load

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (range: string) => {
    const now = new Date();
    let start;
    switch (range) {
      case '1M':
        start = startOfMonth(now);
        break;
      case '3M':
        start = subMonths(startOfMonth(now), 2);
        break;
      case '6M':
        start = subMonths(startOfMonth(now), 5);
        break;
      case '1Y':
        start = subMonths(startOfMonth(now), 11);
        break;
      default:
        start = startOfMonth(now);
    }
    setTimeRange(range);
    setStartDate(format(start, DATE_FORMAT));
    setEndDate(format(endOfMonth(now), DATE_FORMAT));
  };

  const handleGenerateReport = async () => {
    await dispatch(
      generateReport({
        start_date: startDate,
        end_date: endDate,
        account_ids: selectedAccounts.map(Number),
        category_ids: selectedCategories.map(Number),
        transaction_type: transactionType as 'INCOME' | 'EXPENSE' | undefined,
      })
    );
  };

  useEffect(() => {
    handleGenerateReport();
  }, [startDate, endDate, selectedAccounts, selectedCategories, transactionType]);

  const categoryBreakdownData = {
    labels: reportData?.categoryBreakdown.labels || [],
    datasets: [
      {
        data: reportData?.categoryBreakdown.data || [],
        backgroundColor: (reportData?.categoryBreakdown.labels || []).map((_, index) => 
          Object.values(CHART_COLORS.COLORS)[index % CHART_COLORS.COLORS.length]
        ),
        borderWidth: 1,
      },
    ],
  } as ChartData<'doughnut'>;

  const monthlyTrendsData = {
    labels: reportData?.monthlyTrends.labels || [],
    datasets: [
      {
        label: 'Income',
        data: reportData?.monthlyTrends.income || [],
        backgroundColor: CHART_COLORS.GREEN_ALPHA,
        borderColor: CHART_COLORS.GREEN,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: reportData?.monthlyTrends.expenses || [],
        backgroundColor: CHART_COLORS.RED_ALPHA,
        borderColor: CHART_COLORS.RED,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return formatCurrency(context.parsed.y, defaultCurrency);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            return formatCurrency(Number(value), defaultCurrency);
          },
        },
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = (value / total) * 100;
            return `${context.label}: ${formatCurrency(value, defaultCurrency)} (${percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedCategories(typeof value === 'string' ? [value] : value);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', mt: 4, px: 3 }}>
        <Alert severity="error">
          {typeof error === 'string' ? error : 'Failed to load report data'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Chip
                label="1 Month"
                onClick={() => handleTimeRangeChange('1M')}
                color={timeRange === '1M' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label="3 Months"
                onClick={() => handleTimeRangeChange('3M')}
                color={timeRange === '3M' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label="6 Months"
                onClick={() => handleTimeRangeChange('6M')}
                color={timeRange === '6M' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label="1 Year"
                onClick={() => handleTimeRangeChange('1Y')}
                color={timeRange === '1Y' ? 'primary' : 'default'}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateReport}
              disabled={isLoading}
              sx={{ height: '36.5px' }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Generate Report'
              )}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Accounts"
              select
              fullWidth
              SelectProps={{
                multiple: true,
                value: selectedAccounts,
                onChange: (e) => {
                  const value = e.target.value as string[];
                  setSelectedAccounts(value);
                },
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={
                          accounts.find((a) => a.id.toString() === value)?.name
                        }
                        size="small"
                      />
                    ))}
                  </Box>
                ),
              }}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id.toString()}>
                  {account.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Transaction Type"
              select
              fullWidth
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {TRANSACTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Categories"
              select
              fullWidth
              SelectProps={{
                multiple: true,
                value: selectedCategories,
                onChange: (event: SelectChangeEvent<unknown>) => {
                  handleCategoryChange(event as SelectChangeEvent<string[]>);
                },
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={categories.find((c) => c.id.toString() === value)?.name}
                        size="small"
                      />
                    ))}
                  </Box>
                ),
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="report tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Income vs Expenses" {...a11yProps(1)} />
          <Tab label="Category Breakdown" {...a11yProps(2)} />
          <Tab label="Transactions" {...a11yProps(3)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Income</TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            reportData?.summary.totalIncome || 0,
                            defaultCurrency as SupportedCurrency
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Expenses</TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            reportData?.summary.totalExpenses || 0,
                            defaultCurrency as SupportedCurrency
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Net Savings</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              (reportData?.summary.netSavings || 0) >= 0
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {formatCurrency(
                            reportData?.summary.netSavings || 0,
                            defaultCurrency as SupportedCurrency
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Savings Rate</TableCell>
                        <TableCell align="right">
                          {formatPercentage(reportData?.summary.savingsRate || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Trends
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={monthlyTrendsData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Income vs Expenses Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line data={monthlyTrendsData} options={chartOptions} />
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expense Categories
            </Typography>
            <Box sx={{ height: 400 }}>
              <Doughnut
                data={categoryBreakdownData}
                options={doughnutOptions}
              />
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transaction List
            </Typography>
            {reportData?.transactions && reportData.transactions.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Account</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(reportData.transactions as unknown as TransactionWithDetails[])
                      .filter((t) => {
                        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(t.category.id.toString());
                        const accountMatch = selectedAccounts.length === 0 || selectedAccounts.includes(t.account.id.toString());
                        const typeMatch = !transactionType || t.type === transactionType;
                        const dateMatch = isWithinInterval(parseISO(t.date), {
                          start: parseISO(startDate),
                          end: parseISO(endDate),
                        });
                        return categoryMatch && accountMatch && typeMatch && dateMatch;
                      })
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(
                              new Date(transaction.date),
                              DISPLAY_DATE_FORMAT
                            )}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.category.name}</TableCell>
                          <TableCell>{transaction.account.name}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                transaction.type === 'INCOME'
                                  ? 'success.main'
                                  : 'error.main',
                            }}
                          >
                            {formatCurrency(
                              transaction.amount,
                              defaultCurrency as SupportedCurrency
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No transactions found for the selected period
              </Typography>
            )}
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;
