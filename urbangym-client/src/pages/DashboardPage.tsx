import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = [
    { label: 'Mis Reservas', sub: 'Clases disponibles', icon: '🥊', path: '/reservas', color: 'from-orange-500/20 to-transparent', border: 'hover:border-orange-500/60', glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]' },
    { label: 'Máquinas', sub: 'Estado por sede', icon: '🏋️', path: '/maquinas', color: 'from-blue-500/20 to-transparent', border: 'hover:border-blue-500/60', glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]' },
    { label: 'Sedes', sub: 'Horarios y ubicación', icon: '📍', path: '/sedes', color: 'from-green-500/20 to-transparent', border: 'hover:border-green-500/60', glow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]' },
    { label: 'Mis Pagos', sub: 'Historial de membresía', icon: '💳', path: '/pagos', color: 'from-purple-500/20 to-transparent', border: 'hover:border-purple-500/60', glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]' },
    { label: 'Acceso QR', sub: 'Entrada y salida', icon: '📱', path: '/qr', color: 'from-red-500/20 to-transparent', border: 'hover:border-red-500/60', glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]' },
  ];

  const hora = time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const fecha = time.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 overflow-hidden relative">

      {/* FONDO ANIMADO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-white/2 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            {/* LOGO ANIMADO */}
            <div className="relative mb-2">
              <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none select-none">
                <span className="text-white">URBAN</span>
                <span className="text-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,1)] animate-pulse">GYM</span>
              </h1>
              <div className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-orange-500 via-white/20 to-transparent" />
            </div>

            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">
              Bienvenido, <span className="text-orange-400">{user?.nombre}</span>
            </p>

            {/* RELOJ EN VIVO */}
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-3 backdrop-blur">
                <p className="text-2xl font-black tracking-widest text-white tabular-nums">{hora}</p>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{fecha}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping inline-block" />
                <span className="text-green-500 text-[9px] font-black uppercase tracking-widest">Sistemas Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-black text-[9px] px-6 py-3 rounded-2xl uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {menu.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              style={{ animationDelay: `${i * 80}ms` }}
              className={`group relative bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 transition-all duration-300 backdrop-blur-xl overflow-hidden ${item.border} ${item.glow}`}
            >
              {/* GLOW DE FONDO EN HOVER */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]`} />

              {/* NÚMERO DE ORDEN */}
              <span className="absolute top-6 right-8 text-[10px] font-black text-zinc-700 group-hover:text-zinc-500 transition-colors">
                0{i + 1}
              </span>

              <div className="relative z-10">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black uppercase italic group-hover:text-orange-500 transition-colors leading-none mb-2">
                  {item.label}
                </h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  {item.sub}
                </p>

                {/* FLECHA ANIMADA */}
                <div className="mt-6 flex items-center gap-2 text-zinc-700 group-hover:text-orange-500 transition-all group-hover:gap-3">
                  <div className="h-[1px] w-6 bg-current" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Entrar</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-12 flex items-center justify-between border-t border-zinc-900 pt-6">
          <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Urban Gym © 2026</p>
          <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Sistema v2.0 — Microservicios</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;