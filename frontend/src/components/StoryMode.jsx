import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Star } from 'lucide-react';

export default function StoryMode() {
  const { mood } = useStore();

  const getMoodBorderColor = () => {
    switch (mood) {
      case 'morning':
        return 'border-amber-950/20';
      default:
        return 'border-gold/20';
    }
  };

  return (
    <section id="chef-story" className="py-32 w-full max-w-7xl mx-auto px-6 relative pointer-events-auto overflow-hidden">
      <div className="absolute top-[10%] right-[5%] w-[450px] h-[450px] rounded-full bg-radial-[circle_at_center,_rgba(243,229,171,0.03)_0%,_transparent_75%] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Narrative Text */}
        <div className="col-span-1 lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1 }}
            className="flex items-center gap-3"
          >
            <span className="w-12 h-[1px] bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The Philosophy</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-wide font-light leading-tight"
          >
            Where Gastronomy <br />
            <span className="italic text-gold font-light">Meets Cosmic Rhythms</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="space-y-6 text-xs md:text-sm font-light tracking-wide text-gray-400 leading-relaxed max-w-2xl"
          >
            <p>
              At L'Étoile Horizon, we reject the notion that dining is merely consumable sustenance. We look at the dining plate as a canvas of architectural precision. Ingredients do not simply lay; they float, they spherify, and they react.
            </p>
            <p>
              Our molecular gastronomy lab—guided by the visionary culinary direction of <strong className="text-white">Executive Chef Marcus Vance</strong>—aligns each plate with local solar cycles and moisture metrics. When rain meets the windowpane, the flavors deepen. When starlight breaks the clouds, the plates shimmers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`p-6 rounded-2xl border ${getMoodBorderColor()} bg-white/5 flex items-center gap-4.5 max-w-lg`}
          >
            <div className="flex gap-1.5 text-gold animate-pulse">
              <Star className="w-5 h-5 fill-gold" />
              <Star className="w-5 h-5 fill-gold" />
              <Star className="w-5 h-5 fill-gold" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1">Three Michelin Stars</span>
              <p className="text-[11px] text-gray-300 font-light">Awarded for revolutionary culinary concepts and visual design excellence.</p>
            </div>
          </motion.div>
        </div>

        {/* Narrative Card */}
        <div className="col-span-1 lg:col-span-5 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(197,160,89,0.08)_0%,_transparent_75%] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-[32px] overflow-hidden luxury-glass border-gold/15 p-4 shadow-2xl luxury-glow relative group"
          >
            <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80"
                alt="Chef plating molecular dish"
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold block mb-1">Culinary Director</span>
                <h4 className="font-serif text-lg text-white font-semibold">Chef Marcus Vance</h4>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
