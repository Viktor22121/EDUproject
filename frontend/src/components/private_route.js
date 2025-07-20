import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

/**
 * @param {boolean} requireTeacher
 * @param {boolean} requireStudent
 *
 */
export default function PrivateRoute({children,requireTeacher = false,requireStudent = false,}) {
  const { loading, isAuthenticated, isTeacher } = useAuth();

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requireTeacher && !isTeacher)
    return <Navigate to="/student/dashboard" replace />;

  if (requireStudent && isTeacher)
    return <Navigate to="/teacher" replace />;

  return children;
}