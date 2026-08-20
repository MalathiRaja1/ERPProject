import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

function Card({ label, value, tone }) {
  const colors = { good: '#1f9254', warn: '#d68910', bad: '#c0392b', neutral: '#1f2430' };
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 20, minWidth: 200, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: colors[tone] || colors.neutral }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '20px 0' }}>
        <Card label="Low Stock Products" value={data.lowStockProductCount} tone={data.lowStockProductCount > 0 ? 'warn' : 'good'} />
        <Card label="Pending Leave Requests" value={data.pendingLeaveRequestCount} tone={data.pendingLeaveRequestCount > 0 ? 'warn' : 'good'} />
        <Card label="Open Quotations" value={data.openQuotationCount} tone="neutral" />
        <Card label="Outstanding Invoices" value={`₹${data.outstandingInvoiceTotal.toFixed(2)}`} tone={data.outstandingInvoiceTotal > 0 ? 'warn' : 'good'} />
        <Card label="Overdue Invoices" value={data.overdueInvoiceCount} tone={data.overdueInvoiceCount > 0 ? 'bad' : 'good'} />
        <Card label="Present Today" value={`${data.presentTodayCount} / ${data.totalActiveEmployeeCount}`} tone="neutral" />
        <Card label="Cash + Bank Balance" value={`₹${data.cashAndBankBalance.toFixed(2)}`} tone={data.cashAndBankBalance >= 0 ? 'good' : 'bad'} />
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
