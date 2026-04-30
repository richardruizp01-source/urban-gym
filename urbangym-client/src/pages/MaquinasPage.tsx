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
  esta_activa: boolean; // 👈 NUEVO
}

const MaquinasPage = () => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODAS');
  const [sedeActiva, setSedeActiva] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resMaquinas, resSedes] = await Promise.all([
          api.getMaquinas(),
          api.getSedes()
        ]);
        const maquinasData = Array.isArray(resMaquinas.data?.data) ? resMaquinas.data.data : [];
        const sedesData = Array.isArray(resSedes.data?.data) ? resSedes.data.data : [];
        const sedesActivas = sedesData.filter((s: Sede) => s.esta_activa !== false); // 👈 NUEVO
        setMaquinas(maquinasData);
        setSedes(sedesActivas); // 👈 NUEVO
        if (sedesActivas.length > 0) setSedeActiva(sedesActivas[0].id); // 👈 NUEVO
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

  // Agrupar por sede
  const maquinasPorSede = sedes.map(sede => ({
    sede,
    maquinas: filtradas.filter(m => m.sede_id === sede.id)
  })).filter(g => g.maquinas.length > 0);

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'OPERATIVO':
        return { color: 'bg-green-500/20 text-green-400 border border-green-500/30', icon: '✅', label: 'DISPONIBLE', dot: 'bg-green-400' };
      case 'MANTENIMIENTO':
        return { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: '🔧', label: 'MANTENIMIENTO', dot: 'bg-yellow-400' };
      case 'FUERA_DE_SERVICIO':
        return { color: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: '🚫', label: 'FUERA DE SERVICIO', dot: 'bg-red-400' };
      default:
        return { color: 'bg-zinc-700/40 text-zinc-500 border border-zinc-700', icon: '❓', label: estado, dot: 'bg-zinc-500' };
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

  const getSedeIndex = (sedeId: string) => sedes.findIndex(s => s.id === sedeId);

  const sedeColors = [
    { accent: 'from-orange-500 to-orange-700', border: 'border-orange-500/40', glow: 'shadow-[0_0_40px_rgba(249,115,22,0.15)]', tab: 'bg-orange-500 text-black' },
    { accent: 'from-blue-500 to-blue-700', border: 'border-blue-500/40', glow: 'shadow-[0_0_40px_rgba(59,130,246,0.15)]', tab: 'bg-blue-500 text-white' },
    { accent: 'from-purple-500 to-purple-700', border: 'border-purple-500/40', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.15)]', tab: 'bg-purple-500 text-white' },
    { accent: 'from-emerald-500 to-emerald-700', border: 'border-emerald-500/40', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]', tab: 'bg-emerald-500 text-white' },
  ];

  const conteo = {
    TODAS: maquinas.length,
    OPERATIVO: maquinas.filter(m => m.estado === 'OPERATIVO').length,
    MANTENIMIENTO: maquinas.filter(m => m.estado === 'MANTENIMIENTO').length,
    FUERA_DE_SERVICIO: maquinas.filter(m => m.estado === 'FUERA_DE_SERVICIO').length,
  };

  const sedeActivaData = sedes.find(s => s.id === sedeActiva);
  const maquinasSedeActiva = sedeActiva
    ? filtradas.filter(m => m.sede_id === sedeActiva)
    : filtradas;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">

      {/* FONDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/4 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/4 rounded-full blur-[120px]" />
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
            MÁQUINAS <span className="text-orange-500">DISPONIBLES</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
            {conteo.TODAS} máquinas registradas · {conteo.OPERATIVO} operativas · {conteo.MANTENIMIENTO} en mantenimiento
          </p>
        </div>

        {/* FILTROS DE ESTADO */}
        <div className="flex flex-wrap gap-3 mb-10">
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* TABS DE SEDES */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
              {sedes.map((sede, i) => {
                const color = sedeColors[i % sedeColors.length];
                const cantMaquinas = filtradas.filter(m => m.sede_id === sede.id).length;
                const isActive = sedeActiva === sede.id;
                return (
                  <button
                    key={sede.id}
                    onClick={() => setSedeActiva(sede.id)}
                    className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${
                      isActive
                        ? `${color.tab} ${color.border} ${color.glow}`
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-current animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      {sede.nombre}
                    </span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20' : 'bg-zinc-800 text-zinc-500'}`}>
                      {cantMaquinas}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CONTENIDO DE LA SEDE ACTIVA */}
            {sedeActivaData && (
              <div>
                {/* HEADER DE SEDE */}
                {(() => {
                  const i = getSedeIndex(sedeActivaData.id);
                  const color = sedeColors[i % sedeColors.length];
                  return (
                    <div className={`mb-8 p-6 rounded-[2rem] border ${color.border} bg-zinc-900/20 ${color.glow} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${color.accent}`} />
                        <div>
                          <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.4em]">Sede</p>
                          <h2 className="text-3xl font-black uppercase italic">{sedeActivaData.nombre}</h2>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Máquinas</p>
                        <p className="text-4xl font-black text-orange-500">{maquinasSedeActiva.length}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* GRID DE MÁQUINAS */}
                {maquinasSedeActiva.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {maquinasSedeActiva.map((maquina) => {
                      const estadoConfig = getEstadoConfig(maquina.estado);
                      return (
                        <div
                          key={maquina.id}
                          className={`group bg-zinc-900/20 border rounded-[2rem] p-8 transition-all relative overflow-hidden ${
                            maquina.estado === 'OPERATIVO'
                              ? 'border-zinc-800/50 hover:border-orange-500/40'
                              : maquina.estado === 'MANTENIMIENTO'
                              ? 'border-yellow-500/20 opacity-80'
                              : 'border-red-500/20 opacity-60'
                          }`}
                        >
                          {/* Dot indicador arriba */}
                          <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${estadoConfig.dot} ${maquina.estado === 'OPERATIVO' ? 'animate-pulse' : ''}`} />

                          <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl">{getAreaIcon(maquina.area)}</span>
                            <h3 className="text-xl font-black uppercase italic group-hover:text-orange-500 transition-colors leading-tight">
                              {maquina.nombre}
                            </h3>
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
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-zinc-800 rounded-[2rem]">
                    <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.5em]">No hay máquinas en esta sede</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MaquinasPage;