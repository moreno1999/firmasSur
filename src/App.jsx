import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleBasedRoute, PublicRoute } from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/DashboardHome';
import CrearPlantilla from './components/CrearPlantilla';
import RellenarPlantilla from './components/RellenarPlantilla';
import ManageUsers from './components/ManageUsers';
import { NotFound, Unauthorized } from './components/ErrorPages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            {/* Ruta pública - Login */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* Rutas protegidas - Requieren autenticación */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Rutas con permisos específicos */}
            <Route 
              path="/crear-plantilla" 
              element={
                <RoleBasedRoute requiredPermission="canCreateTemplates">
                  <CrearPlantilla />
                </RoleBasedRoute>
              } 
            />

            <Route 
              path="/rellenar-plantilla" 
              element={
                <RoleBasedRoute requiredPermission="canFillTemplates">
                  <RellenarPlantilla />
                </RoleBasedRoute>
              } 
            />

            <Route 
              path="/gestionar-usuarios" 
              element={
                <RoleBasedRoute requiredPermission="canManageUsers">
                  <ManageUsers />
                </RoleBasedRoute>
              } 
            />

            {/* Rutas de error */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />

            {/* Redirección inicial */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta catch-all para 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        
        {/* Estilos para la animación de loading */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Router>
    </AuthProvider>
  );
}

export default App;
