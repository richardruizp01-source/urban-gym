import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

interface Membresia {
  id: string;
  tipo: string;
  precio: number;
  descripcion: string;
}

interface Pago {
  id: string;
  monto: number;
  estado: string;
  fecha_pago: string;
  fecha_vence: string;
  membresia: Membresia;
}

const PagosPage = () => {
  const { user } = useAuth();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [accesoActivo, setAccesoActivo] = useState(false);

  const cargarDatos = async () => {
    if (!user) return;
    try {
      const [resPagos, resMembresias, resAcceso] = await Promise.all([
        api.getPagosBySocio(user.id),
        api.getMembresias(),
        api.verificarAcceso(user.id),
      ]);
      setPagos(resPagos.data);
      setMembresias(resMembresias.data);
      setAccesoActivo(resAcceso.data.acceso);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handlePagar = async (membresia_id: string) => {
    if (!user) return;
    setPagando(true);
    try {
      await api.crearPago({ socio_id: user.id, membresia_id });
      alert('✅ Pago registrado con éxito');
      cargarDatos();
    } catch (err: any) {
      alert('❌ Error: ' + err.response?.data?.error);
    } finally {
      setPagando(false);
    }
  };

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="mb-10 flex items-center justify-between">
        <Link to="/dashboard" className="group flex items-center gap-3 text-zinc-500 hover:text-orange-500 transition-all">
          <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-xl">←</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Dashboard</span>
        </Link>
        <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${accesoActivo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {accesoActivo ? '● Membresía Activa' : '● Sin Membresía Activa'}
        </span>
      </div>

      <div className="mb-10">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
          MIS <span className="text-orange-500">PAGOS</span>
        </h1>
      </div>

      {/* PLANES */}
      <div className="mb-12">
        <h2 className="text-xl font-black uppercase italic text-zinc-400 mb-6">Planes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {membresias.map((m) => (
            <div key={m.id} className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-6 hover:border-orange-500/40 transition-all">
              <h3 className="text-xl font-black uppercase italic text-orange-500 mb-1">{m.tipo}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">{m.descripcion}</p>
              <p className="text-3xl font-black text-white mb-6">{formatPrecio(m.precio)}<span className="text-zinc-500 text-xs">/mes</span></p>
              <button
                onClick={() => handlePagar(m.id)}
                disabled={pagando}
                className="w-full bg-orange-500 text-black font-black text-[9px] py-3 rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-105 transition-transform"
              >
                {pagando ? 'Procesando...' : 'Suscribirse'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORIAL */}
      <div>
        <h2 className="text-xl font-black uppercase italic text-zinc-400 mb-6">Historial de Pagos</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pagos.length > 0 ? (
          <div className="space-y-4">
            {pagos.map((p) => (
              <div key={p.id} className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-white font-black uppercase italic">{p.membresia.tipo}</p>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    Vence: {new Date(p.fecha_vence).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-black">{formatPrecio(p.monto)}</p>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${p.estado === 'PAGADO' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-zinc-800 rounded-[2rem]">
            <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.5em]">Sin pagos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagosPage;