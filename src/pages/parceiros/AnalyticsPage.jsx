// src/pages/parceiros/AnalyticsPage.jsx

import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
// O usePartnerData já foi corrigido, então não precisamos mexer nele aqui.
// Apenas o usePartnerData é importado, não o useVendasData.
import { usePartnerData } from '@/hooks/usePartnerData';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Componentes e Mapeamentos (sem alteração) ---
const ChartPlaceholder = () => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-pulse"><div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div><div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div></div> );
const FilterButton = ({ label, value, activeFilter, setFilter }) => { const isActive = activeFilter === value; return ( <button onClick={() => setFilter(value)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${ isActive ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600' }`}>{label}</button> ); };
const PLAN_MAP = [ { cleanName: 'Plano Família Plus 12x', keywords: ['Família Plus', '12x'] }, { cleanName: 'Plano Família 12x', keywords: ['Família', '12x'] }, { cleanName: 'Plano Individual Plus 12x', keywords: ['Individual Plus', '12x'] }, { cleanName: 'Plano Individual 12x', keywords: ['Individual', '12x'] }, { cleanName: 'Plano Família Plus', keywords: ['Família Plus'] }, { cleanName: 'Plano Família', keywords: ['Família'] }, { cleanName: 'Plano Individual Plus', keywords: ['Individual Plus'] }, { cleanName: 'Plano Individual', keywords: ['Individual'] }, ];
const mapRawNameToClean = (rawName) => { if (!rawName) return 'Não Identificado'; const lowerCaseRawName = rawName.toLowerCase(); for (const plan of PLAN_MAP) { const allKeywordsMatch = plan.keywords.every(keyword => lowerCaseRawName.includes(keyword.toLowerCase())); if (allKeywordsMatch) return plan.cleanName; } return 'Outros'; };
const COLORS = { 'Comissão Aprovada': '#10B981', 'Comissão Pendente': '#F59E0B', 'Outros': '#6B7280' };
const STATUS_MAP_PIZZA = { 'CONFIRMED': 'Comissão Aprovada', 'RECEIVED': 'Comissão Aprovada', 'PENDING': 'Comissão Pendente', 'AWAITING_RISK_ANALYSIS': 'Comissão Pendente' };

export default function AnalyticsPage() {
  const { user } = useOutletContext();
  // Os dados brutos já vêm do hook, que agora está correto.
  const { loading, error, vendas, dadosGraficoLinha, dadosGraficoBarra, dadosGraficoPizza } = usePartnerData(user?.id);
  
  const [filtroData, setFiltroData] = useState('all');

  // ===================================================================
  // ==> CORREÇÃO: Filtrar por data_pagamento e recalcular gráficos <==
  // ===================================================================
  const dadosGraficosFiltrados = useMemo(() => {
    if (!vendas || vendas.length === 0) {
      return { linha: [], barra: [], pizza: [] };
    }

    const vendasFiltradas = (() => {
        if (filtroData === 'all') return vendas;
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - parseInt(filtroData));
        // Filtra por data de PAGAMENTO
        return vendas.filter(v => v.data_pagamento && new Date(v.data_pagamento) >= dataLimite);
    })();

    // A lógica de recalcular os gráficos é necessária aqui, pois o filtro muda os dados de entrada.
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

    return {
      linha,
      barra,
      pizza: Object.entries(comissoesPorStatus).map(([name, value]) => ({ name, value })),
    };
  }, [vendas, filtroData]);

  if (loading) { /* ... */ }
  if (error) { /* ... */ }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <title>Análises | Portal do Parceiro MedSinai</title>
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Análises e Gráficos</h1>
        <div className="flex flex-wrap gap-3">
          <FilterButton label="Últimos 7 dias" value="7" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Últimos 30 dias" value="30" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Todo o período" value="all" activeFilter={filtroData} setFilter={setFiltroData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Vendas Pagas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGraficosFiltrados.linha}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
              <XAxis dataKey="data" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
              <Legend />
              <Line type="monotone" dataKey="vendas" stroke="#10B981" strokeWidth={2} name="Nº de Vendas Pagas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribuição por Plano (Vendas Pagas)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGraficosFiltrados.barra}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
              <XAxis dataKey="plano" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
              <Legend />
              <Bar dataKey="quantidade" fill="#3B82F6" name="Nº de Vendas Pagas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Valor de Comissão por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dadosGraficosFiltrados.pizza} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {dadosGraficosFiltrados.pizza.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || COLORS.Outros} /> ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: 'white', fontWeight: 'bold' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
