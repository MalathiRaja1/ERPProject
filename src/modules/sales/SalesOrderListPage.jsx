import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../../api/client';
import { fetchOrders, updateOrderStatus, fulfillOrder } from './ordersSlice';

const STATUS_COLORS = { Draft: '#8a8f98', Confirmed: '#2d6cdf', Fulfilled: '#1f9254', Cancelled: '#c0392b' };

export default function SalesOrderListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.orders);
  const [warehouses, setWarehouses] = useState([]);
  const [fulfillOrderId, setFulfillOrderId] = useState(null);
  const [warehouseId, setWarehouseId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({}));
    apiClient.get('/warehouses').then((res) => setWarehouses(res.data));
  }, [dispatch]);

  const handleConfirm = (id) => {
    dispatch(updateOrderStatus({ id, status: 'Confirmed' })).then(() => dispatch(fetchOrders({})));
  };

  const openFulfill = (id) => {
    setFulfillOrderId(id);
    setError(null);
  };

  const handleFulfill = async () => {
    setError(null);
    const res = await dispatch(fulfillOrder({ id: fulfillOrderId, warehouseId: Number(warehouseId) }));
    if (fulfillOrder.rejected.match(res)) {
      setError(res.payload || res.error.message || 'Fulfillment failed — check stock availability.');
    } else {
      setFulfillOrderId(null);
      dispatch(fetchOrders({}));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Sales Orders</h1>
      </div>
      <p style={{ color: '#666' }}>Orders are created automatically when a Quotation is converted (Sales — Quotations page).</p>

      {status === 'loading' && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Invoice</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.customerName}</td>
              <td>{new Date(o.orderDate).toLocaleDateString()}</td>
              <td>₹{o.totalAmount.toFixed(2)}</td>
              <td><span style={{ color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
              <td>{o.hasInvoice ? 'Yes' : 'No'}</td>
              <td>
                {o.status === 'Draft' && <button onClick={() => handleConfirm(o.id)}>Confirm</button>}
                {o.status === 'Confirmed' && <button onClick={() => openFulfill(o.id)}>Fulfill</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && status !== 'loading' && (
            <tr><td colSpan={7}>No sales orders yet — convert an accepted quotation first.</td></tr>
          )}
        </tbody>
      </table>

      {fulfillOrderId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Fulfill Order</h2>
            <label>Warehouse to deduct stock from</label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            {error && <p className="error-text">{typeof error === 'string' ? error : JSON.stringify(error)}</p>}
            <div className="modal-actions">
              <button type="button" onClick={() => setFulfillOrderId(null)}>Cancel</button>
              <button type="button" onClick={handleFulfill} disabled={!warehouseId}>Confirm Fulfillment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
