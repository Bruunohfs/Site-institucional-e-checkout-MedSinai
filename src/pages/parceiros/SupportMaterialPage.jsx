import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import PreviewModal from '@/components/modals/PreviewModal';
import JSZip from 'jszip';
import { useNotification } from '@/components/notifications/NotificationContext'; // <-- 1. IMPORTAR O HOOK

// Ícones
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const CopyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;

const MaterialCard = ({ material, onPreview }) => {
  const isText = material.tipo === 'texto';
  const isGallery = material.tipo === 'galeria';
  const [downloadState, setDownloadState] = useState('idle');
  const { addNotification } = useNotification(); // <-- 2. INICIALIZAR O HOOK

  let thumbnailUrl = null;
  if (material.url_do_arquivo && material.url_do_arquivo.length > 0) {
    thumbnailUrl = material.url_do_arquivo[0];
  }

  const handleAction = async (e) => {
    e.stopPropagation();
    if (isText) {
      navigator.clipboard.writeText(material.conteudo_texto);
      // ===================================================================
      // ==> 3. SUBSTITUIR O alert() PELA NOTIFICAÇÃO <==
      // ===================================================================
      addNotification('Texto copiado para a área de transferência!', 'success');
      return;
    }

    if (!material.url_do_arquivo || material.url_do_arquivo.length === 0) return;

    setDownloadState('preparing');

    try {
      const zip = new JSZip();
      const urlsToDownload = material.url_do_arquivo;
      const filePromises = urlsToDownload.map(async (url, index) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Falha ao baixar ${url}`);
        const blob = await response.blob();
        const ext = url.split('.').pop().split('?')[0];
        const fileName = `${material.titulo.replace(/\s/g, '_')}_${index + 1}.${ext}`;
        return { name: fileName, blob };
      });

      const files = await Promise.all(filePromises);
      files.forEach(file => { zip.file(file.name, file.blob); });

      setDownloadState('downloading');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const objectUrl = window.URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', `${material.titulo.replace(/\s/g, '_') || 'material'}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

    } catch (error) {
      console.error("Erro ao criar o arquivo zip:", error);
      // ===================================================================
      // ==> 3. SUBSTITUIR O alert() PELA NOTIFICAÇÃO <==
      // ===================================================================
      addNotification('Não foi possível baixar o pacote de arquivos.', 'error');
    } finally {
      setDownloadState('idle');
    }
  };

  const getButtonText = () => {
    if (downloadState === 'preparing') return 'Preparando...';
    if (downloadState === 'downloading') return 'Baixando...';
    return isText ? 'Copiar Texto' : 'Baixar Material';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onPreview(material)}>
      <div className="relative w-full h-48 group">
        {isGallery && (<div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold py-1 px-2 rounded-md z-10">{material.url_do_arquivo?.length || 0} FOTOS</div>)}
        {thumbnailUrl && (material.tipo === 'imagem' || isGallery) ? (<img src={thumbnailUrl} alt={material.titulo} className="w-full h-full object-cover" />) : isText ? (<div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-4"><p className="text-gray-500 dark:text-gray-400 text-center line-clamp-5">{material.conteudo_texto}</p></div>) : (<div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center"><p className="text-gray-500">({material.tipo})</p></div>)}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{material.titulo}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex-grow">{material.descrição}</p>
        <button 
          onClick={handleAction} 
          disabled={downloadState !== 'idle'}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {downloadState === 'idle' && (isText ? <CopyIcon /> : <DownloadIcon />)}
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

// --- Componente Principal da Página ---
export default function SupportMaterialPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const filterOptions = ['todos', 'imagem', 'galeria', 'video', 'documento', 'texto'];
  const { addNotification } = useNotification(); // <-- 2. INICIALIZE O HOOK AQUI TAMBÉM

  useEffect(() => {
    const fetchMateriais = async () => { 
      setLoading(true); 
      const { data, error } = await supabase.from('materiais_apoio').select('*').order('created_at', { ascending: false }); 
      if (error) {
        console.error("Erro:", error);
        // ===================================================================
        // ==> 3. SUBSTITUIR O console.error PELA NOTIFICAÇÃO <==
        // ===================================================================
        addNotification('Falha ao carregar os materiais de apoio.', 'error');
      } else {
        setMateriais(data || []); 
      }
      setLoading(false); 
    };
    fetchMateriais();
  }, []);

  const filteredMateriais = useMemo(() => {
    return materiais.filter(material => {
      const matchesSearchTerm = material.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilterType = filterType === 'todos' || material.tipo === filterType;
      return matchesSearchTerm && matchesFilterType;
    });
  }, [materiais, searchTerm, filterType]);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando materiais...</div>;
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <title>Material de Apoio | Portal do Parceiro MedSinai</title>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Material de Apoio</h1>
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2"><label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por Título</label><input type="text" id="search" placeholder="Ex: Banner para Instagram" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" /></div>
          <div><label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Tipo</label><select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{filterOptions.map(option => (<option key={option} value={option} className="capitalize">{option.charAt(0).toUpperCase() + option.slice(1)}</option>))}</select></div>
        </div>
      </div>
      {filteredMateriais.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{filteredMateriais.map(material => (<MaterialCard key={material.id} material={material} onPreview={setPreviewMaterial} />))}</div>) : (<p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhum material encontrado com os filtros atuais.</p>)}
      <PreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
    </div>
  );
}
