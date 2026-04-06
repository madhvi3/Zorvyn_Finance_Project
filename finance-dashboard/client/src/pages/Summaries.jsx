import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

export default function Summaries() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        // Use the same dashboard summary endpoint for advanced insights
        const res = await axios.get(`http://localhost:5000/api/dashboard/summary?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch summaries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken, period]);

  if (!data && loading) return <div style={{ padding: 40 }}>Loading insights...</div>;
  if (!data && !loading) return <div style={{ padding: 40, color: 'var(--danger)' }}>Access denied or error loading.</div>;

  const { categoryExpenses, trends } = data;

  // Process dynamic trends
  const trendMap = {};
  if (trends) {
    trends.forEach(mt => {
      let label = "";
      if (period === 'day') label = `${mt._id.year}-${String(mt._id.month).padStart(2, '0')}-${String(mt._id.day).padStart(2, '0')}`;
      else if (period === 'week') label = `${mt._id.year}-W${String(mt._id.week).padStart(2, '0')}`;
      else if (period === 'month') label = `${mt._id.year}-${String(mt._id.month).padStart(2, '0')}`;
      else if (period === 'year') label = `${mt._id.year}`;

      if (!trendMap[label]) trendMap[label] = { Income: 0, Expense: 0 };
      trendMap[label][mt._id.type] = mt.total;
    });
  }

  const barData = Object.keys(trendMap).map(label => ({
    name: label,
    Income: trendMap[label].Income,
    Expense: trendMap[label].Expense
  }));

  // Color palette for Categories
  const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB', 
    '#F1C40F', '#E67E22'
  ];

  const pieData = categoryExpenses?.map((c, i) => ({
    name: c._id || 'Uncategorized',
    value: c.total,
    color: categoryColors[i % categoryColors.length]
  })) || [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ marginBottom: '8px' }}>Deep Insights & Summaries</h1>
      <p style={{ marginBottom: '32px' }}>Analyze structured financial data tailored for Analysts.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Category Expenses Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '20px' }}>Comprehensive Category Breakdown</h3>
          {pieData.length > 0 ? (
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.8)' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ opacity: 0.5, fontSize: '14px' }}>No expenses recorded yet.</div>
          )}
        </div>

        {/* Detailed Trends */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Financial Velocity</h3>
            <select 
              className="form-control" 
              style={{ width: '120px', padding: '6px', fontSize: '13px' }} 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          <div style={{ flex: 1, minHeight: '300px' }}>
            {loading ? (
              <div style={{ opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Recalculating...</div>
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                    tickFormatter={(val) => `$${val}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.8)' }}>{value}</span>} />
                  <Bar dataKey="Income" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ opacity: 0.5, fontSize: '14px' }}>No trend data available for this period.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
