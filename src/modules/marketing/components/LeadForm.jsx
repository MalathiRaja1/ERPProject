import { useEffect, useState } from 'react';
import apiClient from '../../../api/client';
import { useToast, extractErrorMessage } from '../../../components/ToastProvider';

export default function LeadForm({ onClose, onSaved }) {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: '', companyName: '', email: '', phone: '', source: 'Website',
    estimatedValue: '', notes: '', campaignId: '', assignedToEmployeeId: ''
  });

  useEffect(() => {
    apiClient.get('/campaigns').then((res) => setCampaigns(res.data));
    apiClient.get('/employees').then((res) => setEmployees(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/leads', {
        ...form,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        campaignId: form.campaignId ? Number(form.campaignId) : null,
        assignedToEmployeeId: form.assignedToEmployeeId ? Number(form.assignedToEmployeeId) : null
      });
      toast.success('Lead created.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create lead'));
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>New Lead</h2>
        <label>Contact Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label>Company Name</label>
        <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <label>Source</label>
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
          <option>Website</option><option>Referral</option><option value="ColdCall">Cold Call</option>
          <option value="SocialMedia">Social Media</option><option>Advertisement</option>
          <option>Campaign</option><option>Other</option>
        </select>
        <label>Campaign (optional)</label>
        <select value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
          <option value="">None</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label>Assign To (optional)</label>
        <select value={form.assignedToEmployeeId} onChange={(e) => setForm({ ...form, assignedToEmployeeId: e.target.value })}>
          <option value="">Unassigned</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
        </select>
        <label>Estimated Value</label>
        <input type="number" step="0.01" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
        <label>Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Create Lead</button>
        </div>
      </form>
    </div>
  );
}
