import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Compass, Sparkles, Flame, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AiSommelier({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salutations. I am your personal AI Sommelier & Gastronomer. Whisper your culinary desires—be it an elevated spice, a vegetarian preference, or a pairing for cold coffee—and I shall curate the perfect Michelin tasting paths for you.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { mood, setBaseDish, backendApi } = useStore();

  const presets = [
    { label: 'Something Spicy & Rich', text: 'I want something spicy' },
    { label: 'Vegetarian but Filling', text: 'Vegetarian but filling' },
    { label: 'Pairs with Cold Coffee', text: 'Pairs beautifully with cold coffee' },
    { label: 'Under 300 Calories', text: 'Clean tasting under 300 calories' }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendApi}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      const resData = await response.json();

      if (resData.success && resData.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: resData.data.response,
            recommendations: resData.data.recommendations
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Apologies. The neural gastronomy database is experiencing a brief recalibration. Please ask me again.' }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I have lost contact with the central cellar logs, but I remain. For a lighter touch, try our Deconstructed Butter Paneer Tikka paired with Masala Chai Infusion.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto cursor-pointer"
          />

          {/* Chat Sliding Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] luxury-glass border-l border-white/10 z-50 flex flex-col pointer-events-auto shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-gold animate-spin-slow" />
                <div>
                  <h3 className="font-serif text-lg tracking-wider text-white">AI SOMMELIER</h3>
                  <p className="text-[10px] tracking-widest text-gold uppercase font-semibold">Gastronomic Guide</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    {msg.role === 'user' ? 'Your Palate' : 'Gastrobot'}
                  </span>

                  <div className={`p-4 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gold/20 border border-gold/30 text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>

                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full mt-3 space-y-4">
                      {msg.recommendations.map((rec, rIdx) => (
                        <div key={rIdx} className="p-4 rounded-xl luxury-glass border-gold/25 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-radial-[circle_at_center,_rgba(197,160,89,0.15)_0%,_transparent_70%]" />
                          
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-serif text-sm text-gold tracking-wide">{rec.name}</h4>
                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider text-gray-400">
                              {rec.calories} cal
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{rec.description}</p>
                          
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5">
                            <div className="flex items-center gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Flame key={i} className={`w-3 h-3 ${i < rec.spiceLevel ? 'text-red-400 fill-red-400' : 'text-gray-600'}`} />
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                setBaseDish(rec.name);
                                onClose();
                                document.getElementById('plate-builder')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-gold hover:text-white font-semibold cursor-pointer"
                            >
                              <UtensilsCrossed className="w-3 h-3" />
                              Load Base Plate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span className="text-[10px] uppercase tracking-widest animate-pulse font-semibold">Sommelier is pairing cellar vaults...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-6 py-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold block mb-2">Quick Gastronomic Phrases</span>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.text)}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-[10px] text-gray-300 hover:text-white cursor-pointer transition-all hover:scale-105"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 border-t border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3 relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Whisper taste requirements..."
                  className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-full px-5 py-3.5 pr-14 text-xs text-white placeholder-gray-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-black rounded-full disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
