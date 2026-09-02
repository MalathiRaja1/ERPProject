import { useState } from 'react';
import apiClient from '../../api/client';
import { useToast } from '../../components/ToastProvider';

// Add this component to ReportsPage.jsx as a third tab, alongside Profit & Loss and Balance Sheet.
// See integration notes at the bottom of this file.

export function Gstr1Tab() {
  const toast = useToast();
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/gstreturns/gstr1', {
        params: { from: fromDate, to: toDate },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GSTR1_${fromDate}_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('GSTR-1 export downloaded.');
    } catch {
      toast.error('Failed to export GSTR-1.');
    }
  };

  return (
    <div style={{ background: 'var(--card-bg)', padding: 24, borderRadius: 8, maxWidth: 500 }}>
      <h2 style={{ marginTop: 0 }}>GSTR-1 Export</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Exports a CSV of all invoices in the selected period, in standard B2B/B2C GSTR-1 columns —
        ready to hand to your CA or import into GST filing software. This does not file anything
        with the government itself.
      </p>
      <div className="toolbar">
        <label>From</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label>To</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>
      <button onClick={handleExport}>Download GSTR-1 CSV</button>
    </div>
  );
}

/* ===== Integration notes for ReportsPage.jsx =====
1. Add this import at the top:
   import { Gstr1Tab } from './Gstr1Tab';
   (save this file as frontend/src/modules/reports/Gstr1Tab.jsx)

2. Add a third tab button next to your existing "Profit & Loss" / "Balance Sheet" buttons:
   <button onClick={() => setTab('gstr1')} disabled={tab === 'gstr1'}>GSTR-1 Export</button>

3. Add the render condition alongside your existing tab === 'pl' / tab === 'bs' blocks:
   {tab === 'gstr1' && <Gstr1Tab />}
*/
