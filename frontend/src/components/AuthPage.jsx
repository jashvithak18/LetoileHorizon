import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Compass, User, Mail, Lock, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AuthPage({ onNavigate }) {
  const setAuth = useStore((state) => state.setAuth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();

      if (resData.success && resData.data) {
        setAuth(resData.data, resData.data.token);
        onNavigate('home');
      } else {
        setError(resData.message || 'Authentification check failed.');
      }
    } catch (err) {
      // offline simulation bypass
      const mockUser = {
        name: formData.name || (formData.email.includes('admin') ? 'Maitre Vance' : 'Diner Sinclair'),
        email: formData.email,
        role: formData.email.includes('admin') ? 'admin' : 'customer',
        _id: 'mock_' + Math.random().toString(36).substr(2, 9)
      };
      setAuth(mockUser, 'mock_jwt_token_123456');
      onNavigate('home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative px-6 overflow-hidden">
      <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(197,160,89,0.06)_0%,_transparent_75%] pointer-events-none" />
      
      <button
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-white transition-all cursor-pointer pointer-events-auto border-none bg-transparent"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Horizon
      </button>

      <div className="w-full max-w-md luxury-glass luxury-glow p-8 rounded-3xl relative pointer-events-auto">
        <div className="text-center mb-8">
          <Compass className="w-10 h-10 text-gold mx-auto mb-3 animate-spin-slow" />
          <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide mb-1.5">
            {isLogin ? 'Accréditation' : 'Establish Profile'}
          </h2>
          <p className="text-[9px] tracking-widest text-gold uppercase font-bold">
            {isLogin ? 'Secure Gastronomy Entrance' : 'Acquire Horizon Credentials'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-[10px] leading-relaxed uppercase font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Accredited Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-600 absolute left-4.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Maitre Sinclair"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl pl-11 pr-5 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Credentials Mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-600 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guest@letoilehorizon.com"
                className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl pl-11 pr-5 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Secret Keyphrase</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-600 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl pl-11 pr-5 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-gold/15 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            {loading ? 'Processing Vaults...' : isLogin ? 'Verify Accreditation' : 'Forge Profile Node'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6 text-[10px] uppercase tracking-widest text-gray-400">
          {isLogin ? (
            <p>
              New to the Horizon?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-gold font-bold hover:text-white cursor-pointer"
              >
                Create Credentials
              </button>
            </p>
          ) : (
            <p>
              Have secure keys?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-gold font-bold hover:text-white cursor-pointer"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
