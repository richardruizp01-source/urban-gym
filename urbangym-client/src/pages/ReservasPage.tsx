import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

interface Reserva {
  id: string;
  clase_instancia_id: string;
  estado: string;
  nombre_clase?: string;
  trainer_nombre?: string;
  sede_nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  capacidad_total?: number;
  cupos_disponibles?: number;
}

const ReservasPage = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (!user?.id) return;
      try {
const res = await api.getReservasBySocio(user.id);
const data = res.data?.data || res.data || [];
const confirmadas = data.map((r: any) => ({
  id: r.id,
  clase_instancia_id: r.clase_instancia_id,
  estado: r.estado,
  nombre_clase: r.clases_instancia?.nombre_clase,
  trainer_nombre: r.clases_instancia?.trainer_nombre,
  sede_nombre: r.clases_instancia?.sede_nombre,
  fecha_inicio: r.clases_instancia?.fecha_inicio,
  fecha_fin: r.clases_instancia?.fecha_fin,
  capacidad_total: r.clases_instancia?.capacidad_total,
  cupos_disponibles: r.clases_instancia?.cupos_disponibles,
}));
setReservas(confirmadas);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).toUpperCase();
  };

  const getEstado = (fecha_inicio?: string, fecha_fin?: string) => {
    if (!fecha_inicio || !fecha_fin) return 'PROXIMA';
    const ahora = new Date();
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    if (ahora >= inicio && ahora <= fin) return 'ACTIVA';
    if (ahora > fin) return 'FINALIZADA';
    return 'PROXIMA';
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
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
              MIS <span className="text-orange-500">RESERVAS</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
              {reservas.length} clase{reservas.length !== 1 ? 's' : ''} reservada{reservas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/clases"
            className="bg-orange-500 text-black font-black text-[9px] px-5 py-3 rounded-2xl uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            + Reservar Clase
          </Link>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reservas.length > 0 ? (
            reservas.map(reserva => {
              const estado = getEstado(reserva.fecha_inicio, reserva.fecha_fin);
              return (
                <div
                  key={reserva.id}
                  className={`group bg-zinc-900/20 border rounded-[2rem] p-8 transition-all backdrop-blur-xl relative overflow-hidden ${
                    estado === 'FINALIZADA'
                      ? 'border-zinc-800/30 opacity-60'
                      : 'border-zinc-800/50 hover:border-orange-500/40'
                  }`}
                >
                  {estado === 'ACTIVA' && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-orange-300 to-transparent rounded-t-[2rem]" />
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black uppercase italic group-hover:text-orange-500 transition-colors leading-none">
                      {reserva.nombre_clase || 'Clase Reservada'}
                    </h3>
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${
                      estado === 'ACTIVA'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : estado === 'FINALIZADA'
                        ? 'bg-zinc-700/40 text-zinc-500 border-zinc-700'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {estado === 'ACTIVA' ? '● EN CURSO' : estado === 'FINALIZADA' ? '✓ FINALIZADA' : '◎ PRÓXIMA'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {reserva.trainer_nombre && (
                      <div>
                        <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Entrenador</span>
                        <p className="text-[11px] font-bold text-white italic">{reserva.trainer_nombre}</p>
                      </div>
                    )}
                    {reserva.sede_nombre && (
                      <div>
                        <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Sede</span>
                        <p className="text-[11px] font-bold text-white">{reserva.sede_nombre}</p>
                      </div>
                    )}
                    <div className="border-t border-zinc-800/60 pt-3">
                      <p className="text-[10px] font-bold text-white">{formatFecha(reserva.fecha_inicio)}</p>
                      <p className="text-[10px] font-bold text-zinc-400">{formatFecha(reserva.fecha_fin)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600">
                    <div className="h-[1px] w-4 bg-current" />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      Reserva #{reserva.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-[2rem]">
              <p className="text-zinc-500 font-black text-sm uppercase tracking-[0.3em] mb-4">No tienes reservas aún</p>
              <Link
                to="/clases"
                className="inline-block bg-orange-500 text-black font-black text-[9px] px-6 py-3 rounded-2xl uppercase tracking-[0.2em] hover:scale-105 transition-transform"
              >
                Ver Clases Disponibles →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservasPage;