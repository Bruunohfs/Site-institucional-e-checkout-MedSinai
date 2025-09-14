import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // Importa o hook
import { createClient } from '@supabase/supabase-js';

// A configuração do Supabase ainda é necessária para buscar os dados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Componentes (StatCard, formatDate) permanecem os mesmos
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return 'Pendente';
  return new Date(dateString).toLocaleDateString('pt-BR');
};


export default function DashboardPage() {
  // Recebe o 'user' do layout pai
  const { user } = useOutletContext(); 

  // O resto dos seus estados permanece aqui
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ vendasMes: 0, comissaoPendente: 0, comissaoAprovadaMes: 0 });
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    // O useEffect agora só busca os dados das vendas
    const fetchData = async () => {
      const { data: vendasData, error: vendasError } = await supabase.from('vendas').select('*');
      
      if (vendasError) {
        console.error("Erro ao buscar vendas:", vendasError);
        setLoading(false);
        return;
      }
      
      setVendas(vendasData || []);

      if (vendasData) {
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        let vendasMes = 0;
        let comissaoPendente = 0;
        let comissaoAprovadaMes = 0;

        vendasData.forEach(venda => {
          const dataContratacao = new Date(venda.created_at);
          const dataPagamento = venda.data_pagamento ? new Date(venda.data_pagamento) : null;

          if (dataContratacao >= primeiroDiaMes) vendasMes++;
          
          if (dataPagamento && dataPagamento >= primeiroDiaMes && (venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED')) {
            comissaoAprovadaMes += venda.valor;
          }
          if (venda.status_pagamento === 'PENDING' || venda.status_pagamento === 'AWAITING_RISK_ANALYSIS') {
            comissaoPendente += venda.valor;
          }
        });
        setSummary({ vendasMes, comissaoPendente, comissaoAprovadaMes });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // A lógica de ordenação e filtro permanece a mesma
  const sortedAndFilteredVendas = [...vendas]
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    })
    .filter(venda => {
      if (filtroStatus === 'pagos') return venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
      if (filtroStatus === 'pendentes') return venda.status_pagamento === 'PENDING' || venda.status_pagamento === 'AWAITING_RISK_ANALYSIS';
      return true;
    });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-700 dark:text-gray-300">Carregando dados...</p>
      </div>
    );
  }

  return (
    // O div principal agora só precisa de padding
    <div className="p-4 sm:p-6 lg:p-8">
      
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Vendas (Mês)" value={summary.vendasMes} icon="📈" />
        <StatCard title="Comissão Pendente" value={`R$ ${summary.comissaoPendente.toFixed(2).replace('.', ',')}`} icon="⏳" />
        <StatCard title="Comissão Aprovada (Mês)" value={`R$ ${summary.comissaoAprovadaMes.toFixed(2).replace('.', ',')}`} icon="✅" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
        <div className="mb-8 p-5 bg-blue-50 dark:bg-gray-700/50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seu Link de Afiliado</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Compartilhe este link para rastrear suas vendas:</p>
          {/* Agora 'user' vem do useOutletContext e funciona perfeitamente */}
          <input type="text" readOnly value={`https://www.medsinai.com.br/?pid=${user?.id}`} className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200" />
        </div>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Suas Vendas</h2>

        <div className="flex flex-wrap gap-3 my-4">
          <button onClick={( ) => setFiltroStatus('todos')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'todos' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Todos</button>
          <button onClick={() => setFiltroStatus('pagos')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'pagos' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Pagos</button>
          <button onClick={() => setFiltroStatus('pendentes')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'pendentes' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Pendentes</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('created_at')}>Contratação {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('nome_cliente')}>Cliente {sortConfig.key === 'nome_cliente' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('nome_plano')}>Plano {sortConfig.key === 'nome_plano' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('valor')}>Valor {sortConfig.key === 'valor' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('forma_pagamento')}>Forma de Pagamento {sortConfig.key === 'forma_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('data_pagamento')}>Pagamento {sortConfig.key === 'data_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('data_vencimento')}>Vencimento {sortConfig.key === 'data_vencimento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('status_pagamento')}>Status {sortConfig.key === 'status_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredVendas.map((venda) => (
                <tr key={venda.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(venda.created_at)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{venda.nome_cliente}</td>
                  <td className="px-6 py-4">{venda.nome_plano}</td>
                  <td className="px-6 py-4 whitespace-nowrap">R$ {venda.valor.toFixed(2).replace('.', ',')}</td>
                  <td className="px-6 py-4 capitalize">{venda.forma_pagamento.toLowerCase().replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(venda.data_pagamento)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(venda.data_vencimento)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {venda.status_pagamento}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
