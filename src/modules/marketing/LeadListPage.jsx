import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';
import LeadForm from './components/LeadForm';
import ConvertLeadModal from './components/ConvertLeadModal';
import ActivityModal from './components/ActivityModal';

const STATUS_COLORS = {
  New: '#8a8f98', Contacted: '#2d6cdf', Qualified: '#6a4fd6',
  ProposalSent: '#d68910', Won: '#1f9254', Lost: '#c0392b'
};

const NEXT_STATUS = {
  New: 'Contacted', Contacted: 'Qualified', Qualified: 'ProposalSent'
};

export default function LeadListPage() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [convertLead, setConvertLead] = useState(null);
  const [activityLead, setActivityLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/leads', { params: statusFilter ? { status: statusFilter } : {} });
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleAdvance = async (lead) => {
    const next = NEXT_STATUS[lead.status];
    if (!next) return;
    try {
      await apiClient.patch(`/leads/${lead.id}/status`, { status: next });
      toast.success(`Lead moved to ${next}.`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleLost = async (lead) => {
    try {
      await apiClient.patch(`/leads/${lead.id}/status`, { status: 'Lost' });
      toast.success('Lead marked Lost.');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update status'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leads</h1>
        <button onClick={() => setShowForm(true)}>+ New Lead</button>
      </div>

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>New</option><option>Contacted</option><option>Qualified</option>
          <option value="ProposalSent">Proposal Sent</option><option>Won</option><option>Lost</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th><th>Company</th><th>Source</th><th>Campaign</th>
            <th>Assigned To</th><th>Est. Value</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.companyName || '—'}</td>
              <td>{l.source}</td>
              <td>{l.campaignName || '—'}</td>
              <td>{l.assignedToName || '—'}</td>
              <td>{l.estimatedValue ? `₹${l.estimatedValue.toFixed(2)}` : '—'}</td>
              <td><span style={{ color: STATUS_COLORS[l.status] }}>{l.status}</span></td>
              <td>
                <button onClick={() => setActivityLead(l)}>Activity</button>{' '}
                {NEXT_STATUS[l.status] && (
                  <button onClick={() => handleAdvance(l)}>Move to {NEXT_STATUS[l.status]}</button>
                )}{' '}
                {l.status === 'ProposalSent' && !l.convertedCustomerId && (
                  <button onClick={() => setConvertLead(l)}>Mark Won</button>
                )}{' '}
                {!['Won', 'Lost'].includes(l.status) && (
                  <button onClick={() => handleLost(l)}>Mark Lost</button>
                )}
                {l.convertedCustomerId && <em> Converted</em>}
              </td>
            </tr>
          ))}
          {leads.length === 0 && !loading && <tr><td colSpan={8}>No leads yet.</td></tr>}
        </tbody>
      </table>

      {showForm && <LeadForm onClose={() => setShowForm(false)} onSaved={load} />}
      {convertLead && <ConvertLeadModal lead={convertLead} onClose={() => setConvertLead(null)} onConverted={load} />}
      {activityLead && <ActivityModal lead={activityLead} onClose={() => setActivityLead(null)} />}
    </div>
  );
}
