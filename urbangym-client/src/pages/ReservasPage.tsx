import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

interface Sesion {
  id: string;
  nombre_clase: string;
  trainer_nombre: string;
  sede_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_total: number;
  cupos_disponibles: number;
}

const ReservasPage = () => {
  const { user, refreshUser } = useAuth();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [reservasUsuario, setReservasUsuario] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState<string | null>(null);

  // 👈 NUEVO: verificar si el socio puede reservar
  const membresiaVencida = user?.fecha_vencimiento ? new Date(user.fecha_vencimiento) < new Date() : false;
  const puedeReservar = user?.estado_membresia === 'ACTIVE' && !membresiaVencida;

  useEffect(() => {
    const cargar = async () => {
      try {
        await refreshUser(); // 👈 refresca datos antes de verificar membresía
        const res = await api.getInstancias();
        setSesiones(Array.isArray(res.data) ? res.data : []);

        // Traer reservas del usuario para saber cuáles ya reservó
        if (user?.id) {
          const resReservas = await api.getReservasBySocio(user.id);
          const data = resReservas.data?.data || resReservas.data || [];
          // Guardamos los clase_instancia_id que ya tiene reservados y confirmados
          const idsReservados = data
            .filter((r: any) => r.estado === 'CONFIRMED')
            .map((r: any) => r.clase_instancia_id);
          setReservasUsuario(idsReservados);
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
    // 👈 NUEVO: bloquear si no ha pagado
    if (!puedeReservar) {
      alert('⚠️ Tu membresía no está activa. Realiza tu pago para poder reservar clases.');
      return;
    }
    setReservando(sesion.id);
    try {
      await api.crearReserva({
        socio_id: user.id,
        clase_instancia_id: sesion.id,
      });
      // Agregar al estado local para bloquear el botón inmediatamente
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
      hour: '2-digit', minute: '2-digit', hour12: true
    }).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="mb-10">
        <Link to="/dashboard" className="group flex items-center gap-3 text-zinc-500 hover:text-orange-500 transition-all">
          <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-xl">←</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Dashboard</span>
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
          MIS <span className="text-orange-500">RESERVAS</span>
        </h1>
      </div>

      {/* 👈 NUEVO: banner de aviso si no puede reservar */}
      {!puedeReservar && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-[1.5rem] p-6 flex items-center gap-4">
          <span className="text-3xl">🔒</span>
          <div>
            <p className="text-red-400 font-black uppercase tracking-widest text-xs">Membresía inactiva</p>
            <p className="text-zinc-400 text-sm mt-1">No puedes reservar clases hasta que realices tu pago y tu membresía esté activa.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sesiones.length > 0 ? (
          sesiones.map((sesion) => {
            const ahora = new Date();
            const inicio = new Date(sesion.fecha_inicio);
            const fin = new Date(sesion.fecha_fin);
            const estaActiva = ahora >= inicio && ahora <= fin;
            const finalizada = ahora > fin;
            const yaReservo = reservasUsuario.includes(sesion.id);

            return (
              <div key={sesion.id} className="group bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 hover:border-orange-500/40 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-black uppercase italic group-hover:text-orange-500">
                    {sesion.nombre_clase}
                  </h3>
                  <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${estaActiva ? 'bg-orange-500/20 text-orange-500' : finalizada ? 'bg-zinc-700/40 text-zinc-500' : 'bg-blue-500/20 text-blue-400'}`}>
                    {estaActiva ? 'ACTIVA' : finalizada ? 'FINALIZADA' : 'PRÓXIMA'}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Estratega:</span>
                    <p className="text-[11px] font-bold text-white italic">{sesion.trainer_nombre}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Sede:</span>
                    <p className="text-[11px] font-bold text-white">{sesion.sede_nombre}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Cupos:</span>
                    <p className="text-[11px] font-bold text-white">
                      <span className="text-orange-500">{sesion.cupos_disponibles}</span> / {sesion.capacidad_total}
                    </p>
                  </div>
                  <div className="border-t border-zinc-800/60 pt-3">
                    <p className="text-[10px] font-bold text-white">{formatFecha(sesion.fecha_inicio)}</p>
                    <p className="text-[10px] font-bold text-zinc-400">{formatFecha(sesion.fecha_fin)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleReservar(sesion)}
                  disabled={!!reservando || finalizada || sesion.cupos_disponibles === 0 || yaReservo || !puedeReservar}
                  className={`w-full font-black text-[9px] py-3 rounded-2xl uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed ${
                    !puedeReservar
                      ? 'bg-red-950/40 text-red-400 border border-red-900/40 cursor-not-allowed'
                      : yaReservo
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                      : 'bg-orange-500 text-black hover:scale-105 disabled:opacity-40'
                  }`}
                >
                  {reservando === sesion.id
                    ? 'Reservando...'
                    : finalizada
                    ? 'Finalizada'
                    : sesion.cupos_disponibles === 0
                    ? 'Sin Cupos'
                    : !puedeReservar
                    ? '🔒 Primero paga'
                    : yaReservo
                    ? '🔒 Ya Reservado'
                    : 'Reservar'}
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
  );
};

export default ReservasPage;