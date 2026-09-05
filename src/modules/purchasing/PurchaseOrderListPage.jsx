import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

const STATUS_COLORS = { Draft: '#8a8f98', Sent: '#2d6cdf', Confirmed: '#6a4fd6', Received: '#1f9254', Cancelled: '#c0392b' };

export default function PurchaseOrderListPage() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [receiveOrderId, setReceiveOrderId] = useState(null);
  const [warehouseId, setWarehouseId] = useState('');
  const [loading, setLoading] = useState(false);

  const [supplierId, setSupplierId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: '' }]);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/purchaseorders');
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    apiClient.get('/suppliers').then((res) => setSuppliers(res.data));
    apiClient.get('/products').then((res) => setProducts(res.data));
    apiClient.get('/warehouses').then((res) => setWarehouses(res.data));
  }, []);

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    if (field === 'productId') {
      const product = products.find((p) => p.id === Number(value));
      if (product) next[index].unitPrice = product.unitPrice;
    }
    setItems(next);
  };
  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/purchaseorders', {
        supplierId: Number(supplierId),
        expectedDeliveryDate: expectedDeliveryDate || null,
        items: items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }))
      });
      toast.success('Purchase order created.');
      setShowForm(false);
      setSupplierId(''); setExpectedDeliveryDate(''); setItems([{ productId: '', quantity: 1, unitPrice: '' }]);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create purchase order'));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apiClient.patch(`/purchaseorders/${id}/status`, { status });
      toast.success(`Order marked ${status}.`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleReceive = async () => {
    try {
      await apiClient.post(`/purchaseorders/${receiveOrderId}/receive`, { warehouseId: Number(warehouseId) });
      toast.success('Goods received — stock updated.');
      setReceiveOrderId(null);
      setWarehouseId('');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to receive goods'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Purchase Orders</h1>
        <button onClick={() => setShowForm(true)}>+ New Purchase Order</button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr><th>PO #</th><th>Supplier</th><th>Date</th><th>Total</th><th>Bill</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {orders.map((po) => (
            <tr key={po.id}>
              <td>{po.poNumber}</td>
              <td>{po.supplierName}</td>
              <td>{new Date(po.orderDate).toLocaleDateString()}</td>
              <td>₹{po.totalAmount.toFixed(2)}</td>
              <td>{po.hasBill ? 'Yes' : 'No'}</td>
              <td><span style={{ color: STATUS_COLORS[po.status] }}>{po.status}</span></td>
              <td>
                {po.status === 'Draft' && <button onClick={() => handleStatusChange(po.id, 'Sent')}>Mark Sent</button>}
                {po.status === 'Sent' && <button onClick={() => handleStatusChange(po.id, 'Confirmed')}>Confirm</button>}
                {po.status === 'Confirmed' && <button onClick={() => setReceiveOrderId(po.id)}>Receive Goods</button>}
              </td>
            </tr>
          ))}
          {orders.length === 0 && !loading && <tr><td colSpan={7}>No purchase orders yet.</td></tr>}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card" style={{ width: 560 }} onSubmit={handleCreate}>
            <h2>New Purchase Order</h2>
            <label>Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
              <option value="">Select supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}{s.state ? ` (${s.state})` : ''}</option>)}
            </select>
            <label>Expected Delivery Date (optional)</label>
            <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />

            <label>Line Items</label>
            {items.map((item, idx) => {
              const product = products.find((p) => p.id === Number(item.productId));
              return (
                <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} required>
                    <option value="">Product</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required style={{ width: 60 }} />
                  <input type="number" step="0.01" placeholder="Price" value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} required style={{ width: 90 }} />
                  {product && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GST {product.taxRatePercent}%</span>}
                  {items.length > 1 && <button type="button" onClick={() => removeItem(idx)}>✕</button>}
                </div>
              );
            })}
            <button type="button" onClick={addItem}>+ Add line</button>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit">Create Purchase Order</button>
            </div>
          </form>
        </div>
      )}

      {receiveOrderId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Receive Goods</h2>
            <label>Warehouse to stock items into</label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <div className="modal-actions">
              <button type="button" onClick={() => setReceiveOrderId(null)}>Cancel</button>
              <button type="button" onClick={handleReceive} disabled={!warehouseId}>Confirm Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
