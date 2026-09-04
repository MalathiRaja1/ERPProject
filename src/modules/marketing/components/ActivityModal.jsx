import { useEffect, useState } from 'react';
import apiClient from '../../../api/client';
import { useToast, extractErrorMessage } from '../../../components/ToastProvider';

export default function ActivityModal({ lead, onClose }) {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ activityType: 'Call', description: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get(`/leads/${lead.id}/activities`);
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/leads/${lead.id}/activities`, form);
      toast.success('Activity logged.');
      setForm({ activityType: 'Call', description: '' });
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to log activity'));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: 480 }}>
        <h2>Activity — {lead.name}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })}>
            <option>Call</option><option>Email</option><option>Meeting</option><option>Note</option>
          </select>
          <input
            style={{ flex: 1 }}
            placeholder="What happened?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button type="submit">Log</button>
        </form>

        {loading && <p>Loading...</p>}

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {activities.map((a) => (
            <div key={a.id} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
              <strong>{a.activityType}</strong> — {new Date(a.activityDate).toLocaleString()}
              <p style={{ margin: '4px 0 0' }}>{a.description}</p>
            </div>
          ))}
          {activities.length === 0 && !loading && <p style={{ color: 'var(--text-muted)' }}>No activity logged yet.</p>}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
