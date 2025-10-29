import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{
          fontSize: '6rem',
          color: '#6c757d',
          margin: '0',
          fontWeight: '700'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#343a40',
          margin: '1rem 0',
          fontWeight: '600'
        }}>
          Página no encontrada
        </h2>
        <p style={{
          color: '#6c757d',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          La página que buscas no existe o ha sido movida.
        </p>
        <Link 
          to="/dashboard"
          style={{
            padding: '0.75rem 2rem',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      textAlign: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '4rem',
          margin: '0 0 1rem 0'
        }}>
          🚫
        </div>
        <h1 style={{
          fontSize: '2rem',
          color: '#dc3545',
          margin: '0 0 1rem 0',
          fontWeight: '700'
        }}>
          Acceso Denegado
        </h1>
        <p style={{
          color: '#6c757d',
          marginBottom: '2rem',
          fontSize: '1.1rem',
          maxWidth: '500px'
        }}>
          No tienes permisos para acceder a esta página. Contacta con el administrador si crees que esto es un error.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 2rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Volver Atrás
          </button>
          <Link 
            to="/dashboard"
            style={{
              padding: '0.75rem 2rem',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};