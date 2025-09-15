import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import PreviewModal from '../../components/ui/PreviewModal'; // <-- 1. IMPORTE O NOVO MODAL

const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const CopyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const EyeIcon = () => <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;


// --- 2. ATUALIZE O MATERIALCARD ---
const MaterialCard = ({ material, onPreviewSelect }) => {
  const isText = material.tipo === 'texto';

  const handleAction = (e) => {
    e.stopPropagation(); // Impede que o clique no botão abra o preview
    if (isText) {
      navigator.clipboard.writeText(material.conteudo_texto);
    } else {
      const link = document.createElement('a');
      link.href = material.url_do_arquivo;
      link.setAttribute('download', material.titulo || 'material-de-apoio');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // Não permite preview para materiais do tipo texto
  const handleCardClick = () => {
    if (!isText) {
      onPreviewSelect(material);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-48 group">
        {/* Camada de overlay com ícone de "ver" */}
        {!isText && (
          <div className="absolute inset-0 bg-black/50 flex justify-center items-center transition-opacity opacity-0 group-hover:opacity-100">
            <EyeIcon />
          </div>
        )}
        
        {/* Renderização da Thumbnail */}
        {material.tipo === 'imagem' && <img src={material.url_do_arquivo} alt={material.titulo} className="w-full h-full object-cover" />}
        {material.tipo === 'video' && <div className="w-full h-full bg-gray-900 flex justify-center items-center"><p className="text-gray-500">(Vídeo)</p></div>}
        {material.tipo === 'documento' && <div className="w-full h-full bg-gray-900 flex justify-center items-center"><p className="text-gray-500">(Documento)</p></div>}
        {isText && <div className="w-full h-full bg-gray-900 flex justify-center items-center p-4"><p className="text-gray-400 text-center line-clamp-5">{material.conteudo_texto}</p></div>}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{material.titulo}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex-grow">{material.descrição}</p>
        <button onClick={handleAction} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 hover:opacity-90 transition-opacity">
          {isText ? <CopyIcon /> : <DownloadIcon />}
          {isText ? 'Copiar Texto' : 'Baixar'}
        </button>
      </div>
    </div>
  );
};


export default function SupportMaterialPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null); // <-- 3. ESTADO ATUALIZADO

  useEffect(() => {
    const fetchMateriais = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('materiais_apoio').select('*').order('created_at', { ascending: false });
      if (error) console.error("Erro:", error);
      else setMateriais(data || []);
      setLoading(false);
    };
    fetchMateriais();
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Material de Apoio</h1>
      
      {materiais.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {materiais.map(material => (
            <MaterialCard 
              key={material.id} 
              material={material} 
              onPreviewSelect={setSelectedMaterial} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Nenhum material disponível.</p>
      )}

      {/* --- 4. RENDERIZE O NOVO MODAL --- */}
      <PreviewModal 
        material={selectedMaterial} 
        onClose={() => setSelectedMaterial(null)} 
      />
    </div>
  );
}
