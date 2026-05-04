import React from 'react';

export default function Login() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,64,0.09)',
        background: '#fff',
        minWidth: 320,
        gap: 16
      }}>
        <h2 style={{ color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>Iniciar sesión</h2>
        <label style={{ color: '#222', fontWeight: 500 }}>Usuario</label>
        <input type="text" placeholder="Usuario" style={{ padding: 8, border: '1px solid #1976d2', borderRadius: 4 }} />
        <label style={{ color: '#222', fontWeight: 500 }}>Contraseña</label>
        <input type="password" placeholder="Contraseña" style={{ padding: 8, border: '1px solid #1976d2', borderRadius: 4 }} />
        <button style={{ marginTop: 24, background: '#1976d2', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}
