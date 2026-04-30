import { useState, useEffect } from 'react'; // 👈 Agregamos useEffect
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 👈 Asegúrate de tener axios
import * as api from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  // 1. Estados para el formulario y las sedes
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    sede_id: '', // 👈 Agregamos sede_id
  });
  
  const [sedes, setSedes] = useState<any[]>([]); // 👈 Guardar sedes de la DB
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Cargar sedes automáticamente al entrar
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/members/active-branches');
        if (response.data.success) {
          setSedes(response.data.data);
        }
      } catch (err) {
        console.error("Error cargando sedes:", err);
      }
    };
    fetchSedes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sede_id) {
        setError('Por favor selecciona una sede');
        return;
    }
    setLoading(true);
    setError('');
    try {
      await api.register({ ...form, rol: 'SOCIO' });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
            URBAN<span className="text-orange-500">GYM</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mt-2">Nuevo Miembro</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-2xl font-black uppercase italic text-white mb-6">Crear <span className="text-orange-500">Cuenta</span></h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-xs font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Campos de Nombre, Email, Teléfono, Contraseña se mantienen igual ... */}
            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Nombre completo</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white focus:border-orange-500 outline-none"
                placeholder="Tu nombre"
                onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            
            {/* --- SELECT DE SEDES DINÁMICO --- */}
            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Sede Principal</label>
              <select
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white focus:border-orange-500 outline-none appearance-none"
                value={form.sede_id}
                onChange={(e) => setForm(prev => ({ ...prev, sede_id: e.target.value }))}
              >
                <option value="">SELECCIONA TU SEDE</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900">
                    {s.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white focus:border-orange-500 outline-none"
                placeholder="tu@email.com"
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Contraseña</label>
              <input
                type="password"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white focus:border-orange-500 outline-none"
                placeholder="••••••••"
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-black font-black text-[10px] py-4 rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform mt-2"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-500 hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;