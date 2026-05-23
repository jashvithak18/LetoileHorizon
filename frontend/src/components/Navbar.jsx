import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { User, LogOut, Terminal, Compass } from 'lucide-react';

export default function Navbar({ onOpenAi, onOpenWaitlist, onOpenAdmin, onNavigate }) {
  const { user, isAuthenticated, logout, loadAuthFromStorage } = useStore();
  const mood = useStore((state) => state.mood);

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  const getMoodTitleColor = () => {
    switch (mood) {
      case 'morning':
        return 'text-amber-900';
      default:
        return 'text-white';
    }
  };

  const getMoodSubtitleColor = () => {
    switch (mood) {
      case 'morning':
        return 'text-amber-800/80';
      default:
        return 'text-gold';
    }
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-300">
      <nav className="luxury-glass luxury-glow rounded-full px-6 py-4 flex items-center justify-between pointer-events-auto">
        
        {/* Brand Logo & Michelin Stars */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex flex-col items-start gap-0.5 cursor-pointer text-left bg-transparent border-none outline-none"
        >
          <div className={`font-serif text-lg tracking-[0.25em] font-medium transition-colors duration-1000 ${getMoodTitleColor()}`}>
            L'ÉTOILE HORIZON
          </div>
          <div className={`text-[9px] tracking-[0.35em] uppercase font-semibold transition-colors duration-1000 ${getMoodSubtitleColor()}`}>
            ✧ ✧ ✧ michelin cuisine
          </div>
        </button>

        {/* Central Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.18em] font-medium">
          <a href="#chef-story" className="hover:text-gold transition-colors">Story</a>
          <a href="#gourmet-menu" className="hover:text-gold transition-colors">Menu</a>
          <a href="#plate-builder" className="hover:text-gold transition-colors">Plate Craft</a>
          <a href="#floor-map" className="hover:text-gold transition-colors">Atmosphere Seating</a>
          <button 
            onClick={onOpenWaitlist}
            className="hover:text-gold transition-colors cursor-pointer text-left font-medium uppercase tracking-[0.18em]"
          >
            Waitlist Stats
          </button>
        </div>

        {/* Dynamic User Profile / Action Buttons */}
        <div className="flex items-center gap-4 text-xs">
          {/* AI dining Sommelier Button */}
          <button
            onClick={onOpenAi}
            className="hidden sm:flex items-center gap-2 border border-gold/40 hover:border-gold px-4 py-2 rounded-full font-medium tracking-wider text-[10px] uppercase text-gold hover:bg-gold/10 transition-all hover:scale-105 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 animate-pulse" />
            AI Sommelier
          </button>

          {/* User Auth flow */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <User className="w-3.5 h-3.5 text-gold" />
                <span className={`text-[10px] tracking-wider uppercase hidden lg:inline max-w-[80px] truncate ${mood === 'morning' ? 'text-amber-900' : 'text-gray-300'}`}>
                  {user?.name.split(' ')[0]}
                </span>
              </div>
              
              {user?.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  title="Admin Terminal"
                  className="p-2 rounded-full hover:bg-white/5 border border-gold/20 hover:border-gold/60 text-gold cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-full hover:bg-white/5 border border-red-500/20 hover:border-red-500/50 text-red-400 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-gold/80 to-gold hover:from-gold hover:to-gold-light text-black px-4.5 py-2 rounded-full font-semibold uppercase tracking-wider text-[10px] shadow-lg shadow-gold/20 transition-all hover:scale-105 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              Accréditation
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
