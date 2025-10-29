import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para rutas que requieren autenticación
export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Cargando...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Componente para rutas que requieren permisos específicos
export const RoleBasedRoute = ({ children, requiredPermission }) => {
  const { user, getUserPermissions, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permissions = getUserPermissions();
  
  if (requiredPermission && !permissions[requiredPermission]) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Componente para usuarios ya logueados (redirect del login)
export const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Cargando...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};