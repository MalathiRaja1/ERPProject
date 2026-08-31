import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const ACTION_COLORS = { Created: '#1f9254', Updated: '#2d6cdf', Deleted: '#c0392b' };

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [entityNames, setEntityNames] = useState([]);
  const [entityName, setEntityName] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (entityName) params.entityName = entityName;
    if (action) params.action = action;
    const { data } = await apiClient.get('/auditlog', { params });
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    apiClient.get('/auditlog/entity-names').then((res) => setEntityNames(res.data));
  }, []);

  useEffect(() => { load(); }, [entityName, action]);

  return (
    <div>
      <div className="page-header">
        <h1>Audit Trail</h1>
      </div>
      <p style={{ color: '#666' }}>Every record created, changed, or deleted across the system — captured automatically.</p>

      <div className="toolbar">
        <select value={entityName} onChange={(e) => setEntityName(e.target.value)}>
          <option value="">All record types</option>
          {entityNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All actions</option>
          <option value="Created">Created</option>
          <option value="Updated">Updated</option>
          <option value="Deleted">Deleted</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr><th>Time</th><th>User</th><th>Action</th><th>Record</th><th>ID</th><th>Details</th></tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.userName || '—'}</td>
              <td><span style={{ color: ACTION_COLORS[log.action] }}>{log.action}</span></td>
              <td>{log.entityName}</td>
              <td>{log.entityId}</td>
              <td style={{ fontSize: 13, color: '#555' }}>{log.summary}</td>
            </tr>
          ))}
          {logs.length === 0 && !loading && <tr><td colSpan={6}>No audit entries match this filter.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
