import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CrearPlantilla from "./CrearPlantilla";
import RellenarPlantilla from "./RellenarPlantilla";
import ManageUsers from "./ManageUsers";

function Navbar({ setSection, section }) {
  const { user, logout, hasPermission } = useAuth();

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
        
        <button
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            fontWeight: section === "home" ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={() => setSection("home")}
        >
          Inicio
        </button>

        {/* Solo mostrar "Crear Plantilla" si el usuario tiene permisos */}
        {hasPermission('canCreateTemplates') && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              fontWeight: section === "create" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => setSection("create")}
          >
            Crear Plantilla
          </button>
        )}

        {/* Mostrar "Rellenar Plantilla" si el usuario tiene permisos */}
        {hasPermission('canFillTemplates') && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              fontWeight: section === "fill" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => setSection("fill")}
          >
            Rellenar Plantilla
          </button>
        )}

        {/* Mostrar "Gestionar Usuarios" solo para admin */}
        {hasPermission('canManageUsers') && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              fontWeight: section === "users" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => setSection("users")}
          >
            Gestionar Usuarios
          </button>
        )}
      </div>

      {/* Información del usuario y logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={logout}
          style={{
            background: "#dc3545",
            border: "none",
            color: "white",
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
    <div style={{ padding: "2rem", marginTop: "5rem", maxWidth: "800px", margin: "5rem auto 2rem" }}>
      <h2>Bienvenido al sistema de plantillas</h2>
      <p style={{ marginBottom: "2rem" }}>
        Hola <strong>{user?.name}</strong>, selecciona una opción en el menú para comenzar.
      </p>

      {/* Mostrar permisos del usuario */}
      <div style={{
        background: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
        marginBottom: "2rem"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#495057" }}>
          Tu Rol: <span style={{ color: "#007bff" }}>{user?.role}</span>
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{
            background: permissions.canCreateTemplates ? "#d4edda" : "#f8d7da",
            padding: "1rem",
            borderRadius: "6px",
            border: `1px solid ${permissions.canCreateTemplates ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            <h4 style={{ 
              margin: "0 0 0.5rem 0", 
              color: permissions.canCreateTemplates ? "#155724" : "#721c24" 
            }}>
              Crear Plantillas
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: "0.9rem",
              color: permissions.canCreateTemplates ? "#155724" : "#721c24" 
            }}>
              {permissions.canCreateTemplates ? "✅ Permitido" : "❌ No permitido"}
            </p>
          </div>

          <div style={{
            background: permissions.canFillTemplates ? "#d4edda" : "#f8d7da",
            padding: "1rem",
            borderRadius: "6px",
            border: `1px solid ${permissions.canFillTemplates ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            <h4 style={{ 
              margin: "0 0 0.5rem 0", 
              color: permissions.canFillTemplates ? "#155724" : "#721c24" 
            }}>
              Rellenar Plantillas
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: "0.9rem",
              color: permissions.canFillTemplates ? "#155724" : "#721c24" 
            }}>
              {permissions.canFillTemplates ? "✅ Permitido" : "❌ No permitido"}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {permissions.canCreateTemplates && (
          <a
            href="/templates/index.html"
            target="_blank"
            style={{
              padding: "1rem 2rem",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            � Crear Nueva Plantilla (Sistema Original)
          </a>
        )}
        
        {permissions.canFillTemplates && (
          <a
            href="/templates/index.html"
            target="_blank"
            style={{
              padding: "1rem 2rem",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            📝 Rellenar Plantilla (Sistema Original)
          </a>
        )}

        {permissions.canManageUsers && (
          <button
            style={{
              padding: "1rem 2rem",
              background: "#6f42c1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500"
            }}
            onClick={() => setSection("users")}
          >
            👥 Gestionar Usuarios
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [section, setSection] = useState("home");
  const { hasPermission } = useAuth();

  // Validar permisos y redirigir si es necesario
  React.useEffect(() => {
    if (section === "create" && !hasPermission('canCreateTemplates')) {
      setSection("home");
    }
    if (section === "users" && !hasPermission('canManageUsers')) {
      setSection("home");
    }
  }, [section, hasPermission]);

  return (
    <div>
      <Navbar setSection={setSection} section={section} />
      {section === "home" && <Home />}
      {section === "create" && hasPermission('canCreateTemplates') && <CrearPlantilla />}
      {section === "fill" && hasPermission('canFillTemplates') && <RellenarPlantilla />}
      {section === "users" && hasPermission('canManageUsers') && <ManageUsers />}
      
      {/* Mensaje de acceso denegado */}
      {((section === "create" && !hasPermission('canCreateTemplates')) ||
        (section === "fill" && !hasPermission('canFillTemplates')) ||
        (section === "users" && !hasPermission('canManageUsers'))) && (
        <div style={{ 
          padding: "2rem", 
          marginTop: "5rem", 
          textAlign: "center",
          maxWidth: "600px",
          margin: "5rem auto 2rem"
        }}>
          <div style={{
            background: "#f8d7da",
            padding: "2rem",
            borderRadius: "8px",
            border: "1px solid #f5c6cb"
          }}>
            <h2 style={{ color: "#721c24", marginBottom: "1rem" }}>
              Acceso Denegado
            </h2>
            <p style={{ color: "#721c24", marginBottom: "1.5rem" }}>
              No tienes permisos para acceder a esta sección.
            </p>
            <button
              onClick={() => setSection("home")}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}