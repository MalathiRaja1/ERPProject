import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

const STATUS_COLORS = { Planning: '#8a8f98', Active: '#2d6cdf', OnHold: '#d68910', Completed: '#1f9254', Cancelled: '#c0392b' };

export default function ProjectListPage() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', description: '', customerId: '', managerEmployeeId: '',
    startDate: new Date().toISOString().slice(0, 10), endDate: '', budget: ''
  });

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/projects');
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    apiClient.get('/customers').then((res) => setCustomers(res.data));
    apiClient.get('/employees').then((res) => setEmployees(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/projects', {
        ...form,
        customerId: form.customerId ? Number(form.customerId) : null,
        managerEmployeeId: form.managerEmployeeId ? Number(form.managerEmployeeId) : null,
        endDate: form.endDate || null,
        budget: Number(form.budget)
      });
      toast.success('Project created.');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create project'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        <button onClick={() => setShowForm(true)}>+ New Project</button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th><th>Name</th><th>Customer</th><th>Manager</th>
            <th>Budget</th><th>Revenue</th><th>Tasks</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td>{p.customerName || '—'}</td>
              <td>{p.managerName || '—'}</td>
              <td>₹{p.budget.toFixed(2)}</td>
              <td>₹{p.invoicedRevenue.toFixed(2)}</td>
              <td>{p.completedTaskCount} / {p.taskCount}</td>
              <td><span style={{ color: STATUS_COLORS[p.status] }}>{p.status}</span></td>
              <td><Link to={`/projects/${p.id}`}><button>Open</button></Link></td>
            </tr>
          ))}
          {projects.length === 0 && !loading && <tr><td colSpan={9}>No projects yet.</td></tr>}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleSubmit}>
            <h2>New Project</h2>
            <label>Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label>Customer (optional)</label>
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label>Project Manager (optional)</label>
            <select value={form.managerEmployeeId} onChange={(e) => setForm({ ...form, managerEmployeeId: e.target.value })}>
              <option value="">None</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
            </select>
            <label>Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <label>End Date (optional)</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <label>Budget</label>
            <input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required />
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
