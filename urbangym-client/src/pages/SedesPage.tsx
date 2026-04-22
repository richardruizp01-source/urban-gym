import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  hora_apertura: string;
  hora_cierre: string;
  esta_activa: boolean;
}

const SedesPage = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.getSedes();
        setSedes(Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

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
          NUESTRAS <span className="text-orange-500">SEDES</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sedes.length > 0 ? (
          sedes.map((sede) => {
            const ahora = new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota'
            });
            const abierta = sede.esta_activa && ahora >= sede.hora_apertura && ahora <= sede.hora_cierre;

            return (
              <div key={sede.id} className="group bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 hover:border-orange-500/40 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-black uppercase italic group-hover:text-orange-500">
                    {sede.nombre}
                  </h3>
                  <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${abierta ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {abierta ? 'ABIERTA' : 'CERRADA'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Dirección:</span>
                    <p className="text-[11px] font-bold text-white">{sede.direccion || 'Sin dirección'}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Apertura:</span>
                      <p className="text-[11px] font-bold text-green-400">{sede.hora_apertura || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Cierre:</span>
                      <p className="text-[11px] font-bold text-red-400">{sede.hora_cierre || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-[2rem]">
            <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.5em]">No hay sedes disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SedesPage;