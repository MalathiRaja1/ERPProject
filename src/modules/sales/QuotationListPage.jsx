import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { fetchQuotations, updateQuotationStatus, convertToOrder } from './quotationsSlice';
import QuotationForm from './components/QuotationForm';

const STATUS_COLORS = {
  Draft: '#8a8f98', Sent: '#2d6cdf', Accepted: '#1f9254', Rejected: '#c0392b', Expired: '#a5a9b0'
};

export default function QuotationListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.quotations);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { dispatch(fetchQuotations({})); }, [dispatch]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateQuotationStatus({ id, status: newStatus })).then(() => dispatch(fetchQuotations({})));
  };

  const handleConvert = (id) => {
    dispatch(convertToOrder(id)).then((res) => {
      if (!res.error) alert(`Converted to Sales Order ${res.payload.order.orderNumber}`);
      dispatch(fetchQuotations({}));
    });
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
