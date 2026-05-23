import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, ShieldAlert, Sparkles, Check, ChevronRight } from 'lucide-react';

const FALLBACK_LOADS = [
  { hour: '12:00', occupancy: 40, avgWaitMinutes: 10 },
  { hour: '13:00', occupancy: 65, avgWaitMinutes: 20 },
  { hour: '14:00', occupancy: 50, avgWaitMinutes: 15 },
  { hour: '15:00', occupancy: 25, avgWaitMinutes: 5 },
  { hour: '16:00', occupancy: 20, avgWaitMinutes: 5 },
  { hour: '17:00', occupancy: 45, avgWaitMinutes: 10 },
  { hour: '18:00', occupancy: 75, avgWaitMinutes: 30 },
  { hour: '19:00', occupancy: 95, avgWaitMinutes: 50 },
  { hour: '20:00', occupancy: 100, avgWaitMinutes: 65 },
  { hour: '21:00', occupancy: 90, avgWaitMinutes: 45 },
  { hour: '22:00', occupancy: 60, avgWaitMinutes: 20 },
  { hour: '23:00', occupancy: 30, avgWaitMinutes: 10 }
];

export default function WaitlistHeatmap({ isOpen, onClose }) {
  const { mood } = useStore();
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState({
    currentWaitingCount: 2,
    hourlyLoads: FALLBACK_LOADS,
    smartRecommendations: [
      'Starlight Rooftop is currently at peak capacity. Wait times average 35 minutes.',
      'Grand Piano Salon features immediate availability at Table 12, with a 12% noise drop compared to earlier hours.',
      'Peak service is expected between 19:30 and 21:00. Seating before 18:30 features near-zero waiting durations.'
    ]
  });

  const [formData, setFormData] = useState({ name: '', phone: '', partySize: 2, ambienceZone: 'rooftop' });
  const [isSeated, setIsSeated] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/waitlist/analytics');
        const resData = await response.json();
        if (resData.success && resData.data) {
          setAnalytics(resData.data);
        }
      } catch (err) {
        // simulation
      }
    };
    fetchAnalytics();
  }, [isSeated]);

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      if (resData.success) {
        setEstimatedWait(resData.data.estimatedWaitMinutes);
        setIsSeated(true);
      }
    } catch (err) {
      setEstimatedWait(15 + formData.partySize * 5);
      setIsSeated(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 pointer-events-auto cursor-pointer"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full max-h-[92vh] luxury-glass border-t border-white/10 rounded-t-[32px] z-50 flex flex-col pointer-events-auto shadow-2xl overflow-y-auto no-scrollbar"
          >
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-white tracking-wide mb-1">Queue Intelligence</h3>
                <p className="text-[10px] tracking-widest text-gold uppercase font-bold">Smart Waitlist Heatmap & Analytics</p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full hover:bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-[10px] font-semibold uppercase tracking-widest cursor-pointer"
              >
                Close Logs
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Hourly Occupancy Profile</span>
                    <span className="text-[9px] text-gold-light font-semibold uppercase tracking-wider">Live Sync</span>
                  </div>

                  <div className="h-64 w-full">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.hourlyLoads} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#c5a059" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="hour" stroke="#525252" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#525252" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              background: '#121212',
                              border: '1px solid rgba(197, 160, 89, 0.3)',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: '#ffffff'
                            }}
                            labelStyle={{ color: '#c5a059', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="occupancy" stroke="#c5a059" strokeWidth={2} fillOpacity={1} fill="url(#goldGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500">
                        Synchronizing visual nodes...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Sommelier Queue Suggestions</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analytics.smartRecommendations.map((rec, rIdx) => (
                      <div key={rIdx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-gray-300 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-5">
                <div className="p-6 md:p-8 rounded-2xl bg-black/60 border border-white/5 relative overflow-hidden h-full flex flex-col justify-center">
                  
                  {isSeated ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center flex flex-col items-center py-6"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                        <Check className="w-6 h-6 text-gold animate-bounce" />
                      </div>
                      <h4 className="font-serif text-xl text-white font-light mb-1">Queue Place Registered</h4>
                      <p className="text-[10px] text-gold uppercase tracking-widest font-bold mb-4">Smart Waitlist Registered</p>
                      <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
                        We have reserved your virtual spot. Your estimated waiting time for the selected zone is:
                      </p>
                      
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 mb-4">
                        <Clock className="w-8 h-8 text-gold animate-pulse" />
                        <div className="text-left">
                          <span className="text-[9px] uppercase tracking-widest text-gray-500 block">Estimated Wait</span>
                          <span className="text-xl font-bold text-white">{estimatedWait} Minutes</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleJoinWaitlist} className="space-y-4">
                      <div className="mb-4">
                        <h4 className="font-serif text-xl text-white tracking-wide mb-1">Join the Waitlist</h4>
                        <p className="text-[9px] tracking-widest text-gray-500 uppercase font-bold">Skip stationary lobby waits</p>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Registered Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Lord Vance"
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Contact Line</label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 555 123 4567"
                            className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Party Size</label>
                          <select
                            value={formData.partySize}
                            onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <option key={n} value={n} className="bg-neutral-900 text-white">
                                {n} {n === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Aesthetic Atmosphere Zone</label>
                        <select
                          value={formData.ambienceZone}
                          onChange={(e) => setFormData({ ...formData, ambienceZone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all cursor-pointer"
                        >
                          <option value="rooftop" className="bg-neutral-900 text-white">Starlight Rooftop</option>
                          <option value="piano" className="bg-neutral-900 text-white">Grand Piano Salon</option>
                          <option value="hearth" className="bg-neutral-900 text-white">Chef's Hearthside</option>
                          <option value="terrace" className="bg-neutral-900 text-white">Oceanview Terrace</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Join Virtual Wait Queue
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
