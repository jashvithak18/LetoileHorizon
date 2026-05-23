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
    const particleCount = mood === 'rainy' ? 140 : 70;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getParticleConfig = () => {
      switch (mood) {
        case 'morning': // Neon Electric Blue sparks
          return {
            color: 'rgba(0, 229, 255, ',
            sizeMin: 1.5,
            sizeMax: 5.0,
            speedY: -0.35,
            speedX: 0.15,
            glow: 'rgba(0, 229, 255, 0.4)'
          };
        case 'rainy': // Titanium Rain (Cool Silver & Smoky Titanium)
          return {
            color: 'rgba(165, 180, 252, ',
            sizeMin: 0.8,
            sizeMax: 2.5,
            speedY: 3.5,
            speedX: -0.5,
            glow: 'rgba(165, 180, 252, 0.08)'
          };
        case 'festive': // Neon Electric Pink sparks
          return {
            color: 'rgba(255, 60, 172, ',
            sizeMin: 2.0,
            sizeMax: 6.0,
            speedY: -0.4,
            speedX: 0.25,
            glow: 'rgba(255, 60, 172, 0.4)'
          };
        case 'evening': // Cosmic Purple sparks (Default)
        default:
          return {
            color: 'rgba(181, 60, 254, ',
            sizeMin: 1.2,
            sizeMax: 4.5,
            speedY: -0.55,
            speedX: -0.12,
            glow: 'rgba(181, 60, 254, 0.4)'
          };
      }
    };

    const getShadowColor = () => {
      switch (mood) {
        case 'morning': return 'rgba(0, 229, 255, 0.65)';
        case 'rainy': return 'rgba(165, 180, 252, 0.2)';
        case 'festive': return 'rgba(255, 60, 172, 0.65)';
        case 'evening':
        default: return 'rgba(181, 60, 254, 0.65)';
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
        this.alpha = Math.random() * 0.6 + 0.15;
        this.speedY = this.config.speedY * (Math.random() * 0.8 + 0.6);
        this.speedX = this.config.speedX * (Math.random() * 0.8 + 0.6);
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.005;
      }

      update(config) {
        this.config = config;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.2;
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
          // Drawing rain droplets streaks
          ctx.strokeStyle = `${this.config.color}${this.alpha})`;
          ctx.lineWidth = this.size;
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX * 1.8, this.y + this.speedY * 1.8);
          ctx.stroke();
        } else {
          // Drawing round volumetric embers/sparks
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `${this.config.color}${this.alpha})`;
          ctx.shadowBlur = 10;
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
    { id: 'morning', label: 'Electric Blue', icon: Sparkles, color: 'text-electric-blue' },
    { id: 'rainy', label: 'Titanium Rain', icon: CloudRain, color: 'text-indigo-200' },
    { id: 'evening', label: 'Cosmic Purple', icon: Flame, color: 'text-cosmic-purple' },
    { id: 'festive', label: 'Neon Pink', icon: Moon, color: 'text-neon-pink' }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Volumetric shifting backdrop glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--accent-glow-color)_0%,_transparent_65%] animate-pulse opacity-40" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80 mix-blend-screen" />

      <div className="absolute top-24 right-6 pointer-events-auto z-50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3.5 rounded-full luxury-glass border-accent-glow/30 text-accent-glow hover:text-white transition-all hover:scale-105 pointer-events-auto cursor-pointer"
            aria-label="Adjust Atmosphere Dial"
          >
            {mood === 'morning' && <Sparkles className="w-5 h-5 animate-pulse" />}
            {mood === 'rainy' && <CloudRain className="w-5 h-5" />}
            {mood === 'evening' && <Flame className="w-5 h-5 animate-bounce" />}
            {mood === 'festive' && <Moon className="w-5 h-5" />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 p-2 rounded-2xl luxury-glass flex flex-col gap-1 w-48 shadow-2xl animate-fade-in z-50">
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-accent-glow/60 font-semibold">
                Atmospheric Modulator
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
                        ? 'bg-accent-glow/20 text-white shadow-inner font-semibold border border-accent-glow/30' 
                        : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
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
