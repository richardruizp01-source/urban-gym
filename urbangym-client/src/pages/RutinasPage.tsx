import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMisRutinas } from '../services/api';

const RutinasPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rutinaActiva, setRutinaActiva] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const cargar = async () => {
      try {
        console.log("🔍 USER:", user);
        const id = user?.id;
        console.log("🆔 ID:", id);
        const res = await getMisRutinas(id);
        console.log("💪 RUTINAS:", res.data);
        setRutinas(res.data.data || []);
      } catch (err: any) {
        console.error("❌ ERROR:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative">

      {/* FONDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-yellow-500 transition-colors mb-3 flex items-center gap-2"
            >
              ← Volver
            </button>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              <span className="text-white">MIS </span>
              <span className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]">RUTINAS</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Enviadas por tu coach
            </p>
          </div>
          <div className="text-right">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Total</p>
            <p className="text-4xl font-black text-yellow-500">{rutinas.length}</p>
          </div>
        </div>

        {/* CONTENIDO */}
        {loading ? (
          <p className="text-yellow-500 text-sm font-black uppercase tracking-widest animate-pulse">Cargando rutinas...</p>
        ) : rutinas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">💪</p>
            <p className="text-zinc-500 text-sm font-black uppercase tracking-widest">Tu coach aún no te ha enviado rutinas</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rutinas.map((rutina: any, i: number) => (
              <div
                key={rutina.id}
                className="bg-zinc-900/30 border border-zinc-800/50 rounded-[1.5rem] overflow-hidden backdrop-blur-xl hover:border-yellow-500/40 transition-all duration-300"
              >
                <div
                  className="flex items-center justify-between p-6 cursor-pointer"
                  onClick={() => setRutinaActiva(rutinaActiva?.id === rutina.id ? null : rutina)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 font-black text-sm">
                      {String(rutinas.length - i).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase italic text-lg leading-none">{rutina.objetivo}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Coach: {rutina.coach?.nombre || '—'} · {new Date(rutina.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 text-[10px] font-black uppercase">
                      {Array.isArray(rutina.contenido) ? rutina.contenido.length : 0} ejercicios
                    </span>
                    <span className="text-yellow-500 text-lg">
                      {rutinaActiva?.id === rutina.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {rutinaActiva?.id === rutina.id && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-zinc-800 pt-4">
                      <div className="rounded-xl overflow-hidden border border-zinc-800">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-zinc-900/60">
                              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ejercicio</th>
                              <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Series</th>
                              <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Reps</th>
                              <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Descanso</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(rutina.contenido) && rutina.contenido.map((ej: any, j: number) => (
                              <tr key={j} className="border-t border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                                <td className="px-4 py-3 font-bold text-sm text-white">{ej.nombre}</td>
                                <td className="px-4 py-3 text-center font-black text-yellow-500">{ej.series}</td>
                                <td className="px-4 py-3 text-center font-black text-white">{ej.reps}</td>
                                <td className="px-4 py-3 text-center text-zinc-400 text-sm">{ej.descanso}s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 border-t border-zinc-900 pt-6">
          <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Urban Gym © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default RutinasPage;