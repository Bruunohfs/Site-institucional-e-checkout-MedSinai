// src/components/TestimonialCard.jsx - VERSÃO FINAL COM ALTURA CONSISTENTE

import { useState } from 'react';

export default function TestimonialCard({ testimonial }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200; // Mantendo os 200 caracteres

  const needsTruncation = testimonial.text.length > MAX_LENGTH;
  const displayText = isExpanded ? testimonial.text : `${testimonial.text.substring(0, MAX_LENGTH)}...`;

  return (
    // ==> A MÁGICA ESTÁ AQUI <==
    // Adicionamos uma altura mínima (min-h-[350px]) ao card principal.
    // Isso força TODOS os cards a terem pelo menos essa altura, tanto no mobile quanto no desktop.
    // O 'h-full' continua aqui para garantir que eles se estiquem para preencher a linha no desktop.
    <div className="h-full min-h-[350px] bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      
      {/* A seção de texto não precisa mais da altura mínima, pois o card pai já a impõe. */}
      <div className="mb-6"> 
        <div className="flex items-center mb-4">
          {[...Array(testimonial.stars)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ))}
        </div>
        <p className="text-gray-600 dark:text-gray-300">"{displayText}"</p>
        
        {needsTruncation && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-600 font-semibold text-sm mt-2"
          >
            {isExpanded ? 'Ver menos' : 'Ler mais'}
          </button>
        )}
      </div>

      {/* A parte do autor do depoimento fica no final, como antes */}
      <div className="flex items-center mt-auto">
        <img className="w-12 h-12 rounded-full object-cover mr-4" src={testimonial.avatar} alt={testimonial.name} />
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
