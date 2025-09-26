// src/components/TestimonialCard.jsx - VERSÃO FINAL E ROBUSTA

import { useState } from 'react';
import { UserAvatarIcon } from './ui/UserAvatarIcon'; // Ajuste o caminho se necessário

export default function TestimonialCard({ testimonial }) {
  // ==================================================
  // 1. VERIFICAÇÃO DE SEGURANÇA
  // Se o depoimento não for um objeto válido, não renderiza nada para evitar quebrar a página.
  if (!testimonial) {
    return null;
  }
  // ==================================================

  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200;

  // ==================================================
  // 2. LÓGICA ROBUSTA PARA PEGAR O TEXTO
  // Pega o texto de 'testimonial.body' OU 'testimonial.text'.
  // O '|| ""`' garante que, se ambos forem nulos, teremos uma string vazia e não um erro.
  const textContent = testimonial.body || testimonial.text || "";
  // ==================================================

  const needsTruncation = textContent.length > MAX_LENGTH;
  const displayText = isExpanded ? textContent : `${textContent.substring(0, MAX_LENGTH)}...`;

  return (
    <div className="h-full min-h-[350px] bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      
      <div className="mb-6"> 
        <div className="flex items-center mb-4">
          {[...Array(testimonial.stars || 0)].map((_, i) => ( // Adicionado '|| 0' para segurança
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

      <div className="flex items-center mt-auto">
        <div className="mr-4 flex-shrink-0">
          {/* Lógica robusta para a imagem */}
          {(testimonial.image_url || testimonial.avatar) ? (
            <img className="w-12 h-12 rounded-full object-cover" src={testimonial.image_url || testimonial.avatar} alt={testimonial.name} />
          ) : (
            <UserAvatarIcon className="w-12 h-12" />
          )}
        </div>

        <div>
          <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
          {/* Lógica robusta para a ocupação/role */}
          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.occupation || testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
