import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "#212e36",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          Proyecto Firmas
        </span>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link
            to="/dashboard"
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              fontWeight: isActive("/dashboard") ? "bold" : "normal",
              cursor: "pointer",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              backgroundColor: isActive("/dashboard") ? "rgba(255,255,255,0.1)" : "transparent"
            }}
          >
            Inicio
          </Link>

          {/* Mostrar "Crear Plantilla" solo si tiene permisos */}
          {hasPermission('canCreateTemplates') && (
            <Link
              to="/crear-plantilla"
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: isActive("/crear-plantilla") ? "bold" : "normal",
                cursor: "pointer",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: isActive("/crear-plantilla") ? "rgba(255,255,255,0.1)" : "transparent"
              }}
            >
              Crear Plantilla
            </Link>
          )}

          {/* Mostrar "Rellenar Plantilla" solo si tiene permisos */}
          {hasPermission('canFillTemplates') && (
            <Link
              to="/rellenar-plantilla"
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: isActive("/rellenar-plantilla") ? "bold" : "normal",
                cursor: "pointer",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: isActive("/rellenar-plantilla") ? "rgba(255,255,255,0.1)" : "transparent"
              }}
            >
              Rellenar Plantilla
            </Link>
          )}

          {/* Mostrar "Gestionar Usuarios" solo para admin */}
          {hasPermission('canManageUsers') && (
            <Link
              to="/gestionar-usuarios"
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: isActive("/gestionar-usuarios") ? "bold" : "normal",
                cursor: "pointer",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: isActive("/gestionar-usuarios") ? "rgba(255,255,255,0.1)" : "transparent"
              }}
            >
              Gestionar Usuarios
            </Link>
          )}
        </div>
      </div>

      {/* Usuario y logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "0.9rem" }}>
          Hola, <strong>{user?.name}</strong>
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}

function Home() {
  const { user, getUserPermissions } = useAuth();
  const permissions = getUserPermissions();
  
  return (
    <div style={{ padding: "2rem", marginTop: "5rem", maxWidth: "1000px", margin: "5rem auto 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#2c3e50" }}>
          Sistema de Plantillas PDF
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
          Crea, gestiona y rellena plantillas de documentos PDF de forma profesional
        </p>
      </div>

      {/* Saludo personalizado */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "2rem",
        borderRadius: "12px",
        textAlign: "center",
        marginBottom: "3rem"
      }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
          ¡Bienvenido, {user?.name}! 👋
        </h3>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Tienes permisos de: <strong>{user?.role}</strong>
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem", 
        marginBottom: "3rem" 
      }}>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "2rem",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>
            {JSON.parse(localStorage.getItem('pdfTemplates') || '[]').length}
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Plantillas Creadas</p>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          padding: "2rem",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>∞</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Documentos Generados</p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          padding: "2rem",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>100%</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Funcional</p>
        </div>
      </div>

      {/* Acciones rápidas basadas en permisos */}
      <div style={{
        background: "#f8f9fa",
        padding: "2rem",
        borderRadius: "12px",
        border: "1px solid #e9ecef"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#2c3e50" }}>
          Acciones Rápidas:
        </h3>
        
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {permissions.canCreateTemplates && (
            <a
              href="/templates/index.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "1rem 2rem",
                background: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                display: "inline-block"
              }}
            >
              🚀 Crear Nueva Plantilla (Sistema Original)
            </a>
          )}
          
          {permissions.canFillTemplates && (
            <a
              href="/templates/index.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "1rem 2rem",
                background: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                display: "inline-block"
              }}
            >
              📝 Rellenar Plantilla (Sistema Original)
            </a>
          )}

          {permissions.canManageUsers && (
            <Link
              to="/gestionar-usuarios"
              style={{
                padding: "1rem 2rem",
                background: "#6f42c1",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                display: "inline-block"
              }}
            >
              👥 Gestionar Usuarios
            </Link>
          )}
        </div>
      </div>

      {/* Aviso importante */}
      <div style={{
        background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
        border: "1px solid #ffeaa7",
        borderRadius: "12px",
        padding: "2rem",
        textAlign: "center",
        marginTop: "3rem"
      }}>
        <h4 style={{ color: "#856404", marginBottom: "1rem" }}>
          💡 Sistema Híbrido Recomendado
        </h4>
        <p style={{ color: "#856404", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "700px", margin: "0 auto" }}>
          Actualmente recomendamos usar el <strong>"Sistema Original"</strong> para crear y rellenar plantillas, 
          ya que mantiene toda la funcionalidad desarrollada. El dashboard React gestiona usuarios y permisos, 
          mientras que el sistema original maneja las plantillas.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <Home />
    </div>
  );
}