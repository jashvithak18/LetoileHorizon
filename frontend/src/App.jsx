import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Music, Flame, Sparkles, Check, Users, Calendar, AlertTriangle, Send, User, LogOut, Terminal, ArrowLeft, ChevronRight, Play, X, Clock, HelpCircle, MapPin, Eye, BookOpen, Layers, Plus } from 'lucide-react';
import { useStore } from './store/useStore';
import { useSocket } from './hooks/useSocket';
import MoodBackdrop from './components/MoodBackdrop';

// Custom Recharts Area/Bar Charts (Vite safe)
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const HOURLY_LOADS = [
  { hour: '9AM', occupancy: 25 },
  { hour: '12PM', occupancy: 55 },
  { hour: '3PM', occupancy: 40 },
  { hour: '6PM', occupancy: 90 },
  { hour: '9PM', occupancy: 100 },
  { hour: '12AM', occupancy: 35 }
];

const BACKEND_API = import.meta.env.VITE_API_URL || 'https://letoilehorizon.onrender.com';

export default function App() {
  const { mood, setMood, customPlate, setSpiceLevel, toggleTopping, setBaseDish, user, token, isAuthenticated, logout, loadAuthFromStorage, selectedTable, selectedZone, setSelectedTable, reservedTables, setReservedTables, setAuth, currentPage, setCurrentPage } = useStore();
  const { emitTableBooking } = useSocket();

  // Navigation, Sound and Page settings
  const [soundOn, setSoundOn] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  
  // Login / Register view toggle (inside Auth page)
  const [isLoginView, setIsLoginView] = useState(true);
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 6-Step Build Your Plate wizard states
  const [customizerStep, setCustomizerStep] = useState(1); // 1: Base, 2: Toppings, 3: Sauces, 4: Spice, 5: Sides, 6: Drinks
  const [plateBase, setPlateBase] = useState('Luminescent Truffle Sphere');
  const [plateToppings, setPlateToppings] = useState([]);
  const [plateSauce, setPlateSauce] = useState('Cream Sauce');
  const [plateSpice, setPlateSpice] = useState(1);
  const [plateSide, setPlateSide] = useState('Garlic Bread');
  const [plateDrink, setPlateDrink] = useState('Citrus Mocktail');
  const [isCustomSaved, setIsCustomSaved] = useState(false);

  // AI Dining Concierge chat states
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', content: 'Salutations. I am Aura, your AI dining concierge. Whisper your culinary desires—be it capsaicin heat, comforting broths, or something paired with premium mocktails.' }
  ]);
  const [aiSuggestions, setAiSuggestions] = useState([
    { name: 'Spicy Ramen Bowl', price: 650, calories: 380, spiceLevel: 3, pairing: 'Cold Brew Coffee', description: 'Hand-pulled wheat noodles bathed in volcanic Szechuan dashi glaze.' },
    { name: 'Kung Pao Cottage Cheese', price: 580, calories: 410, spiceLevel: 2, pairing: 'Citrus Mocktail', description: 'Sautéed organic paneer cubes tossed in ginger-soy glaze.' },
    { name: 'Peri Peri Avocado Bowl', price: 720, calories: 280, spiceLevel: 3, pairing: 'Citrus Mocktail', description: 'Fresh avocado chunks glazed with hot birds-eye peri chili sauce.' }
  ]);

  // Seating Booking input states
  const [bookingFormData, setBookingFormData] = useState({ name: '', email: '', phone: '', guests: 2, date: '2026-05-23', time: '19:30', notes: '' });

  // Waitlist queue states
  const [waitlistFormData, setWaitlistFormData] = useState({ name: '', phone: '', partySize: 2 });
  const [isWaitSubmitted, setIsWaitSubmitted] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(25);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Admin and menus list
  const [menuItems, setMenuItems] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminWaitlist, setAdminWaitlist] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '', description: '', price: 650, category: 'entree',
    calories: 280, spiceLevel: 1, isVegetarian: true, isVegan: false, isGlutenFree: false,
    ingredientsStr: '', pairingsStr: ''
  });

  // Fetch initial menu
  useEffect(() => {
    loadAuthFromStorage();
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BACKEND_API}/api/menu`);
        const data = await res.json();
        if (data.success && data.data.length > 0) setMenuItems(data.data);
        else throw new Error();
      } catch (err) {
        setMenuItems([
          { _id: '1', name: 'Luminescent Truffle Sphere', price: 650, calories: 120, spiceLevel: 0, pairings: ['Château d\'Yquem', 'Cold Brew Coffee'], description: 'A liquid-spherified truffle essence encased in an isomalt veil.', isVegetarian: true },
          { _id: '2', name: 'Saffron Solar Cod', price: 850, calories: 420, spiceLevel: 1, pairings: ['Citrus Mocktail'], description: 'Sous-vide glacier cod in saffron seaweed butter with blood orange foam.' },
          { _id: '3', name: 'Hyperbaric Szechuan Duck', price: 1100, calories: 680, spiceLevel: 3, pairings: ['Jasmine Tea'], description: 'Pressure tenderized dry-aged duck breast glazed with Szechuan plum reductions.' }
        ]);
      }
    };
    fetchMenu();
  }, [loadAuthFromStorage]);

  // Sync reserved tables coordinate states
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${BACKEND_API}/api/reservations`, {
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
        // simulated fallbacks
      }
    };
    if (token) fetchReservations();
  }, [token, setReservedTables]);

  // Dynamic Neon Background Accent lights shifter
  useEffect(() => {
    const root = document.documentElement;
    let glow1 = '#0a0f1c'; // Deep Navy
    let glow2 = '#04060c'; // Obsidian blue-black
    let accent = 'rgba(181, 60, 254, 0.2)'; // Cosmic Purple
    let fgAccent = '#b53cfe';

    if (currentPage === 'ai-concierge') {
      glow1 = '#061320'; // Electric Blue theme
      glow2 = '#02060b';
      accent = 'rgba(0, 229, 255, 0.25)';
      fgAccent = '#00e5ff';
    } else if (currentPage === 'table-atmosphere') {
      glow1 = '#150620'; // Neon Purple theme
      glow2 = '#04020a';
      accent = 'rgba(181, 60, 254, 0.28)';
      fgAccent = '#b53cfe';
    } else if (currentPage === 'build-plate') {
      glow1 = '#200615'; // Neon Pink theme
      glow2 = '#080205';
      accent = 'rgba(255, 60, 172, 0.28)';
      fgAccent = '#ff3cac';
    } else if (currentPage === 'story') {
      glow1 = '#281a05'; // Volcanic / Warm Gold theme
      glow2 = '#0c0802';
      accent = 'rgba(255, 184, 0, 0.25)';
      fgAccent = '#ffb800';
    }

    root.style.setProperty('--bg-glow-color-1', glow1);
    root.style.setProperty('--bg-glow-color-2', glow2);
    root.style.setProperty('--accent-glow-color', accent);
    root.style.setProperty('--fg-accent-color', fgAccent);
  }, [currentPage]);

  // Seating Blueprint Table Click logic (guarded with login check)
  const handleSeatClick = (tId, tZone) => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setSelectedTable(tId, tZone);
    setIsBooked(false);
  };

  // Secure table booking API
  const handleBookingConfirm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_API}/api/reservations`, {
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

  // Conversational AI sommelier API
  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const query = aiInput;
    setAiInput('');
    setAiChat(prev => [...prev, { role: 'user', content: query }]);
    setAiLoading(true);

    try {
      const response = await fetch(`${BACKEND_API}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAiChat(prev => [...prev, { role: 'assistant', content: data.data.response }]);
        if (data.data.recommendations && data.data.recommendations.length > 0) {
          const mapped = data.data.recommendations.map(d => ({
            name: d.name,
            price: d.price || 650,
            calories: d.calories || 280,
            spiceLevel: d.spiceLevel || 1,
            pairing: d.pairings?.[0] || 'Citrus Mocktail',
            description: d.description || 'Delicately cooked molecular plate.'
          }));
          setAiSuggestions(mapped);
        }
      }
    } catch (err) {
      // simulated keyword fallback
      let reply = 'I have consulted the private cellars. Discover our signature molecular suggestions.';
      let list = [
        { name: 'Spicy Ramen Bowl', price: 650, calories: 380, spiceLevel: 3, pairing: 'Cold Brew Coffee', description: 'Hand-pulled wheat noodles bathed in volcanic Szechuan dashi glaze.' }
      ];

      if (query.toLowerCase().includes('comfort') || query.toLowerCase().includes('rain')) {
        reply = 'A stormy night calls for comforting warmth. I highly suggest Saffron Solar Cod paired with a Citrus Mocktail.';
        list = [
          { name: 'Saffron Solar Cod', price: 850, calories: 420, spiceLevel: 1, pairing: 'Citrus Mocktail', description: 'Sous-vide glacier cod in saffron seaweed butter with blood orange foam.' }
        ];
      } else if (query.toLowerCase().includes('truffle') || query.toLowerCase().includes('veggie')) {
        reply = 'Absolute luxury in clean vegetarian spheres. Enjoy the Luminescent Truffle Sphere.';
        list = [
          { name: 'Luminescent Truffle Sphere', price: 650, calories: 120, spiceLevel: 0, pairing: 'Cold Brew Coffee', description: 'A liquid-spherified truffle essence encased in an isomalt veil.' }
        ];
      }

      setAiChat(prev => [...prev, { role: 'assistant', content: reply }]);
      setAiSuggestions(list);
    } finally {
      setAiLoading(false);
    }
  };

  // Waitlist registry queue form submit
  const handleWaitlistRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_API}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...waitlistFormData, ambienceZone: 'rooftop' })
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

  // Accréditation User Authentication (Login/Register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const endpoint = isLoginView ? 'login' : 'register';

    try {
      const response = await fetch(`${BACKEND_API}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authFormData)
      });
      const resData = await response.json();

      if (resData.success && resData.data) {
        setAuth(resData.data, resData.data.token);
        setCurrentPage('home');
      } else {
        setAuthError(resData.message || 'Verification rejected.');
      }
    } catch (err) {
      // offline simulation bypass
      const mockUser = {
        name: authFormData.name || (authFormData.email.includes('admin') ? 'Maitre Vance' : 'Diner Sinclair'),
        email: authFormData.email,
        role: authFormData.email.includes('admin') ? 'admin' : 'customer',
        _id: 'mock_' + Math.random().toString(36).substr(2, 9)
      };
      setAuth(mockUser, 'mock_jwt_token_123456');
      setCurrentPage('home');
    } finally {
      setAuthLoading(false);
    }
  };

  // Admin operations: bookings completed statuses
  const handleUpdateAdminBooking = async (id, status) => {
    try {
      await fetch(`${BACKEND_API}/api/reservations/${id}`, {
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
      await fetch(`${BACKEND_API}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      alert('Masterpiece deployed!');
      window.location.reload();
    } catch (err) {
      alert('Seeded into simulated buffers.');
      setAdminOpen(false);
    }
  };

  // Build Your Plate customizer wizards details
  const handlePlateToppingToggle = (name) => {
    setPlateToppings(prev => {
      const idx = prev.indexOf(name);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return [...prev, name];
    });
  };

  const calculateCustomPlatePrice = () => {
    let basePrice = 650;
    if (plateBase === 'Saffron Solar Cod') basePrice = 850;
    if (plateBase === 'Hyperbaric Szechuan Duck') basePrice = 1100;
    
    let toppingsPrice = plateToppings.length * 120;
    let sidePrice = plateSide === 'None' ? 0 : 120;
    let drinkPrice = plateDrink === 'None' ? 0 : 250;

    return basePrice + toppingsPrice + sidePrice + drinkPrice;
  };

  // Dynamic Horizontal Scrollytelling overlay controller ticks
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
    <div className="w-full min-h-screen overflow-x-hidden no-scrollbar bg-radial-[circle_at_center,_var(--bg-glow-color-1)_0%,_var(--bg-glow-color-2)_100%] text-[#e6e8ea] select-none relative pb-28">
      
      {/* Background modulators particles */}
      <MoodBackdrop />
      <div className="volumetric-fog" />
      <div className="cinematic-vignette" />

      {/* Floating Center Glow Shifter */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] rounded-full border border-white/5 bg-radial-[circle_at_center,_rgba(230,232,234,0.03)_0%,_transparent_75%] pointer-events-none mix-blend-screen opacity-40 z-0 animate-atmospheric-shift" />

      {/* TOP HEADER */}
      <header className="sticky top-6 left-0 right-0 w-[92%] max-w-7xl mx-auto z-40 pointer-events-auto">
        <div className="luxury-glass luxury-glow rounded-full px-6 py-4 flex items-center justify-between">
          
          <button onClick={() => setCurrentPage('home')} className="flex flex-col items-start gap-0.5 cursor-pointer text-left border-none bg-transparent">
            <span className="font-serif text-base tracking-[0.25em] font-medium text-white">L'ÉTOILE HORIZON</span>
            <span className="text-[7.5px] tracking-[0.32em] uppercase font-semibold text-accent-glow">✧ ✧ ✧ molecular culinary suite</span>
          </button>

          {/* Router Nav tabs */}
          <div className="hidden lg:flex items-center gap-7 text-[9px] uppercase tracking-[0.22em] font-bold text-gray-400">
            {['home', 'ai-concierge', 'table-atmosphere', 'build-plate', 'waitlist', 'story', 'menu'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentPage(tab)}
                className={`transition-colors cursor-pointer ${currentPage === tab ? 'text-accent-glow font-bold animate-pulse' : 'hover:text-white'}`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('table-atmosphere')}
              className="flex items-center gap-1.5 border border-accent-glow/40 hover:border-accent-glow px-4.5 py-2 rounded-full font-medium tracking-wider text-[9px] uppercase text-accent-glow hover:bg-white/5 transition-all hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-accent-glow" />
              Reserve Table
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <button onClick={() => setCurrentPage('profile')} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8.5px] uppercase tracking-wider text-gray-300 cursor-pointer">
                  <User className="w-2.8 h-2.8 text-accent-glow" />
                  <span>{user?.name.split(' ')[0]}</span>
                </button>
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
              <button onClick={() => setCurrentPage('login')} className="bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black px-4 py-2 rounded-full font-bold uppercase tracking-wider text-[8.5px] transition-all hover:scale-105 cursor-pointer shadow-md shadow-accent-glow/5">
                Accréditation
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================
          13 FULL-SCREEN PAGES SPATIAL ROUTER VIEWPORTS
          ======================================================== */}
      <div className="w-full max-w-7xl mx-auto px-6 mt-8 relative z-20">
        <AnimatePresence mode="wait">
          
          {/* PAGE 1: HOME */}
          {currentPage === 'home' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }} className="w-full min-h-[80vh] flex flex-col md:flex-row items-center justify-between gap-8 py-8">
              
              {/* Left sidebar nav coordinates dial */}
              <div className="hidden md:flex flex-col gap-4 text-left">
                {[
                  { page: 'home', label: 'HOME', code: '01' },
                  { page: 'ai-concierge', label: 'AI CHEF', code: '02' },
                  { page: 'table-atmosphere', label: 'LIVE MAP', code: '03' },
                  { page: 'build-plate', label: 'BUILD PLATE', code: '04' },
                  { page: 'waitlist', label: 'WAITLIST', code: '05' },
                  { page: 'story', label: 'STORY', code: '06' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(item.page)}
                    className="group flex items-center gap-3 cursor-pointer text-left bg-transparent border-none outline-none"
                  >
                    <span className="text-[9px] font-extrabold tracking-widest text-accent-glow/55 group-hover:text-accent-glow transition-all">{item.code}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-glow/30 group-hover:bg-accent-glow group-hover:scale-150 transition-all duration-300" />
                    <span className="text-[8px] uppercase tracking-[0.25em] text-gray-500 group-hover:text-white transition-all font-bold">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Central Title Details */}
              <div className="flex flex-col items-start text-left gap-6 max-w-xl">
                <span className="text-[9px] tracking-[0.60em] uppercase font-bold text-accent-glow animate-pulse">AN IMPOSSIBLE LUXURY EXPERIENCE</span>
                <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl leading-[0.98] tracking-tight font-extralight text-white">
                  <span className="bg-gradient-to-b from-[#e6e8ea] via-[#ecdcc9] to-accent-glow bg-clip-text text-transparent italic font-light">BEYOND</span>
                  <br />
                  <span className="text-[1.02em] uppercase font-light tracking-[0.15em] block mt-1">THE ORDINARY</span>
                </h1>
                <p className="text-[11px] md:text-xs font-light tracking-[0.14em] max-w-md leading-relaxed text-gray-400">
                  Step into a world where culinary art meets futuristic imagination. Every detail. Every flavor. Crafted beyond limits.
                </p>
                <div className="flex gap-4 items-center mt-2 pointer-events-auto">
                  <button onClick={() => setCurrentPage('table-atmosphere')} className="flex items-center gap-2 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-[9px] shadow-2xl transition-all hover:scale-105 cursor-pointer hover:shadow-accent-glow/15">
                    Explore Experience
                  </button>
                  <button onClick={() => setCurrentPage('story')} className="flex items-center gap-2 bg-white/5 text-accent-glow border border-accent-glow/30 hover:border-accent-glow px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-[9px] backdrop-blur-md transition-all hover:scale-105 cursor-pointer">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Begin Story
                  </button>
                </div>
              </div>

              {/* Center levitating dish plate */}
              <div className="relative flex-1 max-w-md h-[400px] flex items-center justify-center">
                <div className="absolute w-[200px] h-[15px] bg-black/60 rounded-full blur-md bottom-12 animate-pulse opacity-50" />
                <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-[260px] h-[260px] lg:w-[320px] lg:h-[320px] flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-accent-glow/20 animate-spin-slow scale-105" />
                  <div className="absolute inset-2.5 rounded-full border border-dashed border-accent-glow/30 animate-pulse scale-95" />
                  
                  <div className="absolute top-4 left-10 w-2 h-2 rounded-full bg-white/30 blur-[1px] animate-bounce opacity-40" />
                  <div className="absolute bottom-10 right-4 w-1.5 h-1.5 rounded-full bg-white/20 blur-[1px] animate-pulse opacity-50" />

                  <div className="w-[190px] h-[190px] lg:w-[250px] lg:h-[250px] rounded-full overflow-hidden border border-white/15 bg-radial-[circle_at_center,_rgba(0,0,0,0.85)_0%,_rgba(10,10,10,1)_95%] shadow-2xl relative">
                    <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" alt="Molecular Course" className="object-cover w-full h-full opacity-85 rotate-12 scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
                  </div>
                </motion.div>
              </div>

              {/* Sound wave waves bottom left */}
              <div className="absolute bottom-8 left-12 flex items-center gap-3.5 pointer-events-auto z-30">
                <button onClick={() => setSoundOn(!soundOn)} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-accent-glow/40 px-3.5 py-2.5 rounded-full text-accent-glow hover:text-white transition-all cursor-pointer">
                  <Music className="w-3.5 h-3.5" />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Sound {soundOn ? 'ON' : 'OFF'}</span>
                </button>
                <div className="flex items-end gap-0.5 h-3">
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i} animate={{ height: soundOn ? [3, 12, 3] : 3 }} transition={{ duration: 0.6 + i * 0.15, repeat: Infinity, ease: "linear" }} className="w-[1.5px] bg-accent-glow" />
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* PAGE 2: AI DINING CONCIERGE (AURA) */}
          {currentPage === 'ai-concierge' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
              
              {/* Left conversational chat logs */}
              <div className="lg:col-span-7 luxury-glass neon-blue-glow p-6 rounded-[32px] flex flex-col justify-between min-h-[500px] text-left relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    {/* Animated Holographic AI Orb */}
                    <div className="relative w-12 h-12 rounded-full border border-electric-blue/40 flex items-center justify-center bg-black/60 overflow-hidden shadow-lg shadow-electric-blue/10">
                      <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-electric-blue/35 animate-spin-slow" />
                      <div className="w-6 h-6 rounded-full bg-radial-[circle_at_center,_rgba(0,229,255,0.75)_0%,_transparent_65%] animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base tracking-wider text-white">Aura AI</h3>
                      <p className="text-[7.5px] tracking-widest text-electric-blue uppercase font-bold">Molecular Sommelier</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] uppercase tracking-wider font-semibold text-gray-300">Live Concierge</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar max-h-[300px]">
                  {aiChat.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                      <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">{msg.role === 'user' ? 'Your Palate' : 'Aura'}</span>
                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-[10.5px] leading-relaxed text-left ${msg.role === 'user' ? 'bg-electric-blue/15 text-white border border-electric-blue/20' : 'bg-white/5 border border-white/5 text-gray-300'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {aiLoading && <div className="text-left text-[8px] text-electric-blue uppercase tracking-widest animate-pulse font-bold">Decoding gastronomic nodes...</div>}
                </div>

                <form onSubmit={handleAiAsk} className="flex gap-2 border-t border-white/5 pt-4 mt-4">
                  <input
                    type="text"
                    required
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Tell Aura your mood or capsaicin cravings..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-electric-blue/40 transition-all"
                  />
                  <button type="submit" className="p-3 bg-electric-blue text-black rounded-xl hover:bg-electric-blue/90 transition-all cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right suggested items cards */}
              <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Recommended Sequences</span>

                <div className="grid grid-cols-1 gap-3.5 overflow-y-auto no-scrollbar max-h-[460px] pr-1">
                  {aiSuggestions.map((rec, rIdx) => (
                    <div key={rIdx} className="p-4 bg-black/45 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between gap-3 group">
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="font-serif text-sm sm:text-base text-white tracking-wide">{rec.name}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[7px] bg-red-950/40 border border-red-500/20 px-1.5 py-0.5 rounded font-bold text-red-400 uppercase tracking-widest">
                              ✧ Spicy
                            </span>
                            <span className="text-[7px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-semibold">
                              {rec.calories} cal
                            </span>
                          </div>
                        </div>
                        <span className="font-serif text-base text-electric-blue font-semibold">₹{rec.price}</span>
                      </div>

                      <p className="text-[9.5px] text-gray-400 font-light leading-relaxed h-10 overflow-hidden">
                        {rec.description}
                      </p>

                      <div className="border-t border-white/5 pt-2.5 flex items-center justify-between">
                        <span className="text-[8px] text-accent-glow font-bold uppercase tracking-wider">Pairing: {rec.pairing}</span>
                        <button
                          onClick={() => {
                            setBaseDish(rec.name);
                            setCurrentPage('build-plate');
                            setCustomizerStep(2);
                          }}
                          className="text-[7.5px] uppercase tracking-widest text-white hover:text-electric-blue font-bold cursor-pointer transition-colors"
                        >
                          Load to Builder →
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* PAGE 3: LIVE TABLE ATMOSPHERE MAP */}
          {currentPage === 'table-atmosphere' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
              
              <div className="lg:col-span-7 luxury-glass neon-purple-glow p-6 rounded-[32px] flex flex-col gap-6 text-left relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-cosmic-purple font-bold block">03 Live Seating Blueprint</span>
                    <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">Choose Your Vibe</h2>
                  </div>

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
                        onClick={() => setSelectedTable(null, v.id)}
                        className={`px-3 py-1.5 rounded-full border text-[7.5px] uppercase tracking-widest font-bold cursor-pointer transition-all ${
                          selectedZone === v.id
                            ? 'bg-cosmic-purple/20 border-cosmic-purple text-white shadow-lg shadow-cosmic-purple/10'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center items-center flex-1 py-4">
                  <div className="w-full max-w-[280px]">
                    <svg viewBox="0 0 400 480" className="w-full h-auto overflow-visible select-none">
                      <line x1="20" y1="120" x2="380" y2="120" stroke="rgba(230,232,234,0.06)" strokeDasharray="3 3" />
                      <line x1="20" y1="220" x2="380" y2="220" stroke="rgba(230,232,234,0.06)" strokeDasharray="3 3" />
                      <line x1="20" y1="320" x2="380" y2="320" stroke="rgba(230,232,234,0.06)" strokeDasharray="3 3" />

                      {TABLES.map((t) => {
                        const taken = !!reservedTables[t.id];
                        const selected = selectedTable === t.id;
                        let color = 'fill-neutral-950 stroke-white/10 cursor-pointer hover:stroke-cosmic-purple';
                        if (taken) color = 'fill-red-950/60 stroke-red-500/20 cursor-not-allowed';
                        if (selected) color = 'fill-cosmic-purple/20 stroke-cosmic-purple';

                        return (
                          <g key={t.id} onClick={() => !taken && handleSeatClick(t.id, t.zone)}>
                            {selected && <circle cx={t.x} cy={t.y} r="22" className="fill-cosmic-purple/10 stroke-cosmic-purple/20 animate-pulse" />}
                            <circle cx={t.x} cy={t.y} r="16" className={`transition-all duration-300 ${color}`} />
                            <text x={t.x} y={t.y + 3} textAnchor="middle" fill={taken ? '#ef4444' : selected ? '#ffffff' : '#666'} fontSize="8" className="font-bold pointer-events-none">{t.id}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Noise meters logs */}
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-[8px]">
                  <span className="uppercase text-gray-400 font-semibold tracking-wider">Atmosphere noise</span>
                  <span className="text-cosmic-purple font-bold uppercase">{activeZoneTable.decibels} DB ({activeZoneTable.crowd})</span>
                </div>
              </div>

              {/* Right Booking coordinates details */}
              <div className="lg:col-span-5 flex flex-col justify-center text-left">
                {selectedTable ? (
                  <div className="p-6 bg-black/35 rounded-[32px] border border-white/5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg text-white font-medium">Coordinate Seating {selectedTable}</h4>
                      <p className="text-[7.5px] uppercase tracking-widest text-cosmic-purple font-bold">Atmosphere: {activeZoneTable.name}</p>
                    </div>

                    {reservedTables[selectedTable] ? (
                      <div className="p-4 bg-red-950/20 border border-red-500/10 rounded-xl text-center text-red-300 text-[8px] uppercase tracking-wider font-semibold">
                        ✧ Seated dome occupied at {reservedTables[selectedTable].time}
                      </div>
                    ) : isBooked ? (
                      <div className="p-4 bg-cosmic-purple/15 border border-cosmic-purple/20 rounded-xl text-center text-cosmic-purple text-[8.5px] uppercase tracking-wider font-bold">
                        ✓ Seating coordinate synced live
                      </div>
                    ) : (
                      <form onSubmit={handleBookingConfirm} className="space-y-3">
                        <input
                          type="text"
                          required
                          placeholder="Registered Name"
                          value={bookingFormData.name}
                          onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-cosmic-purple/40"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            required
                            value={bookingFormData.time}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, time: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none"
                          />
                          <select
                            value={bookingFormData.guests}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, guests: parseInt(e.target.value) })}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none"
                          >
                            <option value="2">2 Guests</option>
                            <option value="4">4 Guests</option>
                            <option value="6">6 Guests</option>
                          </select>
                        </div>
                        
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-cosmic-purple to-electric-blue text-black rounded-xl text-[8.5px] font-bold uppercase tracking-widest shadow-lg shadow-cosmic-purple/10">
                          Confirm Seating Vibe
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="p-8 bg-black/25 rounded-[32px] border border-dashed border-white/5 text-center text-gray-500 space-y-3">
                    <Users className="w-8 h-8 mx-auto text-cosmic-purple/20" />
                    <h4 className="text-[10px] uppercase tracking-widest text-cosmic-purple/50 font-bold">No Seating Selected</h4>
                    <p className="text-[10.5px] text-gray-400 font-light">Click any coordinate in the blueprint floor map on the left to initialize live reservation.</p>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* PAGE 4: BUILD YOUR PLATE ENGINE */}
          {currentPage === 'build-plate' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
              
              {/* Left Step Customizer Control panels */}
              <div className="lg:col-span-7 luxury-glass neon-pink-glow p-6 rounded-[32px] flex flex-col justify-between min-h-[500px] text-left">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[8px] uppercase tracking-[0.25em] text-neon-pink font-bold block">04 Build Your Plate Wizard</span>
                      <h3 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">Step {customizerStep} of 6: {
                        customizerStep === 1 && 'Base Dish Selection' ||
                        customizerStep === 2 && 'Custom toppings' ||
                        customizerStep === 3 && 'Aromatic Sauces' ||
                        customizerStep === 4 && 'Capsaicin Spice Level' ||
                        customizerStep === 5 && 'Extra Sides' ||
                        'drink Pairings'
                      }</h3>
                    </div>
                    {/* step badges indicators */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <span key={s} className={`w-2.5 h-1 rounded ${s === customizerStep ? 'bg-neon-pink scale-y-125' : 'bg-white/10'} transition-all`} />
                      ))}
                    </div>
                  </div>

                  {/* STEP 1: Base Dish selection */}
                  {customizerStep === 1 && (
                    <div className="space-y-3 animate-fade-in">
                      <p className="text-[10px] text-gray-400 font-light">Select the master base molecular course from our current catalog:</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {['Luminescent Truffle Sphere', 'Saffron Solar Cod', 'Hyperbaric Szechuan Duck'].map((dish) => (
                          <button
                            key={dish}
                            onClick={() => setPlateBase(dish)}
                            className={`p-4 rounded-xl border text-[10.5px] text-left cursor-pointer transition-all ${
                              plateBase === dish
                                ? 'bg-neon-pink/15 border-neon-pink text-white font-bold'
                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{dish}</span>
                              <span className="font-semibold text-neon-pink">₹{dish === 'Luminescent Truffle Sphere' ? '650' : dish === 'Saffron Solar Cod' ? '850' : '1100'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Toppings */}
                  {customizerStep === 2 && (
                    <div className="space-y-3 animate-fade-in">
                      <p className="text-[10px] text-gray-400 font-light">Choose custom toppings. Checked items drop dynamically onto the plate:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {TOPPINGS_CATALOG.map((item) => {
                          const active = plateToppings.includes(item.name);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handlePlateToppingToggle(item.name)}
                              className={`p-3 rounded-xl border text-[9.5px] text-left cursor-pointer transition-all ${
                                active
                                  ? 'bg-neon-pink/15 border-neon-pink text-white font-bold'
                                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <span className="text-[8px] text-neon-pink">+₹120</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Sauces */}
                  {customizerStep === 3 && (
                    <div className="space-y-3 animate-fade-in">
                      <p className="text-[10px] text-gray-400 font-light">Choose a molecular sauce base to complement the flavors:</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {['Cream Sauce', 'Pesto Sauce', 'Spicy Arrabbiata'].map((sauce) => (
                          <button
                            key={sauce}
                            onClick={() => setPlateSauce(sauce)}
                            className={`p-3.5 rounded-xl border text-[10px] text-left cursor-pointer transition-all ${
                              plateSauce === sauce
                                ? 'bg-neon-pink/15 border-neon-pink text-white font-bold'
                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                          >
                            {sauce}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Spice level */}
                  {customizerStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-[10px] text-gray-400 font-light">Adjust capsaicin heat monitors on volcanic stone beds:</p>
                      <div className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5">
                        <div className="text-left space-y-1">
                          <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">Capsaicin fire</span>
                          <span className="text-sm font-bold text-white uppercase block">
                            {plateSpice === 0 && 'Whisper of pepper'}
                            {plateSpice === 1 && 'Solar warmth'}
                            {plateSpice === 2 && 'Nitrogen shock'}
                            {plateSpice === 3 && 'Szechuan inferno'}
                          </span>
                        </div>
                        
                        <div className="flex gap-1 text-neon-pink">
                          {[...Array(3)].map((_, idx) => (
                            <button key={idx} onClick={() => setPlateSpice(idx + 1)} className="cursor-pointer border-none bg-transparent">
                              <Flame key={idx} className={`w-6 h-6 ${idx < plateSpice ? 'text-neon-pink fill-neon-pink' : 'text-gray-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Sides */}
                  {customizerStep === 5 && (
                    <div className="space-y-3 animate-fade-in">
                      <p className="text-[10px] text-gray-400 font-light">Select extra sides to expand taste parameters:</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {['None', 'Garlic Bread', 'Truffle Fries', 'Shiso Salad'].map((side) => (
                          <button
                            key={side}
                            onClick={() => setPlateSide(side)}
                            className={`p-3.5 rounded-xl border text-[10px] text-left cursor-pointer transition-all ${
                              plateSide === side
                                ? 'bg-neon-pink/15 border-neon-pink text-white font-bold'
                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{side}</span>
                              {side !== 'None' && <span className="text-[8px] text-neon-pink">+₹120</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Drink Pairing */}
                  {customizerStep === 6 && (
                    <div className="space-y-3 animate-fade-in">
                      <p className="text-[10px] text-gray-400 font-light">Combine with a paired molecular drink infusion:</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {['None', 'Cold Brew Coffee', 'Citrus Mocktail', 'Jasmine Tea'].map((drink) => (
                          <button
                            key={drink}
                            onClick={() => setPlateDrink(drink)}
                            className={`p-3.5 rounded-xl border text-[10px] text-left cursor-pointer transition-all ${
                              plateDrink === drink
                                ? 'bg-neon-pink/15 border-neon-pink text-white font-bold'
                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{drink}</span>
                              {drink !== 'None' && <span className="text-[8px] text-neon-pink">+₹250</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Wizard navigation indicators */}
                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4">
                  <button
                    disabled={customizerStep === 1}
                    onClick={() => setCustomizerStep(prev => Math.max(1, prev - 1))}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-[8px] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  {customizerStep < 6 ? (
                    <button
                      onClick={() => setCustomizerStep(prev => Math.min(6, prev + 1))}
                      className="flex items-center gap-1 bg-neon-pink text-black px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-[8px] cursor-pointer"
                    >
                      Next Step
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsCustomSaved(true);
                        setTimeout(() => {
                          setIsCustomSaved(false);
                          setCurrentPage('profile');
                        }, 2000);
                      }}
                      className="flex items-center gap-1 bg-gradient-to-r from-neon-pink to-electric-blue text-black px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[8px] cursor-pointer shadow-lg"
                    >
                      {isCustomSaved ? 'Plate Synced!' : 'Complete Plate'}
                    </button>
                  )}
                </div>

              </div>

              {/* Right Customizer Presentation Plate */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5 text-left">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Visual Plate Assembler</span>
                
                {/* 3D styled plate render */}
                <div className="relative w-full aspect-[4/3] rounded-[32px] border border-white/5 bg-gradient-to-b from-neutral-900 to-black overflow-hidden flex items-center justify-center shadow-2xl">
                  <div className="absolute w-[70%] h-[70%] rounded-full border border-dashed border-neon-pink/20 animate-spin-slow" />
                  
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-36 h-36 rounded-full bg-radial-[circle_at_center,_rgba(15,15,15,1)_0%,_rgba(40,40,40,1)_100%] border border-neon-pink/40 flex flex-col items-center justify-center text-center p-3 text-[9px] uppercase font-bold tracking-widest text-white shadow-2xl">
                    <span className="text-[7px] text-neon-pink mb-1">Base dish</span>
                    <span className="leading-tight">{plateBase}</span>
                  </motion.div>

                  <AnimatePresence>
                    {plateToppings.map((toppingName, tIdx) => {
                      const item = TOPPINGS_CATALOG.find(t => t.name === toppingName);
                      if (!item) return null;
                      
                      let offsetStyle = {};
                      if (item.id === 'gold') offsetStyle = { top: '25%', left: '30%' };
                      if (item.id === 'truffle') offsetStyle = { bottom: '25%', right: '28%' };
                      if (item.id === 'saffron') offsetStyle = { top: '35%', right: '25%' };
                      if (item.id === 'balsamic') offsetStyle = { bottom: '35%', left: '25%' };
                      if (item.id === 'shiso') offsetStyle = { top: '25%', right: '30%' };

                      return (
                        <motion.span
                          key={item.id}
                          initial={{ y: -120, opacity: 0 }}
                          animate={{ y: 0, opacity: 0.85 }}
                          exit={{ scale: 0.2, opacity: 0 }}
                          style={offsetStyle}
                          className="absolute w-3 h-3 rounded-full bg-neon-pink shadow-lg"
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Itemized Order summary */}
                <div className="p-5 bg-black/45 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Your Order</span>
                    <span className="text-base text-neon-pink font-semibold">₹{calculateCustomPlatePrice()}</span>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-gray-400 font-light max-h-[100px] overflow-y-auto no-scrollbar">
                    <div className="flex justify-between"><span>Base: {plateBase}</span></div>
                    {plateToppings.length > 0 && <div className="flex justify-between"><span>Toppings: {plateToppings.join(', ')}</span></div>}
                    <div className="flex justify-between"><span>Sauce: {plateSauce}</span></div>
                    <div className="flex justify-between"><span>Spice: Level {plateSpice}</span></div>
                    <div className="flex justify-between"><span>Side: {plateSide}</span></div>
                    <div className="flex justify-between"><span>Drink: {plateDrink}</span></div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* PAGE 5: SMART WAITLIST */}
          {currentPage === 'waitlist' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
              
              {/* Left Smart Waitlist Heatmap & Recharts */}
              <div className="lg:col-span-7 luxury-glass p-6 rounded-[32px] flex flex-col gap-6 text-left relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">05 Smart Waitlist matrix</span>
                    <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide font-medium">Waitlist Insights</h2>
                  </div>
                  
                  {/* Live occupancy percentage */}
                  <div className="px-3.5 py-2 bg-accent-glow/10 border border-accent-glow/20 rounded-full flex flex-col items-center">
                    <span className="text-[7px] text-accent-glow uppercase tracking-wider block">Live load</span>
                    <span className="text-xs font-bold text-white">78%</span>
                  </div>
                </div>

                {/* Heatmap Area Chart */}
                <div className="h-36 w-full p-2 bg-black/40 rounded-xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HOURLY_LOADS} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                      <defs>
                        <linearGradient id="neonG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--fg-accent-color)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--fg-accent-color)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" stroke="#444" fontSize={7} axisLine={false} tickLine={false} />
                      <YAxis stroke="#444" fontSize={7} axisLine={false} tickLine={false} />
                      <Area type="monotone" dataKey="occupancy" stroke="var(--fg-accent-color)" fill="url(#neonG)" strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block">Current Wait</span>
                    <span className="text-xs font-bold text-white">25-30 Mins</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block">People Ahead</span>
                    <span className="text-xs font-bold text-white">14</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block">Estimated Table</span>
                    <span className="text-xs font-bold text-white">8:45 PM</span>
                  </div>
                </div>
              </div>

              {/* Right Waitlist form registry inputs */}
              <div className="lg:col-span-5 flex flex-col justify-center text-left">
                {isWaitSubmitted ? (
                  <div className="p-6 bg-black/35 rounded-[32px] border border-white/5 text-center space-y-3 flex flex-col items-center">
                    <Check className="w-6 h-6 text-accent-glow animate-bounce" />
                    <h4 className="font-serif text-lg text-white tracking-wide">Queue Registry Confirmed</h4>
                    <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                      We have secured your profile inside virtual queues. We will send notifications when Table Dome ID aligns with party size.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistRegister} className="p-6 bg-black/35 rounded-[32px] border border-white/5 space-y-4">
                    <div className="space-y-1 border-b border-white/5 pb-3">
                      <h4 className="font-serif text-base text-white tracking-wide">Register Virtual Queue</h4>
                      <p className="text-[8px] uppercase tracking-widest text-accent-glow font-bold">Smart Waitlist Queue</p>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Diner Name"
                      value={waitlistFormData.name}
                      onChange={(e) => setWaitlistFormData({ ...waitlistFormData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-accent-glow/40"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Line coordinates"
                      value={waitlistFormData.phone}
                      onChange={(e) => setWaitlistFormData({ ...waitlistFormData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    />
                    <select
                      value={waitlistFormData.partySize}
                      onChange={(e) => setWaitlistFormData({ ...waitlistFormData, partySize: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="2">Party of 2 Guests</option>
                      <option value="4">Party of 4 Guests</option>
                      <option value="6">Party of 6 Guests</option>
                    </select>

                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-md">
                      Commit Queue Registry
                    </button>
                  </form>
                )}
              </div>

            </motion.div>
          )}

          {/* PAGE 6: OUR STORY (CINEMATIC SCROLLYTELLING OVERLAY) */}
          {currentPage === 'story' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full min-h-[75vh] flex flex-col justify-center items-center relative overflow-hidden bg-black/40 rounded-[32px] border border-white/5 p-8"
              onWheel={handleStoryScroll}
            >
              
              {/* horizontal glide story chapters */}
              <div className="w-full h-full flex items-center relative min-h-[460px]">
                
                {/* CHAPTER 1: Philosophy */}
                <div
                  style={{
                    opacity: storyScroll === 0 ? 1 : 0,
                    transform: `translate3d(${(0 - storyScroll) * 350}px, 0, 0)`,
                    pointerEvents: storyScroll === 0 ? 'auto' : 'none',
                    transition: 'opacity 0.8s ease, transform 0.8s ease'
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
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
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
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

                {/* CHAPTER 3: Molecular Plating */}
                <div
                  style={{
                    opacity: storyScroll === 2 ? 1 : 0,
                    transform: `translate3d(${(2 - storyScroll) * 350}px, 0, 0)`,
                    pointerEvents: storyScroll === 2 ? 'auto' : 'none',
                    transition: 'opacity 0.8s ease, transform 0.8s ease'
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="max-w-2xl text-center space-y-5 mx-auto flex flex-col items-center">
                    <span className="text-[8.5px] uppercase tracking-[0.4em] text-accent-glow font-bold">Chapter III: Gastronomic Climax</span>
                    <h3 className="font-serif text-5xl sm:text-6xl text-white font-extralight leading-tight">
                      Beyond <br />
                      <span className="italic text-accent-glow font-light">Sustenance</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-light leading-relaxed max-w-md">
                      Verify secure accreditation nodes. claim Table blueprints concurrently linked via real-time WebSocket sync networks.
                    </p>
                    <button onClick={() => setCurrentPage('home')} className="bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[8px] shadow-lg cursor-pointer transition-all hover:scale-105">
                      Return to Spatial Console
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom indicators */}
              <div className="absolute bottom-6 left-8 flex gap-4 items-center">
                {[0, 1, 2].map((idx) => (
                  <button key={idx} onClick={() => setStoryScroll(idx)} className="flex items-center gap-2 text-left cursor-pointer border-none bg-transparent">
                    <span className={`w-2.5 h-2.5 rounded-full ${storyScroll === idx ? 'bg-accent-glow scale-125' : 'bg-neutral-800'} transition-all`} />
                    <span className={`text-[7px] font-bold tracking-widest uppercase ${storyScroll === idx ? 'text-white' : 'text-gray-600'}`}>0{idx + 1}</span>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-6 right-8 text-right hidden sm:block">
                <span className="text-[7px] uppercase tracking-[0.35em] text-accent-glow/50 block">Cinematic Scrollytelling</span>
                <span className="text-[7.5px] text-gray-500 font-semibold">Scroll mouse wheel to glide chambers</span>
              </div>

            </motion.div>
          )}

          {/* PAGE 7: GOURMET MENU */}
          {currentPage === 'menu' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] py-6 text-left space-y-6">
              
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">Gourmet Catalogue</span>
                <h2 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-wide">Molecular Masterpieces</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div key={item._id} className="p-4 rounded-3xl luxury-glass border-white/5 flex flex-col justify-between min-h-[290px] relative overflow-hidden">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-white/10 bg-neutral-900 relative">
                      <img src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'} alt={item.name} className="object-cover w-full h-full opacity-80" />
                      <span className="absolute top-4 right-4 bg-black/85 px-3 py-1.5 rounded-lg border border-accent-glow/30 text-[10px] font-bold text-accent-glow">₹{item.price}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="font-serif text-base text-white tracking-wide">{item.name}</h4>
                        {item.calories > 0 && <span className="text-[7.5px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-semibold">{item.calories} Cal</span>}
                      </div>
                      
                      <p className="text-[9.5px] text-gray-400 font-light leading-relaxed h-12 overflow-hidden">{item.description}</p>
                      
                      <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                        <div className="flex gap-0.5 text-accent-glow">
                          {[...Array(3)].map((_, i) => (
                            <Flame key={i} className={`w-3.5 h-3.5 ${i < item.spiceLevel ? 'text-red-400 fill-red-400' : 'text-gray-700'}`} />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setBaseDish(item.name);
                            setPlateBase(item.name);
                            setCurrentPage('build-plate');
                            setCustomizerStep(2);
                          }}
                          className="text-[7.5px] uppercase tracking-widest text-accent-glow hover:text-white font-extrabold cursor-pointer transition-colors"
                        >
                          Load base dish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {/* PAGE 8: MY RESERVATIONS */}
          {currentPage === 'reservations' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] py-6 text-left space-y-6">
              
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">Diner Workspace</span>
                <h2 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-wide">My Active Domes</h2>
              </div>

              {!isAuthenticated ? (
                <div className="p-8 text-center bg-black/25 rounded-[32px] border border-white/5 space-y-3 flex flex-col items-center justify-center min-h-[300px]">
                  <ShieldAlert className="w-8 h-8 text-accent-glow animate-pulse" />
                  <p className="text-[9px] uppercase tracking-widest text-accent-glow font-bold">Verification coordinates missing</p>
                  <button onClick={() => setCurrentPage('login')} className="px-6 py-3 bg-accent-glow text-black rounded-full text-[8.5px] font-bold uppercase tracking-widest">Login via Accreditation</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(reservedTables).map((tableId) => {
                    const r = reservedTables[tableId];
                    return (
                      <div key={tableId} className="p-5 bg-black/35 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div className="space-y-1 text-left">
                          <span className="text-[8px] uppercase tracking-widest text-accent-glow font-bold">Dome coordinates: Table {tableId}</span>
                          <h4 className="font-serif text-base text-white tracking-wide">{r.name || user.name}</h4>
                          <p className="text-[9.5px] text-gray-400 font-light">Guests: {r.guests || 2} ✧ Hour: {r.time || '19:30'} ✧ Date: {r.date || '2026-05-23'}</p>
                        </div>
                        <button
                          onClick={() => {
                            const copy = { ...reservedTables };
                            delete copy[tableId];
                            setReservedTables(copy);
                          }}
                          className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-red-400 rounded-xl text-[8px] uppercase font-bold tracking-widest cursor-pointer"
                        >
                          Cancel Dome
                        </button>
                      </div>
                    );
                  })}
                  {Object.keys(reservedTables).length === 0 && (
                    <div className="col-span-2 p-8 text-center text-gray-500 font-light">No Domes claimed in this culinary sequence.</div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* PAGE 9: LOGIN / REGISTER */}
          {currentPage === 'login' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] flex items-center justify-center py-8">
              <div className="w-full max-w-sm luxury-glass p-8 rounded-3xl text-center space-y-6 relative pointer-events-auto">
                <div className="space-y-1">
                  <Compass className="w-8 h-8 text-accent-glow mx-auto mb-2 animate-spin-slow" />
                  <h2 className="font-serif text-2xl text-white tracking-wide">{isLoginView ? 'Accréditation' : 'Establish Profile'}</h2>
                  <p className="text-[8px] tracking-widest text-accent-glow uppercase font-bold">Claim secure credentials</p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[9px] uppercase tracking-wider font-semibold text-center flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
                  {!isLoginView && (
                    <div className="space-y-1">
                      <label className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Diner Name</label>
                      <input
                        type="text"
                        required
                        value={authFormData.name}
                        onChange={(e) => setAuthFormData({ ...authFormData, name: e.target.value })}
                        placeholder="Maitre Vance"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Mail Coordinates</label>
                    <input
                      type="email"
                      required
                      value={authFormData.email}
                      onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                      placeholder="admin@letoile.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[7.5px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Vault Keyphrase</label>
                    <input
                      type="password"
                      required
                      value={authFormData.password}
                      onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full py-3 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                    {authLoading ? 'Verifying keys...' : isLoginView ? 'Verify Accreditation' : 'Forge Profile Node'}
                  </button>
                </form>

                <div className="border-t border-white/5 pt-4 text-center text-[9px] uppercase tracking-widest text-gray-400">
                  {isLoginView ? (
                    <p>New coordinates? <button onClick={() => setIsLoginView(false)} className="text-accent-glow font-bold hover:text-white cursor-pointer bg-transparent border-none">Create credentials</button></p>
                  ) : (
                    <p>Have secure keys? <button onClick={() => setIsLoginView(true)} className="text-accent-glow font-bold hover:text-white cursor-pointer bg-transparent border-none">Log In</button></p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PAGE 10: USER PROFILE */}
          {currentPage === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] py-6 text-left space-y-6">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">Diner Profile Portal</span>
                  <h2 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-wide">{user?.name || 'Maitre Vance'}</h2>
                  <p className="text-[9px] text-gray-400 font-light">{user?.email || 'admin@letoile.com'} ✧ Role: {user?.role || 'Guest Admin'}</p>
                </div>
                <button onClick={logout} className="flex items-center gap-2 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[8px] text-red-400 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  De-Accredit Session
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Active reservations */}
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block">Booked Seating Domes</span>
                  {Object.keys(reservedTables).map((tableId) => {
                    const r = reservedTables[tableId];
                    return (
                      <div key={tableId} className="p-4 bg-black/35 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div className="text-left space-y-1">
                          <h4 className="text-sm font-semibold text-white">Table {tableId}</h4>
                          <p className="text-[9px] text-gray-400 font-light">Guests: {r.guests || 2} ✧ Hour: {r.time || '19:30'} ✧ Date: {r.date || '2026-05-23'}</p>
                        </div>
                        <span className="text-[7.5px] uppercase tracking-widest text-accent-glow font-bold">✧ Active</span>
                      </div>
                    );
                  })}
                  {Object.keys(reservedTables).length === 0 && (
                    <div className="p-6 bg-black/20 rounded-2xl border border-dashed border-white/5 text-center text-gray-500 text-[10px] font-light">No reservations registered.</div>
                  )}
                </div>

                {/* Custom customized plates profiles */}
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block">Customized Taste Profiles</span>
                  <div className="p-5 bg-black/35 rounded-[32px] border border-white/5 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="font-serif text-base text-white tracking-wide">{plateBase}</span>
                      <span className="text-xs text-accent-glow font-bold">₹{calculateCustomPlatePrice()}</span>
                    </div>

                    <div className="text-[9.5px] text-gray-400 font-light space-y-1 leading-relaxed border-t border-white/5 pt-3">
                      <div><span>Sauce base: {plateSauce}</span></div>
                      <div><span>Spice rating: Level {plateSpice}</span></div>
                      <div><span>Extra sides: {plateSide}</span></div>
                      <div><span>Infusion: {plateDrink}</span></div>
                      {plateToppings.length > 0 && <div><span>Added toppings: {plateToppings.join(', ')}</span></div>}
                    </div>

                    <button onClick={() => setCurrentPage('build-plate')} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] uppercase tracking-widest font-bold text-center block text-accent-glow transition-all">Modify Custom Plate</button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* PAGE 11: ABOUT CHEF */}
          {currentPage === 'about-chef' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 text-left items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-[1px] bg-accent-glow" />
                  <span className="text-[8px] uppercase tracking-[0.4em] text-accent-glow font-bold">The Philosophy</span>
                </div>
                
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-extralight leading-tight">
                  Chef Marcus Vance: <br />
                  <span className="italic text-accent-glow font-light">Taste as Architecture</span>
                </h2>
                
                <p className="text-[11px] sm:text-xs text-gray-400 font-light leading-relaxed max-w-xl">
                  Under the direction of Culinary Director Chef Marcus Vance, ingredients align with solar moisture meters. We tenderize dry-aged duck breast glided with rosemary plum reductions over heated volcanic stones. Sustenance forged as digital fine-dining architecture, awarded with three Michelin Star credentials for visual concept boundaries.
                </p>

                <div className="p-4 rounded-xl border border-white/5 bg-black/30 flex items-center gap-3 max-w-md">
                  <span className="text-accent-glow text-lg animate-pulse">✧ ✧ ✧</span>
                  <p className="text-[9.5px] text-gray-400 font-light leading-normal">Bespoke molecular creations matching high-frequency acoustic decibels.</p>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="w-64 sm:w-72 rounded-[32px] overflow-hidden luxury-glass border-white/10 p-3 shadow-2xl relative">
                  <div className="aspect-[3/4] rounded-[24px] overflow-hidden bg-neutral-900">
                    <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80" alt="chef vance" className="w-full h-full object-cover grayscale opacity-75" />
                  </div>
                  <div className="absolute bottom-6 left-6 text-left">
                    <span className="text-[7.5px] uppercase tracking-widest text-accent-glow font-bold block mb-0.5">Chef Marcus Vance</span>
                    <span className="font-serif text-xs text-white">Culinary Director</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* PAGE 12: SENSORY GALLERY */}
          {currentPage === 'gallery' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] py-6 text-left space-y-6">
              
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">Sensory visual Showcase</span>
                <h2 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-wide">Atmosphere Gallery</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Starlight Dome', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', desc: 'Spaceship lounge seating preview coordinates.' },
                  { title: 'Tasting Plating', img: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=600&q=80', desc: 'Molecular dry-aged duck glided with plum foam.' },
                  { title: 'Volcanic Buckwheat Soba', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', desc: 'Hand-pulled Szechuan noodles over volcanic stones.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-black/40 rounded-[32px] border border-white/5 space-y-3 group overflow-hidden relative">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 relative">
                      <img src={item.img} alt={item.title} className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="space-y-1 px-2 text-left">
                      <h4 className="font-serif text-base text-white tracking-wide">{item.title}</h4>
                      <p className="text-[9px] text-gray-400 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {/* PAGE 13: CONTACT PORTAL */}
          {currentPage === 'contact' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="w-full min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 items-center">
              
              {/* Form panel */}
              <div className="lg:col-span-7 luxury-glass p-6 rounded-[32px] text-left relative overflow-hidden">
                <div className="space-y-1 border-b border-white/5 pb-3 mb-4">
                  <span className="text-[8px] uppercase tracking-[0.25em] text-accent-glow font-bold block">Contact Coordinates</span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">Touch L'Étoile Horizon</h3>
                </div>

                {contactSubmitted ? (
                  <div className="p-8 text-center space-y-2 flex flex-col items-center justify-center">
                    <Check className="w-6 h-6 text-accent-glow animate-bounce" />
                    <h4 className="font-serif text-base text-white tracking-wide">Coordinates stage submitted</h4>
                    <p className="text-[10px] text-gray-400 font-light leading-relaxed max-w-sm">We have cataloged your coordinates and messages. A molecular assistant will trace you soon.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-accent-glow/40"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Mail Coordinate"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      />
                    </div>
                    <textarea
                      required
                      placeholder="Whisper message coordinates..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none h-24 resize-none"
                    />

                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-glow/85 to-accent-glow text-black rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-md">
                      Transmit message
                    </button>
                  </form>
                )}
              </div>

              {/* Right Coordinate location details */}
              <div className="lg:col-span-5 text-left space-y-6">
                <div className="p-5 bg-black/45 rounded-[32px] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-accent-glow animate-pulse" />
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Galactic Location</h4>
                      <p className="text-xs text-white font-light mt-0.5">Suite 2045, Horizon Tower, New Delhi, India</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent-glow" />
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block"> Ticking hours</h4>
                      <p className="text-xs text-white font-light mt-0.5">Every cycle: 18:00 - 24:00 (Reservations required)</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================
          FLOATING GLASS FOOTER NAVIGATION BAR (Sticky at Bottom)
          ======================================================== */}
      <footer className="fixed bottom-6 left-0 right-0 w-[92%] max-w-7xl mx-auto z-40 pointer-events-auto">
        <div className="luxury-glass luxury-glow rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
          
          {/* Main Footer pages tabs */}
          <div className="flex items-center gap-4 sm:gap-6 text-[8px] sm:text-[9.5px] uppercase tracking-wider font-extrabold text-gray-500">
            {[
              { page: 'home', label: 'HOME' },
              { page: 'ai-concierge', label: 'AI CONCIERGE' },
              { page: 'table-atmosphere', label: 'LIVE TABLE' },
              { page: 'build-plate', label: 'BUILD PLATE' },
              { page: 'waitlist', label: 'WAITLIST' },
              { page: 'story', label: 'OUR STORY' },
              { page: 'menu', label: 'MENU' }
            ].map((tab) => (
              <button
                key={tab.page}
                onClick={() => {
                  setCurrentPage(tab.page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`transition-all hover:text-white cursor-pointer px-1 py-1 ${
                  currentPage === tab.page ? 'text-accent-glow font-black border-b border-accent-glow animate-pulse' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OTHER PAGES Spatial grid dials (Right side footer) */}
          <div className="flex items-center gap-2.5 border-l border-white/10 pl-4 sm:pl-6 text-[7.5px] sm:text-[8.5px] uppercase font-bold text-gray-400">
            <button onClick={() => setCurrentPage('reservations')} className="hover:text-white cursor-pointer transition-colors">Domes</button>
            <button onClick={() => setCurrentPage('profile')} className="hover:text-white cursor-pointer transition-colors">Profile</button>
            <button onClick={() => setCurrentPage('about-chef')} className="hover:text-white cursor-pointer transition-colors">Chef</button>
            <button onClick={() => setCurrentPage('gallery')} className="hover:text-white cursor-pointer transition-colors">Gallery</button>
            <button onClick={() => setCurrentPage('contact')} className="hover:text-white cursor-pointer transition-colors">Contact</button>
          </div>

        </div>
      </footer>

      {/* ========================================================
          ADMINISTRATIVE CONTROL DRAWER
          ======================================================== */}
      <AnimatePresence>
        {adminOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setAdminOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 pointer-events-auto cursor-pointer" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-3xl luxury-glass border border-white/10 z-50 flex flex-col pointer-events-auto shadow-2xl overflow-hidden" style={{ position: 'fixed' }}>
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-accent-glow animate-pulse" />
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
                    <input type="number" required placeholder="Tasting Price (₹)" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
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
  { id: 'gold', name: 'Nebula Saffron Shimmer', price: 120 },
  { id: 'truffle', name: 'Smoked Truffle Foam', price: 120 },
  { id: 'saffron', name: 'Saffron Tuile Net', price: 120 },
  { id: 'balsamic', name: 'Aged Balsamic Pearls', price: 120 },
  { id: 'shiso', name: 'Emerald Shiso Sprouts', price: 120 }
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
