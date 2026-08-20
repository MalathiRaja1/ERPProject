import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'Asset' });
  const [error, setError] = useState(null);
  const [seedMessage, setSeedMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/accounts');
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    setSeedMessage(null);
    const { data } = await apiClient.post('/accounts/seed-standard');
    setSeedMessage(data.message);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post('/accounts', form);
      setForm({ code: '', name: '', type: 'Asset' });
      load();
    } catch (err) {
      setError(err.response?.data || 'Failed to create account');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Chart of Accounts</h1>
        <button onClick={handleSeed}>Set Up Standard Accounts</button>
      </div>
      <p style={{ color: '#666' }}>
        The system posts automatically to codes 1000 (Cash), 1010 (Bank), 1100 (Accounts Receivable) and
        4000 (Sales Revenue) whenever an invoice or payment is recorded. Click "Set Up Standard Accounts" once to create them.
      </p>
      {seedMessage && <p style={{ color: '#1f9254' }}>{seedMessage}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', margin: '16px 0' }}>
        <div>
          <label>Code</label><br />
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required style={{ width: 80 }} />
        </div>
        <div>
          <label>Name</label><br />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label>Type</label><br />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit">+ Add Account</button>
      </form>
      {error && <p className="error-text">{typeof error === 'string' ? error : JSON.stringify(error)}</p>}

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Balance</th></tr></thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}>
              <td>{a.code}</td><td>{a.name}</td><td>{a.type}</td>
              <td>₹{a.balance.toFixed(2)}</td>
            </tr>
          ))}
          {accounts.length === 0 && !loading && (
            <tr><td colSpan={4}>No accounts yet — click "Set Up Standard Accounts" to get started.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
