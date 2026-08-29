import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

export default function PayrollPage() {
  const toast = useToast();
  const [runs, setRuns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', periodStart: '', periodEnd: '', additionalDeductions: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/payroll');
    setRuns(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    apiClient.get('/employees').then((res) => setEmployees(res.data));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/payroll/generate', {
        ...form,
        employeeId: Number(form.employeeId),
        additionalDeductions: Number(form.additionalDeductions)
      });
      toast.success('Payroll run generated.');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to generate payroll run'));
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await apiClient.post(`/payroll/${id}/mark-paid`);
      if (res.data.warning) toast.warning(res.data.warning);
      else toast.success('Payroll marked as paid.');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to mark payroll as paid'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Payroll</h1>
        <button onClick={() => setShowForm(true)}>+ Generate Payroll Run</button>
      </div>
      <p style={{ color: '#666' }}>
        Deductions are calculated automatically from Absent days recorded in Attendance for the period, plus any manual amount you add.
      </p>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th><th>Employee</th><th>Period</th><th>Gross</th>
            <th>Deductions</th><th>Net Pay</th><th>Paid On</th><th></th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td>{r.employeeCode}</td>
              <td>{r.employeeName}</td>
              <td>{new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}</td>
              <td>₹{r.grossPay.toFixed(2)}</td>
              <td>₹{r.deductions.toFixed(2)}</td>
              <td>₹{r.netPay.toFixed(2)}</td>
              <td>{r.paidOn ? new Date(r.paidOn).toLocaleDateString() : '—'}</td>
              <td>{!r.paidOn && <button onClick={() => handleMarkPaid(r.id)}>Mark Paid</button>}</td>
            </tr>
          ))}
          {runs.length === 0 && !loading && <tr><td colSpan={8}>No payroll runs yet.</td></tr>}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleGenerate}>
            <h2>Generate Payroll Run</h2>
            <label>Employee</label>
            <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
            </select>
            <label>Period Start</label>
            <input type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} required />
            <label>Period End</label>
            <input type="date" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} required />
            <label>Additional Manual Deductions (optional)</label>
            <input type="number" step="0.01" value={form.additionalDeductions}
              onChange={(e) => setForm({ ...form, additionalDeductions: e.target.value })} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit">Generate</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
