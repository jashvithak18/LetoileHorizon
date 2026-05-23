import { motion } from 'framer-motion';
import { Compass, CalendarDays, Utensils } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Hero({ onOpenAi }) {
  const mood = useStore((state) => state.mood);

  const getMoodHeadingColor = () => {
    switch (mood) {
      case 'morning':
        return 'from-amber-950 via-gold-dark to-amber-900';
      case 'rainy':
        return 'from-slate-200 via-slate-400 to-slate-500';
      case 'festive':
        return 'from-rose-100 via-gold-light to-amber-100';
      case 'evening':
      default:
        return 'from-white via-gold-light to-gold';
    }
  };

  const getMoodSubtitleColor = () => {
    switch (mood) {
      case 'morning':
        return 'text-amber-800/80';
      case 'rainy':
        return 'text-slate-400';
      case 'festive':
        return 'text-rose-200/80';
      default:
        return 'text-gold';
    }
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* Immersive Glow Ring in Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vh] h-[70vh] rounded-full border border-gold/10 bg-radial-[circle_at_center,_var(--gold-glow)_0%,_transparent_70%] pointer-events-none mix-blend-screen opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] rounded-full border border-gold/20 animate-spin-slow pointer-events-none opacity-40" />

      {/* Hero Typography Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl flex flex-col items-center gap-6">
        
        {/* Concept Moniker */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={`text-[10px] tracking-[0.6em] uppercase font-bold ${getMoodSubtitleColor()}`}
        >
          AN IMPOSSIBLE LUXURY EXPERIENCE
        </motion.div>

        {/* Master Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-5xl md:text-8xl lg:text-9xl tracking-tight leading-[1.05]"
        >
          <span className={`bg-gradient-to-b ${getMoodHeadingColor()} bg-clip-text text-transparent italic font-light`}>
            Sustenance
          </span>
          <br />
          <span className={`text-[1.05em] uppercase font-extralight tracking-widest ${mood === 'morning' ? 'text-amber-950' : 'text-white'}`}>
            as Art
          </span>
        </motion.h1>

        {/* Brand Statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`text-[13px] md:text-base font-light tracking-[0.12em] max-w-2xl leading-relaxed mx-auto ${mood === 'morning' ? 'text-amber-900/90' : 'text-gray-400'}`}
        >
          Transcend ordinary gastronomy. Enter a space where molecular precision aligns with real-time solar rhythms, curated by intuitive AI sommelier guides.
        </motion.p>

        {/* Luxury CTA Clusters */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-4.5 mt-8 pointer-events-auto"
        >
          {/* Reserve Table CTA */}
          <a
            href="#floor-map"
            className="flex items-center gap-2.5 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black px-7 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-gold/15 transition-all hover:scale-105 hover:shadow-gold/25 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            Reserve Table
          </a>

          {/* Explore Menu CTA */}
          <a
            href="#gourmet-menu"
            className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 text-gold hover:text-white border border-gold/30 hover:border-gold px-7 py-4 rounded-full font-semibold uppercase tracking-widest text-[10px] backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            Explore Menu
          </a>

          {/* Ask AI Sommelier CTA */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-2.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/40 hover:border-gold px-7 py-4 rounded-full font-semibold uppercase tracking-widest text-[10px] transition-all hover:scale-105 cursor-pointer"
          >
            <Compass className="w-4 h-4 animate-spin-slow" />
            AI Sommelier
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className={`text-[8px] uppercase tracking-[0.4em] font-medium ${mood === 'morning' ? 'text-amber-800' : 'text-gold'}`}>
          Scroll to enter
        </span>
        <div className="w-5 h-8 rounded-full border border-gold/30 flex items-start justify-center p-1.5 opacity-60">
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1.5 h-1.5 rounded-full bg-gold"
          />
        </div>
      </div>
    </section>
  );
}
