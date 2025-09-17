// src/pages/parceiros/AnalyticsPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- Componentes Auxiliares (sem alteração) ---
const TAXA_COMISSAO = 0.4;
const ChartPlaceholder = () => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-pulse"><div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div><div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div></div> );
const COLORS = { 'Comissão Aprovada': '#10B981', 'Comissão Pendente': '#F59E0B', 'CANCELADA': '#EF4444', 'Outros': '#6B7280' };
const statusMap = { 'CONFIRMED': 'Comissão Aprovada', 'RECEIVED': 'Comissão Aprovada', 'PENDING': 'Comissão Pendente', 'AWAITING_RISK_ANALYSIS': 'Comissão Pendente' };
const FilterButton = ({ label, value, activeFilter, setFilter }) => { const isActive = activeFilter === value; return ( <button onClick={() => setFilter(value)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${ isActive ? 'bg-green-500 text-white border-green-500' : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600' }`}>{label}</button> ); };

// --- Função de Mapeamento de Nomes (sem alteração) ---
const PLAN_MAP = [ { cleanName: 'Plano Família Plus 12x', keywords: ['Família Plus', '12x'] }, { cleanName: 'Plano Família 12x', keywords: ['Família', '12x'] }, { cleanName: 'Plano Individual Plus 12x', keywords: ['Individual Plus', '12x'] }, { cleanName: 'Plano Individual 12x', keywords: ['Individual', '12x'] }, { cleanName: 'Plano Família Plus', keywords: ['Família Plus'] }, { cleanName: 'Plano Família', keywords: ['Família'] }, { cleanName: 'Plano Individual Plus', keywords: ['Individual Plus'] }, { cleanName: 'Plano Individual', keywords: ['Individual'] }, ];
const mapRawNameToClean = (rawName) => { if (!rawName) return 'Não Identificado'; const lowerCaseRawName = rawName.toLowerCase(); for (const plan of PLAN_MAP) { const allKeywordsMatch = plan.keywords.every(keyword => lowerCaseRawName.includes(keyword.toLowerCase())); if (allKeywordsMatch) return plan.cleanName; } return 'Outros'; };

// --- Componente Principal ---
export default function AnalyticsPage() {
  const [todasAsVendas, setTodasAsVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState('all');

  useEffect(() => {
    const fetchVendas = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('vendas').select('created_at, nome_plano, valor, status_pagamento, id_cobranca_principal, id_pagamento').order('created_at', { ascending: true });
      if (error) console.error("Erro ao buscar vendas:", error); else setTodasAsVendas(data || []);
      setLoading(false);
    };
    fetchVendas();
  }, []);

  const vendasFiltradas = useMemo(() => {
    if (filtroData === 'all') return todasAsVendas;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - parseInt(filtroData));
    return todasAsVendas.filter(venda => new Date(venda.created_at) >= dataLimite);
  }, [todasAsVendas, filtroData]);

  // ===================================================================
  // ============ LÓGICA DE CONTAGEM ÚNICA CORRIGIDA ====================
  // ===================================================================
  const getVendaUnicaId = (venda) => venda.id_cobranca_principal || venda.id_pagamento;

  const dataGraficoLinha = useMemo(() => {
    const { dados } = vendasFiltradas.reduce((acc, venda) => {
      const vendaId = getVendaUnicaId(venda);
      if (vendaId && !acc.idsContados.has(vendaId)) {
        const data = new Date(venda.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        acc.dados[data] = acc.dados[data] || { data, vendas: 0 };
        acc.dados[data].vendas++;
        acc.idsContados.add(vendaId);
      }
      return acc;
    }, { dados: {}, idsContados: new Set() });
    return Object.values(dados);
  }, [vendasFiltradas]);

  const dataGraficoBarra = useMemo(() => {
    const { dados } = vendasFiltradas.reduce((acc, venda) => {
      const vendaId = getVendaUnicaId(venda);
      if (vendaId && !acc.idsContados.has(vendaId)) {
        const planoMapeado = mapRawNameToClean(venda.nome_plano);
        acc.dados[planoMapeado] = acc.dados[planoMapeado] || { plano: planoMapeado, quantidade: 0 };
        acc.dados[planoMapeado].quantidade++;
        acc.idsContados.add(vendaId);
      }
      return acc;
    }, { dados: {}, idsContados: new Set() });
    return Object.values(dados);
  }, [vendasFiltradas]);

  const dataGraficoPizza = useMemo(() => {
    const comissoesPorStatus = vendasFiltradas.reduce((acc, venda) => {
      const status = statusMap[venda.status_pagamento] || venda.status_pagamento || 'Outros';
      acc[status] = (acc[status] || 0) + (venda.valor * TAXA_COMISSAO);
      return acc;
    }, {});
    return Object.entries(comissoesPorStatus).map(([name, value]) => ({ name, value }));
  }, [vendasFiltradas]);

  // --- Renderização (sem alterações) ---
  if (loading) { return ( <div className="p-4 sm:p-6 lg:p-8"><h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Análises e Gráficos</h1><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><ChartPlaceholder /><ChartPlaceholder /><ChartPlaceholder className="lg:col-span-2" /></div></div> ); }
  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Vendas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}><LineChart data={dataGraficoLinha}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" /><XAxis dataKey="data" /><YAxis allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} /><Legend /><Line type="monotone" dataKey="vendas" stroke="#10B981" strokeWidth={2} name="Nº de Vendas" /></LineChart></ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribuição por Plano</h2>
          <ResponsiveContainer width="100%" height={300}><BarChart data={dataGraficoBarra}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" /><XAxis dataKey="plano" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={70} /><YAxis allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} /><Legend /><Bar dataKey="quantidade" fill="#3B82F6" name="Quantidade de Vendas" /></BarChart></ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Valor de Comissão por Status</h2>
          <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={dataGraficoPizza} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}><Cell key="cell-0" fill={COLORS['Comissão Aprovada']} /><Cell key="cell-1" fill={COLORS['Comissão Pendente']} /><Cell key="cell-2" fill={COLORS['CANCELADA']} /><Cell key="cell-3" fill={COLORS['Outros']} /></Pie><Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: 'white', fontWeight: 'bold' }} /><Legend /></PieChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
