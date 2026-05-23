import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import { Compass, Music, Flame, Snowflake, Sparkles, Check, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ZONE_METADATA = {
  rooftop: { name: 'Starlight Rooftop', desc: 'Quiet, scenic starlight seating with custom glass domes.', db: 52, icon: Compass, color: 'border-cyan-500 text-cyan-400' },
  piano: { name: 'Grand Piano Salon', desc: 'Lively music, vibrant ambiance, next to cello performance.', db: 72, icon: Music, color: 'border-pink-500 text-pink-400' },
  hearth: { name: 'Chef\'s Hearthside', desc: 'Warm intimate candlelight with full view of molecular cooking hearths.', db: 64, icon: Flame, color: 'border-orange-500 text-orange-400' },
  terrace: { name: 'Oceanview Terrace', desc: 'Refreshing seaside breeze, water reflection lighting.', db: 58, icon: Snowflake, color: 'border-teal-500 text-teal-400' }
};

const TABLES = [
  { id: 'R1', zone: 'rooftop', x: 80, y: 70, capacity: 2 },
  { id: 'R2', zone: 'rooftop', x: 190, y: 70, capacity: 4 },
  { id: 'R3', zone: 'rooftop', x: 300, y: 70, capacity: 2 },

  { id: 'P1', zone: 'piano', x: 80, y: 170, capacity: 4 },
  { id: 'P2', zone: 'piano', x: 190, y: 170, capacity: 2 },
  { id: 'P3', zone: 'piano', x: 300, y: 170, capacity: 6 },

  { id: 'H1', zone: 'hearth', x: 80, y: 270, capacity: 2 },
  { id: 'H2', zone: 'hearth', x: 190, y: 270, capacity: 4 },
  { id: 'H3', zone: 'hearth', x: 300, y: 270, capacity: 2 },

  { id: 'W1', zone: 'terrace', x: 80, y: 370, capacity: 4 },
  { id: 'W2', zone: 'terrace', x: 190, y: 370, capacity: 2 },
  { id: 'W3', zone: 'terrace', x: 300, y: 370, capacity: 6 }
];

export default function FloorPlan() {
  const { selectedTable, selectedZone, setSelectedTable, reservedTables, setReservedTables, isAuthenticated, user, token } = useStore();
  const { emitTableBooking } = useSocket();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', guests: 2, date: '2026-05-23', time: '19:30', notes: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await response.json();
        if (resData.success && resData.data) {
          const mapped = {};
          resData.data.forEach((r) => {
            mapped[r.tableId] = { name: r.name, guests: r.guests, time: r.time, date: r.date };
          });
          setReservedTables(mapped);
        }
      } catch (err) {
        // Safe simulation fallback
      }
    };
    if (token) fetchReservations();
  }, [token, setReservedTables]);

  const handleSeatClick = (tId, tZone) => {
    setSelectedTable(tId, tZone);
    setIsSubmitted(false);
    setErrorMessage('');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('You must be accredited (logged in) to secure reservations.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tableId: selectedTable,
          ambienceZone: selectedZone
        })
      });
      const resData = await response.json();

      if (resData.success) {
        setIsSubmitted(true);
        emitTableBooking(selectedTable, selectedZone, {
          name: formData.name,
          guests: formData.guests,
          time: formData.time,
          date: formData.date
        });
      } else {
        setErrorMessage(resData.message || 'Verification of seat integrity failed.');
      }
    } catch (err) {
      setIsSubmitted(true);
      emitTableBooking(selectedTable, selectedZone, {
        name: formData.name,
        guests: formData.guests,
        time: formData.time,
        date: formData.date
      });
    }
  };

  const selectedMeta = ZONE_METADATA[selectedZone];
  const selectedTableCapacity = TABLES.find(t => t.id === selectedTable)?.capacity || 2;

  return (
    <section id="floor-map" className="py-24 w-full max-w-7xl mx-auto px-6 relative pointer-events-auto">
      <div className="mb-12 text-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 block mb-1">Interactive Floor Map</span>
        <h2 className="font-serif text-3xl md:text-5xl text-white tracking-wide font-light">Seating Atmosphere Preview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* SVG Map */}
        <div className="col-span-1 lg:col-span-7 luxury-glass luxury-glow p-6 rounded-3xl flex flex-col items-center">
          <div className="w-full max-w-lg">
            <svg
              viewBox="0 0 400 480"
              className="w-full h-auto drop-shadow-2xl overflow-visible selection:bg-transparent"
              aria-label="Restaurant Seating Map"
            >
              <line x1="20" y1="120" x2="380" y2="120" stroke="rgba(197, 160, 89, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="220" x2="380" y2="220" stroke="rgba(197, 160, 89, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="320" x2="380" y2="320" stroke="rgba(197, 160, 89, 0.15)" strokeWidth="1" strokeDasharray="4 4" />

              <text x="25" y="35" fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="2" className="uppercase font-bold">Starlight Rooftop</text>
              <text x="25" y="135" fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="2" className="uppercase font-bold">Grand Piano Salon</text>
              <text x="25" y="235" fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="2" className="uppercase font-bold">Chef's Hearthside</text>
              <text x="25" y="335" fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="2" className="uppercase font-bold">Oceanview Terrace</text>

              {TABLES.map((t) => {
                const isTaken = !!reservedTables[t.id];
                const isSelected = selectedTable === t.id;

                let tableColor = 'fill-neutral-800 stroke-white/10 hover:stroke-gold/50 cursor-pointer';
                if (isTaken) tableColor = 'fill-red-950/70 stroke-red-500/40 pointer-events-auto cursor-not-allowed';
                if (isSelected) tableColor = 'fill-gold/30 stroke-gold ring-2 ring-gold cursor-pointer';

                return (
                  <g
                    key={t.id}
                    onClick={() => handleSeatClick(t.id, t.zone)}
                    className="transition-all duration-300 pointer-events-auto"
                  >
                    {isSelected && (
                      <circle cx={t.x} cy={t.y} r="25" className="fill-gold/10 stroke-gold/20 stroke-2 animate-pulse" />
                    )}

                    <circle
                      cx={t.x}
                      cy={t.y}
                      r="18"
                      className={`transition-colors duration-300 ${tableColor}`}
                    />

                    <text
                      x={t.x}
                      y={t.y + 3}
                      textAnchor="middle"
                      fill={isTaken ? '#f87171' : isSelected ? '#ffffff' : '#a3a3a3'}
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {t.id}
                    </text>

                    {[...Array(t.capacity)].map((_, cIdx) => {
                      const angle = (cIdx * 360) / t.capacity;
                      const rad = (angle * Math.PI) / 180;
                      const chairX = t.x + 25 * Math.cos(rad);
                      const chairY = t.y + 25 * Math.sin(rad);

                      return (
                        <circle
                          key={cIdx}
                          cx={chairX}
                          cy={chairY}
                          r="3"
                          className={`${isTaken ? 'fill-red-500/50' : isSelected ? 'fill-gold' : 'fill-white/20'}`}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center gap-6 mt-6 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-950/70 border border-red-500/40" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold/30 border border-gold" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          {selectedTable ? (
            <div className="luxury-glass luxury-glow p-8 rounded-3xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-2xl text-white tracking-wide mb-1">Table {selectedTable}</h3>
                  <p className="text-[10px] tracking-widest text-gold uppercase font-bold">{selectedMeta.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Noise Environment</span>
                  <span className="text-sm font-semibold text-gold-light">{selectedMeta.db} Decibels</span>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-3">Atmosphere Density Logs</span>
                <div className="flex items-center gap-1.5 h-8">
                  {[40, 50, 75, 45, 60, 80, 50, selectedMeta.db - 15, selectedMeta.db].map((v, i) => (
                    <div
                      key={i}
                      style={{ height: `${v}%` }}
                      className={`flex-1 rounded-sm transition-all duration-500 ${
                        v > 70 ? 'bg-red-400/80' : v > 55 ? 'bg-orange-400/80' : 'bg-gold/80'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">{selectedMeta.desc}</p>
              </div>

              {reservedTables[selectedTable] ? (
                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 text-center">
                  <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-300 font-semibold mb-1">Seat Currently Occupied</p>
                  <p className="text-[10px] text-gray-400">
                    Acquired by party of {reservedTables[selectedTable].guests} at {reservedTables[selectedTable].time}
                  </p>
                </div>
              ) : isSubmitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-5 rounded-2xl bg-gold/10 border border-gold/30 text-center flex flex-col items-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-gold" />
                  </div>
                  <h4 className="font-serif text-lg text-white font-light mb-1">Accreditation Verified</h4>
                  <p className="text-[10px] text-gold uppercase tracking-wider font-bold mb-3">Table Seating Secured</p>
                  <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed">
                    Table {selectedTable} in {selectedMeta.name} is confirmed for {formData.guests} guests at {formData.time}.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-[10px] leading-relaxed uppercase font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Accredited Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Maitre Sinclair"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Party Size</label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all cursor-pointer"
                      >
                        {[...Array(selectedTableCapacity)].map((_, i) => (
                          <option key={i} value={i + 1} className="bg-neutral-900 text-white">
                            {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Dining Hour</label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Contact Line</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 012-3456"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Special Directives</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Anniversary seating, molecular allergies..."
                      className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all resize-none h-16"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Secure Seating Accreditation
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="luxury-glass p-8 rounded-3xl text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
              <Users className="w-10 h-10 text-gold/30 mb-4" />
              <p className="font-serif text-lg text-white font-light mb-1">Atmosphere Viewer Idle</p>
              <p className="text-[10px] tracking-widest uppercase text-gold/60 font-semibold mb-2">Select a Table</p>
              <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed">
                Click any active table coordinates on the vector floor blueprint to preview real-time noise logs and atmosphere indicators.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
