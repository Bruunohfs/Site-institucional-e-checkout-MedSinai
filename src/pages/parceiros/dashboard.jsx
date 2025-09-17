import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';


// Taxa de Comissão
const TAXA_COMISSAO = 0.4; // 40%

// Componente StatCard
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

// --- COMPONENTE PARA COPIAR ---
const CopyableInput = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy || copied) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Falha ao copiar texto: ', err);
    });
  };

  const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM5 1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5v-1z"/></svg>;
  const CheckIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>;

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        readOnly
        value={textToCopy || 'Não definido'}
        className="w-full p-2 pr-24 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200"
      />
      <button
        onClick={handleCopy}
        disabled={!textToCopy}
        className={`absolute right-1.5 px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
          copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50'
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
   );
};

// Componente formatDate
const formatDate = (dateString) => {
  if (!dateString) return 'Pendente';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export default function DashboardPage() {
  const { user } = useOutletContext(); 
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState({ 
    vendasPagasMes: 0, 
    vendasPendentesMes: 0, 
    comissaoPendente: 0, 
    comissaoAprovadaMes: 0 
  });

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

        let vendasPagasMes = 0;
        let vendasPendentesMes = 0;
        let comissaoPendente = 0;
        let comissaoAprovadaMes = 0;

        vendasData.forEach(venda => {
          const dataContratacao = new Date(venda.created_at);
          const isVendaDoMes = dataContratacao >= primeiroDiaMes;
          const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
          const isPendente = venda.status_pagamento === 'PENDING' || venda.status_pagamento === 'AWAITING_RISK_ANALYSIS';

          if (isVendaDoMes) {
            if (isPaga) vendasPagasMes++;
            else if (isPendente) vendasPendentesMes++;
          }
          
          if (isPaga) {
            const dataPagamento = venda.data_pagamento ? new Date(venda.data_pagamento) : null;
            if (dataPagamento && dataPagamento >= primeiroDiaMes) {
              comissaoAprovadaMes += venda.valor * TAXA_COMISSAO;
            }
          }
          
          if (isPendente) {
            comissaoPendente += venda.valor * TAXA_COMISSAO;
          }
        });

        setSummary({ vendasPagasMes, vendasPendentesMes, comissaoPendente, comissaoAprovadaMes });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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
    return <div className="p-8"><p className="text-gray-700 dark:text-gray-300">Carregando dados...</p></div>;
  }

  return (
    <div className="notranslate">
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Visão Geral</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 ">
        <StatCard title="Vendas Pagas (Mês)" value={summary.vendasPagasMes} icon="✅" />
        <StatCard title="Vendas Pendentes (Mês)" value={summary.vendasPendentesMes} icon="⏳" />
        <StatCard title="Comissão Aprovada (Mês)" value={`R$ ${summary.comissaoAprovadaMes.toFixed(2).replace('.', ',')}`} icon="💰" />
        <StatCard title="Comissão Pendente" value={`R$ ${summary.comissaoPendente.toFixed(2).replace('.', ',')}`} icon="⌛" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
        
        {/* --- CORREÇÃO APLICADA AQUI --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bloco 1: Link de Afiliado */}
          <div className="p-5 bg-green-50 dark:bg-gray-700/50 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seu Link de Parceiro</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">Compartilhe para rastrear suas vendas.</p>
            <CopyableInput textToCopy={`https://www.medsinai.com.br/?pid=${user?.id}`} />
          </div>
          {/* Bloco 2: Cupom de Desconto */}
          <div className="p-5 bg-green-50 dark:bg-gray-700/50 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seu Cupom de Desconto</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">Ofereça aos seus clientes no checkout.</p>
            <CopyableInput textToCopy={user?.user_metadata?.cupom} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Suas Vendas</h2>

        <div className="flex flex-wrap gap-3 my-4">
          <button onClick={( ) => setFiltroStatus('todos')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'todos' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Todos</button>
          <button onClick={() => setFiltroStatus('pagos')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'pagos' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Pagos</button>
          <button onClick={() => setFiltroStatus('pendentes')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'pendentes' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Pendentes</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('created_at')}>Contratação {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('nome_cliente')}>Cliente {sortConfig.key === 'nome_cliente' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('nome_plano')}>Plano {sortConfig.key === 'nome_plano' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('valor')}>Valor do Plano {sortConfig.key === 'valor' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-green-600 dark:text-green-400">Sua Comissão</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('forma_pagamento')}>Forma de Pag. {sortConfig.key === 'forma_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('data_pagamento')}>Pagamento {sortConfig.key === 'data_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('data_vencimento')}>Vencimento {sortConfig.key === 'data_vencimento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort('status_pagamento')}>Status {sortConfig.key === 'status_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
              </tr>
            </thead>
            <tbody>
  {/* --- LÓGICA DE ESTADO VAZIO ADICIONADA AQUI --- */}
  {sortedAndFilteredVendas.length > 0 ? (
    // Se houver vendas, mapeia e mostra cada uma
    sortedAndFilteredVendas.map((venda) => (
      <tr key={venda.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
        <td className="px-6 py-4 whitespace-nowrap">{formatDate(venda.created_at)}</td>
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{venda.nome_cliente}</td>
        <td className="px-6 py-4">{venda.nome_plano}</td>
        <td className="px-6 py-4 whitespace-nowrap">R$ {venda.valor.toFixed(2).replace('.', ',')}</td>
        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600 dark:text-green-400">
          R$ {(venda.valor * TAXA_COMISSAO).toFixed(2).replace('.', ',')}
        </td>
        <td className="px-6 py-4 capitalize">{venda.forma_pagamento.toLowerCase().replace('_', ' ')}</td>
        <td className="px-6 py-4 whitespace-nowrap">{formatDate(venda.data_pagamento)}</td>
        <td className="px-6 py-4 whitespace-nowrap">{formatDate(venda.data_vencimento)}</td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED' ? 'bg-green-500' : 'bg-orange-500'}`}>
            {venda.status_pagamento}
          </span>
        </td>
      </tr>
    ))
  ) : (
    // Se NÃO houver vendas, mostra a mensagem de estado vazio
    <tr>
      <td colSpan="9" className="text-center py-10 px-6">
        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <p className="font-semibold text-lg">Nenhuma venda encontrada</p>
          <p className="text-sm">Quando você realizar a primeira venda, ela aparecerá aqui.</p>
        </div>
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
