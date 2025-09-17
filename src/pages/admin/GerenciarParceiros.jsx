import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import EditPartnerModal from './EditPartnerModal';
import AddPartnerModal from './AddPartnerModal';

// --- COMPONENTE: StatusSwitch ---
// Adicionando classes de tema ao texto "Ativo/Inativo"
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

// Ícones (sem alterações)
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const AddUserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;

export default function GerenciarParceiros() {
  // Toda a lógica de estado e funções (sem alterações)
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => { fetchParceiros(); }, []);

  const fetchParceiros = async () => {
    setLoading(true);
    setError('');
    const { data, error: functionError } = await supabase.functions.invoke('list-partners');
    if (functionError) {
      setError('Falha ao carregar os parceiros.');
    } else {
      const filteredParceiros = data.users.filter(user => user.user_metadata?.role !== 'admin');
      setParceiros(filteredParceiros);
    }
    setLoading(false);
  };

  const handleOpenEditModal = (parceiro) => { setSelectedParceiro(parceiro); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedParceiro(null); };
  const handleSaveChanges = async (partnerId, updatedData) => {
    const { data, error } = await supabase.functions.invoke('admin-update-partner', {
      body: {
        action: 'update_data',
        partnerId,
        updatedData,
      },
    });

    if (error) {
      alert(`Falha ao salvar as alterações: ${error.message}`);
    } else {
      // Atualiza a lista de parceiros com os novos dados
      setParceiros(parceiros.map(p => (p.id === partnerId ? data.user : p)));
      handleCloseEditModal();
    }
  };

  // NOVA FUNÇÃO DE RESET DE SENHA - CHAMA A EDGE FUNCTION
  const handleResetPassword = async (partnerId) => {
    const { error } = await supabase.functions.invoke('admin-update-partner', {
      body: {
        action: 'reset_password',
        partnerId,
      },
    });

    if (error) {
      alert(`Falha ao enviar link de reset: ${error.message}`);
      return false;
    }
    return true;
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleCreatePartner = async (newPartnerData) => {
    const { data: createdUser, error: functionError } = await supabase.functions.invoke('create-partner', { body: newPartnerData });
    if (functionError) {
      alert(`Falha ao criar parceiro: ${functionError.message}`);
      return false;
    } else {
      setParceiros(prevParceiros => [createdUser.user, ...prevParceiros].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      return true;
    }
  };

  const handleStatusChange = async (parceiro, newStatus) => {
    setUpdatingStatusId(parceiro.id);
    const { error } = await supabase.functions.invoke('update-partner-status', { body: { partnerId: parceiro.id, status: newStatus } });
    if (error) {
      alert(`Falha ao atualizar status: ${error.message}`);
    } else {
      setParceiros(parceiros.map(p => p.id === parceiro.id ? { ...p, user_metadata: { ...p.user_metadata, status: newStatus } } : p));
    }
    setUpdatingStatusId(null);
  };

  // --- RENDERIZAÇÃO COM CORES DINÂMICAS ---

  const renderContent = () => {
    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (parceiros.length === 0) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum parceiro encontrado.</div>;
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-400 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-sm font-semibold text-black dark:text-gray-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-black dark:text-gray-300">E-mail</th>
              <th className="p-4 text-sm font-semibold text-black dark:text-gray-300">Cupom</th>
              <th className="p-4 text-sm font-semibold text-black dark:text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-black dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {parceiros.map(parceiro => (
              <tr key={parceiro.id} className="border-b border-gray-400 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 font-medium text-black dark:text-white">{parceiro.user_metadata?.nome || '-'}</td>
                <td className="p-4 text-black dark:text-gray-400">{parceiro.email}</td>
                <td className="p-4 font-mono text-black dark:text-black">{parceiro.user_metadata?.cupom || '-'}</td>
                <td className="p-4">
                  <StatusSwitch 
                    isChecked={parceiro.user_metadata?.status === 'ativo' || parceiro.user_metadata?.status === undefined}
                    isLoading={updatingStatusId === parceiro.id}
                    onChange={() => {
                      const newStatus = (parceiro.user_metadata?.status === 'ativo' || parceiro.user_metadata?.status === undefined) ? 'inativo' : 'ativo';
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Parceiros</h1>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">
          <AddUserIcon />
          Novo Parceiro
        </button>
      </div>
     <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 overflow-hidden shadow-sm">
        {renderContent()}
      </div>
      <EditPartnerModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        onSave={handleSaveChanges} 
        onResetPassword={handleResetPassword} // Passa a nova função para o modal
        parceiro={selectedParceiro} 
      />
      <AddPartnerModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} onSave={handleCreatePartner} />
    </div>
  );
}
