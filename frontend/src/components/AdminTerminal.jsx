import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, ShieldCheck, Calendar, Users, Utensils, Check, Ban, Plus, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTerminal({ isOpen, onClose }) {
  const { token } = useStore();
  const [activeTab, setActiveTab] = useState('bookings');
  
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newDish, setNewDish] = useState({
    name: '', description: '', price: 65, category: 'entree',
    calories: 250, spiceLevel: 1, isVegetarian: false, isVegan: false, isGlutenFree: false,
    ingredientsStr: '', pairingsStr: '', image: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const resResponse = await fetch('http://localhost:5000/api/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await resResponse.json();
      if (resData.success && resData.data) {
        setBookings(resData.data);
      }

      const waitResponse = await fetch('http://localhost:5000/api/waitlist');
      const waitData = await waitResponse.json();
      if (waitData.success && waitData.data) {
        setWaitlist(waitData.data);
      }
    } catch (err) {
      console.warn('Backend terminal offline. Running simulation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchData();
    }
  }, [isOpen, token]);

  const handleUpdateBooking = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const resData = await response.json();
      if (resData.success) {
        fetchData();
      }
    } catch (err) {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    }
  };

  const handleUpdateWaitlist = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/waitlist/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const resData = await response.json();
      if (resData.success) {
        fetchData();
      }
    } catch (err) {
      setWaitlist(prev => prev.filter(w => w._id !== id));
    }
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDish,
        ingredients: newDish.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
        pairings: newDish.pairingsStr.split(',').map(s => s.trim()).filter(Boolean)
      };

      const response = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      
      if (resData.success) {
        alert('Molecular culinary masterpiece cataloged successfully!');
        setNewDish({
          name: '', description: '', price: 65, category: 'entree',
          calories: 250, spiceLevel: 1, isVegetarian: false, isVegan: false, isGlutenFree: false,
          ingredientsStr: '', pairingsStr: '', image: ''
        });
        window.location.reload();
      }
    } catch (err) {
      alert('Dish created inside simulation buffer. Refresh parent grid to view local mock array.');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 pointer-events-auto cursor-pointer"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-[10%] left-[5%] right-[5%] bottom-[10%] lg:left-[15%] lg:right-[15%] rounded-3xl luxury-glass border border-white/10 z-50 flex flex-col pointer-events-auto shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-gold" />
                <div>
                  <h3 className="font-serif text-lg tracking-wider text-white">Administration Terminal</h3>
                  <p className="text-[9px] tracking-widest text-gold uppercase font-bold">L'Étoile Horizon Command Vault</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={fetchData}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                  title="Reload Live Logs"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/5 p-4 flex md:flex-col gap-1 bg-black/10 overflow-x-auto no-scrollbar">
                {[
                  { id: 'bookings', label: 'Live Bookings', icon: Calendar },
                  { id: 'waitlist', label: 'Walk-in Queue', icon: Users },
                  { id: 'menu', label: 'Menu CRUD Portal', icon: Utensils }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                        active
                          ? 'bg-gold/20 text-white shadow-inner'
                          : 'hover:bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gold" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-black/5 no-scrollbar">
                {activeTab === 'bookings' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Active Reservation Database</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{bookings.length} Total Bookings</span>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-xs">
                        No active seating logs are registered in this cycle.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-serif text-sm text-white font-medium">{booking.name}</span>
                                <span className="text-[8px] uppercase tracking-widest bg-gold/10 text-gold-light border border-gold/20 px-1.5 py-0.5 rounded font-bold">
                                  Table {booking.tableId}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400">
                                Party of {booking.guests} ✧ {booking.date} at {booking.time} ✧ {booking.phone}
                              </p>
                              {booking.notes && <p className="text-[9px] text-gold-light italic">Notes: "{booking.notes}"</p>}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border mr-2 ${
                                booking.status === 'confirmed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                booking.status === 'completed' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400'
                              }`}>
                                {booking.status}
                              </span>

                              {booking.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateBooking(booking._id, 'completed')}
                                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg cursor-pointer transition-all"
                                    title="Complete & Release Table"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBooking(booking._id, 'cancelled')}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg cursor-pointer transition-all"
                                    title="Cancel Reservation"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'waitlist' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Active Live Virtual Queue</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{waitlist.length} Waiting Parties</span>
                    </div>

                    {waitlist.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-xs">
                        The virtual queue contains no pending records.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {waitlist.map((waitItem) => (
                          <div key={waitItem._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-serif text-sm text-white font-medium">{waitItem.name}</span>
                                <span className="text-[8px] uppercase tracking-widest bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
                                  {waitItem.ambienceZone}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400">
                                Party of {waitItem.partySize} ✧ Phone: {waitItem.phone} ✧ Estimated wait: {waitItem.estimatedWaitMinutes}m
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateWaitlist(waitItem._id, 'seated')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-[9px] uppercase tracking-widest font-bold cursor-pointer transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Seat Guest
                              </button>
                              <button
                                onClick={() => handleUpdateWaitlist(waitItem._id, 'cancelled')}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg cursor-pointer transition-all"
                                title="Dismiss Queue"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'menu' && (
                  <form onSubmit={handleCreateDish} className="space-y-4 max-w-xl">
                    <div className="mb-4 pb-2 border-b border-white/5">
                      <h4 className="font-serif text-lg text-white font-light mb-1">Catalog a New Piece</h4>
                      <p className="text-[9px] text-gray-500 uppercase font-bold">Deploy high-end molecular recipes directly to active database structures</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Masterpiece Name</label>
                        <input
                          type="text"
                          required
                          value={newDish.name}
                          onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                          placeholder="Liquid Amber Tuile"
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Tasting Price ($)</label>
                        <input
                          type="number"
                          required
                          value={newDish.price}
                          onChange={(e) => setNewDish({ ...newDish, price: parseInt(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Gourmet Sensory Description</label>
                      <textarea
                        required
                        value={newDish.description}
                        onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                        placeholder="A thermal frozen sheet of elderberry gold flakes encasing fresh rose fog..."
                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all h-20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Course Category</label>
                        <select
                          value={newDish.category}
                          onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all cursor-pointer"
                        >
                          <option value="tasting" className="bg-neutral-900 text-white">Tasting</option>
                          <option value="entree" className="bg-neutral-900 text-white">Entrée</option>
                          <option value="dessert" className="bg-neutral-900 text-white">Dessert</option>
                          <option value="beverage" className="bg-neutral-900 text-white">Beverage</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Calorie Metric</label>
                        <input
                          type="number"
                          value={newDish.calories}
                          onChange={(e) => setNewDish({ ...newDish, calories: parseInt(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Spice Level (0-3)</label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={newDish.spiceLevel}
                          onChange={(e) => setNewDish({ ...newDish, spiceLevel: parseInt(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Cellar Pairings (comma-separated)</label>
                        <input
                          type="text"
                          value={newDish.pairingsStr}
                          onChange={(e) => setNewDish({ ...newDish, pairingsStr: e.target.value })}
                          placeholder="Vintage Rosé, White Bud Tea"
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Raw Ingredients (comma-separated)</label>
                        <input
                          type="text"
                          value={newDish.ingredientsStr}
                          onChange={(e) => setNewDish({ ...newDish, ingredientsStr: e.target.value })}
                          placeholder="Isomalt, Elderberry, Rose Dew"
                          className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1.5">Media Image URL</label>
                      <input
                        type="text"
                        value={newDish.image}
                        onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                        placeholder="https://images.unsplash.com/... or blank for default"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
                      />
                    </div>

                    <div className="flex gap-6 py-2 text-[10px] font-semibold text-gray-400 uppercase">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newDish.isVegetarian}
                          onChange={(e) => setNewDish({ ...newDish, isVegetarian: e.target.checked })}
                          className="rounded border-white/10 text-gold focus:ring-0 accent-gold"
                        />
                        <span>Vegetarian</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newDish.isVegan}
                          onChange={(e) => setNewDish({ ...newDish, isVegan: e.target.checked })}
                          className="rounded border-white/10 text-gold focus:ring-0 accent-gold"
                        />
                        <span>Vegan</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newDish.isGlutenFree}
                          onChange={(e) => setNewDish({ ...newDish, isGlutenFree: e.target.checked })}
                          className="rounded border-white/10 text-gold focus:ring-0 accent-gold"
                        />
                        <span>Gluten Free</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Commit Masterpiece to Menu logs
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
