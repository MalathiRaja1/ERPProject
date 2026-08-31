import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/client';
// If you already added AlertButtons from the email-alerts build, restore this import
// and the <AlertButtons /> line right after <h1>Dashboard</h1> below.
// import { AlertButtons } from './AlertButtons';

function Card({ label, value, tone }) {
  const colors = { good: '#1f9254', warn: '#d68910', bad: '#c0392b', neutral: 'var(--text)' };
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 20, minWidth: 200, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: colors[tone] || colors.neutral }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 20, boxShadow: 'var(--shadow)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ width: '100%', height: 260 }}>{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [inventoryValuation, setInventoryValuation] = useState([]);

  useEffect(() => {
    apiClient.get('/dashboard').then((res) => setData(res.data));
    apiClient.get('/reports/sales-trend', { params: { months: 6 } }).then((res) => setSalesTrend(res.data));
    apiClient.get('/reports/inventory-valuation').then((res) => setInventoryValuation(res.data.slice(0, 8)));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      {/* <AlertButtons /> — restore this line if you added the email-alerts feature */}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '20px 0' }}>
        <Card label="Low Stock Products" value={data.lowStockProductCount} tone={data.lowStockProductCount > 0 ? 'warn' : 'good'} />
        <Card label="Pending Leave Requests" value={data.pendingLeaveRequestCount} tone={data.pendingLeaveRequestCount > 0 ? 'warn' : 'good'} />
        <Card label="Open Quotations" value={data.openQuotationCount} tone="neutral" />
        <Card label="Outstanding Invoices" value={`₹${data.outstandingInvoiceTotal.toFixed(2)}`} tone={data.outstandingInvoiceTotal > 0 ? 'warn' : 'good'} />
        <Card label="Overdue Invoices" value={data.overdueInvoiceCount} tone={data.overdueInvoiceCount > 0 ? 'bad' : 'good'} />
        <Card label="Present Today" value={`${data.presentTodayCount} / ${data.totalActiveEmployeeCount}`} tone="neutral" />
        <Card label="Cash + Bank Balance" value={`₹${data.cashAndBankBalance.toFixed(2)}`} tone={data.cashAndBankBalance >= 0 ? 'good' : 'bad'} />
      </div>

      <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="Sales Trend (last 6 months)">
          {salesTrend.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No invoiced sales yet.</p> : (
            <ResponsiveContainer>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Inventory Value by Product">
          {inventoryValuation.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No products yet.</p> : (
            <ResponsiveContainer>
              <BarChart data={inventoryValuation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sku" />
                <YAxis />
                <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                <Bar dataKey="totalValue" fill="#1f9254" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {data.lowStockItems.length > 0 && (
        <>
          <h2>Low Stock Alert</h2>
          <table className="data-table">
            <thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Reorder Level</th></tr></thead>
            <tbody>
              {data.lowStockItems.map((item) => (
                <tr key={item.sku} className="row-low-stock">
                  <td>{item.sku}</td><td>{item.productName}</td><td>{item.totalStock}</td><td>{item.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
