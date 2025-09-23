// src/pages/admin/GerenciarDepoimentos.jsx (VERSÃO FINAL COM MODAL E NOTIFICAÇÕES)

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNotification } from '../../components/notifications/NotificationContext';
import ConfirmationModal from '../../components/modals/ConfirmationModal'; // 1. IMPORTAR O MODAL

// --- ÍCONES ---
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const XCircleIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ChevronDownIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

function GerenciarDepoimentos() {
  const { addNotification } = useNotification();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedRowId, setExpandedRowId] = useState(null);

  // 2. ESTADO PARA CONTROLAR O MODAL DE CONFIRMAÇÃO
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('is_approved', false);
    else if (filter === 'approved') query = query.eq('is_approved', true);
    
    const { data, error } = await query;
    if (error) {
      setError("Não foi possível carregar os depoimentos.");
      addNotification("Não foi possível carregar os depoimentos.", 'error');
    } else {
      setTestimonials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  // 3. FUNÇÕES DE AÇÃO ATUALIZADAS
  const handleApprove = async (id) => {
    const { error } = await supabase.from('testimonials').update({ is_approved: true }).eq('id', id);
    if (error) {
      addNotification("Erro ao aprovar o depoimento.", 'error');
    } else {
      addNotification("Depoimento aprovado com sucesso!", 'success');
      fetchTestimonials();
    }
  };

  const handleDisapprove = async (id) => {
    const { error } = await supabase.from('testimonials').update({ is_approved: false }).eq('id', id);
    if (error) {
      addNotification("Erro ao desativar o depoimento.", 'error');
    } else {
      addNotification("Depoimento desativado.", 'info');
      fetchTestimonials();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      addNotification("Erro ao excluir o depoimento.", 'error');
    } else {
      addNotification("Depoimento excluído permanentemente.", 'success');
      fetchTestimonials();
    }
  };

  // 4. FUNÇÕES PARA ABRIR O MODAL
  const openDisapproveModal = (id) => {
    setModalState({
      isOpen: true,
      title: 'Desativar Depoimento',
      message: 'Tem certeza que deseja desativar este depoimento? Ele não aparecerá mais no site.',
      onConfirm: () => handleDisapprove(id),
    });
  };

  const openDeleteModal = (id) => {
    setModalState({
      isOpen: true,
      title: 'Excluir Permanentemente',
      message: 'Esta ação não pode ser desfeita. Tem certeza que deseja EXCLUIR este depoimento?',
      onConfirm: () => handleDelete(id),
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* 5. RENDERIZAR O MODAL */}
      <ConfirmationModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Depoimentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Aprove ou exclua os depoimentos enviados pelos usuários.</p>
        </div>

        <div className="flex space-x-2 mb-4">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Todos</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Pendentes</button>
          <button onClick={() => setFilter('approved')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Aprovados</button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          {loading && <p className="p-4 text-center">Carregando depoimentos...</p>}
          {error && <p className="p-4 text-red-500 text-center">{error}</p>}
          
          {/* Tabela para Desktop */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-300 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Depoimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avaliação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                {testimonials.map((testimonial) => (
                  <React.Fragment key={testimonial.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {testimonial.image_url && <img className="h-10 w-10 rounded-full object-cover" src={testimonial.image_url} alt={testimonial.name} />}
                          <div className={testimonial.image_url ? "ml-4" : ""}>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{testimonial.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.occupation || 'Não informado'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">{testimonial.body}</p>
                          <button onClick={() => toggleRowExpansion(testimonial.id)} className={`p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform ${expandedRowId === testimonial.id ? 'rotate-180' : ''}`} title="Ver depoimento completo">
                            <ChevronDownIcon />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">{'★'.repeat(testimonial.stars)}{'☆'.repeat(5 - testimonial.stars)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {testimonial.is_approved ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprovado</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendente</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {testimonial.is_approved 
                          ? <button onClick={() => openDisapproveModal(testimonial.id)} className="text-yellow-500 hover:text-yellow-700" title="Desativar"><XCircleIcon /></button> 
                          : <button onClick={() => handleApprove(testimonial.id)} className="text-green-600 hover:text-green-900" title="Aprovar"><CheckIcon /></button>
                        }
                        <button onClick={() => openDeleteModal(testimonial.id)} className="text-red-600 hover:text-red-900" title="Excluir Permanentemente"><TrashIcon /></button>
                      </td>
                    </tr>
                    {expandedRowId === testimonial.id && (
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-bold text-md mb-2 text-gray-800 dark:text-white">Depoimento Completo:</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{testimonial.body}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista de Cards para Mobile */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {testimonial.image_url && <img className="h-10 w-10 rounded-full object-cover" src={testimonial.image_url} alt={testimonial.name} />}
                    <div className={testimonial.image_url ? "ml-4" : ""}>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.occupation || 'Não informado'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testimonial.is_approved 
                      ? <button onClick={() => openDisapproveModal(testimonial.id)} className="text-yellow-500" title="Desativar"><XCircleIcon /></button> 
                      : <button onClick={() => handleApprove(testimonial.id)} className="text-green-600" title="Aprovar"><CheckIcon /></button>
                    }
                    <button onClick={() => openDeleteModal(testimonial.id)} className="text-red-600" title="Excluir"><TrashIcon /></button>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-900 dark:text-gray-300">{testimonial.body}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-yellow-400">{'★'.repeat(testimonial.stars)}{'☆'.repeat(5 - testimonial.stars)}</div>
                  {testimonial.is_approved ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprovado</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendente</span>}
                </div>
              </div>
            ))}
          </div>

          {!loading && testimonials.length === 0 && (
            <p className="text-center p-8 text-gray-500">Nenhum depoimento encontrado para este filtro.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarDepoimentos;
