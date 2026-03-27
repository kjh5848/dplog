import React from "react";

interface NoiseOverlayProps {
  opacity?: number;
}

const NoiseOverlay: React.FC<NoiseOverlayProps> = ({ opacity = 0.2 }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
    </div>
  );
};

export default NoiseOverlay;
