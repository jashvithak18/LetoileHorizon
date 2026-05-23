import { useStore } from '../store/useStore';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { mood } = useStore();

  const getMoodBorderColor = () => {
    switch (mood) {
      case 'morning':
        return 'border-amber-950/10';
      default:
        return 'border-white/5';
    }
  };

  return (
    <footer className={`mt-auto border-t ${getMoodBorderColor()} bg-black/40 py-16 px-6 pointer-events-auto`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="space-y-4">
          <div className="font-serif text-lg tracking-[0.25em] font-medium text-white">
            L'ÉTOILE HORIZON
          </div>
          <p className="text-[11px] text-gray-400 font-light leading-relaxed max-w-xs">
            A state-of-the-art sensory experiment that integrates high-concept molecular gastronomy with local atmospheric and solar alignments.
          </p>
          <div className="flex gap-2 text-gold animate-pulse">
            <span>✧</span>
            <span>✧</span>
            <span>✧</span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-gray-300">
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1">Coordinates</span>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <p className="font-light leading-relaxed">
              742 Solar Horizon Blv,<br />
              Starlight Bay, CA 94107
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gold" />
            <span className="font-light">+1 (415) 888-9900</span>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gold" />
            <span className="font-light">cellar@letoilehorizon.com</span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-gray-300">
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1">Gastronomy Sessions</span>
          
          <div className="space-y-2 font-light">
            <div className="flex justify-between">
              <span className="text-gray-400">Sunrise Seating</span>
              <span>08:30 — 11:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rainy Lounge Cycle</span>
              <span>12:00 — 16:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Obsidian Evening</span>
              <span>18:00 — 23:30</span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-gray-300">
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1">Global Alliances</span>
          
          <div className="space-y-2 font-light">
            <a href="#" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <span>Michelin Gastronomy Guide</span>
              <ExternalLink className="w-3 h-3 text-gold/60" />
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <span>Relais & Châteaux Alliances</span>
              <ExternalLink className="w-3 h-3 text-gold/60" />
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <span>Aman Resorts Design Circle</span>
              <ExternalLink className="w-3 h-3 text-gold/60" />
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
        <div>
          © 2026 L'ÉTOILE HORIZON fine-dining group. ALL RIGHTS RESERVED.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gold transition-colors">Credential Agreement</a>
          <a href="#" className="hover:text-gold transition-colors">AI Processing logs</a>
        </div>
      </div>
    </footer>
  );
}
