// Add this component to DashboardPage.jsx and render it near the top (see integration notes below).

import { useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

export function AlertButtons() {
  const toast = useToast();
  const [sending, setSending] = useState(null);

  const send = async (endpoint, label) => {
    setSending(label);
    try {
      const { data } = await apiClient.post(endpoint);
      if (data.recipientCount === 0) toast.info(data.message);
      else toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err, `Failed to send ${label}`));
    } finally {
      setSending(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
      <button onClick={() => send('/notifications/send-low-stock-alert', 'low stock alert')} disabled={sending === 'low stock alert'}>
        {sending === 'low stock alert' ? 'Sending...' : '📧 Send Low Stock Alert'}
      </button>
      <button onClick={() => send('/notifications/send-overdue-invoices-alert', 'overdue invoices alert')} disabled={sending === 'overdue invoices alert'}>
        {sending === 'overdue invoices alert' ? 'Sending...' : '📧 Send Overdue Invoices Alert'}
      </button>
    </div>
  );
}

/* ===== Integration notes =====
1. Save this as: frontend/src/modules/dashboard/AlertButtons.jsx
2. In DashboardPage.jsx, add:
     import { AlertButtons } from './AlertButtons';
   Then render it right after <h1>Dashboard</h1>:
     <h1>Dashboard</h1>
     <AlertButtons />
*/
