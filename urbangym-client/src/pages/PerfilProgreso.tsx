import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const PerfilProgreso = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Ficha guardada (lo que el servidor ya tiene) ──
  const [fichaGuardada, setFichaGuardada] = useState<{
    pesoActual?: number | string;
    estatura?: number | string;
    objetivo?: string;
    fotoFrontal?: string;
    fotoLateral?: string;
    fotoEspalda?: string;
    updatedAt?: string;
  } | null>(null);
  const [loadingFicha, setLoadingFicha] = useState(true);

  const [datos, setDatos] = useState({
    pesoActual: '',
    estatura: '',
    objetivo: 'Volumen',
    fotoFrontal: '',
    fotoLateral: '',
    fotoEspalda: ''
  });

  // ── Cargar ficha existente al entrar ──
  useEffect(() => {
    const cargarFicha = async () => {
      if (!user) return;
      try {
        // Ajusta el nombre de la función según tu api.ts
        const res = await api.getDetalleAlumno(user.id);
        const ficha = res?.data?.data?.ficha_tecnica || res?.data?.ficha_tecnica || null;
        if (ficha) {
          setFichaGuardada(ficha);
          // Pre-popular el formulario con los datos guardados
          setDatos({
            pesoActual: ficha.pesoActual?.toString() || '',
            estatura: ficha.estatura?.toString() || '',
            objetivo: ficha.objetivo || 'Volumen',
            fotoFrontal: ficha.fotoFrontal || '',
            fotoLateral: ficha.fotoLateral || '',
            fotoEspalda: ficha.fotoEspalda || '',
          });
        }
      } catch (err) {
        console.error("No se pudo cargar la ficha existente:", err);
      } finally {
        setLoadingFicha(false);
      }
    };
    cargarFicha();
  }, [user]);

  // ── Subida a Cloudinary ──
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>, posicion: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'urban_gym_presets');
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/duymmv3fa/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setDatos(prev => ({ ...prev, [posicion]: data.secure_url }));
      }
    } catch (err) {
      console.error("Error al subir foto:", err);
      alert("Error al conectar con la nube");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const datosFinales = {
        ...datos,
        pesoActual: parseFloat(datos.pesoActual),
        estatura: parseFloat(datos.estatura)
      };
      await api.actualizarFichaSocio(user.id, datosFinales);
      // Actualizar ficha guardada con los nuevos datos
      setFichaGuardada({ ...datosFinales, updatedAt: new Date().toISOString() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Error al guardar ficha:", err);
      alert("Error al sincronizar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const objetivoColor: Record<string, string> = {
    Definición: '#f59e0b',
    Volumen:    '#3b82f6',
    Fuerza:     '#ef4444',
    Salud:      '#22c55e',
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans relative overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/[0.03] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Regresar */}
        <div className="mb-12">
          <Link to="/dashboard" className="group inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-all">
            <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
              <span className="text-xl">←</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Regresar</span>
          </Link>
        </div>

        {/* Título */}
        <div className="mb-16">
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            EVOLUCIÓN <span className="text-orange-500">DEL CUERPO</span>
          </h1>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">Ficha Antropométrica & Seguimiento</p>
        </div>

        {/* ── BANNER: FICHA YA REGISTRADA ── */}
        {loadingFicha ? (
          <div className="mb-8 px-6 py-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center gap-3">
            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Cargando ficha registrada...</span>
          </div>
        ) : fichaGuardada ? (
          <div className="mb-10 rounded-[2rem] border border-orange-500/20 bg-orange-500/[0.04] backdrop-blur p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Ficha Registrada</span>
              </div>
              {fichaGuardada.updatedAt && (
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">
                  Actualizada: {new Date(fichaGuardada.updatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {/* Peso */}
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-800">
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Peso</p>
                <p className="text-2xl font-black text-white">{fichaGuardada.pesoActual ?? '—'}<span className="text-xs text-zinc-600 ml-1">kg</span></p>
              </div>

              {/* Estatura */}
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-800">
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Estatura</p>
                <p className="text-2xl font-black text-white">{fichaGuardada.estatura ?? '—'}<span className="text-xs text-zinc-600 ml-1">m</span></p>
              </div>

              {/* Objetivo */}
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-800">
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Objetivo</p>
                <p className="text-sm font-black uppercase" style={{ color: objetivoColor[fichaGuardada.objetivo || ''] || '#fff' }}>
                  {fichaGuardada.objetivo || '—'}
                </p>
              </div>

              {/* Fotos — miniaturas */}
              <div className="col-span-2 flex gap-3 items-center">
                {fichaGuardada.fotoFrontal ? (
                  <img src={fichaGuardada.fotoFrontal} alt="Frontal" className="w-14 h-20 object-cover rounded-xl border border-zinc-800" />
                ) : (
                  <div className="w-14 h-20 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase">F</div>
                )}
                {fichaGuardada.fotoLateral ? (
                  <img src={fichaGuardada.fotoLateral} alt="Lateral" className="w-14 h-14 object-cover rounded-xl border border-zinc-800" />
                ) : (
                  <div className="w-14 h-14 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase">L</div>
                )}
                {fichaGuardada.fotoEspalda ? (
                  <img src={fichaGuardada.fotoEspalda} alt="Espalda" className="w-14 h-14 object-cover rounded-xl border border-zinc-800" />
                ) : (
                  <div className="w-14 h-14 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase">E</div>
                )}
                <div className="ml-1">
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">
                    {[fichaGuardada.fotoFrontal, fichaGuardada.fotoLateral, fichaGuardada.fotoEspalda].filter(Boolean).length}/3<br/>fotos
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[9px] text-zinc-600 font-black uppercase tracking-widest">
              ✓ Tu entrenador puede ver esta información · Edita el formulario de abajo para actualizar
            </p>
          </div>
        ) : (
          /* Sin ficha aún */
          <div className="mb-10 rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/10 p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">📋</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Sin ficha registrada</p>
              <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Completa el formulario y sincroniza para que tu entrenador pueda verte</p>
            </div>
          </div>
        )}

        {/* ── FORMULARIO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-500">Biometría Actual</h3>
                {success && (
                  <span className="text-[9px] font-black text-green-500 flex items-center gap-1 animate-bounce">
                    ✓ FICHA SINCRONIZADA
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Peso (KG)</label>
                  <input
                    type="number" step="0.1" placeholder="Ej: 80,5"
                    value={datos.pesoActual}
                    onChange={(e) => setDatos({ ...datos, pesoActual: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-white font-black outline-none focus:border-orange-500 transition-all text-xl"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Estatura (M)</label>
                  <input
                    type="number" step="0.01" placeholder="Ej: 1,75"
                    value={datos.estatura}
                    onChange={(e) => setDatos({ ...datos, estatura: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-white font-black outline-none focus:border-orange-500 transition-all text-xl"
                  />
                </div>
              </div>

              <div className="mt-12">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-6">Objetivo</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Definición', 'Volumen', 'Fuerza', 'Salud'].map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setDatos({ ...datos, objetivo: obj })}
                      className={`py-4 rounded-2xl text-[9px] font-black uppercase border transition-all ${datos.objetivo === obj ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                    >{obj}</button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGuardar}
              disabled={loading}
              className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Sincronizar Ficha Técnica'}
            </button>
          </div>

          {/* Archivo visual */}
          <div className="space-y-6">
            <div className="bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 h-full flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8">Archivo Visual</h3>
              <div className="flex-1 space-y-6">
                <label className="aspect-[3/4] bg-zinc-950 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center group cursor-pointer hover:border-orange-500/40 transition-all overflow-hidden relative">
                  {datos.fotoFrontal ? <img src={datos.fotoFrontal} className="w-full h-full object-cover" /> : <span className="text-3xl">📸</span>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadFoto(e, 'fotoFrontal')} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="aspect-square bg-zinc-950 border border-zinc-900 rounded-[1.5rem] flex items-center justify-center text-[7px] font-black text-zinc-800 uppercase cursor-pointer hover:border-zinc-700 overflow-hidden">
                    {datos.fotoLateral ? <img src={datos.fotoLateral} className="w-full h-full object-cover" /> : "Lateral"}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadFoto(e, 'fotoLateral')} />
                  </label>
                  <label className="aspect-square bg-zinc-950 border border-zinc-900 rounded-[1.5rem] flex items-center justify-center text-[7px] font-black text-zinc-800 uppercase cursor-pointer hover:border-zinc-700 overflow-hidden">
                    {datos.fotoEspalda ? <img src={datos.fotoEspalda} className="w-full h-full object-cover" /> : "Espalda"}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadFoto(e, 'fotoEspalda')} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilProgreso;