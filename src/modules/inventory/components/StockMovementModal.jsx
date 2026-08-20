import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { recordStockMovement, fetchProducts } from '../productsSlice';

const MOVEMENT_TYPES = ['In', 'Out', 'Transfer', 'Adjustment'];

export default function StockMovementModal({ product, onClose }) {
  const dispatch = useDispatch();
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ warehouseId: '', type: 'In', quantity: '', reference: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/warehouses').then((res) => setWarehouses(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(recordStockMovement({
        productId: product.id,
        warehouseId: Number(form.warehouseId),
        type: MOVEMENT_TYPES.indexOf(form.type), // matches the C# enum order
        quantity: Number(form.quantity),
        reference: form.reference
      })).unwrap();
      dispatch(fetchProducts({}));
      onClose();
    } catch (err) {
      setError(err?.response?.data || 'Failed to record movement');
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>Adjust Stock — {product.name}</h2>
        <label>Warehouse</label>
        <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} required>
          <option value="">Select warehouse</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <label>Movement Type</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label>Quantity</label>
        <input type="number" min="1" value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        <label>Reference (optional)</label>
        <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />

        {error && <p className="error-text">{JSON.stringify(error)}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
