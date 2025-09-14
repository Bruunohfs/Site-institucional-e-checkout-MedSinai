// src/pages/parceiros/AnalyticsPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Componentes e constantes (sem alterações)
const ChartPlaceholder = () => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-pulse"><div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div><div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div></div> );
const COLORS = { 'Pagas': '#10B981', 'Pendentes': '#F59E0B', 'Outros': '#6B7280' };
const statusMap = { 'CONFIRMED': 'Pagas', 'RECEIVED': 'Pagas', 'PENDING': 'Pendentes', 'AWAITING_RISK_ANALYSIS': 'Pendentes' };

// Componente para os botões de filtro
const FilterButton = ({ label, value, activeFilter, setFilter }) => {
  const isActive = activeFilter === value;
  return (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        isActive 
          ? 'bg-green-500 text-white border-green-500' 
          : 'bg-transparent dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
};

export default function AnalyticsPage() {
  const [todasAsVendas, setTodasAsVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  // 1. Estado para controlar o filtro de data ativo
  const [filtroData, setFiltroData] = useState('all'); // 'all', '7d', '30d'

  useEffect(() => {
    const fetchVendas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendas')
        .select('created_at, nome_plano, valor, status_pagamento')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Erro ao buscar vendas:", error);
      } else {
        setTodasAsVendas(data);
      }
      setLoading(false);
    };
    fetchVendas();
  }, []);

  // 2. Filtra as vendas com base no estado 'filtroData'
  const vendasFiltradas = useMemo(() => {
    if (filtroData === 'all') {
      return todasAsVendas;
    }
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() - parseInt(filtroData));

    return todasAsVendas.filter(venda => new Date(venda.created_at) >= dataLimite);
  }, [todasAsVendas, filtroData]);

  // 3. Os cálculos dos gráficos agora usam 'vendasFiltradas'
  const dataGraficoLinha = useMemo(() => Object.values(vendasFiltradas.reduce((acc, venda) => {
    const data = new Date(venda.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    acc[data] = acc[data] || { data, vendas: 0 };
    acc[data].vendas++;
    return acc;
  }, {})), [vendasFiltradas]);

  const dataGraficoBarra = useMemo(() => Object.values(vendasFiltradas.reduce((acc, venda) => {
    const plano = venda.nome_plano || 'Não identificado';
    acc[plano] = acc[plano] || { plano, quantidade: 0 };
    acc[plano].quantidade++;
    return acc;
  }, {})), [vendasFiltradas]);

  const dataGraficoPizza = useMemo(() => Object.values(vendasFiltradas.reduce((acc, venda) => {
    const status = statusMap[venda.status_pagamento] || 'Outros';
    acc[status] = acc[status] || { name: status, value: 0 };
    acc[status].value += venda.valor;
    return acc;
  }, {})), [vendasFiltradas]);


  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Análises e Gráficos</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartPlaceholder /><ChartPlaceholder /><ChartPlaceholder className="lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Análises e Gráficos</h1>
        {/* 4. Renderiza os botões de filtro */}
        <div className="flex flex-wrap gap-3">
          <FilterButton label="Últimos 7 dias" value="7" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Últimos 30 dias" value="30" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Todo o período" value="all" activeFilter={filtroData} setFilter={setFiltroData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Os gráficos abaixo agora são atualizados dinamicamente */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Vendas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataGraficoLinha}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
              <XAxis dataKey="data" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
              <Legend />
              <Line type="monotone" dataKey="vendas" stroke="#10B981" strokeWidth={2} name="Nº de Vendas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribuição por Plano</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataGraficoBarra}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
              <XAxis dataKey="plano" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
              <Legend />
              <Bar dataKey="quantidade" fill="#3B82F6" name="Quantidade de Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Valor de Comissão por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataGraficoPizza} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {dataGraficoPizza.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} /> ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} contentStyle={{ backgroundColor: 'rgb(42 42 42)', border: 'none' }} itemStyle={{color: '#eee'}} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
