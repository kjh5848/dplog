import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, Download, ChevronDown } from 'lucide-react';

export const Button: React.FC<{
  variant?: 'primary' | 'secondary' | 'nav' | 'text' | 'primary-inverse' | 'secondary-inverse';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ variant = 'primary', children, className = '', onClick, icon, disabled }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 text-base border border-transparent shadow-sm",
    'primary-inverse': "bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 text-base border border-transparent shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-6 py-2.5 text-base shadow-sm backdrop-blur-sm bg-opacity-80",
    'secondary-inverse': "bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 px-6 py-3 text-base shadow-sm",
    nav: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-black px-4 py-2 text-sm rounded-lg",
    text: "bg-transparent text-blue-600 hover:text-blue-700 px-0 py-0 text-base hover:underline"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const TypedText: React.FC<{
  text: string;
  className?: string;
  startDelay?: number;
  typingSpeed?: number;
}> = ({ text, className = "", startDelay = 500, typingSpeed = 50 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(startTimeout);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }
  }, [started, displayedText, text, typingSpeed]);

  return (
    <span className={`${className} inline-block relative`}>
      {displayedText}
      <span className="animate-pulse ml-0.5 inline-block w-[3px] h-[1em] bg-blue-500 align-middle"></span>
    </span>
  );
};

export const SectionContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 ${className}`}>
    {children}
  </div>
);

export const ParticleCanvas: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'light' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const particleCount = 60;
    const connectionDistance = 150;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const color = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
      const particleColor = theme === 'light' ? '#1a73e8' : '#ffffff';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    initParticles();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};