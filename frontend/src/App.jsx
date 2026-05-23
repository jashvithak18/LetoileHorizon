import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Music, Flame, Sparkles, Check, Users, Calendar, AlertTriangle, Send, User, LogOut, Terminal, ArrowLeft, ChevronRight, Play, X, Clock, ShieldAlert } from 'lucide-react';
import { useStore } from './store/useStore';
import { useSocket } from './hooks/useSocket';
import MoodBackdrop from './components/MoodBackdrop';

// Custom Area/Bar Charts for Waitlist Analytics (Vite safe)
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'https://letoilehorizon.onrender.com';

const HOURLY_LOADS = [
  { hour: '9AM', occupancy: 20 },
  { hour: '12PM', occupancy: 50 },
  { hour: '3PM', occupancy: 35 },
  { hour: '6PM', occupancy: 85 },
  { hour: '9PM', occupancy: 100 },
  { hour: '12AM', occupancy: 30 }
];

export default function App() {
  const { mood, setMood, customPlate, setSpiceLevel, toggleTopping, setBaseDish, user, token, isAuthenticated, logout, loadAuthFromStorage, selectedTable, selectedZone, setSelectedTable, reservedTables, setReservedTables, setAuth } = useStore();
  const { emitTableBooking } = useSocket();

  // Navigation, Sound and Story Overlays
  const [page, setPage] = useState('home'); // 'home' | 'auth'
  const [adminOpen, setAdminOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [storyOverlay, setStoryOverlay] = useState(false);
  const [storyScroll, setStoryScroll] = useState(0); // 0, 1, 2 driven by delta wheel ticks in overlay
  const [isBooked, setIsBooked] = useState(false);
  const [isCustomSaved, setIsCustomSaved] = useState(false);

  // Seating Blueprint Zone selection
  const [activeVibe, setActiveVibe] = useState('rooftop'); // 'rooftop' | 'candlelight' | 'music' | 'quiet' | 'chef'

  // AI Dining Concierge state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState({
    text: 'A majestic journey. Whisper your culinary desires—be it capsaicin heat, comforting broths, or something paired with premium white wines.',
    suggestedDish: {
      name: 'Charred Miso Tofu Bowl',
      price: 65,
      calories: 280,
      spiceLevel: 2,
      pairing: 'Great with Cold Brew',
      description: 'Charred organic tofu chunks glazed in sweet white miso dashi, served with wild shiso greens.'
    }
  });

  // Table form state
  const [bookingFormData, setBookingFormData] = useState({ name: '', email: '', phone: '', guests: 2, date: '2026-05-23', time: '19:30', notes: '' });

  // Waitlist form state
  const [waitlistFormData, setWaitlistFormData] = useState({ name: '', phone: '', partySize: 2 });
  const [isWaitSubmitted, setIsWaitSubmitted] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(15);

  // Admin lists
  const [menuItems, setMenuItems] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminWaitlist, setAdminWaitlist] = useState([]);
  const [newDish, setNewDish] = useState({
    name: '', description: '', price: 75, category: 'entree',
    calories: 280, spiceLevel: 1, isVegetarian: true, isVegan: false, isGlutenFree: false,
    ingredientsStr: '', pairingsStr: ''
  });

  // Fetch initial data
  useEffect(() => {
    loadAuthFromStorage();
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/menu`);
        const data = await res.json();
        if (data.success && data.data.length > 0) setMenuItems(data.data);
        else throw new Error();
      } catch (err) {
        setMenuItems([
          { _id: '1', name: 'Luminescent Truffle Sphere', price: 75, calories: 120, spiceLevel: 0, pairings: ['Château d\'Yquem', 'Veuve Clicquot'], description: 'A liquid-spherified truffle essence encased in an isomalt veil.', isVegetarian: true },
          { _id: '2', name: 'Saffron Solar Cod', price: 95, calories: 420, spiceLevel: 1, pairings: ['Montrachet Chardonnay'], description: 'Sous-vide glacier cod in saffron seaweed butter with blood orange foam.' },
          { _id: '3', name: 'Hyperbaric Szechuan Duck', price: 110, calories: 680, spiceLevel: 3, pairings: ['Napa Cabernet'], description: 'Pressure tenderized dry-aged duck breast glazed with Szechuan plum reductions.' }
        ]);
      }
    };
    fetchMenu();
  }, [loadAuthFromStorage]);

  // Sync Seating Reserved table coordinates
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/reservations`, {
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
        // simulation fallback
      }
    };
    if (token) fetchReservations();
  }, [token, setReservedTables]);

  // Dynamic Background Light Morpher
  useEffect(() => {
    const root = document.documentElement;
    let glow1 = '#121727'; // Indigo
    let glow2 = '#04060c'; // Obsidian blue-black
    let accent = 'rgba(230, 232, 234, 0.15)'; // silver
    let fgAccent = '#e6e8ea'; 

    if (storyOverlay) {
      // cinematic overlay lighting: volcanic burnt copper embers
      glow1 = '#32140a';
      glow2 = '#080302';
      accent = 'rgba(242, 100, 25, 0.22)';
      fgAccent = '#c87a53';
    } else if (mood === 'morning') {
      glow1 = '#1b2633'; // Aurora Ambient
      glow2 = '#070a10';
      accent = 'rgba(45, 212, 191, 0.18)';
      fgAccent = '#2dd4bf';
    } else if (mood === 'rainy') {
      glow1 = '#1e1f26'; // Smoked Titanium Rain
      glow2 = '#0a0b0d';
      accent = 'rgba(165, 180, 252, 0.15)';
      fgAccent = '#a5b4fc';
    } else if (mood === 'festive') {
      glow1 = '#282018'; // Champagne Shimmer
      glow2 = '#0e0b08';
      accent = 'rgba(236, 220, 201, 0.2)';
      fgAccent = '#ecdcc9';
    }

    root.style.setProperty('--bg-glow-color-1', glow1);
    root.style.setProperty('--bg-glow-color-2', glow2);
    root.style.setProperty('--accent-glow-color', accent);
    root.style.setProperty('--fg-accent-color', fgAccent);
  }, [mood, storyOverlay]);

  // AI Dining Concierge submission
  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const query = aiInput;
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      const data = await response.json();
      if (data.success && data.data) {
        const dish = data.data.recommendations?.[0] || aiResponse.suggestedDish;
        setAiResponse({
          text: data.data.response || 'Chef Vance recommends this supreme tasting sequence.',
          suggestedDish: {
            name: dish.name || 'Charred Miso Tofu Bowl',
            price: dish.price || 65,
            calories: dish.calories || 280,
            spiceLevel: dish.spiceLevel || 1,
            pairing: dish.pairings?.[0] || 'Imperial Oolong Elixir',
            description: dish.description || 'Delicately cooked glacier course topped with saffron dust.'
          }
        });
      }
    } catch (err) {
      // offline Gastrobot responses
      let text = 'Welcome to the Horizon cellar. Here is a bespoke recipe for your mood.';
      let dish = { name: 'Luminescent Truffle Sphere', price: 75, calories: 120, spiceLevel: 0, pairing: 'Veuve Clicquot', description: 'A liquid-spherified winter truffle course encased in stardust veil.' };

      if (query.toLowerCase().includes('spicy') || query.toLowerCase().includes('duck')) {
        text = 'For your palate that craves high warmth, discover our signature capsaicin infuser.';
        dish = { name: 'Hyperbaric Szechuan Duck', price: 110, calories: 680, spiceLevel: 3, pairing: 'Napa Cabernet', description: 'Pressure glazed dry-aged duck breast glided with rosemary plum reductions.' };
      } else if (query.toLowerCase().includes('fish') || query.toLowerCase().includes('saffron')) {
        text = 'An ocean breeze meets solar heat. Capturing clean glacier cod structures.';
        dish = { name: 'Saffron Solar Cod', price: 95, calories: 420, spiceLevel: 1, pairing: 'Montrachet Chardonnay', description: 'Glacier cod bathed in saffron butter with blood orange sea parsley net.' };
      }

      setAiResponse({ text, suggestedDish: dish });
    } finally {
      setAiLoading(false);
    }
  };

  // SVG Floor map seat click mapping
  const handleSeatClick = (tId, tZone) => {
    setSelectedTable(tId, tZone);
    setIsBooked(false);
  };

  // Secure Reservation booking submission
  const handleBookingConfirm = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Verification required. Log in via Accréditation.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bookingFormData,
          tableId: selectedTable,
          ambienceZone: selectedZone
        })
      });
      const resData = await response.json();
      if (resData.success) {
        setIsBooked(true);
        emitTableBooking(selectedTable, selectedZone, {
          name: bookingFormData.name,
          guests: bookingFormData.guests,
          time: bookingFormData.time,
          date: bookingFormData.date
        });
      }
    } catch (err) {
      setIsBooked(true);
      emitTableBooking(selectedTable, selectedZone, {
        name: bookingFormData.name,
        guests: bookingFormData.guests,
        time: bookingFormData.time,
        date: bookingFormData.date
      });
    }
  };

  // Smart Waitlist submit queue registry
  const handleWaitlistRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...waitlistFormData, ambienceZone: selectedZone })
      });
      const data = await response.json();
      if (data.success) {
        setEstimatedWait(data.data.estimatedWaitMinutes);
        setIsWaitSubmitted(true);
      }
    } catch (err) {
      setEstimatedWait(15 + waitlistFormData.partySize * 5);
      setIsWaitSubmitted(true);
    }
  };

  // Open Administration console
  const handleOpenAdminTerminal = async () => {
    setAdminOpen(true);
    try {
      const resResponse = await fetch(`${API_BASE}/api/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await resResponse.json();
      if (resData.success) setAdminBookings(resData.data);

      const waitRes = await fetch(`${API_BASE}/api/waitlist`);
      const waitData = await waitRes.json();
      if (waitData.success) setAdminWaitlist(waitData.data);
    } catch (err) {
      // offline simulated logs
    }
  };

  const handleUpdateAdminBooking = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      handleOpenAdminTerminal();
    } catch (err) {
      setAdminBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    }
  };

  const handleCreateDishAdmin = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDish,
        ingredients: newDish.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
        pairings: newDish.pairingsStr.split(',').map(s => s.trim()).filter(Boolean)
      };
      await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      alert('Masterpiece deployed!');
      window.location.reload();
    } catch (err) {
      alert('Deployed inside simulated MERN buffers.');
      setAdminOpen(false);
    }
  };

  // Cinematic scrollytelling ticks inside horizontal storytelling overlay
  const handleStoryScroll = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      setStoryScroll(prev => Math.min(2, prev + 1));
    } else {
      setStoryScroll(prev => Math.max(0, prev - 1));
    }
  };

  const activeZoneTable = selectedZone ? ZONE_METADATA[selectedZone] : ZONE_METADATA.rooftop;

  return (
    <>
      {page === 'home' ? (
        <div className="w-full min-h-screen overflow-y-auto no-scrollbar scroll-smooth bg-radial-[circle_at_center,_var(--bg-glow-color-1)_0%,_var(--bg-glow-color-2)_100%] text-[#e6e8ea] select-none relative pb-16">
          
          {/* Layered Environmental Backgrounds & Particles */}
          <MoodBackdrop />
          <div className="volumetric-fog" />
          <div className="cinematic-vignette" />

          {/* Floating Volumetric Background Ring */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] rounded-full border border-white/5 bg-radial-[circle_at_center,_rgba(230,232,234,0.04)_0%,_transparent_75%] pointer-events-none mix-blend-screen opacity-40 z-0 animate-atmospheric-shift" />

          {/* MASTER HEADER */}
          <header className="sticky top-6 left-0 right-0 w-[92%] max-w-7xl mx-auto z-50 pointer-events-auto">
            <div className="luxury-glass luxury-glow rounded-full px-6 py-4 flex items-center justify-between">
              
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-start gap-0.5 cursor-pointer text-left">
                <span className="font-serif text-base tracking-[0.25em] font-medium text-white">L'ÉTOILE HORIZON</span>
                <span className="text-[7.5px] tracking-[0.32em] uppercase font-semibold text-accent-glow">✧ ✧ ✧ molecular culinary suite</span>
              </button>

              <div className="hidden lg:flex items-center gap-7 text-[9px] uppercase tracking-[0.22em] font-bold text-gray-400">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white cursor-pointer transition-colors">Experience</button>
                <button onClick={() => document.getElementById('grid-customizer').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white cursor-pointer transition-colors">Menu</button>
                <button onClick={() => document.getElementById('grid-atmosphere').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white cursor-pointer transition-colors">Reservations</button>
                <button onClick={() => document.getElementById('grid-waitlist').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white cursor-pointer transition-colors">Journey</button>
                <button onClick={() => setPage('auth')} className="hover:text-white cursor-pointer transition-colors">Accréditation</button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => document.getElementById('grid-atmosphere').scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-1.5 border border-accent-glow/40 hover:border-accent-glow px-4.5 py-2 rounded-full font-medium tracking-wider text-[9px] uppercase text-accent-glow hover:bg-white/5 transition-all hover:scale-105 cursor-pointer"
                >
                  <Calendar className="w-3 h-3 text-accent-glow" />
                  Reserve Dome
                </button>

                {isAuthenticated ? (
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8.5px] uppercase tracking-wider text-gray-300">
                      <User className="w-2.8 h-2.8 text-accent-glow" />
                      <span>{user?.name.split(' ')[0]}</span>
                    </span>
                    {user?.role === 'admin' && (
                      <button onClick={handleOpenAdminTerminal} className="p-2 rounded-full hover:bg-white/5 border border-accent-glow/20 text-accent-glow cursor-pointer">
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={logout} className="p-2 rounded-full hover:bg-white/5 border border-red-500/20 text-red-400 cursor-pointer">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setPage('auth')} className="bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black px-4 py-2 rounded-full font-bold uppercase tracking-wider text-[8.5px] transition-all hover:scale-105 cursor-pointer shadow-md shadow-accent-glow/5">
                    Accréditation
                  </button>
                )}
              </div>

            </div>
          </header>

          {/* ========================================================
              SECTION 1: BREATHTAKING HERO EXPERIENCE
              ======================================================== */}
          <section className="w-full min-h-screen relative flex items-center justify-between px-6 lg:px-16 max-w-7xl mx-auto z-20 gap-8">
            
            {/* Left dial navigation coord links */}
            <div className="hidden md:flex flex-col gap-4 text-left pointer-events-auto">
              {[
                { id: '01', label: 'HOME', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { id: '02', label: 'AI CHEF', action: () => document.getElementById('hero-ai-concierge')?.scrollIntoView({ behavior: 'smooth' }) },
                { id: '03', label: 'RESERVE', action: () => document.getElementById('grid-atmosphere').scrollIntoView({ behavior: 'smooth' }) },
                { id: '04', label: 'BUILD', action: () => document.getElementById('grid-customizer').scrollIntoView({ behavior: 'smooth' }) },
                { id: '05', label: 'WAITLIST', action: () => document.getElementById('grid-waitlist').scrollIntoView({ behavior: 'smooth' }) },
                { id: '06', label: 'STORY', action: () => document.getElementById('grid-story').scrollIntoView({ behavior: 'smooth' }) }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="group flex items-center gap-3 cursor-pointer select-none text-left bg-transparent border-none outline-none"
                >
                  <span className="text-[9px] font-extrabold tracking-widest text-accent-glow/55 group-hover:text-accent-glow transition-all">
                    {item.id}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-glow/30 group-hover:bg-accent-glow group-hover:scale-150 transition-all duration-300" />
                  <span className="text-[8px] uppercase tracking-[0.25em] text-gray-500 group-hover:text-white transition-all font-bold">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Middle Title Details */}
            <div className="flex flex-col items-start text-left gap-6 max-w-xl z-20">
              <span className="text-[9px] tracking-[0.60em] uppercase font-bold text-accent-glow animate-pulse">AN IMPOSSIBLE LUXURY EXPERIENCE</span>
              
              <h1 className="font-serif text-5xl lg:text-7xl xl:text-8xl leading-[0.98] tracking-tight font-extralight text-white">
                <span className="bg-gradient-to-b from-[#e6e8ea] via-[#ecdcc9] to-accent-glow bg-clip-text text-transparent italic font-light">BEYOND</span>
                <br />
                <span className="text-[1.02em] uppercase font-light tracking-[0.15em] block mt-1">THE ORDINARY</span>
              </h1>
              
              <p className="text-[11px] md:text-xs font-light tracking-[0.14em] max-w-md leading-relaxed text-gray-400">
                Step into a world where culinary art meets futuristic imagination. Every detail. Every flavor. Crafted beyond limits.
              </p>

              <div className="flex gap-4 items-center mt-2 pointer-events-auto">
                <button
                  onClick={() => document.getElementById('grid-atmosphere').scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-[9px] shadow-2xl transition-all hover:scale-105 cursor-pointer hover:shadow-accent-glow/15"
                >
                  Explore Experience
                </button>
                <button
                  onClick={() => {
                    setStoryOverlay(true);
                    setStoryScroll(0);
                  }}
                  className="flex items-center gap-2 bg-white/5 text-accent-glow border border-accent-glow/30 hover:border-accent-glow px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-[9px] backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Watch Film
                </button>
              </div>
            </div>

            {/* Center Levitating Plate Rendering */}
            <div className="relative flex-1 max-w-md h-[400px] flex items-center justify-center pointer-events-none">
              <div className="absolute w-[200px] h-[15px] bg-black/60 rounded-full blur-md bottom-12 animate-pulse opacity-50" />
              
              <motion.div
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-[260px] h-[260px] lg:w-[320px] lg:h-[320px] flex items-center justify-center"
              >
                {/* Floating Orbital Stardust loops */}
                <div className="absolute inset-0 rounded-full border border-accent-glow/20 animate-spin-slow scale-105" />
                <div className="absolute inset-2.5 rounded-full border border-dashed border-accent-glow/30 animate-pulse scale-95" />
                
                {/* floating particles inside circles */}
                <div className="absolute top-4 left-10 w-2 h-2 rounded-full bg-white/30 blur-[1px] animate-bounce opacity-40" />
                <div className="absolute bottom-10 right-4 w-1.5 h-1.5 rounded-full bg-white/20 blur-[1px] animate-pulse opacity-50" />

                {/* Spherified dish rendering */}
                <div className="w-[190px] h-[190px] lg:w-[250px] lg:h-[250px] rounded-full overflow-hidden border border-white/15 bg-radial-[circle_at_center,_rgba(0,0,0,0.85)_0%,_rgba(10,10,10,1)_95%] shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                    alt="Molecular Course"
                    className="object-cover w-full h-full opacity-85 rotate-12 scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
                </div>
              </motion.div>
            </div>

            {/* Right docked Holographic AI Dining Concierge */}
            <div id="hero-ai-concierge" className="w-[290px] lg:w-[330px] rounded-3xl luxury-glass border-accent-glow/20 p-5 text-left flex flex-col gap-4 relative z-30 pointer-events-auto">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-accent-glow animate-spin-slow" />
                  <span className="text-[10px] uppercase tracking-widest text-white font-semibold">AI Dining Concierge</span>
                </div>
                {/* AI mood orb indicator */}
                <span className="w-2 h-2 rounded-full bg-accent-glow animate-pulse" />
              </div>

              <p className="text-[9px] text-gray-400 font-light leading-relaxed">
                Ask anything. Get personalized gourmet course suggestions.
              </p>

              <form onSubmit={handleAiAsk} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="I want something spicy under 300 cal..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white placeholder-gray-600 outline-none focus:border-accent-glow/40 transition-all"
                />
                <button type="submit" className="p-2.5 bg-accent-glow text-black rounded-xl hover:bg-accent-glow/90 transition-all cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Suggestions results card */}
              <div className="p-3 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col gap-2">
                <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold">AI Suggests</span>
                
                {aiLoading ? (
                  <div className="py-6 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-widest text-accent-glow font-bold animate-pulse">Consulting taste vaults...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-left space-y-1">
                        <h4 className="font-serif text-sm text-white tracking-wide">{aiResponse.suggestedDish.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[6.5px] bg-red-950/30 border border-red-500/20 px-1 py-0.2 rounded font-bold text-red-400 uppercase tracking-widest">
                            ✧ Spicy lvl {aiResponse.suggestedDish.spiceLevel}
                          </span>
                          <span className="text-[6.5px] bg-white/5 px-1 py-0.2 rounded text-gray-400">
                            {aiResponse.suggestedDish.calories} cal
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-white/15">
                        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=100&q=80" alt="dish" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <p className="text-[8.5px] text-gray-400 font-light leading-normal leading-relaxed h-8 overflow-hidden">
                      {aiResponse.suggestedDish.description}
                    </p>

                    <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                      <span className="text-[8px] text-accent-glow font-semibold">{aiResponse.suggestedDish.pairing}</span>
                      <button
                        onClick={() => {
                          setBaseDish(aiResponse.suggestedDish.name);
                          document.getElementById('grid-customizer').scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[7.5px] uppercase tracking-widest text-white hover:text-accent-glow font-bold cursor-pointer"
                      >
                        Load to Customizer →
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Sound Wave bars bottom left */}
            <div className="absolute bottom-8 left-12 flex items-center gap-3.5 pointer-events-auto z-30">
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-accent-glow/40 px-3.5 py-2.5 rounded-full text-accent-glow hover:text-white transition-all cursor-pointer"
              >
                <Music className="w-3.5 h-3.5" />
                <span className="text-[8px] uppercase tracking-widest font-bold">Sound {soundOn ? 'ON' : 'OFF'}</span>
              </button>
              
              <div className="flex items-end gap-0.5 h-3">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: soundOn ? [3, 12, 3] : 3 }}
                    transition={{ duration: 0.6 + i * 0.15, repeat: Infinity, ease: "linear" }}
                    className="w-[1.5px] bg-accent-glow"
                  />
                ))}
              </div>
            </div>

          </section>

          {/* ========================================================
              SECTION 2: FUTURISTIC DASHBOARD SPATIAL GRID
              ======================================================== */}
          <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-20">
            
            {/* GRID ITEM 1: Live Seating Blueprint (Col-span 7) */}
            <div id="grid-atmosphere" className="lg:col-span-7 luxury-glass luxury-glow p-6 rounded-[32px] flex flex-col gap-6 text-left relative overflow-hidden min-h-[460px]">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">02 Live Table Atmosphere</span>
                  <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">Choose Your Perfect Vibe</h2>
                </div>

                {/* Seating Dials vibes */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'rooftop', name: 'Rooftop' },
                    { id: 'candlelight', name: 'Candlelight' },
                    { id: 'music', name: 'Live Music' },
                    { id: 'quiet', name: 'Quiet Corner' },
                    { id: 'chef', name: 'Chef\'s Table' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVibe(v.id)}
                      className={`px-3 py-1.5 rounded-full border text-[7.5px] uppercase tracking-widest font-bold cursor-pointer transition-all ${
                        activeVibe === v.id
                          ? 'bg-accent-glow/20 border-accent-glow text-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom floor plan mapping */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
                
                {/* SVG floor map with purple seating dots */}
                <div className="md:col-span-7 flex justify-center">
                  <div className="w-full max-w-[280px]">
                    <svg viewBox="0 0 400 480" className="w-full h-auto overflow-visible select-none">
                      <line x1="20" y1="120" x2="380" y2="120" stroke="rgba(230,232,234,0.06)" strokeDasharray="3 3" />
                      <line x1="20" y1="220" x2="380" y2="220" stroke="rgba(230,232,234,0.06)" strokeDasharray="3 3" />
                      <line x1="20" y1="320" x2="380" y2="320" stroke="rgba(230,232,234,0.06)" strokeDasharray="3 3" />

                      <text x="25" y="30" fill="rgba(255,255,255,0.22)" fontSize="8" className="uppercase font-bold tracking-widest">Rooftop domes</text>
                      <text x="25" y="130" fill="rgba(255,255,255,0.22)" fontSize="8" className="uppercase font-bold tracking-widest">Piano Salon</text>
                      <text x="25" y="230" fill="rgba(255,255,255,0.22)" fontSize="8" className="uppercase font-bold tracking-widest">Chef's hearthside</text>
                      <text x="25" y="330" fill="rgba(255,255,255,0.22)" fontSize="8" className="uppercase font-bold tracking-widest">Ocean Terrace</text>

                      {TABLES.map((t) => {
                        const taken = !!reservedTables[t.id];
                        const selected = selectedTable === t.id;
                        let color = 'fill-neutral-950 stroke-white/10 cursor-pointer hover:stroke-accent-glow';
                        if (taken) color = 'fill-red-950/60 stroke-red-500/20 cursor-not-allowed';
                        if (selected) color = 'fill-accent-glow/20 stroke-accent-glow';

                        return (
                          <g key={t.id} onClick={() => !taken && handleSeatClick(t.id, t.zone)}>
                            {selected && <circle cx={t.x} cy={t.y} r="22" className="fill-accent-glow/10 stroke-accent-glow/20 animate-pulse" />}
                            <circle cx={t.x} cy={t.y} r="16" className={`transition-all duration-300 ${color}`} />
                            <text x={t.x} y={t.y + 3} textAnchor="middle" fill={taken ? '#ef4444' : selected ? '#ffffff' : '#666'} fontSize="8" className="font-bold pointer-events-none">{t.id}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Form actions on the right */}
                <div className="md:col-span-5 flex flex-col gap-4 justify-center">
                  {selectedTable ? (
                    <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-4">
                      <div className="text-left space-y-1">
                        <h4 className="text-sm font-semibold text-white">Seating {selectedTable}</h4>
                        <p className="text-[7.5px] uppercase tracking-widest text-accent-glow font-bold">Zone: {activeZoneTable.name}</p>
                      </div>

                      {reservedTables[selectedTable] ? (
                        <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl text-center text-red-300 text-[8px] uppercase tracking-wider font-semibold">
                          ✧ Dome Claimed at {reservedTables[selectedTable].time}
                        </div>
                      ) : isBooked ? (
                        <div className="p-3 bg-accent-glow/10 border border-accent-glow/20 rounded-xl text-center text-accent-glow text-[8px] uppercase tracking-wider font-bold">
                          ✓ Table Registered Live
                        </div>
                      ) : (
                        <form onSubmit={handleBookingConfirm} className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Registered Name"
                            value={bookingFormData.name}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.8 text-[9px] text-white outline-none focus:border-accent-glow/40"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              required
                              value={bookingFormData.time}
                              onChange={(e) => setBookingFormData({ ...bookingFormData, time: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.8 text-[9px] text-white outline-none"
                            />
                            <select
                              value={bookingFormData.guests}
                              onChange={(e) => setBookingFormData({ ...bookingFormData, guests: parseInt(e.target.value) })}
                              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.8 text-[9px] text-white outline-none"
                            >
                              <option value="2">2 Guests</option>
                              <option value="4">4 Guests</option>
                              <option value="6">6 Guests</option>
                            </select>
                          </div>
                          
                          <button type="submit" className="w-full py-2 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-lg text-[8px] font-bold uppercase tracking-widest shadow-md">
                            Acquire Dome
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="p-5 bg-black/20 rounded-2xl border border-dashed border-white/5 text-center text-gray-500 space-y-2">
                      <Users className="w-6 h-6 mx-auto text-accent-glow/20" />
                      <p className="text-[8px] uppercase tracking-widest text-accent-glow/40 font-bold">No Dome Selected</p>
                      <p className="text-[9px] text-gray-400 font-light">Click any coordinate in the blueprint floor to initialize live reservation.</p>
                    </div>
                  )}

                  {/* sound intensity monitor */}
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-[8px]">
                    <span className="uppercase text-gray-400 font-semibold tracking-wider">Atmosphere decibel</span>
                    <span className="text-accent-glow font-bold uppercase">{activeZoneTable.decibels} DB ({activeZoneTable.crowd})</span>
                  </div>
                </div>

              </div>

            </div>

            {/* GRID ITEM 2: Build Your Plate Engine (Col-span 5) */}
            <div id="grid-customizer" className="lg:col-span-5 luxury-glass luxury-glow p-6 rounded-[32px] flex flex-col gap-5 text-left relative min-h-[460px]">
              
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">04 Build Your Plate</span>
                <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">You Imagine. We Create.</h2>
              </div>

              {/* Radial customizer dish image with ingredient springs */}
              <div className="relative flex justify-center my-2">
                <div className="relative w-44 h-44 rounded-full border border-accent-glow/15 flex items-center justify-center shadow-xl bg-gradient-to-b from-neutral-900 to-black overflow-hidden">
                  <div className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-accent-glow/25 animate-spin-slow" />
                  
                  <div className="w-20 h-20 rounded-full bg-radial-[circle_at_center,_rgba(15,15,15,1)_0%,_rgba(40,40,40,1)_100%] border border-accent-glow/40 flex items-center justify-center text-center p-2 text-[8px] uppercase font-bold tracking-widest text-accent-glow">
                    {customPlate.baseDish || 'Luminescent Sphere'}
                  </div>

                  <AnimatePresence>
                    {customPlate.toppings.map((toppingName) => {
                      const item = TOPPINGS_CATALOG.find(t => t.name === toppingName);
                      if (!item) return null;
                      
                      let offsetStyle = {};
                      if (item.id === 'gold') offsetStyle = { top: '22%', left: '32%' };
                      if (item.id === 'truffle') offsetStyle = { bottom: '22%', right: '25%' };
                      if (item.id === 'saffron') offsetStyle = { top: '35%', right: '22%' };
                      if (item.id === 'balsamic') offsetStyle = { bottom: '35%', left: '22%' };
                      if (item.id === 'shiso') offsetStyle = { top: '22%', right: '35%' };

                      return (
                        <motion.span
                          key={item.id}
                          initial={{ y: -100, opacity: 0 }}
                          animate={{ y: 0, opacity: 0.8 }}
                          exit={{ scale: 0.3, opacity: 0 }}
                          style={offsetStyle}
                          className="absolute w-2.5 h-2.5 rounded-full bg-accent-glow shadow-lg"
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Checkboxes selection for toppings and sauces */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {TOPPINGS_CATALOG.map((item) => {
                  const active = customPlate.toppings.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleTopping(item.name)}
                      className={`p-2 rounded-xl border text-[9px] text-left cursor-pointer transition-all ${
                        active
                          ? 'bg-accent-glow/20 border-accent-glow text-white font-bold'
                          : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-[7.5px] text-accent-glow/70">+${item.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Price and Add action bottom */}
              <div className="border-t border-white/5 pt-3.5 flex items-center justify-between gap-4">
                <div className="text-left space-y-0.5">
                  <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block">Energy Profile</span>
                  <span className="text-xs text-accent-glow font-bold">
                    {(customPlate.baseDish === 'Saffron Solar Cod' ? 420 : 120) + customPlate.toppings.length * 20} Cal (Total: ${(customPlate.baseDish === 'Saffron Solar Cod' ? 95 : 75) + customPlate.toppings.length * 15})
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsCustomSaved(true);
                    setTimeout(() => setIsCustomSaved(false), 2000);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-md cursor-pointer"
                >
                  {isCustomSaved ? 'Plate Built!' : 'Assemble Dish'}
                </button>
              </div>

            </div>

            {/* GRID ITEM 3: Smart Waitlist Heatmap (Col-span 6) */}
            <div id="grid-waitlist" className="lg:col-span-6 luxury-glass luxury-glow p-6 rounded-[32px] flex flex-col gap-5 text-left relative min-h-[380px]">
              
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">05 Smart Waitlist</span>
                  <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">Know When To Dine Best</h2>
                </div>
                
                {/* Live occupancy percentage */}
                <div className="px-3 py-1.5 bg-accent-glow/10 border border-accent-glow/20 rounded-full flex flex-col items-center">
                  <span className="text-[7px] text-accent-glow uppercase tracking-wider block">Live load</span>
                  <span className="text-xs font-bold text-white leading-none">78%</span>
                </div>
              </div>

              {/* Heatmap Area Chart */}
              <div className="h-32 w-full p-2 bg-black/40 rounded-xl border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_LOADS} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="purpleG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--fg-accent-color)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--fg-accent-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#444" fontSize={7} axisLine={false} tickLine={false} />
                    <YAxis stroke="#444" fontSize={7} axisLine={false} tickLine={false} />
                    <Area type="monotone" dataKey="occupancy" stroke="var(--fg-accent-color)" fill="url(#purpleG)" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Waitlist submission form / results details */}
              <div className="flex-1 flex flex-col justify-center">
                {isWaitSubmitted ? (
                  <div className="p-4 bg-accent-glow/10 border border-accent-glow/25 rounded-2xl text-center space-y-1">
                    <Check className="w-5 h-5 text-accent-glow mx-auto mb-1 animate-bounce" />
                    <h4 className="text-sm font-semibold text-white">Waitlist Entry Confirmed</h4>
                    <p className="text-[9px] text-gray-400 font-light">Your estimated virtual queue position is {estimatedWait} minutes. Enjoy spaceship lounge coordinates.</p>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Registered Name"
                        value={waitlistFormData.name}
                        onChange={(e) => setWaitlistFormData({ ...waitlistFormData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-accent-glow/40"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone coordinates"
                        value={waitlistFormData.phone}
                        onChange={(e) => setWaitlistFormData({ ...waitlistFormData, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <select
                        value={waitlistFormData.partySize}
                        onChange={(e) => setWaitlistFormData({ ...waitlistFormData, partySize: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none"
                      >
                        <option value="2">Party of 2</option>
                        <option value="4">Party of 4</option>
                        <option value="6">Party of 6</option>
                      </select>
                      <button type="submit" className="w-full py-2 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[8px] font-bold uppercase tracking-widest shadow-md">
                        Join Virtual Queue
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* GRID ITEM 4: Cinematic Story Portal (Col-span 6) */}
            <div id="grid-story" className="lg:col-span-6 luxury-glass luxury-glow p-6 rounded-[32px] flex flex-col justify-between text-left relative min-h-[380px] overflow-hidden group">
              
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80"
                  alt="Story Teaser"
                  className="w-full h-full object-cover opacity-15 grayscale group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">06 Cinematic Story</span>
                <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">Where Every Story Begins</h2>
              </div>

              <div className="relative z-10 space-y-4 pt-16">
                <p className="text-[10.5px] text-gray-400 font-light leading-relaxed max-w-md">
                  Discover the cosmic rhythm and molecular physics that shape Chef Marcus Vance's Gastronomic creations. Launch our fullscreen horizontal scrolling story deck.
                </p>

                <button
                  onClick={() => {
                    setStoryOverlay(true);
                    setStoryScroll(0);
                  }}
                  className="flex items-center gap-2 border border-accent-glow/40 hover:border-accent-glow px-5 py-3 rounded-full font-bold uppercase tracking-widest text-[8px] text-accent-glow hover:bg-white/5 transition-all hover:scale-105 cursor-pointer"
                >
                  Begin Journey
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </main>

          {/* ========================================================
              SECTION 3: WIDGET SUB-FOOTER ROWS
              ======================================================== */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 relative z-20">
            
            {/* Dynamic Atmosphere Weather Widget */}
            <div className="p-5 rounded-2xl luxury-glass border-white/5 text-left flex flex-col justify-between gap-4">
              <div>
                <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Dynamic Atmosphere</span>
                <p className="text-[10px] text-gray-300 font-light">The experience adapts dynamically to time, weather & mood cycles.</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-accent-glow uppercase tracking-widest font-bold">
                  {mood === 'morning' && '✦ Aurora Ambient'}
                  {mood === 'rainy' && '✦ Titanium Rain'}
                  {mood === 'evening' && '✦ Burnt Embers'}
                  {mood === 'festive' && '✦ Champagne Shimmer'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-pulse" />
              </div>
            </div>

            {/* Curated Tasting Menus */}
            <div className="p-5 rounded-2xl luxury-glass border-white/5 text-left flex flex-col justify-between gap-4 group">
              <div>
                <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Curated Tasting Menus</span>
                <p className="text-[10px] text-gray-300 font-light">Journeys crafted by our chefs represents absolute molecular pinnacle.</p>
              </div>
              <button
                onClick={() => document.getElementById('grid-customizer').scrollIntoView({ behavior: 'smooth' })}
                className="text-[8px] uppercase tracking-widest text-accent-glow hover:text-white font-extrabold cursor-pointer text-left block"
              >
                Explore Collection →
              </button>
            </div>

            {/* Chef's Table experience */}
            <div className="p-5 rounded-2xl luxury-glass border-white/5 text-left flex flex-col justify-between gap-4">
              <div>
                <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Chef's Table</span>
                <p className="text-[10px] text-gray-300 font-light">An exclusive coordinate seat into our volcanic culinary suite.</p>
              </div>
              <button
                onClick={() => document.getElementById('grid-atmosphere').scrollIntoView({ behavior: 'smooth' })}
                className="text-[8px] uppercase tracking-widest text-accent-glow hover:text-white font-extrabold cursor-pointer text-left block"
              >
                Claim Coordinates →
              </button>
            </div>

            {/* Inner Circle newsletter */}
            <div className="p-5 rounded-2xl luxury-glass border-white/5 text-left flex flex-col justify-between gap-3">
              <div>
                <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Join Our Inner Circle</span>
                <p className="text-[10px] text-gray-300 font-light">Exclusive invites, chef's molecular logs & private galactic events.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] text-white outline-none focus:border-accent-glow/40"
                />
                <button
                  onClick={() => alert('Welcome to the inner circle of L\'Étoile Horizon!')}
                  className="p-2.5 bg-accent-glow hover:bg-accent-glow/95 rounded-lg text-black transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </section>

          {/* ========================================================
              MODAL CONSOLES
              ======================================================== */}
          
          {/* Admin Terminal */}
          <AnimatePresence>
            {adminOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setAdminOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 pointer-events-auto cursor-pointer" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-3xl luxury-glass border border-white/10 z-50 flex flex-col pointer-events-auto shadow-2xl overflow-hidden" style={{ position: 'fixed' }}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-6 h-6 text-accent-glow" />
                      <div className="text-left">
                        <h3 className="font-serif text-lg tracking-wider text-white">Administration Terminal</h3>
                        <p className="text-[9px] tracking-widest text-accent-glow uppercase font-bold">Horizon Command Vault</p>
                      </div>
                    </div>
                    <button onClick={() => setAdminOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-black/10">
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Active Seating Dome Logs</span>
                      {adminBookings.length === 0 ? (
                        <p className="text-xs text-gray-500 font-light">Seating grids are empty in this cycle.</p>
                      ) : (
                        <div className="space-y-2">
                          {adminBookings.map((b) => (
                            <div key={b._id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <div>
                                <span className="font-serif text-sm text-white block">{b.name}</span>
                                <span className="text-[8px] text-gray-400">Table {b.tableId} ✧ Party of {b.guests}</span>
                              </div>
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateAdminBooking(b._id, 'completed')}
                                  className="px-3 py-1 bg-green-500/25 border border-green-500/30 text-green-300 rounded text-[9px] uppercase font-bold"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleCreateDishAdmin} className="space-y-3.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Catalog a New Piece</span>
                      <input type="text" required placeholder="Masterpiece Name" value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none" />
                      <textarea required placeholder="Sensory details..." value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none h-16 resize-none" />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" required placeholder="Tasting Price ($)" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
                        <input type="number" placeholder="Calorie Metric" value={newDish.calories} onChange={(e) => setNewDish({ ...newDish, calories: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Pairings (comma)" value={newDish.pairingsStr} onChange={(e) => setNewDish({ ...newDish, pairingsStr: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
                        <input type="text" placeholder="Ingredients (comma)" value={newDish.ingredientsStr} onChange={(e) => setNewDish({ ...newDish, ingredientsStr: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-accent-glow/10">
                        Commit Masterpiece
                      </button>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>
      ) : (
        /* Accréditation authorization workspace */
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none pointer-events-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--accent-glow-color)_0%,_transparent_75%] pointer-events-none" />
          <button
            onClick={() => setPage('home')}
            className="absolute top-8 left-8 flex items-center gap-2 text-xs uppercase tracking-widest text-accent-glow hover:text-white transition-all cursor-pointer pointer-events-auto border-none bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Horizon
          </button>
          
          <div className="w-full max-w-sm luxury-glass p-8 rounded-3xl relative flex flex-col justify-center text-center animate-pulse">
            <h2 className="font-serif text-2xl text-white tracking-wide mb-1.5">Verification Portal</h2>
            <p className="text-[8px] tracking-widest text-accent-glow uppercase font-bold mb-6">Claim Secure credentials</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAuth({ name: 'Maitre Vance', email: 'admin@letoile.com', role: 'admin' }, 'mock_token_123');
                setPage('home');
              }}
              className="space-y-4"
            >
              <input type="email" required placeholder="Mail coordinate (admin@letoile.com)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" />
              <input type="password" required placeholder="Passcode Keyphrase" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" />
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] cursor-pointer">
                Accredit Profile Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 6: FULLSCREEN IMAGES / Story Scrollytelling Overlay
          ======================================================== */}
      <AnimatePresence>
        {storyOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-md z-50 select-none flex items-center justify-center pointer-events-auto overflow-hidden text-left"
            onWheel={handleStoryScroll}
          >
            
            {/* Close story controls */}
            <button
              onClick={() => setStoryOverlay(false)}
              className="absolute top-8 right-8 p-3 rounded-full luxury-glass border-accent-glow/30 text-accent-glow hover:text-white cursor-pointer transition-all hover:scale-105 z-50 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Fullscreen drift elements backdrop */}
            <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(242,100,25,0.06)_0%,_transparent_75%] pointer-events-none" />

            {/* horizontal glide story chapters */}
            <div className="w-full h-full flex items-center relative">
              
              {/* CHAPTER 1: Philosophy */}
              <div
                style={{
                  opacity: storyScroll === 0 ? 1 : 0,
                  transform: `translate3d(${(0 - storyScroll) * 350}px, 0, 0)`,
                  pointerEvents: storyScroll === 0 ? 'auto' : 'none',
                  transition: 'opacity 0.8s ease, transform 0.8s ease'
                }}
                className="absolute inset-0 flex items-center justify-center px-12"
              >
                <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-5 text-left">
                    <span className="text-[8.5px] uppercase tracking-[0.4em] text-accent-glow font-bold">Chapter I: Cosmic Rhythm</span>
                    <h3 className="font-serif text-4xl sm:text-6xl text-white font-extralight leading-tight">
                      Sustenance Meets <br />
                      <span className="italic text-accent-glow font-light">Meteorology</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-light leading-relaxed">
                      At L'Étoile Horizon, we don't just plate food. When solar coordinates shift, our molecular spheres realign. Each drop captures a volumetric atmospheric rainfall logic.
                    </p>
                  </div>
                  
                  <div className="md:col-span-5 flex justify-center">
                    <div className="w-56 h-72 rounded-[24px] overflow-hidden border border-accent-glow/20 shadow-2xl bg-neutral-900">
                      <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=600&q=80" alt="chef" className="w-full h-full object-cover grayscale opacity-75" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CHAPTER 2: Molecular Shards */}
              <div
                style={{
                  opacity: storyScroll === 1 ? 1 : 0,
                  transform: `translate3d(${(1 - storyScroll) * 350}px, 0, 0)`,
                  pointerEvents: storyScroll === 1 ? 'auto' : 'none',
                  transition: 'opacity 0.8s ease, transform 0.8s ease'
                }}
                className="absolute inset-0 flex items-center justify-center px-12"
              >
                <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-dashed border-accent-glow/15 animate-spin-slow" />
                      <div className="w-44 h-44 rounded-full overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" alt="ingredient" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-5 text-left">
                    <span className="text-[8.5px] uppercase tracking-[0.4em] text-accent-glow font-bold">Chapter II: Saffron Nets</span>
                    <h3 className="font-serif text-4xl sm:text-6xl text-white font-extralight leading-tight">
                      Forged as <br />
                      <span className="italic text-accent-glow font-light">Digital Shards</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-light leading-relaxed">
                      Spherified winter truffle cores encased in stardust Veils. Our saffron net tuiles are glided with blood orange mist particles, transforming heat profiles on volcanic stones.
                    </p>
                  </div>
                </div>
              </div>

              {/* CHAPTER 3: Molecular Synthesis */}
              <div
                style={{
                  opacity: storyScroll === 2 ? 1 : 0,
                  transform: `translate3d(${(2 - storyScroll) * 350}px, 0, 0)`,
                  pointerEvents: storyScroll === 2 ? 'auto' : 'none',
                  transition: 'opacity 0.8s ease, transform 0.8s ease'
                }}
                className="absolute inset-0 flex items-center justify-center px-12"
              >
                <div className="max-w-3xl text-center space-y-6 mx-auto flex flex-col items-center">
                  <span className="text-[8.5px] uppercase tracking-[0.4em] text-accent-glow font-bold">Chapter III: Gastronomic Climax</span>
                  
                  <h3 className="font-serif text-5xl sm:text-7xl text-white font-extralight leading-tight">
                    Beyond <br />
                    <span className="italic text-accent-glow font-light">Sustenance</span>
                  </h3>
                  
                  <p className="text-[11px] sm:text-xs text-gray-400 font-light leading-relaxed max-w-lg">
                    Verify secure accreditation nodes. claim Table blueprints concurrently linked via real-time WebSocket sync networks.
                  </p>

                  <button
                    onClick={() => setStoryOverlay(false)}
                    className="bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[9px] shadow-lg cursor-pointer transition-all hover:scale-105"
                  >
                    Return to Spatial Console
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom scroll dials status indicators */}
            <div className="absolute bottom-8 left-12 flex gap-4 items-center">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setStoryScroll(idx)}
                  className="flex items-center gap-2 text-left cursor-pointer"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${storyScroll === idx ? 'bg-accent-glow scale-125' : 'bg-neutral-800'} transition-all`} />
                  <span className={`text-[7px] font-bold tracking-widest uppercase ${storyScroll === idx ? 'text-white' : 'text-gray-600'}`}>0{idx + 1}</span>
                </button>
              ))}
            </div>

            <div className="absolute bottom-8 right-12 text-right">
              <span className="text-[7px] uppercase tracking-[0.35em] text-accent-glow/50 block">Cinematic Scrollytelling</span>
              <span className="text-[8px] text-gray-500">Scroll mouse wheel to glide chambers</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

const ZONE_METADATA = {
  rooftop: { name: 'Starlight Rooftop', decibels: '35', crowd: 'Quiet Ambient' },
  candlelight: { name: 'Piano Salon Candlelight', decibels: '45', crowd: 'Soft Piano' },
  music: { name: 'Chef\'s Hearthside Live Music', decibels: '72', crowd: 'Lively Acoustic' },
  quiet: { name: 'Ocean Terrace Quiet Corner', decibels: '25', crowd: 'Whispering Winds' },
  chef: { name: 'Grand VIP Chef\'s Table', decibels: '50', crowd: 'Molecular Live Plating' }
};

const TOPPINGS_CATALOG = [
  { id: 'gold', name: 'Nebula Saffron Shimmer', price: 15 },
  { id: 'truffle', name: 'Smoked Truffle Foam', price: 25 },
  { id: 'saffron', name: 'Saffron Tuile Net', price: 20 },
  { id: 'balsamic', name: 'Aged Balsamic Pearls', price: 10 },
  { id: 'shiso', name: 'Emerald Shiso Sprouts', price: 8 }
];

const TABLES = [
  { id: 'R1', zone: 'rooftop', x: 80, y: 70, capacity: 2 },
  { id: 'R2', zone: 'rooftop', x: 190, y: 70, capacity: 4 },
  { id: 'R3', zone: 'rooftop', x: 300, y: 70, capacity: 2 },

  { id: 'P1', zone: 'candlelight', x: 80, y: 170, capacity: 4 },
  { id: 'P2', zone: 'candlelight', x: 190, y: 170, capacity: 2 },
  { id: 'P3', zone: 'candlelight', x: 300, y: 170, capacity: 6 },

  { id: 'H1', zone: 'music', x: 80, y: 270, capacity: 2 },
  { id: 'H2', zone: 'music', x: 190, y: 270, capacity: 4 },
  { id: 'H3', zone: 'music', x: 300, y: 270, capacity: 2 },

  { id: 'W1', zone: 'quiet', x: 80, y: 370, capacity: 4 },
  { id: 'W2', zone: 'quiet', x: 190, y: 370, capacity: 2 },
  { id: 'W3', zone: 'quiet', x: 300, y: 370, capacity: 6 }
];
