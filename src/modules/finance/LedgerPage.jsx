import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function LedgerPage() {
  const [view, setView] = useState('journal');
  const [entries, setEntries] = useState([]);
  const [trialBalance, setTrialBalance] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadJournal = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/ledger/entries');
    setEntries(data);
    setLoading(false);
  };

  const loadTrialBalance = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/ledger/trial-balance');
    setTrialBalance(data);
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'journal') loadJournal(); else loadTrialBalance();
  }, [view]);

  const totalDebit = trialBalance.reduce((sum, r) => sum + r.totalDebit, 0);
  const totalCredit = trialBalance.reduce((sum, r) => sum + r.totalCredit, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Ledger</h1>
        <div>
          <button onClick={() => setView('journal')} disabled={view === 'journal'}>Journal</button>{' '}
          <button onClick={() => setView('trial-balance')} disabled={view === 'trial-balance'}>Trial Balance</button>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {view === 'journal' && (
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Account</th><th>Description</th><th>Debit</th><th>Credit</th><th>Reference</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.date).toLocaleString()}</td>
                <td>{e.accountCode} — {e.accountName}</td>
                <td>{e.description}</td>
                <td>{e.debit > 0 ? `₹${e.debit.toFixed(2)}` : ''}</td>
                <td>{e.credit > 0 ? `₹${e.credit.toFixed(2)}` : ''}</td>
                <td>{e.referenceType} #{e.referenceId}</td>
              </tr>
            ))}
            {entries.length === 0 && !loading && (
              <tr><td colSpan={6}>No journal entries yet — these post automatically from invoices and payments.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {view === 'trial-balance' && (
        <>
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Account</th><th>Type</th><th>Total Debit</th><th>Total Credit</th><th>Balance</th></tr>
            </thead>
            <tbody>
              {trialBalance.map((r) => (
                <tr key={r.accountCode}>
                  <td>{r.accountCode}</td><td>{r.accountName}</td><td>{r.type}</td>
                  <td>₹{r.totalDebit.toFixed(2)}</td>
                  <td>₹{r.totalCredit.toFixed(2)}</td>
                  <td>₹{r.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 12 }}>
            <strong>Totals — Debit: ₹{totalDebit.toFixed(2)} | Credit: ₹{totalCredit.toFixed(2)}</strong>{' '}
            {Math.abs(totalDebit - totalCredit) < 0.01 ? '✅ Balanced' : '⚠️ Out of balance'}
          </p>
        </>
      )}
    </div>
  );
}
