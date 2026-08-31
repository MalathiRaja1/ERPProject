import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotations, updateQuotationStatus, convertToOrder } from './quotationsSlice';
import QuotationForm from './components/QuotationForm';
import { useToast } from '../../components/ToastProvider';
import { downloadPdf } from '../../utils/downloadPdf';

const STATUS_COLORS = {
  Draft: '#8a8f98', Sent: '#2d6cdf', Accepted: '#1f9254', Rejected: '#c0392b', Expired: '#a5a9b0'
};

export default function QuotationListPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector((state) => state.quotations);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { dispatch(fetchQuotations({})); }, [dispatch]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateQuotationStatus({ id, status: newStatus })).then((res) => {
      if (!res.error) toast.success(`Quotation marked ${newStatus}.`);
      dispatch(fetchQuotations({}));
    });
  };

  const handleConvert = (id) => {
    dispatch(convertToOrder(id)).then((res) => {
      if (!res.error) toast.success(`Converted to Sales Order ${res.payload.order.orderNumber}.`);
      else toast.error('Failed to convert quotation to order.');
      dispatch(fetchQuotations({}));
    });
  };

  const handleDownload = async (q) => {
    try {
      await downloadPdf(`/quotations/${q.id}/pdf`, `${q.quotationNumber}.pdf`);
    } catch {
      toast.error('Failed to download PDF.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Quotations</h1>
        <button onClick={() => setShowForm(true)}>+ New Quotation</button>
      </div>

      {status === 'loading' && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Number</th><th>Customer</th><th>Date</th><th>Valid Until</th>
            <th>Total</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id}>
              <td>{q.quotationNumber}</td>
              <td>{q.customerName}</td>
              <td>{new Date(q.quotationDate).toLocaleDateString()}</td>
              <td>{new Date(q.validUntil).toLocaleDateString()}</td>
              <td>₹{q.totalAmount.toFixed(2)}</td>
              <td><span style={{ color: STATUS_COLORS[q.status] }}>{q.status}</span></td>
              <td>
                <button className="pdf-btn" onClick={() => handleDownload(q)}>PDF</button>{' '}
                {q.status === 'Draft' && (
                  <button onClick={() => handleStatusChange(q.id, 'Sent')}>Mark Sent</button>
                )}
                {q.status === 'Sent' && (
                  <>
                    <button onClick={() => handleStatusChange(q.id, 'Accepted')}>Accept</button>{' '}
                    <button onClick={() => handleStatusChange(q.id, 'Rejected')}>Reject</button>
                  </>
                )}
                {q.status === 'Accepted' && !q.convertedSalesOrderId && (
                  <button onClick={() => handleConvert(q.id)}>Convert to Order</button>
                )}
                {q.convertedSalesOrderId && <em>Converted</em>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && <QuotationForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
