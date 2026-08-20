import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../../api/client';
import { fetchInvoices, createInvoice, recordPayment } from './invoicesSlice';

const STATUS_COLORS = { Unpaid: '#c0392b', PartiallyPaid: '#d68910', Paid: '#1f9254', Overdue: '#8e1b1b' };

export default function InvoiceListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.invoices);
  const [fulfilledOrders, setFulfilledOrders] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [payInvoice, setPayInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BankTransfer');
  const [error, setError] = useState(null);

  const load = () => {
    dispatch(fetchInvoices({}));
    apiClient.get('/salesorders', { params: { status: 'Fulfilled' } }).then((res) => {
      setFulfilledOrders(res.data.filter((o) => !o.hasInvoice));
    });
  };

  useEffect(load, [dispatch]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await dispatch(createInvoice({ salesOrderId: Number(orderId), dueDate }));
    if (createInvoice.rejected.match(res)) {
      setError(res.payload || 'Failed to generate invoice');
    } else {
      setShowGenerate(false);
      load();
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await dispatch(recordPayment({
      invoiceId: payInvoice.id, amount: Number(payAmount), method: payMethod, reference: null
    }));
    if (recordPayment.rejected.match(res)) {
      setError(res.payload || 'Payment failed');
    } else {
      setPayInvoice(null);
      setPayAmount('');
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
        <button onClick={() => setShowGenerate(true)}>+ Generate Invoice</button>
      </div>

      {status === 'loading' && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice #</th><th>Order #</th><th>Customer</th><th>Due Date</th>
            <th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.orderNumber}</td>
              <td>{inv.customerName}</td>
              <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td>₹{inv.totalAmount.toFixed(2)}</td>
              <td>₹{inv.amountPaid.toFixed(2)}</td>
              <td>₹{inv.amountDue.toFixed(2)}</td>
              <td><span style={{ color: STATUS_COLORS[inv.status] }}>{inv.status}</span></td>
              <td>
                {inv.status !== 'Paid' && (
                  <button onClick={() => { setPayInvoice(inv); setPayAmount(inv.amountDue); setError(null); }}>
                    Record Payment
                  </button>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && status !== 'loading' && (
            <tr><td colSpan={9}>No invoices yet — generate one from a fulfilled order.</td></tr>
          )}
        </tbody>
      </table>

      {showGenerate && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleGenerate}>
            <h2>Generate Invoice</h2>
            <label>Fulfilled Order (not yet invoiced)</label>
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
              <option value="">Select order</option>
              {fulfilledOrders.map((o) => (
                <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerName} — ₹{o.totalAmount.toFixed(2)}</option>
              ))}
            </select>
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            {error && <p className="error-text">{error}</p>}
            <div className="modal-actions">
              <button type="button" onClick={() => setShowGenerate(false)}>Cancel</button>
              <button type="submit">Generate</button>
            </div>
          </form>
        </div>
      )}

      {payInvoice && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handlePay}>
            <h2>Record Payment — {payInvoice.invoiceNumber}</h2>
            <p>Amount due: ₹{payInvoice.amountDue.toFixed(2)}</p>
            <label>Amount</label>
            <input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
            <label>Method</label>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option>Cash</option><option>BankTransfer</option><option>Card</option><option>Cheque</option><option>Other</option>
            </select>
            {error && <p className="error-text">{error}</p>}
            <div className="modal-actions">
              <button type="button" onClick={() => setPayInvoice(null)}>Cancel</button>
              <button type="submit">Record Payment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
