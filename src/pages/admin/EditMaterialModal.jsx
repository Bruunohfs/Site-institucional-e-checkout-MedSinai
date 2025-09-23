import { useState, useEffect } from 'react';
// ===================================================================
// ==> CAMINHO DE IMPORTAÇÃO CORRIGIDO USANDO ALIAS '@' <==
// ===================================================================
import { useNotification } from '@/components/notifications/NotificationContext';

export default function EditMaterialModal({ material, isOpen, onClose, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [conteudoTexto, setConteudoTexto] = useState('');
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    if (material) {
      setTitulo(material.titulo || '');
      setDescricao(material.descrição || '');
      setConteudoTexto(material.conteudo_texto || '');
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleSave = async () => {
    setLoading(true);
    const updatedData = {
      titulo,
      descrição: descricao,
      conteudo_texto: conteudoTexto,
    };
    
    const success = await onSave(material.id, updatedData);
    setLoading(false);
    
    if (success) {
      addNotification('Material atualizado com sucesso!', 'success');
      onClose();
    } else {
      addNotification('Falha ao atualizar o material. Tente novamente.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Editar Material</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="titulo-edit" className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input id="titulo-edit" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
          </div>

          <div>
            <label htmlFor="descricao-edit" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
            <textarea id="descricao-edit" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="3" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"></textarea>
          </div>

          {material.tipo === 'texto' && (
            <div>
              <label htmlFor="conteudo-texto-edit" className="block text-sm font-medium text-gray-300 mb-1">Conteúdo do Texto</label>
              <textarea id="conteudo-texto-edit" value={conteudoTexto} onChange={(e) => setConteudoTexto(e.target.value)} rows="5" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono"></textarea>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
