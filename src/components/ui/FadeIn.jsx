// src/components/ui/FadeIn.jsx

import React from 'react';
import { useInView } from 'react-intersection-observer';

function FadeIn({ children, triggerOnce = true, threshold = 0.1, duration = 'duration-700', delay = 'delay-200' }) {
  const { ref, inView } = useInView({
    // triggerOnce: Anima apenas uma vez quando o elemento se torna visível.
    triggerOnce: triggerOnce,
    // threshold: Qual porcentagem do elemento precisa estar visível para disparar a animação (10% neste caso).
    threshold: threshold,
  });

  // Classes de transição do Tailwind CSS
  const transitionClasses = `transition-all ease-in-out ${duration} ${delay}`;

  // Classes de estado inicial (invisível e um pouco para baixo)
  const initialStateClasses = 'opacity-0 translate-y-4';

  // Classes de estado final (visível e na posição original)
  const finalStateClasses = 'opacity-100 translate-y-0';

  return (
    <div
      ref={ref}
      className={`${transitionClasses} ${inView ? finalStateClasses : initialStateClasses}`}
    >
      {children}
    </div>
  );
}

export default FadeIn;
