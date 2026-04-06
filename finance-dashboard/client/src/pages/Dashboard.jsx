import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

export default function Dashboard() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        // Make sure to add await here
        const res = await axios.get('http://localhost:5000/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  if (loading) return <div style={{ padding: 40 }}>Loading dashboard analytics...</div>;
  if (!data) return <div style={{ padding: 40, color: 'var(--danger)' }}>Access denied. You might need to refresh or contact an Admin.</div>;

  const { totalIncome, totalExpense, netBalance, recentRecords, categoryExpenses, trends } = data;

  // Process trends (by default month)
  const trendMap = {};
  if (trends) {
    trends.forEach(mt => {
      const label = mt._id.month ? `${mt._id.year}-${String(mt._id.month).padStart(2, '0')}` : `${mt._id.year}`;
      if (!trendMap[label]) trendMap[label] = { Income: 0, Expense: 0 };
      trendMap[label][mt._id.type] = mt.total;
    });
  }

  // Color palette for Categories
  const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB', 
    '#F1C40F', '#E67E22'
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Dashboard Overview</h1>
      <p>Welcome back! Here's a live summary from the database.</p>
      
      <div className="dashboard-grid">
        <div className="glass-panel metric-card">
          <div className="metric-label">Total Income</div>
          <div className="metric-value text-success">${totalIncome?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </div>
        <div className="glass-panel metric-card">
          <div className="metric-label">Total Expense</div>
          <div className="metric-value text-danger">${totalExpense?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </div>
        <div className="glass-panel metric-card">
          <div className="metric-label">Net Balance</div>
          <div className="metric-value">${netBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        {/* Category Expenses */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Category Wise Expenses</h3>
          {categoryExpenses?.length > 0 ? categoryExpenses.map((c, i) => {
            const color = categoryColors[i % categoryColors.length];
            const percentage = totalExpense > 0 ? ((c.total / totalExpense) * 100).toFixed(1) : 0;
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div className="flex-between" style={{ fontSize: '14px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                    <span style={{ fontWeight: 500 }}>{c._id || 'Uncategorized'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>${c.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '6px', display: 'inline-block', width: '45px', textAlign: 'right' }}>{percentage}%</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: color, 
                    width: `${percentage}%`,
                    borderTopRightRadius: '4px',
                    borderBottomRightRadius: '4px',
                    transition: 'width 1s ease-in-out'
                  }} />
                </div>
              </div>
            );
          }) : (
            <div style={{ opacity: 0.5, fontSize: '14px' }}>No expenses recorded yet.</div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Monthly Trends</h3>
          {Object.keys(trendMap).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(trendMap).map(month => (
                <div key={month} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{month}</div>
                  <div className="flex-between" style={{ fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)'}}/> ${trendMap[month].Income.toLocaleString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)'}}/> ${trendMap[month].Expense.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.5, fontSize: '14px' }}>No monthly data available.</div>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: '40px', marginBottom: '16px' }}>Recent Activity</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(recentRecords || []).map(r => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.notes || r.category}</td>
                <td>
                  <span className={`badge ${r.type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                    {r.type}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {recentRecords?.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5, padding: '24px' }}>No recent activity. Try adding some records!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
