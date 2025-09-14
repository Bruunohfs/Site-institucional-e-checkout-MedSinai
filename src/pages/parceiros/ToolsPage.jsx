// src/pages/parceiros/ToolsPage.jsx

// ... (imports e outros componentes permanecem os mesmos)

export default function ToolsPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SUBSTITUA ESTE USEEFFECT ---
  useEffect(() => {
    const fetchMateriais = async () => {
      setLoading(true);
      
      // Busca os dados diretamente da tabela 'materiais_apoio'
      const { data, error } = await supabase
        .from('materiais_apoio')
        .select('*')
        .order('created_at', { ascending: false }); // Ordena pelos mais recentes primeiro

      if (error) {
        console.error("Erro ao buscar materiais de apoio:", error);
        setMateriais([]); // Em caso de erro, define como array vazio
      } else {
        setMateriais(data);
      }
      
      setLoading(false);
    };

    fetchMateriais();
  }, []);
  // --- FIM DA SUBSTITUIÇÃO ---

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

// O componente MaterialCard e os ícones permanecem os mesmos
// ...
