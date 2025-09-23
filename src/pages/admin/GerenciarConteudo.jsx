import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import AddMaterialModal from './AddMaterialModal';
import EditMaterialModal from './EditMaterialModal';
// ===================================================================
// ==> PASSO 1: IMPORTAR OS COMPONENTES NECESSÁRIOS <==
// ===================================================================
import { useNotification } from '@/components/notifications/NotificationContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

// Ícones (sem alterações)
const AddIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default function GerenciarConteudo() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // ===================================================================
  // ==> PASSO 2: INICIALIZAR HOOKS E ESTADOS DOS MODAIS <==
  // ===================================================================
  const { addNotification } = useNotification();
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  useEffect(() => { fetchMateriais(); }, []);

  const fetchMateriais = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('materiais_apoio').select('*').order('created_at', { ascending: false });
    if (error) {
      setError('Não foi possível carregar os materiais.');
      addNotification('Não foi possível carregar os materiais.', 'error');
    } else {
      setMateriais(data);
    }
    setLoading(false);
  };

  const handleCreateMaterial = async (materialData) => {
    // ... (lógica de criação permanece a mesma)
    let fileUrl = null;
    if (materialData.tipo !== 'texto' && materialData.arquivo) {
      const file = materialData.arquivo;
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const filePath = `materiais/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('materiais-publicos').upload(filePath, file);
      if (uploadError) { 
        addNotification(`Erro no upload: ${uploadError.message}`, 'error');
        return false; 
      }
      const { data: urlData } = supabase.storage.from('materiais-publicos').getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }
    const { error: insertError } = await supabase.from('materiais_apoio').insert({
      titulo: materialData.titulo,
      descrição: materialData.descricao,
      tipo: materialData.tipo,
      conteudo_texto: materialData.conteudo_texto,
      url_do_arquivo: fileUrl,
    });
    if (insertError) { 
      addNotification(`Erro ao criar material: ${insertError.message}`, 'error');
      return false; 
    }
    addNotification('Material criado com sucesso!', 'success');
    fetchMateriais();
    return true;
  };

  // ===================================================================
  // ==> PASSO 3: MODIFICAR A LÓGICA DE EXCLUSÃO <==
  // ===================================================================
  // Esta função apenas abre o modal de confirmação
  const handleDeleteClick = (material) => {
    setMaterialToDelete(material);
    setIsDeleteConfirmationOpen(true);
  };

  // Esta função executa a exclusão após a confirmação
  const executeDeleteMaterial = async () => {
    if (!materialToDelete) return;

    try {
      // Exclui o arquivo do storage, se existir
      if (materialToDelete.url_do_arquivo) {
        const filePath = materialToDelete.url_do_arquivo.split('/materiais-publicos/')[1];
        await supabase.storage.from('materiais-publicos').remove([filePath]);
      }
      // Exclui o registro do banco de dados
      const { error: dbError } = await supabase.from('materiais_apoio').delete().eq('id', materialToDelete.id);
      if (dbError) throw dbError;

      // Atualiza a UI e mostra notificação de sucesso
      setMateriais(materiais.filter(m => m.id !== materialToDelete.id));
      addNotification('Material excluído com sucesso!', 'success');

    } catch (error) {
      // Mostra notificação de erro
      addNotification(`Não foi possível excluir o material. Erro: ${error.message}`, 'error');
    } finally {
      // Limpa o estado para a próxima exclusão
      setMaterialToDelete(null);
    }
  };

  const handleOpenEditModal = (material) => { setSelectedMaterial(material); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedMaterial(null); };
  const handleUpdateMaterial = async (materialId, updatedData) => {
    const { data, error } = await supabase.from('materiais_apoio').update(updatedData).eq('id', materialId).select().single();
    if (error) {
      // Erro já é notificado no modal de edição, mas podemos adicionar um log aqui
      console.error("Erro ao atualizar material:", error);
      return false;
    }
    setMateriais(materiais.map(m => (m.id === materialId ? data : m)));
    return true;
  };

  const renderContent = () => {
    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (materiais.length === 0) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum material cadastrado.</div>;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-400 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Título</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Tipo</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Data de Criação</th>
              <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materiais.map(material => (
              <tr key={material.id} className="border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 font-medium text-gray-900 dark:text-white">{material.titulo}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400 capitalize">{material.tipo}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{new Date(material.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleOpenEditModal(material)} className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <EditIcon />
                  </button>
                  {/* =================================================================== */}
                  {/* ==> PASSO 4: BOTÃO DE EXCLUIR AGORA CHAMA handleDeleteClick <== */}
                  {/* =================================================================== */}
                  <button onClick={() => handleDeleteClick(material)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 dark:text-red-400 transition-colors">
                    <DeleteIcon />
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
    <>
      <div>
        <title>Gerenciar Conteudos | Painel Admin MedSinai</title>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Conteúdo</h1>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm">
            <AddIcon />
            Novo Material
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {renderContent()}
        </div>
        
        <AddMaterialModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateMaterial}
        />
        <EditMaterialModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleUpdateMaterial}
          material={selectedMaterial}
        />
      </div>

      {/* =================================================================== */}
      {/* ==> PASSO 5: RENDERIZAR O MODAL DE CONFIRMAÇÃO DE EXCLUSÃO <== */}
      {/* =================================================================== */}
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={executeDeleteMaterial}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o material "${materialToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
}
