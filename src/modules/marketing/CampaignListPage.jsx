import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

const STATUS_COLORS = { Planned: '#8a8f98', Active: '#2d6cdf', Completed: '#1f9254', Cancelled: '#c0392b' };

export default function CampaignListPage() {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', channel: 'Email',
    startDate: new Date().toISOString().slice(0, 10), endDate: '', budget: '', actualSpend: 0
  });

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/campaigns');
    setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/campaigns', {
        ...form,
        endDate: form.endDate || null,
        budget: Number(form.budget),
        actualSpend: Number(form.actualSpend)
      });
      toast.success('Campaign created.');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create campaign'));
    }
  };

  const roi = (c) => {
    if (c.actualSpend <= 0) return null;
    return ((c.wonValue - c.actualSpend) / c.actualSpend) * 100;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Campaigns</h1>
        <button onClick={() => setShowForm(true)}>+ New Campaign</button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th><th>Channel</th><th>Budget</th><th>Spend</th>
            <th>Leads</th><th>Won</th><th>Won Value</th><th>ROI</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const r = roi(c);
            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.channel}</td>
                <td>₹{c.budget.toFixed(2)}</td>
                <td>₹{c.actualSpend.toFixed(2)}</td>
                <td>{c.leadCount}</td>
                <td>{c.wonLeadCount}</td>
                <td>₹{c.wonValue.toFixed(2)}</td>
                <td style={{ color: r === null ? 'var(--text-muted)' : r >= 0 ? '#1f9254' : '#c0392b' }}>
                  {r === null ? '—' : `${r.toFixed(0)}%`}
                </td>
                <td><span style={{ color: STATUS_COLORS[c.status] }}>{c.status}</span></td>
              </tr>
            );
          })}
          {campaigns.length === 0 && !loading && <tr><td colSpan={9}>No campaigns yet.</td></tr>}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleSubmit}>
            <h2>New Campaign</h2>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label>Channel</label>
            <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option>Email</option><option value="SocialMedia">Social Media</option><option value="Ppc">PPC</option>
              <option>Event</option><option value="ColdOutreach">Cold Outreach</option><option>Other</option>
            </select>
            <label>Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <label>End Date (optional)</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <label>Budget</label>
            <input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required />
            <label>Actual Spend So Far</label>
            <input type="number" step="0.01" value={form.actualSpend} onChange={(e) => setForm({ ...form, actualSpend: e.target.value })} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
