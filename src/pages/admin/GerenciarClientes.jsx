import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

// --- ÍCONES E CONSTANTES (sem alterações) ---
const ChevronDownIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const METODOS_PAGAMENTO = { CREDIT_CARD: 'Cartão de Crédito', BOLETO: 'Boleto', PIX: 'PIX', UNDEFINED: 'Não definido' };
const CICLOS = { WEEKLY: 'Semanal', BIWEEKLY: 'Quinzenal', MONTHLY: 'Mensal', BIMONTHLY: 'Bimestral', QUARTERLY: 'Trimestral', SEMIANNUALLY: 'Semestral', YEARLY: 'Anual' };
const traduzir = (dicionario, termo) => dicionario[termo] || termo;
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };

// --- COMPONENTES DetalhesProdutos e ClienteRow (sem alterações) ---
function DetalhesProdutos({ produtos }) {
  if (!produtos || produtos.length === 0) {
    return <div className="p-4 text-center text-gray-500">Nenhum produto ou assinatura encontrado para este cliente.</div>;
  }
  const assinaturas = produtos.filter(p => p.tipo_produto === 'ASSINATURA');
  const vendas = produtos.filter(p => p.tipo_produto === 'VENDA_AVULSA');
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900/50 space-y-4">
      {assinaturas.length > 0 && (
        <div>
          <h4 className="font-bold text-md text-gray-800 dark:text-white mb-2">Assinaturas Recorrentes:</h4>
          <div className="space-y-3">
            {assinaturas.map(sub => (
              <div key={`sub-${sub.id}`} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{sub.nome_produto || 'Plano não especificado'}</p>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
                  <p><strong>Valor:</strong> {formatCurrency(sub.valor)}</p>
                  <p><strong>Ciclo:</strong> {traduzir(CICLOS, sub.ciclo)}</p>
                  <p><strong>Início:</strong> {format(new Date(sub.data_compra), 'dd/MM/yyyy')}</p>
                  <p><strong>Pagamento:</strong> {traduzir(METODOS_PAGAMENTO, sub.metodo_pagamento)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {vendas.length > 0 && (
        <div>
          <h4 className="font-bold text-md text-gray-800 dark:text-white mb-2">Compras Avulsas:</h4>
          <div className="space-y-3">
            {vendas.map(venda => (
              <div key={`venda-${venda.id}`} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{venda.nome_produto || 'Produto não especificado'}</p>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
                  <p><strong>Valor Pago:</strong> {formatCurrency(venda.valor)}</p>
                  <p><strong>Status:</strong> <span className="font-medium">{venda.status === 'CONFIRMED' || venda.status === 'RECEIVED' ? 'Confirmado' : 'Pendente'}</span></p>
                  <p><strong>Data:</strong> {format(new Date(venda.data_compra), 'dd/MM/yyyy')}</p>
                  <p><strong>Pagamento:</strong> {traduzir(METODOS_PAGAMENTO, venda.metodo_pagamento)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function ClienteRow({ cliente, onToggleDetails, isExpanded, renderAs }) {
  const temAssinaturaAtiva = cliente.produtos.some(p => p.tipo_produto === 'ASSINATURA' && p.status === 'ACTIVE');
  const temVendaRecente = cliente.produtos.some(p => {
    if (p.tipo_produto !== 'VENDA_AVULSA') return false;
    const isConfirmed = p.status === 'CONFIRMED' || p.status === 'RECEIVED';
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
    return isConfirmed && new Date(p.data_compra) > umAnoAtras;
  });
  const isAtivo = temAssinaturaAtiva || temVendaRecente;
  const statusGeral = isAtivo
    ? { text: 'Ativo', style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' }
    : { text: 'Inativo', style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
  const totalProdutos = cliente.produtos.length;
  if (renderAs === 'card') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">{cliente.nome}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.telefone || 'Telefone não cadastrado'}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusGeral.style}`}>{statusGeral.text}</span>
        </div>
        <button onClick={onToggleDetails} className="w-full text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg">
          {isExpanded ? `Ocultar ${totalProdutos} Produto(s)` : `Ver ${totalProdutos} Produto(s)`}
        </button>
        {isExpanded && <DetalhesProdutos produtos={cliente.produtos} />}
      </div>
    );
  }
  return (
    <>
      <tr className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
        <td className="p-4">
          <p className="font-medium text-gray-900 dark:text-white">{cliente.nome}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.telefone || 'N/A'}</p>
        </td>
        <td className="p-4 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusGeral.style}`}>{statusGeral.text}</span></td>
        <td className="p-4 text-center font-medium text-gray-800 dark:text-gray-200">{totalProdutos}</td>
        <td className="p-4 text-center"><button onClick={onToggleDetails} title="Ver Detalhes" className={`p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform ${isExpanded ? 'rotate-180' : ''}`}><ChevronDownIcon /></button></td>
      </tr>
      {isExpanded && (<tr className="bg-gray-100 dark:bg-gray-900/50"><td colSpan="4" className="p-0"><DetalhesProdutos produtos={cliente.produtos} /></td></tr>)}
    </>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function GerenciarClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ===================================================================
  // ==> ATUALIZAÇÃO FINAL NA LÓGICA DE FETCH <==
  // ===================================================================
  const fetchClientesEProdutos = useCallback(async () => {
    setLoading(true);
    setError(''); // Limpa o erro anterior

    // Passo 1: Buscar todos os produtos da view
    const { data: todosProdutos, error: produtosError } = await supabase
      .from('vw_produtos_cliente')
      .select('*');

    if (produtosError) {
      console.error("Erro ao buscar da view 'vw_produtos_cliente':", produtosError);
      setError('Não foi possível carregar os produtos dos clientes.');
      setLoading(false);
      return;
    }

    // Passo 2: Buscar os clientes, aplicando os filtros de texto e data
    let queryClientes = supabase.from('clientes').select('*');
    if (searchTerm) {
      queryClientes = queryClientes.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }
    if (startDate) {
      queryClientes = queryClientes.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      queryClientes = queryClientes.lte('created_at', endOfDay.toISOString());
    }

    const { data: clientesFiltrados, error: clientesError } = await queryClientes;

    if (clientesError) {
      console.error("Erro ao buscar clientes:", clientesError);
      setError('Não foi possível carregar os clientes.');
      setLoading(false);
      return;
    }

    // Passo 3: Juntar os dados e aplicar o filtro de status no frontend
    let dadosCompletos = clientesFiltrados.map(cliente => {
      // Para cada cliente, encontre seus produtos na lista que buscamos no passo 1
      const produtosDoCliente = todosProdutos.filter(p => p.id_cliente === cliente.id);
      return { ...cliente, produtos: produtosDoCliente };
    }).filter(cliente => {
      // Filtra clientes que não têm produtos após os filtros de data/texto
      return cliente.produtos.length > 0;
    });

    // Aplica o filtro de status
    if (statusFilter !== 'todos') {
      dadosCompletos = dadosCompletos.filter(cliente => {
        const temAssinaturaAtiva = cliente.produtos.some(p => p.tipo_produto === 'ASSINATURA' && p.status === 'ACTIVE');
        const temVendaRecente = cliente.produtos.some(p => {
            if (p.tipo_produto !== 'VENDA_AVULSA') return false;
            const isConfirmed = p.status === 'CONFIRMED' || p.status === 'RECEIVED';
            const umAnoAtras = new Date();
            umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
            return isConfirmed && new Date(p.data_compra) > umAnoAtras;
        });
        const isAtivo = temAssinaturaAtiva || temVendaRecente;
        return statusFilter === 'ativo' ? isAtivo : !isAtivo;
      });
    }

    // Passo 4: Paginação
    setTotalCount(dadosCompletos.length);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage;
    const clientesPaginados = dadosCompletos.slice(from, to);

    setClientes(clientesPaginados);
    setLoading(false);
  }, [searchTerm, statusFilter, startDate, endDate, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchClientesEProdutos();
  }, [fetchClientesEProdutos]);

  const toggleRowExpansion = (id) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  const handleClearFilters = () => {
    setSearchTerm(''); setStatusFilter('todos'); setStartDate(''); setEndDate(''); setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && clientes.length === 0) return <div className="p-8 text-center">Carregando clientes...</div>;
  // Exibe o erro real no console, mas uma mensagem amigável na tela
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Gerenciamento de Clientes</h1>
      
      {/* Controles de filtro (sem alterações) */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar por Nome/Email</label>
            <input type="text" id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Digite para buscar..." className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status do Cliente</label>
            <select id="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white">
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
              <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Fim</label>
              <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
            </div>
            <button onClick={handleClearFilters} className="sm:mt-1 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Limpar</button>
          </div>
        </div>
      </div>

      {/* Tabela e Cards (sem alterações) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden shadow-lg">
        {!loading && clientes.length === 0 && (<p className="text-center p-8 text-gray-500">Nenhum cliente encontrado para os filtros selecionados.</p>)}
        {!loading && clientes.length > 0 && (
          <>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-200 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">Status Geral</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">Nº Produtos</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                  {clientes.map(cliente => (<ClienteRow key={`desktop-${cliente.id}`} cliente={cliente} onToggleDetails={() => toggleRowExpansion(cliente.id)} isExpanded={expandedClientId === cliente.id} renderAs="row" />))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-300 dark:divide-gray-700">
              {clientes.map(cliente => (<ClienteRow key={`mobile-${cliente.id}`} cliente={cliente} onToggleDetails={() => toggleRowExpansion(cliente.id)} isExpanded={expandedClientId === cliente.id} renderAs="card" />))}
            </div>
          </>
        )}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Anterior</button>
            <span className="text-sm text-gray-700 dark:text-gray-300">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Próxima</button>
          </div>
        )}
      </div>
    </div>
  );
}
