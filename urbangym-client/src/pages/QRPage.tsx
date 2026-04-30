import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const QRPage = () => {
  const { user } = useAuth();
  const [qr, setQr] = useState<string | null>(null);
  const [expira, setExpira] = useState<Date | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!expira) return;
    const interval = setInterval(() => {
      const restante = Math.max(0, Math.floor((expira.getTime() - Date.now()) / 1000));
      setSegundos(restante);
      if (restante === 0) {
        setQr(null);
        setExpira(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expira]);

  const generarQR = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.generarQR(user.id);
      setQr(res.data.qr);
      setExpira(new Date(res.data.expira));
      setSegundos(30);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Suscripción inactiva o error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      
      {/* 🌌 FONDO AMBIENTAL */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        
        {/* BACK NAV */}
        <div className="mb-12">
          <Link to="/dashboard" className="group inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-all">
            <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 group-hover:border-orange-500/50">
              <span className="text-xl">←</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Regresar</span>
          </Link>
        </div>

        {/* HEADER */}
<div className="text-center mb-12">
  <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-2">
    CLAVE <span className="text-orange-500 text-glow">DIGITAL</span>
  </h1>
  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">
    SISTEMA DE ACCESO A <span className="text-zinc-300">URBAN GYM</span>
  </p>
</div>

        {/* CONTENEDOR DEL QR REALISTA */}
        <div className="relative group">
          {/* Brillo exterior dinámico */}
          <div className={`absolute inset-0 blur-3xl opacity-20 transition-all duration-500 ${qr ? 'bg-orange-500' : 'bg-zinc-800'}`} />
          
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border-2 border-white/5 rounded-[3.5rem] p-10 flex flex-col items-center shadow-2xl">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 w-full animate-in fade-in zoom-in">
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            {qr ? (
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 📱 FRAME DEL QR CON LÁSER */}
                <div className="relative p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.2)] overflow-hidden">
                  
                  {/* LÁSER ROJO/NARANJA ANIMADO */}
                  <div className="absolute inset-x-0 z-10 h-1 bg-orange-500 shadow-[0_0_15px_#f97316] opacity-80 animate-[scan_2s_infinite]" />
                  
                  <img src={qr} alt="QR de acceso" className="w-56 h-56 relative z-0" />
                </div>

                {/* CONTADOR TIPO TIMER DE BOMBA */}
                <div className="mt-10 text-center">
                  <div className={`text-6xl font-black italic tracking-tighter mb-2 transition-colors ${segundos <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    00:{segundos < 10 ? `0${segundos}` : segundos}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Token de seguridad activo</span>
                  </div>
                </div>

                <button
                  onClick={generarQR}
                  className="mt-10 text-[9px] font-black text-zinc-600 hover:text-orange-500 uppercase tracking-widest transition-colors"
                >
                  Regenerar Código Manualmente
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center py-10">
                <div className="w-56 h-56 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex items-center justify-center mb-8 bg-black/20">
                  <span className="text-6xl grayscale opacity-20">📱</span>
                </div>
                
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center mb-10 max-w-[200px] leading-relaxed">
                  Pulsa el botón para generar tu llave de acceso temporal
                </p>

                <button
                  onClick={generarQR}
                  disabled={loading}
                  className="w-full bg-orange-500 text-black font-black text-[11px] py-5 rounded-2xl uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sincronizando...' : 'GENERAR ACCESO'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-12 text-center">
          <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.5em]">
            Usa este código en los torniquetes de entrada o salida
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
        }
      `}</style>
    </div>
  );
};

export default QRPage;