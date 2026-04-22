import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
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
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mt-2">Portal de Acceso</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-2xl font-black uppercase italic text-white mb-6">Iniciar <span className="text-orange-500">Sesión</span></h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-xs font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-orange-500 hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;