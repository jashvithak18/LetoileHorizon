import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // 0. API Endpoint Configuration
  backendApi: import.meta.env.VITE_API_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://letoilehorizon.onrender.com'),

  // 1. Authentication State
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    localStorage.setItem('etoile_token', token);
    localStorage.setItem('etoile_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('etoile_token');
    localStorage.removeItem('etoile_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  loadAuthFromStorage: () => {
    const token = localStorage.getItem('etoile_token');
    const userStr = localStorage.getItem('etoile_user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr), isAuthenticated: true });
    }
  },

  // 2. UI Dining Mood/Atmosphere State
  mood: 'evening', // default: obsidian evening
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  setMood: (newMood) => {
    const root = document.documentElement;
    root.classList.remove('mood-morning', 'mood-rainy', 'mood-festive');
    if (newMood !== 'evening') {
      root.classList.add(`mood-${newMood}`);
    }
    set({ mood: newMood });
  },

  // 3. Interactive Plate Customizer State
  customPlate: {
    spiceLevel: 1, // 0 to 3
    toppings: [], // e.g. ["24k Gold Leaf", "Smoked Truffle Foam"]
    quantity: 1,
    baseDish: null // e.g. "Luminescent Truffle Sphere" or a custom design base
  },
  setBaseDish: (dish) => set((state) => ({
    customPlate: { ...state.customPlate, baseDish: dish }
  })),
  setSpiceLevel: (level) => set((state) => ({
    customPlate: { ...state.customPlate, spiceLevel: level }
  })),
  toggleTopping: (topping) => set((state) => {
    const toppings = [...state.customPlate.toppings];
    const idx = toppings.indexOf(topping);
    if (idx !== -1) {
      toppings.splice(idx, 1);
    } else {
      toppings.push(topping);
    }
    return { customPlate: { ...state.customPlate, toppings } };
  }),
  resetCustomPlate: () => set({
    customPlate: { spiceLevel: 1, toppings: [], quantity: 1, baseDish: null }
  }),

  // 4. Live Table Atmosphere Selections (Real-time Socket.io Sync)
  selectedTable: null,
  selectedZone: 'rooftop',
  reservedTables: {
    'R1': { name: 'Seraphina Sterling', guests: 2, time: '20:00' },
    'P2': { name: 'Aurelia Vance', guests: 4, time: '19:30' }
  },
  setSelectedTable: (tableId, zone) => set({ selectedTable: tableId, selectedZone: zone || get().selectedZone }),
  updateTableStatus: (tableId, status, bookingData) => set((state) => {
    const updated = { ...state.reservedTables };
    if (status === 'reserved' || status === 'unavailable') {
      updated[tableId] = bookingData || { name: 'Seated Diner', guests: 2, time: '19:00' };
    } else {
      delete updated[tableId];
    }
    return { reservedTables: updated };
  }),
  setReservedTables: (tables) => set({ reservedTables: tables })
}));
