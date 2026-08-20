import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const TABS = {
  categories: { endpoint: '/categories', fields: ['name', 'description'], labels: ['Name', 'Description'] },
  suppliers: { endpoint: '/suppliers', fields: ['name', 'contactEmail', 'phone', 'address'], labels: ['Name', 'Email', 'Phone', 'Address'] },
  warehouses: { endpoint: '/warehouses', fields: ['name', 'location'], labels: ['Name', 'Location'] },
  departments: { endpoint: '/departments', fields: ['name', 'managerUserId'], labels: ['Name', 'Manager User ID (optional)'] }
};

export default function SettingsPage() {
  const [tab, setTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const config = TABS[tab];

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get(config.endpoint);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    setForm({});
    setEditingId(null);
    setError(null);
    load();
  }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await apiClient.put(`${config.endpoint}/${editingId}`, form);
      } else {
        await apiClient.post(config.endpoint, form);
      }
      setForm({});
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data || 'Save failed');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(config.fields.map((f) => [f, item[f] ?? ''])));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    setError(null);
    try {
      await apiClient.delete(`${config.endpoint}/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data || 'Delete failed — it may still be in use elsewhere.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings — Reference Data</h1>
      </div>

      <div className="toolbar">
        {Object.keys(TABS).map((t) => (
          <button key={t} onClick={() => setTab(t)} disabled={tab === t} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', margin: '16px 0', flexWrap: 'wrap' }}>
        {config.fields.map((field, i) => (
          <div key={field}>
            <label>{config.labels[i]}</label><br />
            <input
              value={form[field] ?? ''}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required={i === 0}
            />
          </div>
        ))}
        <button type="submit">{editingId ? 'Update' : '+ Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({}); }}>Cancel Edit</button>}
      </form>
      {error && <p className="error-text">{typeof error === 'string' ? error : JSON.stringify(error)}</p>}

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            {config.labels.map((l) => <th key={l}>{l}</th>)}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {config.fields.map((f) => <td key={f}>{item[f]}</td>)}
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>{' '}
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && !loading && (
            <tr><td colSpan={config.labels.length + 1}>No {tab} yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
