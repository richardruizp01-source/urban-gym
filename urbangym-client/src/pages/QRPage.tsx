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
      setError(err.response?.data?.message || 'Error al generar QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="mb-10 flex items-center justify-between">
        <Link to="/dashboard" className="group flex items-center gap-3 text-zinc-500 hover:text-orange-500 transition-all">
          <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-xl">←</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Dashboard</span>
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
          ACCESO <span className="text-orange-500">QR</span>
        </h1>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Entrada y Salida</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 text-center">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6">
              <p className="text-red-400 text-xs font-bold">{error}</p>
            </div>
          )}

          {qr ? (
            <>
              <img src={qr} alt="QR de acceso" className="w-64 h-64 mx-auto border-8 border-orange-500 rounded-2xl mb-6" />
              <div className={`text-4xl font-black mb-2 ${segundos <= 10 ? 'text-red-500' : 'text-orange-500'}`}>
                {segundos}s
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                {segundos > 0 ? 'QR válido — muéstralo en recepción' : 'QR expirado'}
              </p>
              {segundos === 0 && (
                <button
                  onClick={generarQR}
                  className="mt-6 bg-orange-500 text-black font-black text-[10px] px-8 py-4 rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform"
                >
                  Generar Nuevo QR
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-64 h-64 mx-auto border-2 border-dashed border-zinc-700 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-6xl">📱</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6">
                Genera tu QR para entrar o salir del gimnasio
              </p>
              <button
                onClick={generarQR}
                disabled={loading}
                className="bg-orange-500 text-black font-black text-[10px] px-8 py-4 rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform"
              >
                {loading ? 'Generando...' : 'Activar QR'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRPage;