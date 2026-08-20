import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from './productsSlice';
import ProductForm from './components/ProductForm';
import StockMovementModal from './components/StockMovementModal';

export default function ProductListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [movementProduct, setMovementProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ search, lowStockOnly }));
  }, [dispatch, search, lowStockOnly]);

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button onClick={() => setShowForm(true)}>+ New Product</button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label>
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>

      {status === 'loading' && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th><th>Name</th><th>Category</th><th>Supplier</th>
            <th>Unit Price</th><th>Stock</th><th>Reorder Level</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className={p.totalStock <= p.reorderLevel ? 'row-low-stock' : ''}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.categoryName}</td>
              <td>{p.supplierName}</td>
              <td>₹{p.unitPrice.toFixed(2)}</td>
              <td>{p.totalStock}</td>
              <td>{p.reorderLevel}</td>
              <td><button onClick={() => setMovementProduct(p)}>Adjust Stock</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && <ProductForm onClose={() => setShowForm(false)} />}
      {movementProduct && (
        <StockMovementModal product={movementProduct} onClose={() => setMovementProduct(null)} />
      )}
    </div>
  );
}
