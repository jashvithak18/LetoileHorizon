import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Flame, Sparkles, Edit, Trash2, Plus } from 'lucide-react';

export default function GourmetMenu({ onOpenAdmin }) {
  const { setBaseDish, user, token, backendApi } = useStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendApi}/api/menu`);
      const resData = await response.json();
      if (resData.success && resData.data) {
        setItems(resData.data);
      }
    } catch (err) {
      console.warn('Backend menu fetch offline. Syncing with fallback mockup catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you wish to delete this culinary masterpiece from the active menu?')) return;
    try {
      const response = await fetch(`${backendApi}/api/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (resData.success) {
        fetchMenu();
      }
    } catch (err) {
      alert('Delete failed. Offline simulation does not persist catalog truncations.');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const isAdmin = user?.role === 'admin';

  return (
    <section id="gourmet-menu" className="py-24 w-full max-w-7xl mx-auto px-6 relative pointer-events-auto">
      <div className="mb-12 text-center flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 block mb-1">Curated Catalogue</span>
        <h2 className="font-serif text-3xl md:text-5xl text-white tracking-wide font-light mb-4">Gourmet Masterpieces</h2>
        <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
          Savor molecular assemblies where taste structures undergo thermal nitrogen shocks, spherification gels, and dry-aged smoking reductions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-2xl bg-white/5 border border-white/5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flavor notes (e.g. truffle, saffron)..."
            className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-full pl-11 pr-5 py-3 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {['all', 'tasting', 'entree', 'dessert', 'beverage'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold cursor-pointer transition-all ${
                category === cat
                  ? 'bg-gold/20 border border-gold text-white'
                  : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[9px] cursor-pointer hover:scale-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Masterpiece
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gold gap-2">
          <Sparkles className="w-6 h-6 animate-spin-slow" />
          <span className="text-[10px] uppercase tracking-widest font-bold animate-pulse">Syncing cellar menus...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="font-serif text-lg font-light mb-1">No items match your query</p>
          <p className="text-[10px] uppercase tracking-wider text-gold/60 font-semibold">Try alternate flavor notes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="p-6 rounded-3xl luxury-glass border border-white/5 relative flex flex-col justify-between overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 border border-white/10">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                  alt={item.name}
                  className="object-cover w-full h-full hover:scale-105 transition-all duration-700"
                />
                
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gold/30 text-[10px] font-bold text-gold-light">
                  ₹{item.price}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl text-white tracking-wide">{item.name}</h3>
                    {item.calories > 0 && (
                      <span className="text-[8px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-400">
                        {item.calories} cal
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-300 leading-relaxed font-light mb-4">{item.description}</p>
                </div>

                <div className="space-y-3.5 mb-6 pt-3.5 border-t border-white/5">
                  {item.pairings && item.pairings.length > 0 && (
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Chef Pairing Recommendations</span>
                      <p className="text-[9px] text-gold-light italic">{item.pairings.join(' ✧ ')}</p>
                    </div>
                  )}

                  {item.ingredients && item.ingredients.length > 0 && (
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Elemental Matrix</span>
                      <p className="text-[9px] text-gray-400 font-light truncate">{item.ingredients.join(', ')}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Flame key={i} className={`w-3.5 h-3.5 ${i < item.spiceLevel ? 'text-red-400 fill-red-400' : 'text-gray-700'}`} />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.isVegetarian && <span className="text-[8px] uppercase font-bold text-lime-400 border border-lime-400/20 bg-lime-400/5 px-1.5 py-0.5 rounded">veg</span>}
                      {item.isVegan && <span className="text-[8px] uppercase font-bold text-teal-400 border border-teal-400/20 bg-teal-400/5 px-1.5 py-0.5 rounded">vegan</span>}
                      {item.isGlutenFree && <span className="text-[8px] uppercase font-bold text-cyan-400 border border-cyan-400/20 bg-cyan-400/5 px-1.5 py-0.5 rounded">gf</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setBaseDish(item.name);
                      document.getElementById('plate-builder')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 text-center bg-white/5 hover:bg-gold/15 text-gold border border-gold/30 hover:border-gold px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all hover:scale-105 cursor-pointer"
                  >
                    Load in Plate Architect
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onOpenAdmin}
                        title="Edit Dish in Admin"
                        className="p-3.5 rounded-xl bg-white/5 hover:bg-gold/15 text-gold border border-white/10 hover:border-gold/30 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete Dish"
                        className="p-3.5 rounded-xl bg-red-950/10 hover:bg-red-950/20 text-red-400 border border-red-500/20 hover:border-red-500/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
