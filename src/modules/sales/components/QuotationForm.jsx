import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { createQuotation, fetchQuotations } from '../quotationsSlice';

export default function QuotationForm({ onClose }) {
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: '' }]);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/customers').then((res) => setCustomers(res.data));
    apiClient.get('/products').then((res) => setProducts(res.data));
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
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(createQuotation({
        customerId: Number(customerId),
        validUntil,
        notes,
        items: items.map((i) => ({
          productId: Number(i.productId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice)
        }))
      })).unwrap();
      dispatch(fetchQuotations({}));
      onClose();
    } catch (err) {
      setError(err?.toString() || 'Failed to create quotation');
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" style={{ width: 520 }} onSubmit={handleSubmit}>
        <h2>New Quotation</h2>
        <label>Customer</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">Select customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label>Valid Until</label>
        <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />

        <label>Line Items</label>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} required>
              <option value="">Product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input
              type="number" min="1" placeholder="Qty" value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required style={{ width: 60 }}
            />
            <input
              type="number" step="0.01" placeholder="Price" value={item.unitPrice}
              onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} required style={{ width: 90 }}
            />
            {items.length > 1 && <button type="button" onClick={() => removeItem(idx)}>✕</button>}
          </div>
        ))}
        <button type="button" onClick={addItem}>+ Add line</button>

        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

        <p><strong>Total: ₹{total.toFixed(2)}</strong></p>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save Quotation</button>
        </div>
      </form>
    </div>
  );
}
