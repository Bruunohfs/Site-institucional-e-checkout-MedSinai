// src/pages/parceiros/ToolsPage.jsx

import { useState, useEffect } from 'react'; // <<< A CORREÇÃO ESTÁ AQUI
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Ícones
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const CopyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;

// Card para cada material
const MaterialCard = ({ material }) => {
  const isText = material.tipo === 'texto';

  const handleAction = () => {
    if (isText) {
      navigator.clipboard.writeText(material.conteudo_texto);
      // Futuramente, podemos adicionar um feedback visual de "Copiado!"
    } else {
      const link = document.createElement('a');
      link.href = material.url_do_arquivo;
      link.setAttribute('download', material.titulo || 'material-de-apoio');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col">
      {material.tipo === 'imagem' && material.url_do_arquivo && (
        <img src={material.url_do_arquivo} alt={material.titulo} className="w-full h-48 object-cover" />
      )}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{material.titulo}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex-grow">{material.descricao}</p>
        <button
          onClick={handleAction}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {isText ? <CopyIcon /> : <DownloadIcon />}
          {isText ? 'Copiar Texto' : 'Baixar'}
        </button>
      </div>
    </div>
  );
};

export default function ToolsPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateriais = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('materiais_apoio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar materiais de apoio:", error);
        setMateriais([]);
      } else {
        setMateriais(data);
      }
      setLoading(false);
    };
    fetchMateriais();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando materiais...</div>;
  }
  
  if (materiais.length === 0) {
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Material de Apoio</h1>
            <p className="text-gray-500 dark:text-gray-400">Nenhum material de apoio disponível no momento.</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Material de Apoio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materiais.map(material => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
}
