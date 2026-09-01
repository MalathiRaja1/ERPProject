import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

const TABS = {
  categories: { endpoint: '/categories', fields: ['name', 'description'], labels: ['Name', 'Description'] },
  suppliers: { endpoint: '/suppliers', fields: ['name', 'contactEmail', 'phone', 'address'], labels: ['Name', 'Email', 'Phone', 'Address'] },
  warehouses: { endpoint: '/warehouses', fields: ['name', 'location'], labels: ['Name', 'Location'] },
  departments: { endpoint: '/departments', fields: ['name', 'managerUserId'], labels: ['Name', 'Manager User ID (optional)'] },
  customers: {
    endpoint: '/customers',
    fields: ['name', 'email', 'phone', 'address', 'gstin', 'state', 'creditLimit'],
    labels: ['Name', 'Email', 'Phone', 'Address', 'GSTIN', 'State', 'Credit Limit']
  }
};

function ReferenceDataTab({ tab }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
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
    load();
  }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if ('creditLimit' in payload) payload.creditLimit = Number(payload.creditLimit || 0);

      if (editingId) await apiClient.put(`${config.endpoint}/${editingId}`, payload);
      else await apiClient.post(config.endpoint, payload);

      toast.success(editingId ? 'Updated.' : 'Added.');
      setForm({});
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Save failed'));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(config.fields.map((f) => [f, item[f] ?? ''])));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await apiClient.delete(`${config.endpoint}/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Delete failed — it may still be in use elsewhere.'));
    }
  };

  return (
    <>
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
              {config.fields.map((f) => <td key={f}>{f === 'creditLimit' ? `₹${(item[f] ?? 0).toFixed(2)}` : item[f]}</td>)}
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
    </>
  );
}

function CompanyTab() {
  const toast = useToast();
  const [form, setForm] = useState({ companyName: '', gstin: '', address: '', state: '', defaultTermsAndConditions: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/companysettings').then((res) => {
      setForm(res.data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('/companysettings', form);
      toast.success('Company settings saved.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save'));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      <p style={{ color: 'var(--text-muted)' }}>
        Your business's own GST details. The State here determines whether invoices to a customer
        get CGST+SGST (same state) or IGST (different state).
      </p>
      <label>Company Name</label>
      <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
      <label>GSTIN</label>
      <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="e.g. 27ABCDE1234F1Z5" required />
      <label>Address</label>
      <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
      <label>State</label>
      <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Tamil Nadu" required />
      <label>Default Terms &amp; Conditions (applied to new invoices/quotations unless overridden)</label>
      <textarea value={form.defaultTermsAndConditions || ''} onChange={(e) => setForm({ ...form, defaultTermsAndConditions: e.target.value })} rows={4} />
      <button type="submit" style={{ alignSelf: 'flex-start' }}>Save Company Settings</button>
    </form>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('company');

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="toolbar">
        <button onClick={() => setTab('company')} disabled={tab === 'company'}>Company (GST)</button>
        {Object.keys(TABS).map((t) => (
          <button key={t} onClick={() => setTab(t)} disabled={tab === t} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'company' ? <CompanyTab /> : <ReferenceDataTab tab={tab} />}
    </div>
  );
}
