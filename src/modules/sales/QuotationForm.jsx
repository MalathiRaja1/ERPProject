import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { createQuotation, fetchQuotations } from '../quotationsSlice';
import { useToast, extractErrorMessage } from '../../../components/ToastProvider';

export default function QuotationForm({ onClose }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: '' }]);

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

  const getProduct = (productId) => products.find((p) => p.id === Number(productId));

  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const totalTax = items.reduce((sum, i) => {
    const product = getProduct(i.productId);
    const lineSubtotal = (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0);
    return sum + (product ? lineSubtotal * product.taxRatePercent / 100 : 0);
  }, 0);
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createQuotation({
        customerId: Number(customerId),
        validUntil,
        notes,
        termsAndConditions: termsAndConditions || null,
        items: items.map((i) => ({
          productId: Number(i.productId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice)
        }))
      })).unwrap();
      dispatch(fetchQuotations({}));
      toast.success('Quotation created.');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create quotation'));
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" style={{ width: 560 }} onSubmit={handleSubmit}>
        <h2>New Quotation</h2>
        <label>Customer</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">Select customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.state ? ` (${c.state})` : ''}</option>)}
        </select>
        <label>Valid Until</label>
        <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />

        <label>Line Items</label>
        {items.map((item, idx) => {
          const product = getProduct(item.productId);
          return (
            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
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
              {product && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GST {product.taxRatePercent}%</span>}
              {items.length > 1 && <button type="button" onClick={() => removeItem(idx)}>✕</button>}
            </div>
          );
        })}
        <button type="button" onClick={addItem}>+ Add line</button>

        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

        <label>Terms &amp; Conditions (leave blank to use company default)</label>
        <textarea value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} rows={3} />

        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <p style={{ margin: 2 }}>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p style={{ margin: 2 }}>Tax (GST): ₹{totalTax.toFixed(2)}</p>
          <p style={{ margin: 2, fontWeight: 'bold' }}>Grand Total: ₹{grandTotal.toFixed(2)}</p>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save Quotation</button>
        </div>
      </form>
    </div>
  );
}
