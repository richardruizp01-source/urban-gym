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
  
  // 🛡️ ESTADOS DE CONTROL ELITE
  const [showPasarela, setShowPasarela] = useState(false);
  const [showContrato, setShowContrato] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // ⚡ NUEVO: Para la animación de escaneo
  const [planSeleccionado, setPlanSeleccionado] = useState<Membresia | null>(null);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

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
      console.error("Error en sistema de cobros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [user]);

  const handlePagar = async (membresia_id: string) => {
    if (!user) return;
    setPagando(true);
    try {
      await api.crearPago({ socio_id: user.id, membresia_id });
      setShowPasarela(false);
      setAceptoTerminos(false);
      await cargarDatos();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.error || 'Fallo en la red'));
    } finally {
      setPagando(false);
    }
  };

  // ⚡ FUNCIÓN CON ANIMACIÓN "SECURE LINK"
  const procesarHaciaPasarela = () => {
    setIsValidating(true);
    // Simulación de encriptación de 1.8 segundos antes de abrir pasarela
    setTimeout(() => {
      setIsValidating(false);
      setShowContrato(false);
      setShowPasarela(true);
    }, 1800);
  };

  const iniciarProceso = (m: Membresia) => {
    if (accesoActivo) return; // Protección contra doble pago
    setPlanSeleccionado(m);
    setShowContrato(true);
  };

  const getPlanDetails = (tipo: string) => {
    const t = tipo.toUpperCase();
    if (t.includes('BASICO')) return {
      color: 'zinc',
      label: 'Starter Pack',
      hex: '#71717a',
      feats: ['Acceso Sede de Registro', 'Máquinas de Pesas', 'App Urban (Básico)'],
      gradient: 'from-zinc-500/10 to-transparent'
    };
    if (t.includes('ESTANDAR')) return {
      color: 'blue',
      label: 'Warrior Tier',
      hex: '#3b82f6',
      feats: ['Acceso Global Sedes', 'Clases de Zumba/Yoga', 'Lockers y Duchas'],
      gradient: 'from-blue-500/10 to-transparent'
    };
    if (t.includes('PREMIUM')) return {
      color: 'orange',
      label: 'Elite Choice',
      hex: '#f97316',
      feats: ['Acceso 24/7 Total', 'Boxeo & Cross-training', '1 Invitado Mensual'],
      gradient: 'from-orange-500/10 to-transparent'
    };
    if (t.includes('VIP')) return {
      color: 'yellow',
      label: 'Legendary',
      hex: '#eab308',
      feats: ['Entrenador Personal', 'Plan Nutricional App', 'Urban VIP Lounge'],
      gradient: 'from-yellow-500/20 to-transparent'
    };
    return { color: 'zinc', label: 'Plan', hex: '#f97316', feats: ['Acceso General'], gradient: '' };
  };

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-x-hidden font-sans">
      
      {/* 🌌 AMBIENT LIGHTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-orange-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-blue-500/[0.03] blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* TOP BAR */}
        <div className="mb-12 flex items-center justify-between">
          <Link to="/dashboard" className="text-zinc-500 hover:text-white font-black uppercase text-[9px] tracking-[0.4em] transition-all">
            ← Regresar al Panel
          </Link>
          <div className={`px-4 py-1.5 rounded-full border-2 transition-all duration-500 ${accesoActivo ? 'border-green-500/30 text-green-400 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
            <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${accesoActivo ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {accesoActivo ? 'Membresía Activa' : 'Acceso Denegado'}
            </span>
          </div>
        </div>

        <div className="mb-20">
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">
            LEVEL <span className="text-orange-500">UP</span>
          </h1>
          <div className="h-1 w-20 bg-orange-500 mb-4" />
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em]">Planes diseñados para tu evolución</p>
        </div>

        {/* 💳 TARJETAS REALISTAS CON BRILLO DINÁMICO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {membresias.map((m) => {
            const plan = getPlanDetails(m.tipo);
            const colorClass = {
              zinc: 'border-zinc-800 text-zinc-400',
              blue: 'border-blue-500/30 text-blue-400',
              orange: 'border-orange-500 text-orange-500',
              yellow: 'border-yellow-500 text-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.05)]'
            }[plan.color];

            const btnClass = {
              zinc: 'bg-zinc-800 text-white',
              blue: 'bg-blue-600 text-white',
              orange: 'bg-orange-500 text-black',
              yellow: 'bg-yellow-500 text-black'
            }[plan.color];

            return (
              <div key={m.id} className="group relative">
                <div 
                  className={`h-full bg-zinc-900/30 backdrop-blur-md border-2 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden transition-all duration-700
                  ${accesoActivo ? 'opacity-30 grayscale pointer-events-none' : 'hover:border-orange-500/50 hover:-translate-y-3'}
                  ${colorClass}`}
                >
                  {/* ⚡ EFECTO REFLEJO DE LUZ */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent group-hover:animate-[shine_1.5s_ease-in-out]" />
                  <div className={`absolute inset-0 bg-gradient-to-b ${plan.gradient} rounded-[2.5rem] -z-10`} />
                  
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">{plan.label}</span>
                  <h3 className="text-3xl font-black uppercase italic leading-none mb-2">{m.tipo}</h3>
                  <p className="text-zinc-500 text-[10px] font-medium leading-relaxed mb-6">{m.descripcion}</p>
                  
                  <div className="mb-8">
                    <span className="text-4xl font-black">{formatPrecio(m.precio)}</span>
                    <span className="text-[10px] text-zinc-600 font-bold ml-1">/MES</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.feats.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                        <span className={plan.color === 'zinc' ? 'text-zinc-600' : `text-${plan.color}-500`}>✦</span> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => iniciarProceso(m)}
                    disabled={accesoActivo}
                    className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${btnClass}`}
                  >
                    {accesoActivo ? 'YA ESTÁS ACTIVO' : 'SELECCIONAR'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* REGISTRO DE MOVIMIENTOS */}
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-zinc-600 font-black uppercase italic text-sm tracking-widest">Billing History</h2>
            <div className="h-px flex-1 bg-zinc-900" />
          </div>
          
          <div className="bg-zinc-900/10 border border-zinc-900 rounded-[2rem] overflow-hidden">
            {pagos.map(p => (
              <div key={p.id} className="p-6 border-b border-zinc-900 last:border-0 flex justify-between items-center hover:bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-orange-500 font-black">#</div>
                  <div>
                    <p className="font-black text-xs uppercase italic">{p.membresia.tipo}</p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Vence: {new Date(p.fecha_vence).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white">{formatPrecio(p.monto)}</p>
                  <span className="text-[7px] font-black text-green-500 uppercase tracking-tighter">{p.estado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📜 MODAL DE CONTRATO CON ESCÁNER LÁSER */}
      {showContrato && planSeleccionado && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 overflow-hidden shadow-2xl">
            
            {/* 🛡️ CAPA DE ESCANEO DE SEGURIDAD */}
            {isValidating && (
              <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-orange-500 shadow-[0_0_20px_#f97316] animate-[loading_1.8s_ease-in-out]" />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 animate-pulse">Verificando Credenciales...</p>
              </div>
            )}

            <h2 className="text-3xl font-black uppercase italic mb-6">Contrato de <span className="text-orange-500">Socio</span></h2>
            <div className="h-64 overflow-y-auto pr-4 text-zinc-500 text-[11px] leading-relaxed mb-8 border-b border-zinc-900 custom-scrollbar">
              <p className="mb-4 text-white font-black uppercase tracking-widest">Urban Gym S.A.S - Membresía {planSeleccionado.tipo}</p>
              <p className="mb-4">1. Al procesar este pago, el socio acepta que el acceso es personal e intransferible.</p>
              <p className="mb-3">2. No se admiten devoluciones tras la activación del sistema biométrico/QR.</p>
              <p className="mb-3">3. El uso de las sedes está sujeto al cumplimiento del reglamento interno.</p>
            </div>
            
            <div className="flex items-center gap-4 mb-10">
              <input 
                type="checkbox" 
                id="acepto" 
                className="w-6 h-6 accent-orange-500" 
                checked={aceptoTerminos}
                onChange={(e) => setAceptoTerminos(e.target.checked)}
              />
              <label htmlFor="acepto" className="text-[10px] font-black uppercase tracking-widest text-zinc-300 cursor-pointer">
                He leído y acepto los términos del servicio
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowContrato(false)} className="py-4 rounded-xl border border-zinc-800 text-[10px] font-black uppercase">Cancelar</button>
              <button 
                disabled={!aceptoTerminos || isValidating}
                onClick={procesarHaciaPasarela}
                className="py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase disabled:opacity-10 transition-all shadow-xl"
              >
                Aceptar e ir al Pago →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💳 PASARELA PREMIUM MODAL */}
      {showPasarela && planSeleccionado && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 shadow-[0_0_100px_rgba(249,115,22,0.15)] animate-in zoom-in-95 duration-300">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">SECURE PAY</h3>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em]">Urban Bank Service</p>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 mb-10 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-zinc-500">{planSeleccionado.tipo}</span>
              <span className="text-2xl font-black text-orange-500">{formatPrecio(planSeleccionado.precio)}</span>
            </div>

            <div className="space-y-6 mb-12 text-white">
              <input type="text" placeholder="CARD NUMBER" className="w-full bg-transparent border-b border-zinc-800 p-3 text-xs font-black uppercase outline-none focus:border-orange-500 transition-all" />
              <div className="grid grid-cols-2 gap-6">
                <input type="text" placeholder="MM / YY" className="bg-transparent border-b border-zinc-800 p-3 text-xs font-black uppercase outline-none focus:border-orange-500" />
                <input type="password" placeholder="CVC" className="bg-transparent border-b border-zinc-800 p-3 text-xs font-black uppercase outline-none focus:border-orange-500" />
              </div>
            </div>

            <button 
              onClick={() => handlePagar(planSeleccionado.id)}
              disabled={pagando}
              className="w-full bg-orange-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all"
            >
              {pagando ? 'Verifying...' : 'Authorize Transaction'}
            </button>
            <button onClick={() => setShowPasarela(false)} className="w-full mt-6 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Cancel Payment</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        @keyframes loading {
          0% { width: 0%; left: 0; }
          50% { width: 70%; }
          100% { width: 100%; left: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PagosPage;