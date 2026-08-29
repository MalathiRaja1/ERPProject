import { useMemo, useState } from 'react';

// Usage:
//   const { sorted, sortKey, sortDir, toggleSort } = useSortableData(items, 'name');
//   <th className="sortable" onClick={() => toggleSort('name')}>Name{sortArrow('name', sortKey, sortDir)}</th>
//   sorted.map(...)
export function useSortableData(items, initialKey = null, initialDir = 'asc') {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [items, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggleSort };
}

// Small helper to render the ▲/▼ arrow next to a sortable header
export function sortArrow(key, sortKey, sortDir) {
  if (key !== sortKey) return null;
  return <span className="sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>;
}
