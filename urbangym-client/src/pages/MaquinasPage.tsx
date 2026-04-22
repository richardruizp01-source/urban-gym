import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

interface Maquina {
  id: string;
  nombre: string;
  estado: string;
  area: string;
  marca: string;
  sede_id: string;
}

interface Sede {
  id: string;
  nombre: string;
}

const MaquinasPage = () => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODAS');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resMaquinas, resSedes] = await Promise.all([
          api.getMaquinas(),
          api.getSedes()
        ]);
        setMaquinas(Array.isArray(resMaquinas.data?.data) ? resMaquinas.data.data : []);
        setSedes(Array.isArray(resSedes.data?.data) ? resSedes.data.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const getNombreSede = (sede_id: string) =>
    sedes.find(s => s.id === sede_id)?.nombre || 'N/A';

  const filtradas = filtro === 'TODAS' ? maquinas : maquinas.filter(m => m.estado === filtro);

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'OPERATIVO':
        return { color: 'bg-green-500/20 text-green-400 border border-green-500/30', icon: '✅', label: 'DISPONIBLE' };
      case 'MANTENIMIENTO':
        return { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: '🔧', label: 'MANTENIMIENTO' };
      case 'FUERA_DE_SERVICIO':
        return { color: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: '🚫', label: 'FUERA DE SERVICIO' };
      default:
        return { color: 'bg-zinc-700/40 text-zinc-500 border border-zinc-700', icon: '❓', label: estado };
    }
  };

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'CARDIO': return '🏃';
      case 'MUSCULACION': return '💪';
      case 'FUNCIONAL': return '⚡';
      case 'BOXEO': return '🥊';
      default: return '🏋️';
    }
  };

  const conteo = {
    TODAS: maquinas.length,
    OPERATIVO: maquinas.filter(m => m.estado === 'OPERATIVO').length,
    MANTENIMIENTO: maquinas.filter(m => m.estado === 'MANTENIMIENTO').length,
    FUERA_DE_SERVICIO: maquinas.filter(m => m.estado === 'FUERA_DE_SERVICIO').length,
  };

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
          MÁQUINAS <span className="text-orange-500">DISPONIBLES</span>
        </h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
          {conteo.TODAS} máquinas registradas · {conteo.OPERATIVO} operativas · {conteo.MANTENIMIENTO} en mantenimiento
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { key: 'TODAS', label: 'TODAS', count: conteo.TODAS },
          { key: 'OPERATIVO', label: 'DISPONIBLE', count: conteo.OPERATIVO },
          { key: 'MANTENIMIENTO', label: 'MANTENIMIENTO', count: conteo.MANTENIMIENTO },
          { key: 'FUERA_DE_SERVICIO', label: 'FUERA DE SERVICIO', count: conteo.FUERA_DE_SERVICIO },
        ].map((f) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtradas.length > 0 ? (
          filtradas.map((maquina) => {
            const estadoConfig = getEstadoConfig(maquina.estado);
            return (
              <div
                key={maquina.id}
                className={`group bg-zinc-900/20 border rounded-[2rem] p-8 transition-all ${
                  maquina.estado === 'OPERATIVO'
                    ? 'border-zinc-800/50 hover:border-orange-500/40'
                    : maquina.estado === 'MANTENIMIENTO'
                    ? 'border-yellow-500/20 opacity-80'
                    : 'border-red-500/20 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getAreaIcon(maquina.area)}</span>
                    <h3 className="text-xl font-black uppercase italic group-hover:text-orange-500 transition-colors">
                      {maquina.nombre}
                    </h3>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-6 ${estadoConfig.color}`}>
                  <span>{estadoConfig.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{estadoConfig.label}</span>
                </div>

                <div className="space-y-3">
                  {maquina.marca && (
                    <div>
                      <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Marca:</span>
                      <p className="text-[11px] font-bold text-white">{maquina.marca}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Área:</span>
                    <p className="text-[11px] font-bold text-white">{maquina.area || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Sede:</span>
                    <p className="text-[11px] font-bold text-white">{getNombreSede(maquina.sede_id)}</p>
                  </div>
                </div>

                {maquina.estado === 'MANTENIMIENTO' && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                    <p className="text-yellow-400 text-[8px] font-black uppercase tracking-widest">
                      🔧 Temporalmente fuera de uso
                    </p>
                  </div>
                )}
                {maquina.estado === 'FUERA_DE_SERVICIO' && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <p className="text-red-400 text-[8px] font-black uppercase tracking-widest">
                      🚫 No disponible
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-[2rem]">
            <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.5em]">No hay máquinas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaquinasPage;