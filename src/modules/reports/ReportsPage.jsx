import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

function fmt(n) {
  const abs = Math.abs(n).toFixed(2);
  return n < 0 ? `(₹${abs})` : `₹${abs}`;
}

export default function ReportsPage() {
  const [tab, setTab] = useState('pl');
  const [pl, setPl] = useState(null);
  const [bs, setBs] = useState(null);
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));

  const loadPL = async () => {
    const { data } = await apiClient.get('/reports/profit-loss', { params: { from: fromDate, to: toDate } });
    setPl(data);
  };

  const loadBS = async () => {
    const { data } = await apiClient.get('/reports/balance-sheet');
    setBs(data);
  };

  useEffect(() => {
    if (tab === 'pl') loadPL(); else loadBS();
  }, [tab]);

  return (
    <div>
      <div className="page-header">
        <h1>Financial Reports</h1>
        <div>
          <button onClick={() => setTab('pl')} disabled={tab === 'pl'}>Profit &amp; Loss</button>{' '}
          <button onClick={() => setTab('bs')} disabled={tab === 'bs'}>Balance Sheet</button>
        </div>
      </div>

      {tab === 'pl' && (
        <>
          <div className="toolbar">
            <label>From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <label>To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <button onClick={loadPL}>Refresh</button>
          </div>

          {pl && (
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 600 }}>
              <h2 style={{ marginTop: 0 }}>Profit &amp; Loss Statement</h2>
              <p style={{ color: '#666' }}>{new Date(pl.fromDate).toLocaleDateString()} – {new Date(pl.toDate).toLocaleDateString()}</p>

              <h3>Revenue</h3>
              <table className="data-table">
                <tbody>
                  {pl.revenue.map((l) => (
                    <tr key={l.accountCode}><td>{l.accountCode} — {l.accountName}</td><td style={{ textAlign: 'right' }}>{fmt(l.amount)}</td></tr>
                  ))}
                  <tr style={{ fontWeight: 'bold' }}><td>Total Revenue</td><td style={{ textAlign: 'right' }}>{fmt(pl.totalRevenue)}</td></tr>
                </tbody>
              </table>

              <h3>Expenses</h3>
              <table className="data-table">
                <tbody>
                  {pl.expenses.map((l) => (
                    <tr key={l.accountCode}><td>{l.accountCode} — {l.accountName}</td><td style={{ textAlign: 'right' }}>{fmt(l.amount)}</td></tr>
                  ))}
                  <tr style={{ fontWeight: 'bold' }}><td>Total Expenses</td><td style={{ textAlign: 'right' }}>{fmt(pl.totalExpenses)}</td></tr>
                </tbody>
              </table>

              <h3 style={{ color: pl.netProfit >= 0 ? '#1f9254' : '#c0392b' }}>
                Net Profit: {fmt(pl.netProfit)}
              </h3>
            </div>
          )}
        </>
      )}

      {tab === 'bs' && bs && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 600 }}>
          <h2 style={{ marginTop: 0 }}>Balance Sheet</h2>
          <p style={{ color: '#666' }}>As of {new Date(bs.asOfDate).toLocaleDateString()}</p>

          <h3>Assets</h3>
          <table className="data-table">
            <tbody>
              {bs.assets.map((l) => (
                <tr key={l.accountCode}><td>{l.accountCode} — {l.accountName}</td><td style={{ textAlign: 'right' }}>{fmt(l.balance)}</td></tr>
              ))}
              <tr style={{ fontWeight: 'bold' }}><td>Total Assets</td><td style={{ textAlign: 'right' }}>{fmt(bs.totalAssets)}</td></tr>
            </tbody>
          </table>

          <h3>Liabilities</h3>
          <table className="data-table">
            <tbody>
              {bs.liabilities.map((l) => (
                <tr key={l.accountCode}><td>{l.accountCode} — {l.accountName}</td><td style={{ textAlign: 'right' }}>{fmt(l.balance)}</td></tr>
              ))}
              <tr style={{ fontWeight: 'bold' }}><td>Total Liabilities</td><td style={{ textAlign: 'right' }}>{fmt(bs.totalLiabilities)}</td></tr>
            </tbody>
          </table>

          <h3>Equity</h3>
          <table className="data-table">
            <tbody>
              {bs.equity.map((l) => (
                <tr key={l.accountCode}><td>{l.accountCode} — {l.accountName}</td><td style={{ textAlign: 'right' }}>{fmt(l.balance)}</td></tr>
              ))}
              <tr><td>Retained Earnings (undistributed profit)</td><td style={{ textAlign: 'right' }}>{fmt(bs.retainedEarnings)}</td></tr>
              <tr style={{ fontWeight: 'bold' }}><td>Total Equity</td><td style={{ textAlign: 'right' }}>{fmt(bs.totalEquity + bs.retainedEarnings)}</td></tr>
            </tbody>
          </table>

          <p style={{ marginTop: 16, fontWeight: 'bold', color: bs.isBalanced ? '#1f9254' : '#c0392b' }}>
            {bs.isBalanced ? '✅ Balanced' : '⚠️ Out of balance — check ledger entries'}
          </p>
        </div>
      )}
    </div>
  );
}
