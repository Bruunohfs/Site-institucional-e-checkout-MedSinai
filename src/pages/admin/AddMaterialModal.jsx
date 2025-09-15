import { useState } from 'react';

export default function AddMaterialModal({ isOpen, onClose, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('imagem'); // 'imagem', 'documento', 'texto'
  const [conteudoTexto, setConteudoTexto] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!titulo || !descricao) {
      setError('Título e descrição são obrigatórios.');
      return;
    }
    if (tipo !== 'texto' && !arquivo) {
      setError('Por favor, selecione um arquivo para upload.');
      return;
    }
    if (tipo === 'texto' && !conteudoTexto) {
      setError('O campo de texto não pode estar vazio.');
      return;
    }

    setLoading(true);
    setError('');

    const materialData = { titulo, descricao, tipo, conteudo_texto: conteudoTexto, arquivo };
    const success = await onSave(materialData);

    setLoading(false);
    if (success) {
      handleClose(); // Limpa e fecha se o save for bem-sucedido
    } else {
      setError('Falha ao salvar o material. Tente novamente.');
    }
  };

  const handleClose = () => {
    // Reseta todos os estados ao fechar
    setTitulo('');
    setDescricao('');
    setTipo('imagem');
    setConteudoTexto('');
    setArquivo(null);
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Adicionar Novo Material</h2>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="titulo-material" className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input id="titulo-material" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao-material" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
            <textarea id="descricao-material" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="3" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"></textarea>
          </div>

          {/* Tipo de Material */}
         <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
              <option value="imagem">Imagem (PNG, JPG)</option>
              <option value="video">Vídeo (MP4)</option> {/* <-- ADICIONE ESTA LINHA */}
              <option value="documento">Documento (PDF)</option>
              <option value="texto">Texto / Script</option>
            </select>
          </div>

          {/* Input Condicional: Arquivo ou Texto */}
          {tipo === 'texto' ? (
            <div>
              <label htmlFor="conteudo-texto" className="block text-sm font-medium text-gray-300 mb-1">Conteúdo do Texto</label>
              <textarea id="conteudo-texto" value={conteudoTexto} onChange={(e) => setConteudoTexto(e.target.value)} rows="5" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono"></textarea>
            </div>
          ) : (
            <div>
              <label htmlFor="arquivo-upload" className="block text-sm font-medium text-gray-300 mb-1">Arquivo</label>
              <input id="arquivo-upload" type="file" onChange={(e) => setArquivo(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {arquivo && <p className="text-xs text-green-400 mt-1">Arquivo selecionado: {arquivo.name}</p>}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={handleClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Material'}
          </button>
        </div>
      </div>
    </div>
  );
}
