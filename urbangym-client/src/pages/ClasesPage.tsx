import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

interface Sesion {
  id: string;
  nombre_clase: string;
  trainer_nombre: string;
  sede_nombre: string;
  sede_esta_activa: boolean; // 👈 NUEVO
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_total: number;
  cupos_disponibles: number;
  descripcion?: string;
}

const ClasesPage = () => {
  const { user, refreshUser } = useAuth();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [reservasUsuario, setReservasUsuario] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'TODAS' | 'PROXIMA' | 'ACTIVA'>('TODAS');

  const membresiaVencida = user?.fecha_vencimiento
    ? new Date(user.fecha_vencimiento) < new Date()
    : false;
  const puedeReservar = user?.estado_membresia === 'ACTIVE' && !membresiaVencida;

  useEffect(() => {
    const cargar = async () => {
      try {
        await refreshUser();
        const res = await api.getInstancias();
        const todas = Array.isArray(res.data) ? res.data : [];
        setSesiones(todas.filter((s: Sesion) => s.sede_esta_activa !== false)); // 👈 NUEVO
        if (user?.id) {
          const resReservas = await api.getReservasBySocio(user.id);
          const data = resReservas.data?.data || resReservas.data || [];
          const ids = data
            .filter((r: any) => r.estado === 'CONFIRMED')
            .map((r: any) => r.clase_instancia_id);
          setReservasUsuario(ids);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  const handleReservar = async (sesion: Sesion) => {
    if (!user) return;
    if (!puedeReservar) {
      alert('⚠️ Tu membresía no está activa. Realiza tu pago para poder reservar.');
      return;
    }
    setReservando(sesion.id);
    try {
      await api.crearReserva({ socio_id: user.id, clase_instancia_id: sesion.id });
      setReservasUsuario(prev => [...prev, sesion.id]);
      alert('✅ Reserva confirmada');
    } catch (err: any) {
      alert('❌ Error: ' + err.response?.data?.error);
    } finally {
      setReservando(null);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).toUpperCase();

  const getEstado = (sesion: Sesion) => {
    const ahora = new Date();
    const inicio = new Date(sesion.fecha_inicio);
    const fin = new Date(sesion.fecha_fin);
    if (ahora >= inicio && ahora <= fin) return 'ACTIVA';
    if (ahora > fin) return 'FINALIZADA';
    return 'PROXIMA';
  };

  const sesionesConEstado = sesiones.map(s => ({ ...s, estadoTemporal: getEstado(s) }));

  const filtradas = filtro === 'TODAS'
    ? sesionesConEstado.filter(s => s.estadoTemporal !== 'FINALIZADA')
    : sesionesConEstado.filter(s => s.estadoTemporal === filtro);

  const conteo = {
    TODAS: sesionesConEstado.filter(s => s.estadoTemporal !== 'FINALIZADA').length,
    PROXIMA: sesionesConEstado.filter(s => s.estadoTemporal === 'PROXIMA').length,
    ACTIVA: sesionesConEstado.filter(s => s.estadoTemporal === 'ACTIVA').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">

      {/* FONDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* BACK */}
        <div className="mb-10">
          <Link to="/dashboard" className="group flex items-center gap-3 text-zinc-500 hover:text-orange-500 transition-all">
            <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
              <span className="text-xl">←</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Regresar</span>
          </Link>
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            CLASES <span className="text-orange-500">DISPONIBLES</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
            {conteo.TODAS} clases activas · {conteo.ACTIVA} en curso ahora · {conteo.PROXIMA} próximas
          </p>
        </div>

        {/* BANNER MEMBRESÍA */}
        {!puedeReservar && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-[1.5rem] p-6 flex items-center gap-4">
            <span className="text-3xl">🔒</span>
            <div>
              <p className="text-red-400 font-black uppercase tracking-widest text-xs">Membresía inactiva</p>
              <p className="text-zinc-400 text-sm mt-1">Activa tu membresía para reservar clases.</p>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {([
            { key: 'TODAS', label: 'Todas', count: conteo.TODAS },
            { key: 'ACTIVA', label: 'En Curso', count: conteo.ACTIVA },
            { key: 'PROXIMA', label: 'Próximas', count: conteo.PROXIMA },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                filtro === f.key
                  ? 'bg-orange-500 text-black border-orange-500'
                  : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-orange-500'
              }`}
            >
              {f.label}
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${filtro === f.key ? 'bg-black/20' : 'bg-zinc-800'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtradas.length > 0 ? (
            filtradas.map(sesion => {
              const yaReservo = reservasUsuario.includes(sesion.id);
              const estaActiva = sesion.estadoTemporal === 'ACTIVA';

              return (
                <div
                  key={sesion.id}
                  className="group bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 hover:border-orange-500/40 transition-all backdrop-blur-xl relative overflow-hidden"
                >
                  {estaActiva && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-orange-300 to-transparent rounded-t-[2rem]" />
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black uppercase italic group-hover:text-orange-500 transition-colors leading-none">
                      {sesion.nombre_clase}
                    </h3>
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${
                      estaActiva
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {estaActiva ? '● EN CURSO' : '◎ PRÓXIMA'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Entrenador</span>
                      <p className="text-[11px] font-bold text-white italic">{sesion.trainer_nombre}</p>
                    </div>
                    <div>
                      <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Sede</span>
                      <p className="text-[11px] font-bold text-white">{sesion.sede_nombre}</p>
                    </div>

                    {/* 👈 NUEVO: Descripcion */}
                    {sesion.descripcion && (
                      <div>
                        <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Descripción</span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed mt-1">{sesion.descripcion}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Cupos</span>
                        <p className="text-[11px] font-bold text-white">
                          <span className={sesion.cupos_disponibles === 0 ? 'text-red-400' : 'text-orange-500'}>
                            {sesion.cupos_disponibles}
                          </span>
                          {' '}/ {sesion.capacidad_total}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${((sesion.capacidad_total - sesion.cupos_disponibles) / sesion.capacidad_total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-zinc-800/60 pt-3">
                      <p className="text-[10px] font-bold text-white">{formatFecha(sesion.fecha_inicio)}</p>
                      <p className="text-[10px] font-bold text-zinc-400">{formatFecha(sesion.fecha_fin)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReservar(sesion)}
                    disabled={!!reservando || sesion.cupos_disponibles === 0 || yaReservo || !puedeReservar}
                    className={`w-full font-black text-[9px] py-3 rounded-2xl uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed ${
                      !puedeReservar
                        ? 'bg-red-950/40 text-red-400 border border-red-900/40'
                        : yaReservo
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : sesion.cupos_disponibles === 0
                        ? 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                        : 'bg-orange-500 text-black hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                    }`}
                  >
                    {reservando === sesion.id
                      ? 'Reservando...'
                      : sesion.cupos_disponibles === 0
                      ? 'Sin Cupos'
                      : !puedeReservar
                      ? '🔒 Activa tu membresía'
                      : yaReservo
                      ? '✓ Ya Reservado'
                      : 'Reservar Clase'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-[2rem]">
              <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.5em]">No hay clases disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClasesPage;