import { useState, useEffect, useMemo } from 'react'; // <-- Adicionado useMemo
import { supabase } from '@/lib/supabaseClient.js';
import AddMaterialModal from './AddMaterialModal';
import EditMaterialModal from './EditMaterialModal';
import { useNotification } from '@/components/notifications/NotificationContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import PreviewModal from '@/components/modals/PreviewModal';

// Ícones (sem alterações)
const AddIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

// --- Componente do Card de Material para o Admin (sem alterações) ---
const MaterialCardAdmin = ({ material, onEdit, onDelete, onPreview }) => {
  const isText = material.tipo === 'texto';
  const isGallery = material.tipo === 'galeria';
  let thumbnailUrl = null;
  if (material.url_do_arquivo && material.url_do_arquivo.length > 0) {
    thumbnailUrl = material.url_do_arquivo[0];
  }
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow`} onClick={() => onPreview(material)}>
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative">
        {isGallery && (<div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold py-1 px-2 rounded-md z-10">{material.url_do_arquivo?.length || 0} FOTOS</div>)}
        {thumbnailUrl && (material.tipo === 'imagem' || isGallery) ? (<img src={thumbnailUrl} alt={material.titulo} className="w-full h-full object-cover" />) : isText ? (<p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center line-clamp-6">{material.conteudo_texto}</p>) : (<p className="text-gray-500">({material.tipo})</p>)}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <span className="text-xs font-semibold uppercase text-blue-500 dark:text-blue-400">{material.tipo}</span>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-1 truncate">{material.titulo}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex-grow line-clamp-2">{material.descrição || 'Sem descrição.'}</p>
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-4">Criado em: {new Date(material.created_at).toLocaleDateString('pt-BR')}</span>
      </div>
      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-start items-center">
        <button onClick={(e) => { e.stopPropagation(); onEdit(material); }} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title="Editar"><EditIcon /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(material); }} className="p-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50" title="Excluir"><DeleteIcon /></button>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function GerenciarConteudo() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { addNotification } = useNotification();
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [previewMaterial, setPreviewMaterial] = useState(null);

  // ===================================================================
  // ==> PASSO 1: ADICIONAR ESTADOS PARA OS FILTROS <==
  // ===================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'imagem', 'galeria', etc.
  const filterOptions = ['todos', 'imagem', 'galeria', 'video', 'documento', 'texto'];

  useEffect(() => { fetchMateriais(); }, []);

  // ... (suas funções handleCreateMaterial, handleDeleteClick, etc. permanecem as mesmas)
  const fetchMateriais = async () => { setLoading(true); const { data, error } = await supabase.from('materiais_apoio').select('*').order('created_at', { ascending: false }); if (error) { setError('Não foi possível carregar os materiais.'); addNotification('Não foi possível carregar os materiais.', 'error'); } else { setMateriais(data || []); } setLoading(false); };
  const handleCreateMaterial = async (materialData) => { const { titulo, descricao, tipo, conteudo_texto, arquivos } = materialData; if (!titulo) { addNotification('O título é obrigatório.', 'error'); return false; } let fileUrls = []; if (tipo !== 'texto' && arquivos && arquivos.length > 0) { addNotification(`Iniciando upload de ${arquivos.length} arquivo(s)...`, 'info'); for (const file of arquivos) { const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`; const filePath = `materiais/${fileName}`; const { error: uploadError } = await supabase.storage.from('materiais-publicos').upload(filePath, file); if (uploadError) { addNotification(`Erro no upload: ${uploadError.message}`, 'error'); return false; } const { data: urlData } = supabase.storage.from('materiais-publicos').getPublicUrl(filePath); fileUrls.push(urlData.publicUrl); } } const { error: insertError } = await supabase.from('materiais_apoio').insert({ titulo, descrição: descricao, tipo, conteudo_texto, url_do_arquivo: fileUrls }); if (insertError) { addNotification(`Erro ao criar material: ${insertError.message}`, 'error'); return false; } addNotification('Material criado com sucesso!', 'success'); fetchMateriais(); return true; };
  const handleDeleteClick = (material) => { setMaterialToDelete(material); setIsDeleteConfirmationOpen(true); };
  const executeDeleteMaterial = async () => { if (!materialToDelete) return; try { if (materialToDelete.url_do_arquivo && materialToDelete.url_do_arquivo.length > 0) { const filePaths = materialToDelete.url_do_arquivo.map(url => url.split('/materiais-publicos/')[1]); await supabase.storage.from('materiais-publicos').remove(filePaths); } const { error: dbError } = await supabase.from('materiais_apoio').delete().eq('id', materialToDelete.id); if (dbError) throw dbError; setMateriais(materiais.filter(m => m.id !== materialToDelete.id)); addNotification('Material excluído com sucesso!', 'success'); } catch (error) { addNotification(`Erro ao excluir: ${error.message}`, 'error'); } finally { setIsDeleteConfirmationOpen(false); setMaterialToDelete(null); } };
  const handleOpenEditModal = (material) => { setSelectedMaterial(material); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedMaterial(null); };
  const handleUpdateMaterial = async (materialId, updatedData) => { const { data, error } = await supabase.from('materiais_apoio').update(updatedData).eq('id', materialId).select().single(); if (error) { console.error("Erro ao atualizar material:", error); return false; } setMateriais(materiais.map(m => (m.id === materialId ? data : m))); return true; };

  // ===================================================================
  // ==> PASSO 2: CRIAR A LISTA FILTRADA DE MATERIAIS <==
  // ===================================================================
  const filteredMateriais = useMemo(() => {
    return materiais.filter(material => {
      const matchesSearchTerm = material.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilterType = filterType === 'todos' || material.tipo === filterType;
      return matchesSearchTerm && matchesFilterType;
    });
  }, [materiais, searchTerm, filterType]);

  const renderContent = () => {
    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (filteredMateriais.length === 0) {
      return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum material encontrado com os filtros atuais.</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {filteredMateriais.map(material => (
          <MaterialCardAdmin
            key={material.id}
            material={material}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteClick}
            onPreview={setPreviewMaterial}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Conteúdo</h1>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm w-full md:w-auto">
            <AddIcon />
            Novo Material
          </button>
        </div>

        {/* =================================================================== */}
        {/* ==> PASSO 3: ADICIONAR OS CONTROLES DE FILTRO NA INTERFACE <== */}
        {/* =================================================================== */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por Título</label>
              <input
                type="text"
                id="search"
                placeholder="Ex: Logo MedSinai"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Tipo</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              >
                {filterOptions.map(option => (
                  <option key={option} value={option} className="capitalize">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {renderContent()}
        </div>
      </div>

      {/* Modais */}
      <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleCreateMaterial} />
      <EditMaterialModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleUpdateMaterial} material={selectedMaterial} />
      <ConfirmationModal isOpen={isDeleteConfirmationOpen} onClose={() => setIsDeleteConfirmationOpen(false)} onConfirm={executeDeleteMaterial} title="Confirmar Exclusão" message={`Tem certeza que deseja excluir o material "${materialToDelete?.titulo}"?`} />
      <PreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
    </>
  );
}
