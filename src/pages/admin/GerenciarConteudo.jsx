import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import AddMaterialModal from './AddMaterialModal';
import EditMaterialModal from './EditMaterialModal';


// Ícones (sem alterações)
const AddIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default function GerenciarConteudo() {
  // Toda a lógica de estado e funções (sem alterações)
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => { fetchMateriais(); }, []);

  const fetchMateriais = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('materiais_apoio').select('*').order('created_at', { ascending: false });
    if (error) setError('Não foi possível carregar os materiais.');
    else setMateriais(data);
    setLoading(false);
  };

  const handleCreateMaterial = async (materialData) => {
    let fileUrl = null;
    if (materialData.tipo !== 'texto' && materialData.arquivo) {
      const file = materialData.arquivo;
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const filePath = `materiais/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('materiais-publicos').upload(filePath, file);
      if (uploadError) { console.error('Erro no upload:', uploadError); return false; }
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
    if (insertError) { console.error('Erro ao inserir:', insertError); return false; }
    fetchMateriais();
    return true;
  };

  const handleDeleteMaterial = async (material) => {
    if (!window.confirm(`Tem certeza que deseja excluir o material "${material.titulo}"?`)) return;
    try {
      if (material.url_do_arquivo) {
        const filePath = material.url_do_arquivo.split('/materiais-publicos/')[1];
        await supabase.storage.from('materiais-publicos').remove([filePath]);
      }
      const { error: dbError } = await supabase.from('materiais_apoio').delete().eq('id', material.id);
      if (dbError) throw dbError;
      setMateriais(materiais.filter(m => m.id !== material.id));
    } catch (error) {
      alert(`Não foi possível excluir o material. Erro: ${error.message}`);
    }
  };

  const handleOpenEditModal = (material) => { setSelectedMaterial(material); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedMaterial(null); };
  const handleUpdateMaterial = async (materialId, updatedData) => {
    const { data, error } = await supabase.from('materiais_apoio').update(updatedData).eq('id', materialId).select().single();
    if (error) {
      console.error("Erro ao atualizar material:", error);
      return false;
    }
    setMateriais(materiais.map(m => (m.id === materialId ? data : m)));
    return true;
  };

  // --- RENDERIZAÇÃO COM CORES DINÂMICAS ---

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
                  <button onClick={() => handleDeleteMaterial(material)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 dark:text-red-400 transition-colors">
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
    <div>
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
  );
}
