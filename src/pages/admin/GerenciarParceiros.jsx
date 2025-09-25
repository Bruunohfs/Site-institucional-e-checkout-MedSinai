import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import EditPartnerModal from './EditPartnerModal';
import AddPartnerModal from './AddPartnerModal';
import { useNotification } from '@/components/notifications/NotificationContext';

// --- COMPONENTE: StatusSwitch ---
const StatusSwitch = ({ isChecked, onChange, isLoading }) => {
  const switchId = `status-switch-${Math.random()}`;
  return (
    <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        id={switchId}
        className="sr-only peer" 
        checked={isChecked}
        onChange={onChange}
        disabled={isLoading}
      />
      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {isLoading ? '...' : (isChecked ? 'Ativo' : 'Inativo')}
      </span>
    </label>
  );
};

// Ícones
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const AddUserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;

export default function GerenciarParceiros() {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => { fetchParceiros(); }, []);

const fetchParceiros = async () => {
  setLoading(true);
  setError(''); // Limpa erros antigos

  // Faz uma chamada direta à tabela 'profiles', confiando na RLS
 const { data, error } = await supabase
  .from('vw_parceiros') // <== MUDANÇA AQUI
  .select('*')
  .eq('role', 'parceiro');


  if (error) {
    setError('Falha ao carregar os parceiros. Verifique suas permissões (RLS).');
    addNotification('Falha ao carregar os parceiros.', 'error');
    console.error("Erro ao buscar parceiros:", error);
  } else {
    setParceiros(data);
  }
  setLoading(false);
};

  const handleOpenEditModal = (parceiro) => { setSelectedParceiro(parceiro); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedParceiro(null); };
  
const handleSaveChanges = async (partnerId, updatedData) => {
  // A política 'Admins podem gerenciar tudo' permitirá esta chamada
  const { error } = await supabase
    .from('profiles')
    .update({
      nome_completo: updatedData.nome,
      email: updatedData.email, // Se você permite editar o email
      telefone: updatedData.telefone,
      cupom: updatedData.cupom,
    })
    .eq('id', partnerId);

  if (error) {
    addNotification(`Falha ao salvar: ${error.message}`, 'error');
  } else {
    addNotification('Parceiro atualizado com sucesso!', 'success');
    // Atualiza o estado local para refletir a mudança imediatamente
    fetchParceiros(); // A forma mais simples de recarregar os dados
    handleCloseEditModal();
  }
};

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  
const handleCreatePartner = async (newPartnerData) => {
  // 1. Chama a nova Edge Function segura
const { data: createdUserResponse, error: functionError } = await supabase.functions.invoke('admin-create-user', {
  body: {
    email: newPartnerData.email,
    password: newPartnerData.password,
    user_metadata: {
      cupom: newPartnerData.cupom
    }
  },
  // Esta é a forma correta de pegar o token da sessão atual e enviá-lo.
  headers: {
    Authorization: `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
  }
});

  if (functionError) {
    addNotification(`Falha ao criar parceiro: ${functionError.message}`, 'error');
    return false;
  }

  // O resto do código permanece o mesmo!
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      nome_completo: newPartnerData.nome,
      role: 'parceiro',
      status: 'ativo',
      cupom: newPartnerData.cupom
    })
    .eq('id', createdUserResponse.user.id);

  if (profileError) {
    addNotification(`Usuário criado, mas falha ao atualizar perfil: ${profileError.message}`, 'warning');
  } else {
    addNotification('Parceiro criado com sucesso!', 'success');
  }

  const { data: novoParceiroCompleto } = await supabase
    .from('vw_parceiros')
    .select('*')
    .eq('id', createdUserResponse.user.id)
    .single();

  if (novoParceiroCompleto) {
    setParceiros(prevParceiros => [novoParceiroCompleto, ...prevParceiros]);
  }

  return true;
};

 const handleStatusChange = async (parceiro, newStatus) => {
  setUpdatingStatusId(parceiro.id);

  // Faz o update diretamente na coluna 'status' da tabela 'profiles'
  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus }) // Atualiza a coluna 'status'
    .eq('id', parceiro.id);       // Para o parceiro específico

  if (error) {
    addNotification(`Falha ao atualizar status: ${error.message}`, 'error');
  } else {
    addNotification(`Status do parceiro atualizado para "${newStatus}".`, 'success');
    // Atualiza o estado local para o switch mudar visualmente
    setParceiros(parceiros.map(p => 
      p.id === parceiro.id ? { ...p, status: newStatus } : p
    ));
  }
  setUpdatingStatusId(null);
};

  const renderContent = () => {
    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (parceiros.length === 0) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum parceiro encontrado.</div>;
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* =================================================================== */}
          {/* ==> ALTERAÇÃO VISUAL NO CABEÇALHO <== */}
          {/* =================================================================== */}
          <thead className="bg-gray-200 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Nome</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">E-mail</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Cupom</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          {/* =================================================================== */}
          {/* ==> ALTERAÇÃO VISUAL NO CORPO DA TABELA <== */}
          {/* =================================================================== */}
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {parceiros.map(parceiro => (
              <tr key={parceiro.id} className="hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 font-medium text-gray-900 dark:text-white">{parceiro.nome_completo || '-'}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{parceiro.email}</td>
                <td className="p-4 font-mono text-gray-600 dark:text-gray-300">{parceiro.cupom || '-'}</td>
                <td className="p-4">
                  <StatusSwitch 
                    isChecked={parceiro.status === 'ativo'}
                    isLoading={updatingStatusId === parceiro.id}
                    onChange={() => {
                      const newStatus = parceiro.status === 'ativo' ? 'inativo' : 'ativo';
                      handleStatusChange(parceiro, newStatus);
                    }}
                  />
                </td>
                <td className="p-4">
                  <button onClick={() => handleOpenEditModal(parceiro)} className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <EditIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <title>Gerenciar Parceiros | Painel Admin MedSinai</title>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Parceiros</h1>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">
          <AddUserIcon />
          Novo Parceiro
        </button>
      </div>
     <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden shadow-sm">
        {renderContent()}
      </div>
      
      <EditPartnerModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        onSave={handleSaveChanges} 
        parceiro={selectedParceiro} 
      />
      
      <AddPartnerModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} onSave={handleCreatePartner} />
    </div>
  );
}
