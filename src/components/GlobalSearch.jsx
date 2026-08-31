import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/search', { params: { q: query } });
        setResults(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce so we don't hit the API on every keystroke

    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result) => {
    navigate(result.route);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="global-search" ref={boxRef}>
      <input
        placeholder="Search products, employees, invoices..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && (
        <div className="global-search-dropdown">
          {loading && <div className="global-search-item">Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="global-search-item">No matches found.</div>
          )}
          {!loading && results.map((r) => (
            <div key={`${r.type}-${r.id}`} className="global-search-item" onClick={() => handleSelect(r)}>
              <span className="global-search-type">{r.type}</span>
              <div>
                <div className="global-search-label">{r.label}</div>
                <div className="global-search-subtitle">{r.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
