// src/components/TestimonialModal.jsx

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Importa seu cliente Supabase
import StarRating from './ui/StarRating';

// Ícone de Check para a mensagem de sucesso
const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

function TestimonialModal({ isOpen, onClose }) {
  // Estados para controlar o envio e as mensagens
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);

    try {
      let imageUrl = null;
      const imageFile = formProps.foto;

      // 1. Se houver uma foto, faz o upload para o Supabase Storage
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `depoimentos-imagem/${fileName}`; // A pasta será criada aqui

        const { error: uploadError } = await supabase.storage
          .from('depoimentos-publicos')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        // Pega a URL pública da imagem que acabamos de subir
        const { data: urlData } = supabase.storage
          .from('depoimentos-publicos') 
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // 2. Insere os dados na tabela 'testimonials'
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert({
          name: formProps.nome,
          age: formProps.idade || null,
          occupation: formProps.ocupacao || null,
          stars: formProps.estrelas,
          body: formProps.depoimento,
          image_url: imageUrl,
        });

      if (insertError) {
        throw insertError;
      }

      // 3. Se tudo deu certo, mostra a tela de sucesso
      setIsSuccess(true);

    } catch (err) {
      console.error("Erro ao enviar depoimento:", err);
      setError("Ocorreu um erro ao enviar seu depoimento. Por favor, tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para resetar o estado e fechar o modal
  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Tela de Sucesso
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <CheckCircleIcon />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Obrigado!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Obrigado por compartilhar sua experiência! Seu depoimento nos ajuda a inspirar outras pessoas.
          </p>
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Tela do Formulário
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conte sua Experiência</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome*</label>
            <input id="nome" type="text" name="nome" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
          </div>

          {/* Linha com Idade e Ocupação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Idade (Opcional)</label>
              <input id="idade" type="number" name="idade" className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="ocupacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ocupação (Opcional)</label>
              <input id="ocupacao" type="text" name="ocupacao" className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
            </div>
          </div>

          {/* Campo de Estrelas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sua avaliação*</label>
            <StarRating name="estrelas" />
          </div>

          {/* Campo Depoimento */}
          <div>
            <label htmlFor="depoimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu depoimento*</label>
            <textarea id="depoimento" name="depoimento" rows="4" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Conte para nós como a MedSinai te ajudou..."></textarea>
          </div>

          {/* Campo Upload de Foto */}
          <div>
            <label htmlFor="foto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sua foto (Opcional)</label>
            <input id="foto" type="file" name="foto" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/50 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-900" />
            <p className="text-xs text-gray-500 mt-1">Seu rosto nos ajuda a dar mais credibilidade à sua história.</p>
          </div>

          {/* Mensagem de Erro */}
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          {/* Botão de Envio */}
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? "Enviando..." : "Enviar Depoimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestimonialModal;
