import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const STATUS_COLORS = { Pending: '#d68910', Approved: '#1f9254', Rejected: '#c0392b' };

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', startDate: '', endDate: '', type: 'Annual', reason: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/leaverequests');
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    apiClient.get('/employees').then((res) => setEmployees(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post('/leaverequests', { ...form, employeeId: Number(form.employeeId) });
      setShowForm(false);
      setForm({ employeeId: '', startDate: '', endDate: '', type: 'Annual', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data || 'Failed to submit leave request');
    }
  };

  const handleStatus = async (id, status) => {
    await apiClient.patch(`/leaverequests/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leave Requests</h1>
        <button onClick={() => setShowForm(true)}>+ New Leave Request</button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr><th>Code</th><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.employeeCode}</td>
              <td>{r.employeeName}</td>
              <td>{r.type}</td>
              <td>{new Date(r.startDate).toLocaleDateString()}</td>
              <td>{new Date(r.endDate).toLocaleDateString()}</td>
              <td>{r.reason}</td>
              <td><span style={{ color: STATUS_COLORS[r.status] }}>{r.status}</span></td>
              <td>
                {r.status === 'Pending' && (
                  <>
                    <button onClick={() => handleStatus(r.id, 'Approved')}>Approve</button>{' '}
                    <button onClick={() => handleStatus(r.id, 'Rejected')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && !loading && <tr><td colSpan={8}>No leave requests yet.</td></tr>}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleSubmit}>
            <h2>New Leave Request</h2>
            <label>Employee</label>
            <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
            </select>
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Annual</option><option>Sick</option><option>Unpaid</option><option>Other</option>
            </select>
            <label>Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <label>End Date</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            <label>Reason</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {error && <p className="error-text">{typeof error === 'string' ? error : JSON.stringify(error)}</p>}
            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
