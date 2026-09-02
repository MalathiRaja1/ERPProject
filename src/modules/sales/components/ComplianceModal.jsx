import { useState } from 'react';
import apiClient from '../../../api/client';
import { useToast, extractErrorMessage } from '../../../components/ToastProvider';

export default function ComplianceModal({ invoice, onClose }) {
  const toast = useToast();
  const [tab, setTab] = useState('einvoice');

  const [einvoiceForm, setEinvoiceForm] = useState({
    irn: invoice.irn || '', ackNumber: invoice.ackNumber || '',
    ackDate: invoice.ackDate ? invoice.ackDate.slice(0, 10) : '', qrCodeData: ''
  });

  const [ewayForm, setEwayForm] = useState({
    ewayBillNumber: '', transporterName: '', transporterGstin: '',
    vehicleNumber: '', distanceKm: '', generatedDate: new Date().toISOString().slice(0, 10), validUntil: ''
  });

  const handleEinvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/invoices/${invoice.id}/record-einvoice`, einvoiceForm);
      toast.success('e-Invoice details saved.');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save e-invoice details'));
    }
  };

  const handleEwaySubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/ewaybill/invoice/${invoice.id}`, {
        ...ewayForm,
        distanceKm: ewayForm.distanceKm ? Number(ewayForm.distanceKm) : null,
        validUntil: ewayForm.validUntil || null
      });
      toast.success('e-Way Bill details saved.');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save e-way bill details'));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: 480 }}>
        <h2>GST Compliance — {invoice.invoiceNumber}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Generate the actual IRN / e-way bill number through your GSP or the government portal first,
          then paste the details here so they print on your invoice PDF.
        </p>

        <div className="toolbar">
          <button onClick={() => setTab('einvoice')} disabled={tab === 'einvoice'}>e-Invoice</button>
          <button onClick={() => setTab('ewaybill')} disabled={tab === 'ewaybill'}>e-Way Bill</button>
        </div>

        {tab === 'einvoice' && (
          <form onSubmit={handleEinvoiceSubmit}>
            <label>IRN (Invoice Reference Number)</label>
            <input value={einvoiceForm.irn} onChange={(e) => setEinvoiceForm({ ...einvoiceForm, irn: e.target.value })} required />
            <label>Acknowledgement Number</label>
            <input value={einvoiceForm.ackNumber} onChange={(e) => setEinvoiceForm({ ...einvoiceForm, ackNumber: e.target.value })} required />
            <label>Acknowledgement Date</label>
            <input type="date" value={einvoiceForm.ackDate} onChange={(e) => setEinvoiceForm({ ...einvoiceForm, ackDate: e.target.value })} required />
            <label>QR Code Data (from the government/GSP response)</label>
            <textarea value={einvoiceForm.qrCodeData} onChange={(e) => setEinvoiceForm({ ...einvoiceForm, qrCodeData: e.target.value })} rows={3} />
            <div className="modal-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit">Save e-Invoice Details</button>
            </div>
          </form>
        )}

        {tab === 'ewaybill' && (
          <form onSubmit={handleEwaySubmit}>
            <label>e-Way Bill Number</label>
            <input value={ewayForm.ewayBillNumber} onChange={(e) => setEwayForm({ ...ewayForm, ewayBillNumber: e.target.value })} required />
            <label>Transporter Name</label>
            <input value={ewayForm.transporterName} onChange={(e) => setEwayForm({ ...ewayForm, transporterName: e.target.value })} />
            <label>Transporter GSTIN</label>
            <input value={ewayForm.transporterGstin} onChange={(e) => setEwayForm({ ...ewayForm, transporterGstin: e.target.value })} />
            <label>Vehicle Number</label>
            <input value={ewayForm.vehicleNumber} onChange={(e) => setEwayForm({ ...ewayForm, vehicleNumber: e.target.value })} />
            <label>Distance (km)</label>
            <input type="number" value={ewayForm.distanceKm} onChange={(e) => setEwayForm({ ...ewayForm, distanceKm: e.target.value })} />
            <label>Generated Date</label>
            <input type="date" value={ewayForm.generatedDate} onChange={(e) => setEwayForm({ ...ewayForm, generatedDate: e.target.value })} required />
            <label>Valid Until (optional)</label>
            <input type="date" value={ewayForm.validUntil} onChange={(e) => setEwayForm({ ...ewayForm, validUntil: e.target.value })} />
            <div className="modal-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit">Save e-Way Bill Details</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
