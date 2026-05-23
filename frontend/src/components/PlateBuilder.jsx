import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Sparkles, Flame, Check } from 'lucide-react';
import { useState } from 'react';

const TOPPINGS_CATALOG = [
  { id: 'gold', name: '24k Gold Leaf Dust', price: 120, calories: 0, category: 'shimmer', color: 'bg-yellow-400' },
  { id: 'truffle', name: 'Smoked Truffle Foam', price: 150, calories: 30, category: 'foam', color: 'bg-stone-300' },
  { id: 'saffron', name: 'Saffron Tuile Net', price: 120, calories: 15, category: 'crunch', color: 'bg-amber-600' },
  { id: 'balsamic', name: 'Aged Balsamic Pearls', price: 100, calories: 10, category: 'sphere', color: 'bg-zinc-800' },
  { id: 'shiso', name: 'Golden Shiso Sprouts', price: 80, calories: 2, category: 'herb', color: 'bg-lime-500' }
];

export default function PlateBuilder() {
  const { customPlate, setSpiceLevel, toggleTopping, mood } = useStore();
  const [isOrdered, setIsOrdered] = useState(false);

  const basePrice = customPlate.baseDish === 'Saffron Masala Dosa Caviar' ? 850 
                  : customPlate.baseDish === 'Hyperbaric Butter Chicken Capsule' ? 1100 
                  : customPlate.baseDish === 'Tandoori Broccoli Nitro Florets' ? 580
                  : 650;

  const totalPrice = basePrice + customPlate.toppings.reduce((sum, tName) => {
    const topping = TOPPINGS_CATALOG.find(tc => tc.name === tName);
    return sum + (topping ? topping.price : 0);
  }, 0);

  const totalCalories = (customPlate.baseDish === 'Saffron Masala Dosa Caviar' ? 340 
                      : customPlate.baseDish === 'Hyperbaric Butter Chicken Capsule' ? 590 
                      : customPlate.baseDish === 'Tandoori Broccoli Nitro Florets' ? 150
                      : 280) + customPlate.toppings.reduce((sum, tName) => {
    const topping = TOPPINGS_CATALOG.find(tc => tc.name === tName);
    return sum + (topping ? topping.calories : 0);
  }, 0);

  const handleOrder = () => {
    setIsOrdered(true);
    setTimeout(() => setIsOrdered(false), 3000);
  };

  const spiceLabels = [
    { level: 0, text: 'Whisper of Pepper' },
    { level: 1, text: 'Aromatic Warmth' },
    { level: 2, text: 'Szechuan Flare' },
    { level: 3, text: 'Volcanic Inferno' }
  ];

  return (
    <section id="plate-builder" className="py-24 w-full max-w-7xl mx-auto px-6 relative pointer-events-auto">
      <div className="absolute top-[30%] left-[5%] w-[350px] h-[350px] rounded-full bg-radial-[circle_at_center,_rgba(197,160,89,0.06)_0%,_transparent_75%] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Plate View */}
        <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-gold/15 flex items-center justify-center shadow-2xl luxury-glow bg-gradient-to-b from-neutral-900 to-black overflow-hidden">
            <div className="absolute w-[85%] h-[85%] rounded-full border-2 border-dashed border-gold/25 animate-spin-slow" />
            <div className="absolute w-[80%] h-[80%] rounded-full border border-gold/5 bg-radial-[circle_at_center,_rgba(0,0,0,0.8)_0%,_rgba(10,10,10,1)_90%]" />

            <motion.div
              animate={{
                scale: [1, 1.03, 1],
                rotate: [0, 2, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute z-10 w-44 h-44 rounded-full border border-gold/20 shadow-2xl flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(197,160,89,0.35)_0%,_transparent_80%] rounded-full mix-blend-screen" />
              <div className="w-24 h-24 rounded-full bg-radial-[circle_at_center,_rgba(15,15,15,1)_0%,_rgba(40,40,40,1)_100%] border-2 border-gold/40 flex items-center justify-center text-center p-3 text-[10px] uppercase font-bold tracking-widest text-gold-light shadow-xl">
                {customPlate.baseDish || 'Deconstructed Butter Paneer Tikka'}
              </div>
            </motion.div>

            <AnimatePresence>
              {customPlate.toppings.map((toppingName) => {
                const item = TOPPINGS_CATALOG.find(t => t.name === toppingName);
                if (!item) return null;

                let offsetStyle = {};
                if (item.id === 'gold') offsetStyle = { top: '25%', left: '35%' };
                if (item.id === 'truffle') offsetStyle = { bottom: '22%', right: '25%' };
                if (item.id === 'saffron') offsetStyle = { top: '35%', right: '22%' };
                if (item.id === 'balsamic') offsetStyle = { bottom: '35%', left: '22%' };
                if (item.id === 'shiso') offsetStyle = { top: '22%', right: '35%' };

                return (
                  <motion.div
                    key={item.id}
                    initial={{ y: -180, scale: 0.1, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 0.85 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                    style={offsetStyle}
                    className="absolute z-20"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-3.5 h-3.5 rounded-full ${item.color} shadow-lg ring-2 ring-black`} />
                      <span className="text-[7px] uppercase tracking-wider bg-black/80 px-1 py-0.5 rounded text-white border border-white/10 whitespace-nowrap">
                        {item.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-semibold block mb-1">Active Concept Design</span>
            <h4 className="font-serif text-lg text-white font-light">Custom Molecular Assembly</h4>
          </div>
        </div>

        {/* Dashboard */}
        <div className="col-span-1 lg:col-span-6 luxury-glass luxury-glow p-8 rounded-3xl relative">
          <div className="mb-6">
            <h3 className="font-serif text-2xl text-white tracking-wide mb-1">Plate Architect</h3>
            <p className="text-[10px] tracking-widest text-gold uppercase font-bold">Molecular Customization Panel</p>
          </div>

          <div className="mb-6">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Base Culinary Anchor</label>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center justify-between">
              <span className="font-semibold text-gold-light">{customPlate.baseDish || 'Deconstructed Butter Paneer Tikka'}</span>
              <span className="text-[10px] text-gray-500">Preset Anchor</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Aromatics & Capsaicin Heat</label>
              <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {spiceLabels[customPlate.spiceLevel].text}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              value={customPlate.spiceLevel}
              onChange={(e) => setSpiceLevel(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold outline-none"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-2 uppercase font-medium">
              <span>Muted</span>
              <span>Mild</span>
              <span>Intense</span>
              <span>Volcanic</span>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-3.5">Layered Topping Synthesis</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPPINGS_CATALOG.map((item) => {
                const active = customPlate.toppings.includes(item.name);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleTopping(item.name)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      active
                        ? 'bg-gold/20 border-gold text-white font-semibold'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <span className="text-[9px] text-gold-light">+₹{item.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-white/5 grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold block mb-1">Energy Matrix</span>
              <span className="text-base font-semibold text-white">{totalCalories} Kilocalories</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold block mb-1">Tasting Value</span>
              <span className="text-lg font-bold text-gold-light">₹{totalPrice}</span>
            </div>
          </div>

          <button
            onClick={handleOrder}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-gold/10 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {isOrdered ? (
              <>
                <Check className="w-4 h-4" />
                Plate Design Saved
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Save Custom Design to Seating Profile
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
}
