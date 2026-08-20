import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { createProduct, fetchProducts } from '../productsSlice';

export default function ProductForm({ onClose }) {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    sku: '', name: '', description: '', categoryId: '', supplierId: '', unitPrice: '', reorderLevel: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/categories').then((res) => setCategories(res.data));
    apiClient.get('/suppliers').then((res) => setSuppliers(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(createProduct({
        ...form,
        categoryId: Number(form.categoryId),
        supplierId: Number(form.supplierId),
        unitPrice: Number(form.unitPrice),
        reorderLevel: Number(form.reorderLevel)
      })).unwrap();
      dispatch(fetchProducts({}));
      onClose();
    } catch (err) {
      setError(err?.toString() || 'Failed to create product');
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>New Product</h2>
        <label>SKU</label>
        <input name="sku" value={form.sku} onChange={handleChange} required />
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
        <label>Category</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label>Supplier</label>
        <select name="supplierId" value={form.supplierId} onChange={handleChange} required>
          <option value="">Select supplier</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <label>Unit Price</label>
        <input name="unitPrice" type="number" step="0.01" value={form.unitPrice} onChange={handleChange} required />
        <label>Reorder Level</label>
        <input name="reorderLevel" type="number" value={form.reorderLevel} onChange={handleChange} required />

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
