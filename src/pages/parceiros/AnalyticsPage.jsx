// src/pages/parceiros/AnalyticsPage.jsx - VERSÃO FINAL COM CORREÇÃO DO GRÁFICO

import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// --- Componentes e Mapeamentos ---

// ==> ATUALIZAÇÃO 1: ADICIONANDO A FUNÇÃO QUE FALTAVA <==
const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ChartPlaceholder = () => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm animate-pulse"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div></div> );
const FilterButton = ({ label, value, activeFilter, setFilter }) => { const isActive = activeFilter === value; return ( <button onClick={() => setFilter(value)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm ${ isActive ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600' }`}>{label}</button> ); };
const PLAN_MAP = [ { cleanName: 'Plano Família Plus 12x', keywords: ['Família Plus', '12x'] }, { cleanName: 'Plano Família 12x', keywords: ['Família', '12x'] }, { cleanName: 'Plano Individual Plus 12x', keywords: ['Individual Plus', '12x'] }, { cleanName: 'Plano Individual 12x', keywords: ['Individual', '12x'] }, { cleanName: 'Plano Família Plus', keywords: ['Família Plus'] }, { cleanName: 'Plano Família', keywords: ['Família'] }, { cleanName: 'Plano Individual Plus', keywords: ['Individual Plus'] }, { cleanName: 'Plano Individual', keywords: ['Individual'] }, ];
const mapRawNameToClean = (rawName) => { if (!rawName) return 'Não Identificado'; const lowerCaseRawName = rawName.toLowerCase(); for (const plan of PLAN_MAP) { const allKeywordsMatch = plan.keywords.every(keyword => lowerCaseRawName.includes(keyword.toLowerCase())); if (allKeywordsMatch) return plan.cleanName; } return 'Outros'; };
const COLORS = { 'Comissão Aprovada': '#10B981', 'Comissão Pendente': '#F59E0B', 'Outros': '#6B7280' };
const STATUS_MAP_PIZZA = { 'CONFIRMED': 'Comissão Aprovada', 'RECEIVED': 'Comissão Aprovada', 'PENDING': 'Comissão Pendente', 'AWAITING_RISK_ANALYSIS': 'Comissão Pendente' };

const ChartHeader = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
    {icon}
    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
  </div>
);

export default function AnalyticsPage() {
  const { user } = useOutletContext();
  const { loading, error, vendas } = usePartnerData(user?.id);
  const [filtroData, setFiltroData] = useState('all');

  const dadosGraficosFiltrados = useMemo(() => {
    if (!vendas || vendas.length === 0) return { linha: [], barra: [], pizza: [] };
    const vendasFiltradas = (() => {
        if (filtroData === 'all') return vendas;
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - parseInt(filtroData));
        return vendas.filter(v => v.data_pagamento && new Date(v.data_pagamento) >= dataLimite);
    })();
    const getVendaUnicaId = (venda) => venda.id_cobranca_principal || venda.id_pagamento;
    const reduceVendasPagasUnicas = (reducerFn) => {
        const { dados } = vendasFiltradas.reduce((acc, venda) => {
            const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
            const vendaId = getVendaUnicaId(venda);
            if (isPaga && venda.data_pagamento && vendaId && !acc.idsContados.has(vendaId)) {
                reducerFn(acc.dados, venda);
                acc.idsContados.add(vendaId);
            }
            return acc;
        }, { dados: {}, idsContados: new Set() });
        return Object.values(dados);
    };
    const linha = reduceVendasPagasUnicas((dados, venda) => {
      const data = new Date(venda.data_pagamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dados[data] = dados[data] || { data, vendas: 0 };
      dados[data].vendas++;
    });
    const barra = reduceVendasPagasUnicas((dados, venda) => {
      const planoMapeado = mapRawNameToClean(venda.nome_plano);
      dados[planoMapeado] = dados[planoMapeado] || { plano: planoMapeado, quantidade: 0 };
      dados[planoMapeado].quantidade++;
    });
    const comissoesPorStatus = vendasFiltradas.reduce((acc, venda) => {
      const status = STATUS_MAP_PIZZA[venda.status_pagamento] || 'Outros';
      acc[status] = (acc[status] || 0) + (venda.valor * 0.4);
      return acc;
    }, {});
    return { linha, barra, pizza: Object.entries(comissoesPorStatus).map(([name, value]) => ({ name, value })), };
  }, [vendas, filtroData]);

  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? 'rgb(31 41 55)' : '#fff',
    border: `1px solid ${theme === 'dark' ? 'rgb(55 65 81)' : '#e5e7eb'}`,
    color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="flex flex-wrap gap-3">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md w-28 animate-pulse"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md w-36 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartPlaceholder />
          <ChartPlaceholder />
          <div className="lg:col-span-2"><ChartPlaceholder /></div>
        </div>
      </div>
    );
  }
  
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <title>Análises | Portal do Parceiro MedSinai</title>
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Análises e Gráficos</h1>
        <div className="flex flex-wrap gap-3">
          <FilterButton label="Últimos 7 dias" value="7" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Últimos 30 dias" value="30" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Todo o período" value="all" activeFilter={filtroData} setFilter={setFiltroData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
          <ChartHeader title="Vendas Pagas por Dia" icon={<LineChartIcon className="w-5 h-5 text-blue-500" />} />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGraficosFiltrados.linha}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="data" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line type="monotone" dataKey="vendas" stroke="#3B82F6" strokeWidth={2} name="Nº de Vendas Pagas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
          <ChartHeader title="Distribuição por Plano (Vendas Pagas)" icon={<BarChart3 className="w-5 h-5 text-purple-500" />} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGraficosFiltrados.barra}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="plano" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={80} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="quantidade" fill="#8B5CF6" name="Nº de Vendas Pagas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm lg:col-span-2">
          <ChartHeader title="Valor de Comissão por Status" icon={<PieChartIcon className="w-5 h-5 text-green-500" />} />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dadosGraficosFiltrados.pizza} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {dadosGraficosFiltrados.pizza.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || COLORS.Outros} /> ))}
              </Pie>
              {/* ==> ATUALIZAÇÃO 2: CORREÇÃO DA FUNÇÃO DO TOOLTIP <== */}
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
