import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  // Show loading state while checking auth
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

