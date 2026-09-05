import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

const STATUS_COLORS = { Unpaid: '#c0392b', PartiallyPaid: '#d68910', Paid: '#1f9254', Overdue: '#8e1b1b' };

export default function SupplierBillListPage() {
  const toast = useToast();
  const [bills, setBills] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [payBill, setPayBill] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BankTransfer');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/supplierbills');
    setBills(data);
    apiClient.get('/purchaseorders', { params: { status: 'Received' } }).then((res) => {
      setReceivedOrders(res.data.filter((po) => !po.hasBill));
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/supplierbills', { purchaseOrderId: Number(orderId), dueDate });
      toast.success('Supplier bill generated.');
      setShowGenerate(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to generate bill'));
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/supplierpayments', {
        supplierBillId: payBill.id, amount: Number(payAmount), method: payMethod, reference: null
      });
      toast.success('Payment recorded.');
      setPayBill(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Payment failed'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Supplier Bills (Accounts Payable)</h1>
        <button onClick={() => setShowGenerate(true)}>+ Generate Bill</button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Bill #</th><th>PO #</th><th>Supplier</th><th>Due Date</th>
            <th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.id}>
              <td>{b.billNumber}</td>
              <td>{b.poNumber}</td>
              <td>{b.supplierName}</td>
              <td>{new Date(b.dueDate).toLocaleDateString()}</td>
              <td>₹{b.totalAmount.toFixed(2)}</td>
              <td>₹{b.amountPaid.toFixed(2)}</td>
              <td>₹{b.amountDue.toFixed(2)}</td>
              <td><span style={{ color: STATUS_COLORS[b.status] }}>{b.status}</span></td>
              <td>
                {b.status !== 'Paid' && (
                  <button onClick={() => { setPayBill(b); setPayAmount(b.amountDue); }}>Record Payment</button>
                )}
              </td>
            </tr>
          ))}
          {bills.length === 0 && !loading && <tr><td colSpan={9}>No supplier bills yet — generate one from a received purchase order.</td></tr>}
        </tbody>
      </table>

      {showGenerate && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleGenerate}>
            <h2>Generate Supplier Bill</h2>
            <label>Received Purchase Order (not yet billed)</label>
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
              <option value="">Select order</option>
              {receivedOrders.map((po) => (
                <option key={po.id} value={po.id}>{po.poNumber} — {po.supplierName} — ₹{po.totalAmount.toFixed(2)}</option>
              ))}
            </select>
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowGenerate(false)}>Cancel</button>
              <button type="submit">Generate</button>
            </div>
          </form>
        </div>
      )}

      {payBill && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handlePay}>
            <h2>Record Payment — {payBill.billNumber}</h2>
            <p>Amount due: ₹{payBill.amountDue.toFixed(2)}</p>
            <label>Amount</label>
            <input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
            <label>Method</label>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option>Cash</option><option>BankTransfer</option><option>Card</option><option>Cheque</option><option>Other</option>
            </select>
            <div className="modal-actions">
              <button type="button" onClick={() => setPayBill(null)}>Cancel</button>
              <button type="submit">Record Payment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
