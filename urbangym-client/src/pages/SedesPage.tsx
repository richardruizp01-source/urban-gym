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

interface Instancia {
  id: string;
  nombre_clase: string;
  trainer_nombre: string;
  sede_id: string;
  sede_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  cupos_disponibles: number;
  capacidad_total: number;
}

const SedesPage = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instancias, setInstancias] = useState<Instancia[]>([]);
  const [loading, setLoading] = useState(true);
  const [sedeExpandida, setSedeExpandida] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resSedes, resInstancias] = await Promise.all([
          api.getSedes(),
          api.getInstancias(),
        ]);
        setSedes(Array.isArray(resSedes.data) ? resSedes.data : Array.isArray(resSedes.data?.data) ? resSedes.data.data : []);
        setInstancias(Array.isArray(resInstancias.data) ? resInstancias.data : Array.isArray(resInstancias.data?.data) ? resInstancias.data.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const getClasesSede = (sedeId: string) => {
    const sede = sedes.find(s => s.id === sedeId);
    if (!sede) return [];
    const ahora = new Date();
    
    // Normalizamos el nombre de la sede actual (ej: "URBANGYM CENTRO" -> "centro")
    const nombreSedeNormal = sede.nombre.toLowerCase();

    return instancias
      .filter(i => {
        const nombreClaseSede = i.sede_nombre.toLowerCase();
        
        // Match inteligente: Si son iguales O si uno contiene "central" y el otro "centro"
        const coincide = nombreClaseSede === nombreSedeNormal || 
                         (nombreSedeNormal.includes('centro') && nombreClaseSede.includes('central')) ||
                         (nombreSedeNormal.includes('central') && nombreClaseSede.includes('centro'));
        
        return coincide && new Date(i.fecha_fin) > ahora;
      })
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
      .slice(0, 3);
  };

  const getClasesHoySede = (sedeId: string) => {
    const sede = sedes.find(s => s.id === sedeId);
    if (!sede) return 0;
    const hoy = new Date();
    const nombreSedeNormal = sede.nombre.toLowerCase();

    return instancias.filter(i => {
      const fechaClase = new Date(i.fecha_inicio);
      const nombreClaseSede = i.sede_nombre.toLowerCase();

      const coincide = nombreClaseSede === nombreSedeNormal || 
                       (nombreSedeNormal.includes('centro') && nombreClaseSede.includes('central')) ||
                       (nombreSedeNormal.includes('central') && nombreClaseSede.includes('centro'));

      return (
        coincide &&
        fechaClase.toDateString() === hoy.toDateString()
      );
    }).length;
  };

  const formatHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota'
    }).toUpperCase();

  const formatDia = (fecha: string) => {
    const d = new Date(fecha);
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    if (d.toDateString() === hoy.toDateString()) return 'HOY';
    if (d.toDateString() === manana.toDateString()) return 'MAÑANA';
    return d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
  };

  const sedeColors = [
    { gradient: 'from-orange-500/20 via-transparent', border: 'border-orange-500/30', accent: 'text-orange-500', bar: 'bg-orange-500', glow: 'shadow-[0_0_60px_rgba(249,115,22,0.08)]', num: '01' },
    { gradient: 'from-blue-500/20 via-transparent', border: 'border-blue-500/30', accent: 'text-blue-400', bar: 'bg-blue-500', glow: 'shadow-[0_0_60px_rgba(59,130,246,0.08)]', num: '02' },
    { gradient: 'from-purple-500/20 via-transparent', border: 'border-purple-500/30', accent: 'text-purple-400', bar: 'bg-purple-500', glow: 'shadow-[0_0_60px_rgba(168,85,247,0.08)]', num: '03' },
    { gradient: 'from-emerald-500/20 via-transparent', border: 'border-emerald-500/30', accent: 'text-emerald-400', bar: 'bg-emerald-500', glow: 'shadow-[0_0_60px_rgba(16,185,129,0.08)]', num: '04' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 overflow-x-hidden">

      {/* FONDO ANIMADO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-orange-500/3 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-[150px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-purple-500/3 rounded-full blur-[120px] animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* BACK BUTTON */}
        <div className="mb-10">
          <Link to="/dashboard" className="group flex items-center gap-3 text-zinc-500 hover:text-orange-500 transition-all">
            <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
              <span className="text-xl">←</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Regresar</span>
          </Link>
        </div>

        {/* HEADER */}
        <div className="mb-14">
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.5em] mb-2">Red de instalaciones</p>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none">
            NUESTRAS <span className="text-orange-500">SEDES</span>
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-[1px] w-16 bg-orange-500/50" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              {sedes.filter(s => s.esta_activa).length} sedes activas en Colombia
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {sedes.filter(s => s.esta_activa).map((sede, i) => {
              const color = sedeColors[i % sedeColors.length];
              const ahora = new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota'
              });
              const abierta = sede.esta_activa && ahora >= sede.hora_apertura && ahora <= sede.hora_cierre;
              const clasesSede = getClasesSede(sede.id);
              const clasesHoy = getClasesHoySede(sede.id); // 👈 NUEVO
              const expandida = sedeExpandida === sede.id;

              return (
                <div
                  key={sede.id}
                  className={`border rounded-[2.5rem] overflow-hidden transition-all duration-500 ${color.border} ${color.glow} bg-zinc-900/10`}
                >
                  {/* FRANJA DE COLOR SUPERIOR */}
                  <div className={`h-[3px] w-full bg-gradient-to-r ${color.gradient.replace('/20', '')} to-transparent`} />

                  <div className="p-8">
                    {/* FILA PRINCIPAL */}
                    <div className="flex items-start justify-between gap-6">

                      {/* NUMERO GRANDE */}
                      <div className={`text-7xl font-black italic opacity-10 ${color.accent} leading-none select-none hidden md:block`}>
                        {color.num}
                      </div>

                      {/* INFO SEDE */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-1">
                          <div className={`w-2 h-2 rounded-full ${abierta ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${abierta ? 'text-green-400' : 'text-red-400'}`}>
                            {abierta ? 'Abierta ahora' : 'Cerrada'}
                          </span>
                        </div>
                        <h2 className={`text-3xl font-black uppercase italic ${color.accent} leading-none mb-4`}>
                          {sede.nombre}
                        </h2>
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest block">Dirección</span>
                            <p className="text-[11px] font-bold text-white">{sede.direccion || 'Sin dirección'}</p>
                          </div>
                          <div>
                            <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest block">Horario</span>
                            <p className="text-[11px] font-bold text-white">
                              <span className="text-green-400">{sede.hora_apertura}</span>
                              <span className="text-zinc-600 mx-1">→</span>
                              <span className="text-red-400">{sede.hora_cierre}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest block">Clases hoy</span>
                            {/* 👈 NUEVO: muestra solo clases de hoy en esta sede */}
                            <p className={`text-[11px] font-bold ${color.accent}`}>{clasesHoy} hoy</p>
                          </div>
                        </div>
                      </div>

                      {/* BOTÓN EXPANDIR */}
                      <button
                        onClick={() => setSedeExpandida(expandida ? null : sede.id)}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                          expandida
                            ? `${color.border} ${color.accent} bg-zinc-900/60`
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                        }`}
                      >
                        {expandida ? 'Ocultar' : 'Ver clases'}
                        <span className={`transition-transform duration-300 ${expandida ? 'rotate-180' : ''}`}>↓</span>
                      </button>
                    </div>

                    {/* CLASES PRÓXIMAS — EXPANDIBLE */}
                    {expandida && (
                      <div className="mt-8 pt-8 border-t border-zinc-800/60">
                        <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                          Próximas clases en esta sede
                        </p>
                        {clasesSede.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {clasesSede.map((clase) => {
                              const ocupacion = Math.round(((clase.capacidad_total - clase.cupos_disponibles) / clase.capacidad_total) * 100);
                              const enCurso = new Date() >= new Date(clase.fecha_inicio) && new Date() <= new Date(clase.fecha_fin);
                              return (
                                <div key={clase.id} className={`bg-zinc-900/40 border rounded-2xl p-5 transition-all ${color.border}`}>
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-sm font-black uppercase italic">{clase.nombre_clase}</h4>
                                    {enCurso && (
                                      <span className="text-[7px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                                        ● EN CURSO
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-zinc-500 text-[9px] italic mb-3">{clase.trainer_nombre}</p>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-black ${color.accent}`}>{formatHora(clase.fecha_inicio)}</span>
                                    <span className="text-zinc-600 text-[9px] font-black">{formatDia(clase.fecha_inicio)}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-600 text-[7px] font-black uppercase tracking-widest">Cupos</span>
                                      <span className="text-[7px] font-black text-zinc-400">{clase.cupos_disponibles}/{clase.capacidad_total}</span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${color.bar} rounded-full transition-all`}
                                        style={{ width: `${ocupacion}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Sin clases próximas en esta sede</p>
                          </div>
                        )}
                        <Link
                          to="/clases"
                          className={`mt-4 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${color.accent} hover:opacity-80 transition-opacity`}
                        >
                          Ver todas las clases →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SedesPage;