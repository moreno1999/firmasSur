import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ManageUsers = () => {
  const { user, hasPermission, USER_ROLES } = useAuth();
  const [users, setUsers] = useState([
    { id: 1, name: 'Administrador', email: 'admin@test.com', role: USER_ROLES.ADMIN, active: true },
    { id: 2, name: 'Creador', email: 'creator@test.com', role: USER_ROLES.CREATOR, active: true },
    { id: 3, name: 'Visualizador', email: 'viewer@test.com', role: USER_ROLES.VIEWER, active: true }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: USER_ROLES.VIEWER,
    password: '123456' // Contraseña por defecto para desarrollo
  });

  const [showAddForm, setShowAddForm] = useState(false);

  // Solo admin puede acceder
  if (!hasPermission('canManageUsers')) {
    return (
      <div style={{ padding: '2rem', marginTop: '5rem', textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }

  const handleAddUser = (e) => {
    e.preventDefault();
    const userId = Math.max(...users.map(u => u.id)) + 1;
    const userToAdd = {
      ...newUser,
      id: userId,
      active: true
    };
    
    setUsers([...users, userToAdd]);
    setNewUser({ name: '', email: '', role: USER_ROLES.VIEWER, password: '123456' });
    setShowAddForm(false);
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    ));
  };

  const deleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [USER_ROLES.ADMIN]: 'Administrador',
      [USER_ROLES.CREATOR]: 'Creador',
      [USER_ROLES.VIEWER]: 'Visualizador'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.ADMIN]: '#dc3545',
      [USER_ROLES.CREATOR]: '#007bff',
      [USER_ROLES.VIEWER]: '#28a745'
    };
    return colors[role] || '#6c757d';
  };

  return (
    <div style={{ padding: '2rem', marginTop: '5rem', maxWidth: '1000px', margin: '5rem auto 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#000' }}>Gestión de Usuarios</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {showAddForm ? 'Cancelar' : '+ Agregar Usuario'}
        </button>
      </div>

      {/* Formulario para agregar usuario */}
      {showAddForm && (
        <div style={{
          background: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#000' }}>Agregar Nuevo Usuario</h3>
          <form onSubmit={handleAddUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#000' }}>
                  Nombre:
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#000' }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#000' }}>
                Rol:
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px'
                }}
              >
                <option value={USER_ROLES.VIEWER}>Visualizador (Solo rellenar)</option>
                <option value={USER_ROLES.CREATOR}>Creador (Crear y rellenar)</option>
                <option value={USER_ROLES.ADMIN}>Administrador (Acceso completo)</option>
              </select>
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Crear Usuario
            </button>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e9ecef',
          fontWeight: 'bold',
          color: '#000',
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr',
          gap: '1rem'
        }}>
          <div>Nombre</div>
          <div>Email</div>
          <div>Rol</div>
          <div>Estado</div>
          <div>Acciones</div>
        </div>
        
        {users.map(userItem => (
          <div
            key={userItem.id}
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e9ecef',
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr',
              gap: '1rem',
              alignItems: 'center',
              background: userItem.active ? 'white' : '#f8f9fa',
              opacity: userItem.active ? 1 : 0.7
            }}
          >
            <div style={{ fontWeight: userItem.id === user.id ? 'bold' : 'normal', color: '#000' }}>
              {userItem.name}
              {userItem.id === user.id && <span style={{ color: '#007bff' }}> (Tú)</span>}
            </div>
            <div style={{ color: '#000' }}>{userItem.email}</div>
            <div>
              <span style={{
                background: getRoleColor(userItem.role),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem'
              }}>
                {getRoleDisplayName(userItem.role)}
              </span>
            </div>
            <div>
              <span style={{
                background: userItem.active ? '#d4edda' : '#f8d7da',
                color: userItem.active ? '#155724' : '#721c24',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem'
              }}>
                {userItem.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => toggleUserStatus(userItem.id)}
                disabled={userItem.id === user.id}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: userItem.active ? '#ffc107' : '#28a745',
                  color: userItem.active ? '#212529' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: userItem.id === user.id ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {userItem.active ? 'Desactivar' : 'Activar'}
              </button>
              {userItem.id !== user.id && (
                <button
                  onClick={() => deleteUser(userItem.id)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Información sobre roles */}
      <div style={{
        marginTop: '2rem',
        background: '#e7f3ff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #b8daff'
      }}>
        <h4 style={{ marginTop: 0, color: '#004085' }}>Información sobre Roles:</h4>
        <ul style={{ margin: '0.5rem 0', color: '#004085' }}>
          <li><strong>Administrador:</strong> Acceso completo, puede gestionar usuarios</li>
          <li><strong>Creador:</strong> Puede crear y rellenar plantillas</li>
          <li><strong>Visualizador:</strong> Solo puede rellenar plantillas existentes</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageUsers;