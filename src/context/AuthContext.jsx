import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Tipos de usuario y sus permisos
const USER_ROLES = {
  ADMIN: 'admin',
  CREATOR: 'creator', // Puede crear y rellenar plantillas
  VIEWER: 'viewer'    // Solo puede rellenar plantillas
};

const PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canCreateTemplates: true,
    canFillTemplates: true,
    canManageUsers: true,
    canDeleteTemplates: true
  },
  [USER_ROLES.CREATOR]: {
    canCreateTemplates: true,
    canFillTemplates: true,
    canManageUsers: false,
    canDeleteTemplates: false
  },
  [USER_ROLES.VIEWER]: {
    canCreateTemplates: false,
    canFillTemplates: true,
    canManageUsers: false,
    canDeleteTemplates: false
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de usuario desde localStorage o API
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Función de login simulada
  const login = (email, password) => {
    // Simulación de usuarios para desarrollo
    const mockUsers = {
      'admin@test.com': { id: 1, name: 'Administrador', email: 'admin@test.com', role: USER_ROLES.ADMIN },
      'creator@test.com': { id: 2, name: 'Creador', email: 'creator@test.com', role: USER_ROLES.CREATOR },
      'viewer@test.com': { id: 3, name: 'Visualizador', email: 'viewer@test.com', role: USER_ROLES.VIEWER }
    };

    const foundUser = mockUsers[email];
    if (foundUser && password === '123456') { // Contraseña simple para desarrollo
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    
    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Verificar permisos
  const hasPermission = (permission) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.[permission] || false;
  };

  // Obtener permisos del usuario actual
  const getUserPermissions = () => {
    if (!user) return {};
    return PERMISSIONS[user.role] || {};
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    getUserPermissions,
    USER_ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};