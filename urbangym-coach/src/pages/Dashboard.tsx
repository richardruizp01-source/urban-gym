import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyStudents, enviarRutina, getRutinasAlumno, eliminarRutina, getInstanciasByEntrenador } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlumno, setSelectedAlumno] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [vistaModal, setVistaModal] = useState<'info' | 'rutina' | 'historial'>('info');
  const [objetivo, setObjetivo] = useState('');
  const [ejercicios, setEjercicios] = useState<{ nombre: string; series: string; reps: string; descanso: string }[]>([]);
  const [nuevoEj, setNuevoEj] = useState({ nombre: '', series: '', reps: '', descanso: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [clases, setClases] = useState<any[]>([]);
  const [loadingClases, setLoadingClases] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const response = await getMyStudents();
        setAlumnos(response.data.data || []);
      } catch (error) {
        console.error("Error al sincronizar con el microservicio:", error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'alumnos') cargarDatos();
  }, [activeTab]);

  // 🆕 NUEVO
  useEffect(() => {
    const cargarClases = async () => {
      if (!user?.id) return;
      try {
        setLoadingClases(true);
        const response = await getInstanciasByEntrenador(user.id);
        setClases(response.data.data || []);
      } catch (error) {
        console.error("Error al cargar clases:", error);
      } finally {
        setLoadingClases(false);
      }
    };
    if (activeTab === 'clases') cargarClases();
  }, [activeTab, user]);

  useEffect(() => {
    if (vistaModal === 'historial' && selectedAlumno) {
      const cargarHistorial = async () => {
        try {
          setLoadingHistorial(true);
          const res = await getRutinasAlumno(selectedAlumno.id);
          setHistorial(res.data.data || []);
        } catch (error) {
          console.error("Error cargando historial:", error);
        } finally {
          setLoadingHistorial(false);
        }
      };
      cargarHistorial();
    }
  }, [vistaModal, selectedAlumno]);

  const handleGestionar = (alumno: any) => {
    setSelectedAlumno(alumno);
    setVistaModal('info');
    setEjercicios([]);
    setObjetivo('');
    setExito(false);
    setHistorial([]);
    setShowModal(true);
  };

  const handleAgregarEjercicio = () => {
    if (!nuevoEj.nombre) return;
    setEjercicios([...ejercicios, nuevoEj]);
    setNuevoEj({ nombre: '', series: '', reps: '', descanso: '' });
  };

  const handleEnviarRutina = async () => {
    if (!objetivo || ejercicios.length === 0) return;
    try {
      setEnviando(true);
      await enviarRutina(selectedAlumno.id, { contenido: ejercicios, objetivo });
      setExito(true);
      setEjercicios([]);
      setObjetivo('');
    } catch (error) {
      console.error("Error al enviar rutina:", error);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarRutina = async (rutina_id: string) => {
    try {
      await eliminarRutina(selectedAlumno.id, rutina_id);
      setHistorial(historial.filter(r => r.id !== rutina_id));
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: '⚡' },
    { id: 'alumnos', label: 'Alumnos', icon: '👥' },
    { id: 'clases', label: 'Clases', icon: '📅' },
    { id: 'nomina', label: 'Mi Nómina', icon: '💰' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <>
      {/* ── ESTILOS DE ANIMACIÓN ── */}
      <style>{`
        @keyframes aurora1 {
          0%   { transform: translate(0%, 0%) scale(1); opacity: 0.6; }
          33%  { transform: translate(8%, -12%) scale(1.15); opacity: 0.4; }
          66%  { transform: translate(-6%, 10%) scale(0.9); opacity: 0.7; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.6; }
        }
        @keyframes aurora2 {
          0%   { transform: translate(0%, 0%) scale(1); opacity: 0.5; }
          33%  { transform: translate(-10%, 8%) scale(1.2); opacity: 0.3; }
          66%  { transform: translate(12%, -6%) scale(0.85); opacity: 0.6; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.5; }
        }
        @keyframes aurora3 {
          0%   { transform: translate(0%, 0%) scale(1); opacity: 0.4; }
          50%  { transform: translate(6%, 14%) scale(1.1); opacity: 0.65; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.4; }
        }
        @keyframes aurora4 {
          0%   { transform: translate(0%, 0%) scale(1.1); opacity: 0.35; }
          40%  { transform: translate(-14%, -8%) scale(0.9); opacity: 0.55; }
          80%  { transform: translate(8%, 6%) scale(1.2); opacity: 0.3; }
          100% { transform: translate(0%, 0%) scale(1.1); opacity: 0.35; }
        }
        @keyframes gridShimmer {
          0%   { opacity: 0.03; }
          50%  { opacity: 0.07; }
          100% { opacity: 0.03; }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          50%       { transform: translateY(-24px) translateX(10px); opacity: 1; }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50%       { transform: translateY(18px) translateX(-14px); opacity: 0.8; }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          33%       { transform: translateY(-16px) translateX(8px); opacity: 0.9; }
          66%       { transform: translateY(12px) translateX(-6px); opacity: 0.3; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.15); }
          50%       { box-shadow: 0 0 40px rgba(59,130,246,0.35), 0 0 80px rgba(6,182,212,0.1); }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(255,255,255,0.06); }
          50%       { border-color: rgba(59,130,246,0.2); }
        }
        .sidebar-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }
        .card-hover-exotic {
          transition: all 0.3s ease;
          animation: borderPulse 5s ease-in-out infinite;
        }
        .card-hover-exotic:hover {
          transform: translateY(-2px);
        }
      `}</style>

      {/* ── FONDO EXÓTICO FIJO ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#030308' }}>

        {/* Capa base: gradiente radial profundo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0d1829 0%, #030308 70%)',
        }} />

        {/* Aurora blob 1 — azul eléctrico */}
        <div style={{
          position: 'absolute',
          top: '-10%', left: '10%',
          width: '55vw', height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'aurora1 14s ease-in-out infinite',
        }} />

        {/* Aurora blob 2 — cyan profundo */}
        <div style={{
          position: 'absolute',
          top: '20%', right: '-5%',
          width: '45vw', height: '45vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.35) 0%, rgba(14,165,233,0.15) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora2 18s ease-in-out infinite',
        }} />

        {/* Aurora blob 3 — violeta oscuro */}
        <div style={{
          position: 'absolute',
          bottom: '-5%', left: '30%',
          width: '50vw', height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'aurora3 22s ease-in-out infinite',
        }} />

        {/* Aurora blob 4 — teal sutil */}
        <div style={{
          position: 'absolute',
          top: '55%', left: '-8%',
          width: '40vw', height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)',
          filter: 'blur(75px)',
          animation: 'aurora4 16s ease-in-out infinite',
        }} />

        {/* Grid de neón */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridShimmer 6s ease-in-out infinite',
        }} />

        {/* Grid secundario más fino */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px',
        }} />

        {/* Partículas flotantes */}
        {[
          { top: '12%', left: '22%', size: 3, color: 'rgba(96,165,250,0.8)', anim: 'float1 7s ease-in-out infinite' },
          { top: '35%', left: '68%', size: 2, color: 'rgba(34,211,238,0.7)', anim: 'float2 9s ease-in-out infinite 1s' },
          { top: '60%', left: '15%', size: 2, color: 'rgba(167,139,250,0.6)', anim: 'float3 11s ease-in-out infinite 2s' },
          { top: '75%', left: '80%', size: 3, color: 'rgba(96,165,250,0.5)', anim: 'float1 8s ease-in-out infinite 3s' },
          { top: '20%', left: '85%', size: 2, color: 'rgba(52,211,153,0.6)', anim: 'float2 10s ease-in-out infinite 0.5s' },
          { top: '88%', left: '42%', size: 2, color: 'rgba(34,211,238,0.5)', anim: 'float3 12s ease-in-out infinite 1.5s' },
          { top: '48%', left: '50%', size: 4, color: 'rgba(59,130,246,0.4)', anim: 'float1 15s ease-in-out infinite 4s' },
          { top: '5%',  left: '55%', size: 2, color: 'rgba(167,139,250,0.5)', anim: 'float2 6s ease-in-out infinite 2.5s' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: p.top, left: p.left,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animation: p.anim,
          }} />
        ))}

        {/* Viñeta para profundidad */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 40%, rgba(3,3,8,0.7) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── CONTENIDO PRINCIPAL (igual que antes, sobre el fondo) ── */}
      <div style={{ minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif', display: 'flex', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <div className="sidebar-glow" style={{ width: '240px', minHeight: '100vh', background: 'rgba(3,3,8,0.75)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(59,130,246,0.12)', display: 'flex', flexDirection: 'column', padding: '2rem 1rem', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.5px', margin: 0 }}>URBAN<span style={{ color: '#3b82f6' }}>GYM</span></p>
              <p style={{ fontSize: '0.55rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Staff Panel</p>
            </div>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', background: activeTab === tab.id ? 'rgba(59,130,246,0.15)' : 'transparent', color: activeTab === tab.id ? '#3b82f6' : '#6b7280', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', textAlign: 'left', width: '100%', borderLeft: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent', transition: 'all 0.2s', boxShadow: activeTab === tab.id ? '0 0 20px rgba(59,130,246,0.1)' : 'none' }}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.1)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', boxShadow: '0 0 12px rgba(59,130,246,0.4)' }}>
                {user?.nombre?.charAt(0) || 'C'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>{user?.nombre || 'Coach'}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.rol || 'TRAINER'}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ marginLeft: '240px', flex: 1, padding: '2rem' }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-1px', margin: '0 0 0.25rem' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: 0 }}>
              Bienvenido, <span style={{ color: '#3b82f6', fontWeight: '700' }}>{user?.nombre}</span>
            </p>
          </div>

          {/* ── INICIO ── */}
          {activeTab === 'inicio' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Alumnos activos', value: alumnos.length || '—', icon: '👥', color: '#3b82f6', tab: 'alumnos' },
                  { label: 'Clases hoy', value: '—', icon: '📅', color: '#8b5cf6', tab: 'clases' },
                  { label: 'Mi Nómina', value: '—', icon: '💰', color: '#06b6d4', tab: 'nomina' },
                ].map((stat, i) => (
                  <div key={i} onClick={() => setActiveTab(stat.tab)} className="card-hover-exotic" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(3,3,8,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget.style.border = `1px solid ${stat.color}`); (e.currentTarget.style.boxShadow = `0 0 30px ${stat.color}22, inset 0 0 30px ${stat.color}08`); }}
                    onMouseLeave={e => { (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'); (e.currentTarget.style.boxShadow = 'none'); }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '1.8rem', fontWeight: '900', color: stat.color, textShadow: `0 0 20px ${stat.color}88` }}>{stat.value}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(3,3,8,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Actividad reciente</h3>
                <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Sincronizado con el servidor de Members.</p>
              </div>
            </div>
          )}

          {/* ── ALUMNOS ── */}
          {activeTab === 'alumnos' && (
            <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(3,3,8,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Mis alumnos asignados</h3>
              {loading ? (
                <p style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700' }}>CARGANDO ATLETAS...</p>
              ) : alumnos.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '1rem', fontSize: '0.7rem', color: '#4b5563', textTransform: 'uppercase' }}>Nombre</th>
                        <th style={{ padding: '1rem', fontSize: '0.7rem', color: '#4b5563', textTransform: 'uppercase' }}>Email</th>
                        <th style={{ padding: '1rem', fontSize: '0.7rem', color: '#4b5563', textTransform: 'uppercase' }}>Estado</th>
                        <th style={{ padding: '1rem', fontSize: '0.7rem', color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumnos.map((alumno: any) => (
                        <tr key={alumno.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>{alumno.nombre}</td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>{alumno.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: alumno.estado_membresia === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: alumno.estado_membresia === 'ACTIVE' ? '#22c55e' : '#f87171', border: '1px solid rgba(255,255,255,0.05)', fontWeight: '700' }}>{alumno.estado_membresia || 'INACTIVE'}</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button onClick={() => handleGestionar(alumno)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#3b82f6', border: 'none', color: 'white', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>GESTIONAR</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>No se encontraron alumnos en la base de datos.</p>
              )}
            </div>
          )}

          {activeTab === 'clases' && (
  <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(3,3,8,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <h3 style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Mis clases</h3>
    {loadingClases ? (
      <p style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700' }}>CARGANDO CLASES...</p>
    ) : clases.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {clases.map((clase: any) => (
          <div key={clase.id} style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'white' }}>{clase.nombre_clase}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{clase.sede_nombre}</p>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                {clase.cupos_disponibles}/{clase.capacidad_total} cupos
              </span>
            </div>
            {clase.descripcion && (
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.5' }}>{clase.descripcion}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                🕐 <span style={{ color: 'white', fontWeight: '600' }}>
                  {new Date(clase.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} — {new Date(clase.fecha_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                ⏱ <span style={{ color: 'white', fontWeight: '600' }}>
                  {new Date(clase.fecha_fin).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No tienes clases asignadas aún.</p>
    )}
  </div>
)}

          {/* ── NÓMINA ── */}
          {activeTab === 'nomina' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Total recibido', value: '$0', color: '#22c55e' },
                  { label: 'Último pago', value: '—', color: '#3b82f6' },
                  { label: 'Pagos pendientes', value: '0', color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(3,3,8,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '1.8rem', fontWeight: '900', color: stat.color, textShadow: `0 0 20px ${stat.color}66` }}>{stat.value}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(3,3,8,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Historial de pagos</h3>
                {[
                  { mes: 'Abril 2026', monto: '$1,500,000', estado: 'Pagado', fecha: '01/04/2026' },
                  { mes: 'Marzo 2026', monto: '$1,500,000', estado: 'Pagado', fecha: '01/03/2026' },
                  { mes: 'Febrero 2026', monto: '$1,500,000', estado: 'Pagado', fecha: '01/02/2026' },
                ].map((pago, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{pago.mes}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{pago.fecha}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: '900', fontSize: '1rem', color: '#22c55e', textShadow: '0 0 12px rgba(34,197,94,0.4)' }}>{pago.monto}</p>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>{pago.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PERFIL ── */}
          {activeTab === 'perfil' && (
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', maxWidth: '600px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,3,8,0.7)', backdropFilter: 'blur(20px)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '400px', height: '400px', background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />
              <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '300px', height: '300px', background: 'rgba(6,182,212,0.08)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />

              <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', border: '3px solid rgba(59,130,246,0.3)', boxShadow: '0 0 40px rgba(59,130,246,0.35)' }}>
                    {user?.nombre?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{user?.nombre}</h2>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.2rem 0.8rem', borderRadius: '20px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 0 10px rgba(59,130,246,0.2)' }}>{user?.rol}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Email', value: user?.email || '—', icon: '📧' },
                    { label: 'Rol', value: user?.rol || '—', icon: '🎯' },
                    { label: 'Estado', value: 'Activo', icon: '✅' },
                    { label: 'Alumnos asignados', value: alumnos.length || '—', icon: '👥' },
                    { label: 'Sede', value: user?.sede || '—', icon: '📍' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{item.icon} {item.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL DE GESTIÓN ── */}
          {showModal && selectedAlumno && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
              <div style={{ background: 'rgba(5,5,14,0.95)', backdropFilter: 'blur(20px)', width: '480px', borderRadius: '24px', border: '1px solid rgba(59,130,246,0.4)', padding: '2rem', position: 'relative', boxShadow: '0 0 60px rgba(59,130,246,0.2), 0 0 120px rgba(6,182,212,0.08)', maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#6b7280', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>

                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1.5rem', fontStyle: 'italic', color: '#3b82f6', textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>GESTIÓN DE TITÁN</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>👤</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{selectedAlumno.nombre}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#4b5563' }}>ID: {selectedAlumno.id?.slice(0, 8)}...</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {(['info', 'rutina', 'historial'] as const).map(tab => (
                    <button key={tab} onClick={() => setVistaModal(tab)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vistaModal === tab ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: vistaModal === tab ? 'white' : '#6b7280', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', boxShadow: vistaModal === tab ? '0 0 14px rgba(59,130,246,0.4)' : 'none' }}>
                      {tab === 'info' ? '📋 Ficha' : tab === 'rutina' ? '💪 Nueva' : '🗂️ Historial'}
                    </button>
                  ))}
                </div>

                {/* ── VISTA INFO ── */}
                {vistaModal === 'info' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Peso Actual</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>{selectedAlumno.ficha_tecnica?.pesoActual || '--'} <span style={{ fontSize: '0.7rem', color: '#4b5563' }}>kg</span></p>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Estatura</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>{selectedAlumno.ficha_tecnica?.estatura || '--'} <span style={{ fontSize: '0.7rem', color: '#4b5563' }}>m</span></p>
                    </div>
                    <div style={{ gridColumn: 'span 2', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Objetivo</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{selectedAlumno.ficha_tecnica?.objetivo || 'No definido'}</p>
                    </div>
                    {(selectedAlumno.ficha_tecnica?.fotoFrontal || selectedAlumno.ficha_tecnica?.fotoLateral || selectedAlumno.ficha_tecnica?.fotoEspalda) && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Archivo Visual</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                          {selectedAlumno.ficha_tecnica?.fotoFrontal && (
                            <img src={selectedAlumno.ficha_tecnica.fotoFrontal} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', aspectRatio: '3/4' }} />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedAlumno.ficha_tecnica?.fotoLateral && (
                              <img src={selectedAlumno.ficha_tecnica.fotoLateral} style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', aspectRatio: '1/1' }} />
                            )}
                            {selectedAlumno.ficha_tecnica?.fotoEspalda && (
                              <img src={selectedAlumno.ficha_tecnica.fotoEspalda} style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', aspectRatio: '1/1' }} />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── VISTA RUTINA ── */}
                {vistaModal === 'rutina' && (
                  <div>
                    {exito && (
                      <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>
                        ✅ ¡Rutina enviada exitosamente!
                      </div>
                    )}
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Objetivo de la rutina</p>
                      <input value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="Ej: Hipertrofia tren superior" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Agregar ejercicio</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      {[{ key: 'nombre', placeholder: 'Ejercicio' }, { key: 'series', placeholder: 'Series' }, { key: 'reps', placeholder: 'Reps' }, { key: 'descanso', placeholder: 'Desc.' }].map(({ key, placeholder }) => (
                        <input key={key} value={(nuevoEj as any)[key]} onChange={e => setNuevoEj({ ...nuevoEj, [key]: e.target.value })} placeholder={placeholder} style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem' }} />
                      ))}
                    </div>
                    <button onClick={handleAgregarEjercicio} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', marginBottom: '1rem' }}>+ AGREGAR</button>
                    {ejercicios.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        {ejercicios.map((ej, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '0.3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{ej.nombre}</span>
                            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{ej.series}x{ej.reps} — {ej.descanso}s</span>
                            <button onClick={() => setEjercicios(ejercicios.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={handleEnviarRutina} disabled={enviando || !objetivo || ejercicios.length === 0} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: enviando || !objetivo || ejercicios.length === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #3b82f6, #2563eb)', border: 'none', color: enviando || !objetivo || ejercicios.length === 0 ? '#4b5563' : 'white', fontWeight: '800', cursor: enviando || !objetivo || ejercicios.length === 0 ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: (!enviando && objetivo && ejercicios.length > 0) ? '0 0 20px rgba(59,130,246,0.4)' : 'none' }}>
                      {enviando ? 'ENVIANDO...' : 'ENVIAR RUTINA AL ALUMNO'}
                    </button>
                  </div>
                )}

                {/* ── VISTA HISTORIAL ── */}
                {vistaModal === 'historial' && (
                  <div>
                    {loadingHistorial ? (
                      <p style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700' }}>CARGANDO...</p>
                    ) : historial.length === 0 ? (
                      <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No hay rutinas enviadas aún.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {historial.map((rutina: any) => (
                          <div key={rutina.id} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div>
                                <p style={{ margin: 0, fontWeight: '800', fontSize: '0.9rem', color: 'white' }}>{rutina.objetivo}</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#4b5563' }}>
                                  {new Date(rutina.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {Array.isArray(rutina.contenido) ? rutina.contenido.length : 0} ejercicios
                                </p>
                              </div>
                              <button onClick={() => handleEliminarRutina(rutina.id)} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}>🗑️ ELIMINAR</button>
                            </div>
                            {Array.isArray(rutina.contenido) && rutina.contenido.map((ej: any, j: number) => (
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', marginTop: '0.3rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{ej.nombre}</span>
                                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{ej.series}x{ej.reps} — {ej.descanso}s</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;