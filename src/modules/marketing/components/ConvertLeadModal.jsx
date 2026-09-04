import { useState } from 'react';
import apiClient from '../../../api/client';
import { useToast, extractErrorMessage } from '../../../components/ToastProvider';

export default function ConvertLeadModal({ lead, onClose, onConverted }) {
  const toast = useToast();
  const [form, setForm] = useState({ gstin: '', state: '', address: '', creditLimit: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post(`/leads/${lead.id}/convert`, {
        ...form, creditLimit: Number(form.creditLimit)
      });
      toast.success(`Lead converted — customer "${data.name}" created.`);
      onConverted();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to convert lead'));
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>Mark Won — Convert to Customer</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          This creates a real Customer record from "{lead.companyName || lead.name}" so you can
          immediately raise a Quotation for them.
        </p>
        <label>GSTIN (optional)</label>
        <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
        <label>State</label>
        <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Tamil Nadu" />
        <label>Address</label>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <label>Credit Limit</label>
        <input type="number" step="0.01" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} />

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Convert to Customer</button>
        </div>
      </form>
    </div>
  );
}
