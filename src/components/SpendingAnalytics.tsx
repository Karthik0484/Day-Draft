
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, TrendingUp, Calendar, ShoppingCart, List, Filter } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SpendingAnalytics = () => {
  const { user } = useAuth();
  const [showAllSpending, setShowAllSpending] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch spending data
  const { data: spendingData = [] } = useQuery({
    queryKey: ['spending-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spending_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('spend_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Calculate totals
  const todayTotal = spendingData
    .filter(entry => entry.spend_date === today)
    .reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);

  const weekTotal = spendingData
    .filter(entry => entry.spend_date >= oneWeekAgo)
    .reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);

  const monthTotal = spendingData
    .filter(entry => entry.spend_date >= oneMonthAgo)
    .reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);

  // Prepare data for last 7 days chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySpending = last7Days.map(date => {
    const dayTotal = spendingData
      .filter(entry => entry.spend_date === date)
      .reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayTotal
    };
  });

  // Prepare data for category pie chart
  const categoryTotals = spendingData.reduce((acc, entry) => {
    const category = entry.category;
    acc[category] = (acc[category] || 0) + parseFloat(entry.amount.toString());
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Filter spending data based on category
  const filteredSpendingData = filterCategory === 'all' 
    ? spendingData 
    : spendingData.filter(entry => entry.category === filterCategory);

  // Get unique categories for filter
  const categories = Array.from(new Set(spendingData.map(entry => entry.category)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">₹{todayTotal.toFixed(2)}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">₹{weekTotal.toFixed(2)}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{monthTotal.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Spending (Last 7 Days)</h3>
          {dailySpending.some(day => day.amount > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No spending data for the last 7 days
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No spending data available
            </div>
          )}
        </div>
      </div>

      {/* All Spending Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <List className="w-5 h-5" />
            All Spending Records
          </h3>
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAllSpending(!showAllSpending)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {showAllSpending ? 'Show Recent Only' : 'Show All Records'}
            </button>
          </div>
        </div>

        {spendingData.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No spending entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(showAllSpending ? filteredSpendingData : filteredSpendingData.slice(0, 10)).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {new Date(entry.spend_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ₹{parseFloat(entry.amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {entry.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.description || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!showAllSpending && filteredSpendingData.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 of {filteredSpendingData.length} records
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingAnalytics;
