import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Wrap routes that require auth, optionally restricting to specific roles:
// <ProtectedRoute roles={['Admin', 'InventoryManager']}><Inventory /></ProtectedRoute>
export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (roles && !roles.some((r) => user.roles?.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
