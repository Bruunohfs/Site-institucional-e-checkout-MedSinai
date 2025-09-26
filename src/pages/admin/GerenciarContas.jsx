import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import EditPartnerModal from './EditPartnerModal'; // Certifique-se que o nome do arquivo corresponde
import AddPartnerModal from './AddPartnerModal';   // Certifique-se que o nome do arquivo corresponde
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { useNotification } from '@/components/notifications/NotificationContext';

// --- COMPONENTE INTERNO: RoleSelector ---
const RoleSelector = ({ currentRole, onRoleChange, disabled }) => {
  const roles = ['admin', 'parceiro'];
  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(e.target.value)}
      disabled={disabled}
      className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 disabled:opacity-50 w-full"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </option>
      ))}
    </select>
  );
};

// --- COMPONENTE INTERNO: StatusSwitch ---
const StatusSwitch = ({ isChecked, onChange, isLoading }) => {
  const switchId = `status-switch-${Math.random()}`;
  return (
    <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" id={switchId} className="sr-only peer" checked={isChecked} onChange={onChange} disabled={isLoading} />
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

export default function GerenciarContas() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const { addNotification } = useNotification();

  const [isConfirmRoleModalOpen, setIsConfirmRoleModalOpen] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [modalInfo, setModalInfo] = useState({ title: '', message: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('vw_parceiros').select('*');
    if (error) {
      setError('Falha ao carregar os usuários.');
      addNotification('Falha ao carregar os usuários.', 'error');
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleOpenEditModal = (user) => { setSelectedUser(user); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedUser(null); };
  
  const handleSaveChanges = async (userId, updatedData) => {
    const { error } = await supabase.from('profiles').update(updatedData).eq('id', userId);
    if (error) {
      addNotification(`Falha ao salvar: ${error.message}`, 'error');
    } else {
      addNotification('Usuário atualizado com sucesso!', 'success');
      fetchUsers();
      handleCloseEditModal();
    }
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  
  const handleCreatePartner = async (newPartnerData) => {
    const { email, password, nome, telefone, cupom } = newPartnerData;
    const { data: createdUserResponse, error: functionError } = await supabase.functions.invoke('admin-create-user', {
      body: { email, password, user_metadata: { cupom } },
      headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session.access_token}` }
    });

    if (functionError) {
      addNotification(`Falha ao criar usuário: ${functionError.message}`, 'error');
      return false;
    }

    const { error: profileError } = await supabase.from('profiles').update({
      nome_completo: nome,
      telefone: telefone,
      role: 'parceiro',
      status: 'ativo',
      cupom: cupom
    }).eq('id', createdUserResponse.user.id);

    if (profileError) {
      addNotification(`Usuário criado, mas falha ao atualizar perfil: ${profileError.message}`, 'warning');
    } else {
      addNotification('Usuário criado com sucesso!', 'success');
    }
    
    fetchUsers();
    return true;
  };

  const handleStatusChange = async (user, newStatus) => {
    setUpdatingStatusId(user.id);
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.id);
    if (error) {
      addNotification(`Falha ao atualizar status: ${error.message}`, 'error');
    } else {
      addNotification(`Status do usuário atualizado para "${newStatus}".`, 'success');
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    }
    setUpdatingStatusId(null);
  };

  const handleRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    if (newRole === 'admin') {
      setModalInfo({ title: 'Confirmar Promoção', message: `Você tem certeza que deseja promover ${user.nome_completo || 'o usuário'} para Administrador?` });
    } else if (newRole === 'parceiro') {
      setModalInfo({ title: 'Confirmar Rebaixamento', message: `Você tem certeza que deseja rebaixar ${user.nome_completo || 'o usuário'} para Parceiro?` });
    }
    setUserToUpdateRole({ ...user, role: newRole });
    setIsConfirmRoleModalOpen(true);
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdatingRoleId(userId);
    setIsConfirmRoleModalOpen(false);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      addNotification(`Erro ao atualizar a função: ${error.message}`, 'error');
    } else {
      addNotification('Função do usuário atualizada com sucesso!', 'success');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setUpdatingRoleId(null);
    setUserToUpdateRole(null);
  };

  const confirmRoleChange = () => {
    if (userToUpdateRole) updateUserRole(userToUpdateRole.id, userToUpdateRole.role);
  };

  const cancelRoleChange = () => {
    setIsConfirmRoleModalOpen(false);
    setUserToUpdateRole(null);
  };

  // ===================================================================
  // ==> ATUALIZAÇÃO VISUAL E DE CONTEÚDO DA TABELA <==
  // ===================================================================
  const renderContent = () => {
    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (users.length === 0) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum usuário encontrado.</div>;
    
    return (
      <>
        {/* VISUALIZAÇÃO DE TABELA PARA DESKTOP */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contato</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Função</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cupom</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{user.nome_completo || '-'}</td>
                  <td className="p-4 text-sm">
                    <div className="text-gray-800 dark:text-gray-300">{user.email}</div>
                    <div className="text-gray-500 dark:text-gray-400">{user.telefone || 'Sem telefone'}</div>
                  </td>
                  <td className="p-4"><RoleSelector currentRole={user.role} onRoleChange={(newRole) => handleRoleChange(user, newRole)} disabled={updatingRoleId === user.id} /></td>
                  <td className="p-4 font-mono text-gray-600 dark:text-gray-300">{user.cupom || '-'}</td>
                  <td className="p-4"><StatusSwitch isChecked={user.status === 'ativo'} isLoading={updatingStatusId === user.id} onChange={() => handleStatusChange(user, user.status === 'ativo' ? 'inativo' : 'ativo')} /></td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenEditModal(user)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><EditIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VISUALIZAÇÃO DE CARDS PARA MOBILE */}
        <div className="md:hidden space-y-4 p-4">
          {users.map(user => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{user.nome_completo || '-'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{user.telefone || 'Sem telefone'}</p>
                </div>
                <button onClick={() => handleOpenEditModal(user)} className="p-2 -mt-2 -mr-2 rounded-md text-gray-500 dark:text-gray-400"><EditIcon /></button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between items-center"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Função</span><div className="w-1/2"><RoleSelector currentRole={user.role} onRoleChange={(newRole) => handleRoleChange(user, newRole)} disabled={updatingRoleId === user.id} /></div></div>
                <div className="flex justify-between items-center"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span><StatusSwitch isChecked={user.status === 'ativo'} isLoading={updatingStatusId === user.id} onChange={() => handleStatusChange(user, user.status === 'ativo' ? 'inativo' : 'ativo')} /></div>
                <div className="flex justify-between items-center"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cupom</span><span className="font-mono text-sm text-gray-700 dark:text-gray-300">{user.cupom || '-'}</span></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Contas</h1>
        <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm w-full md:w-auto">
          <AddUserIcon />
          Novo Usuário
        </button>
      </div>
      {/* Contêiner principal com o novo estilo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {renderContent()}
      </div>
      
      <EditPartnerModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveChanges} parceiro={selectedUser} />
      <AddPartnerModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} onSave={handleCreatePartner} />
      <ConfirmationModal isOpen={isConfirmRoleModalOpen} onClose={cancelRoleChange} onConfirm={confirmRoleChange} title={modalInfo.title} message={modalInfo.message} />
    </div>
  );
}
