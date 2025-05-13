import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user } = useAuthStore();

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role check if required
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // If there are children, render them, otherwise render the Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;