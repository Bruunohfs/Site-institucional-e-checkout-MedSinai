// src/components/ui/HeartbeatLine.jsx (VERSÃO COM GRADIENTE DO SITE)

import React from 'react';

const HeartbeatLine = ({ className }) => (
  <svg 
    className={`absolute -bottom-1 left-0 w-full h-4 overflow-visible ${className}`} 
    viewBox="0 0 100 10" 
    preserveAspectRatio="none"
  >
    <path
      d="M 0 5 Q 10 5 15 5 L 20 5 Q 22 5 23 7 L 25 3 Q 26 5 28 5 L 72 5 Q 74 5 75 3 L 77 7 Q 78 5 80 5 L 100 5"
      fill="none"
      stroke="url(#site-gradient)" // <-- Mudamos o nome do gradiente para ser mais claro
      strokeWidth="1.5"
      className="heartbeat-path"
    />
    <defs>
      {/* --- MUDANÇA PRINCIPAL AQUI --- */}
      {/* Trocamos as cores vermelhas pelo gradiente verde-azulado do seu site */}
      <linearGradient id="site-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#4ade80' }} /> {/* Cor de 'from-green-400' */}
        <stop offset="100%" style={{ stopColor: '#60a5fa' }} /> {/* Cor de 'to-blue-400' */}
      </linearGradient>
    </defs>
    <style>
      {`
        .heartbeat-path {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          transition: stroke-dashoffset 0.6s ease-in-out;
        }
        .group:hover .heartbeat-path {
          stroke-dashoffset: 0;
        }
      `}
    </style>
  </svg>
);

export default HeartbeatLine;
