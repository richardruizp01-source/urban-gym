import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: saveAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.login({ email, password });
      const { token, user } = response.data;
      if (user.rol !== 'TRAINER' && user.rol !== 'ADMIN') {
        setError('ACCESO RESTRINGIDO AL STAFF');
        setLoading(false);
        return;
      }
      saveAuthData(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Revisa el correo y la clave.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      color: 'white'
    }}>

      {/* Luces de fondo */}
      <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '40px',
        padding: '3rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'white',
              borderRadius: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(255,255,255,0.15)'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="black">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div style={{
              position: 'absolute', top: '-8px', right: '-8px',
              background: '#2563eb', borderRadius: '50%',
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #050505'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M6.5 2h11L20 7l-8 15L4 7l2.5-5z"/>
              </svg>
            </div>
          </div>

          <h1 style={{
            fontSize: '2.8rem', fontWeight: '900',
            fontStyle: 'italic', letterSpacing: '-2px',
            textAlign: 'center', lineHeight: '1', textTransform: 'uppercase',
            margin: '0 0 0.5rem'
          }}>
            URBAN <br />
            <span style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              STAFF
            </span>
          </h1>
          <p style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.4em', color: '#4b5563', textTransform: 'uppercase', fontStyle: 'italic' }}>
            Panel de Entrenadores
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '1.5rem', padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px', color: '#f87171', fontSize: '0.75rem', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <label style={{
              position: 'absolute', top: '-10px', left: '20px',
              padding: '0 8px', background: '#080808',
              fontSize: '0.6rem', fontWeight: '900', color: '#3b82f6',
              textTransform: 'uppercase', letterSpacing: '0.3em', fontStyle: 'italic', zIndex: 1
            }}>Email Profesional</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '1.2rem', color: '#4b5563' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@urbangym.com"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                  padding: '1rem 1rem 1rem 3rem', color: 'white', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <label style={{
              position: 'absolute', top: '-10px', left: '20px',
              padding: '0 8px', background: '#080808',
              fontSize: '0.6rem', fontWeight: '900', color: '#3b82f6',
              textTransform: 'uppercase', letterSpacing: '0.3em', fontStyle: 'italic', zIndex: 1
            }}>Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '1.2rem', color: '#4b5563' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                  padding: '1rem 3rem 1rem 3rem', color: 'white', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: '1.2rem', background: 'none',
                border: 'none', cursor: 'pointer', color: '#4b5563', padding: 0
              }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', background: 'white',
              border: 'none', borderRadius: '16px',
              padding: '1.2rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '900', fontSize: '0.75rem', letterSpacing: '0.3em',
              textTransform: 'uppercase', fontStyle: 'italic',
              opacity: loading ? 0.6 : 1, transition: 'all 0.3s',
              color: 'black'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #2563eb, #06b6d4)';
                (e.target as HTMLButtonElement).style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'white';
              (e.target as HTMLButtonElement).style.color = 'black';
            }}
          >
            {loading ? 'Autorizando...' : 'Entrar al Panel'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', color: '#374151', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
            Urban Gym Staff © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;