import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Ícone para remover arquivo da lista
const RemoveIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

export default function AddMaterialModal({ isOpen, onClose, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('imagem');
  const [conteudoTexto, setConteudoTexto] = useState('');
  const [arquivos, setArquivos] = useState([]); // Estado para múltiplos arquivos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Configuração do Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    // Se o tipo não for galeria, substitui o arquivo. Se for, adiciona à lista.
    if (tipo !== 'galeria') {
      setArquivos(acceptedFiles.slice(0, 1)); // Pega apenas o primeiro arquivo
    } else {
      setArquivos(prev => [...prev, ...acceptedFiles]);
    }
  }, [tipo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSave = async () => {
    if (!titulo) {
      setError('O título é obrigatório.');
      return;
    }
    setLoading(true);
    setError('');
    const success = await onSave({ titulo, descricao, tipo, conteudo_texto: conteudoTexto, arquivos });
    setLoading(false);
    if (success) {
      handleClose();
    } else {
      setError('Não foi possível criar o material. Verifique os dados.');
    }
  };

  const handleClose = () => {
    setTitulo(''); setDescricao(''); setTipo('imagem'); setConteudoTexto(''); setArquivos([]); setError('');
    onClose();
  };

  const removeFile = (fileToRemove) => {
    setArquivos(arquivos.filter(file => file !== fileToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative p-6">
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Adicionar Novo Material</h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Material</label>
            <select id="tipo" value={tipo} onChange={(e) => { setTipo(e.target.value); setArquivos([]); }} className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
              <option value="imagem">Imagem Única</option>
              <option value="galeria">Galeria (Pack de Imagens)</option>
              <option value="video">Vídeo</option>
              <option value="documento">Documento</option>
              <option value="texto">Texto</option>
            </select>
          </div>
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="3" className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"></textarea>
          </div>
          {tipo === 'texto' ? (
            <div>
              <label htmlFor="conteudoTexto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo do Texto</label>
              <textarea id="conteudoTexto" value={conteudoTexto} onChange={(e) => setConteudoTexto(e.target.value)} rows="5" className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"></textarea>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arquivo(s)</label>
              <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                <input {...getInputProps()} multiple={tipo === 'galeria'} />
                <p className="text-gray-500 dark:text-gray-400">{tipo === 'galeria' ? 'Arraste e solte as imagens aqui, ou clique para selecionar' : 'Arraste e solte o arquivo aqui, ou clique para selecionar'}</p>
              </div>
              {arquivos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {arquivos.map((file, index) => (
                    <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                      <span className="text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                      <button onClick={() => removeFile(file)} className="text-red-500 hover:text-red-700 p-1"><RemoveIcon /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleClose} className="py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar Material'}</button>
        </div>
      </div>
    </div>
  );
}
