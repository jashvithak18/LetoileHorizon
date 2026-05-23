import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Flame, CloudRain, Moon, Sparkles } from 'lucide-react';

export default function MoodBackdrop() {
  const canvasRef = useRef(null);
  const mood = useStore((state) => state.mood);
  const setMood = useStore((state) => state.setMood);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let particles = [];
    const particleCount = mood === 'rainy' ? 100 : 50;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getParticleConfig = () => {
      switch (mood) {
        case 'morning': // Soft warm gold floating motes
          return {
            color: 'rgba(249, 115, 22, ',
            sizeMin: 1.5,
            sizeMax: 4.0,
            speedY: -0.2,
            speedX: 0.1,
            glow: 'rgba(249, 115, 22, 0.15)'
          };
        case 'rainy': // Gentle lavender rain
          return {
            color: 'rgba(168, 85, 247, ',
            sizeMin: 0.6,
            sizeMax: 1.8,
            speedY: 2.5,
            speedX: -0.3,
            glow: 'rgba(168, 85, 247, 0.06)'
          };
        case 'festive': // Soft rose gold sparkles
          return {
            color: 'rgba(236, 72, 153, ',
            sizeMin: 1.5,
            sizeMax: 4.5,
            speedY: -0.3,
            speedX: 0.18,
            glow: 'rgba(236, 72, 153, 0.15)'
          };
        case 'evening': // Elegant lavender dust (Default)
        default:
          return {
            color: 'rgba(168, 85, 247, ',
            sizeMin: 1.0,
            sizeMax: 3.5,
            speedY: -0.35,
            speedX: -0.08,
            glow: 'rgba(168, 85, 247, 0.12)'
          };
      }
    };

    const getShadowColor = () => {
      switch (mood) {
        case 'morning': return 'rgba(249, 115, 22, 0.2)';
        case 'rainy': return 'rgba(168, 85, 247, 0.08)';
        case 'festive': return 'rgba(236, 72, 153, 0.2)';
        case 'evening':
        default: return 'rgba(168, 85, 247, 0.15)';
      }
    };

    class Particle {
      constructor(config) {
        this.config = config;
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init 
          ? Math.random() * canvas.height 
          : (this.config.speedY > 0 ? -10 : canvas.height + 10);
        
        this.size = Math.random() * (this.config.sizeMax - this.config.sizeMin) + this.config.sizeMin;
        this.alpha = Math.random() * 0.35 + 0.08;
        this.speedY = this.config.speedY * (Math.random() * 0.8 + 0.6);
        this.speedX = this.config.speedX * (Math.random() * 0.8 + 0.6);
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.015 + 0.003;
      }

      update(config) {
        this.config = config;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.15;
        this.wobble += this.wobbleSpeed;

        if (
          this.y < -20 || 
          this.y > canvas.height + 20 || 
          this.x < -20 || 
          this.x > canvas.width + 20
        ) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        if (this.config.speedY > 2) {
          ctx.strokeStyle = `${this.config.color}${this.alpha})`;
          ctx.lineWidth = this.size;
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX * 1.5, this.y + this.speedY * 1.5);
          ctx.stroke();
        } else {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `${this.config.color}${this.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = getShadowColor();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    const init = () => {
      particles = [];
      const config = getParticleConfig();
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(config));
      }
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const config = getParticleConfig();

      particles.forEach((p) => {
        p.update(config);
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [mood]);

  const moodsList = [
    { id: 'morning', label: 'Warm Sunrise', icon: Sparkles, color: 'text-sunset-orange' },
    { id: 'rainy', label: 'Lavender Rain', icon: CloudRain, color: 'text-electric-lavender' },
    { id: 'evening', label: 'Violet Dusk', icon: Flame, color: 'text-electric-lavender' },
    { id: 'festive', label: 'Rose Glow', icon: Moon, color: 'text-aurora-pink' }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Volumetric soft ambient glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--accent-glow-color)_0%,_transparent_65%] animate-pulse opacity-30" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />

      <div className="absolute top-24 right-6 pointer-events-auto z-50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3.5 rounded-full luxury-glass border border-white/40 text-accent-glow hover:text-graphite transition-all hover:scale-105 pointer-events-auto cursor-pointer shadow-lg shadow-black/5"
            aria-label="Adjust Atmosphere"
          >
            {mood === 'morning' && <Sparkles className="w-5 h-5 animate-pulse" />}
            {mood === 'rainy' && <CloudRain className="w-5 h-5" />}
            {mood === 'evening' && <Flame className="w-5 h-5 animate-bounce" />}
            {mood === 'festive' && <Moon className="w-5 h-5" />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 p-2 rounded-2xl luxury-glass flex flex-col gap-1 w-48 shadow-xl animate-fade-in z-50 border border-white/40">
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-gray-400 font-semibold">
                Atmosphere
              </div>
              {moodsList.map((m) => {
                const Icon = m.icon;
                const active = mood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMood(m.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[10px] uppercase tracking-wider transition-all pointer-events-auto cursor-pointer ${
                      active 
                        ? 'bg-accent-glow/10 text-graphite shadow-inner font-semibold border border-accent-glow/20' 
                        : 'hover:bg-white/40 text-gray-500 hover:text-graphite border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
