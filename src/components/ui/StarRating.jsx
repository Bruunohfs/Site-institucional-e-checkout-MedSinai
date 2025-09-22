// src/components/ui/StarRating.jsx

import React, { useState } from 'react';

const Star = ({ filled, onHover, onLeave, onClick }) => (
  <svg
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    onClick={onClick}
    className={`w-8 h-8 cursor-pointer transition-transform duration-200 ${filled ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-gray-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function StarRating({ name }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div 
      className="flex items-center gap-1"
      onMouseLeave={() => setHoverRating(0)} // Limpa o hover ao sair da área
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <label key={starValue}>
          {/* 
            ===================================================================
            ==> A MÁGICA ESTÁ AQUI <==
            Usamos botões de rádio invisíveis. Eles são perfeitos para
            validação 'required' e funcionam nativamente com formulários.
            ===================================================================
          */}
          <input
            type="radio"
            name={name}
            value={starValue}
            onClick={() => setRating(starValue)}
            className="sr-only" // Classe do Tailwind que torna o elemento invisível
            required // Agora a validação 'required' funciona!
          />
          <Star
            filled={hoverRating >= starValue || rating >= starValue}
            onHover={() => setHoverRating(starValue)}
            onClick={() => setRating(starValue)}
          />
        </label>
      ))}
    </div>
  );
}

export default StarRating;
