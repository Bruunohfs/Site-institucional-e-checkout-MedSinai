import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const KpiCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-400 dark:border-gray-700 flex items-center gap-4 shadow-sm">
    <div className="text-2xl md:text-3xl text-blue-500 dark:text-blue-400">{icon}</div>
    <div className="flex-1 overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">
        {value}
      </p>
    </div>
  </div>
);

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- COMPONENTE PRINCIPAL DO DASHBOARD ---

export default function AdminDashboard() {
  // Lógica de busca e cálculo (sem alterações)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendas, setVendas] = useState([]);
  const [parceiros, setParceiros] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: vendasData, error: vendasError } = await supabase.from('vendas').select('*');
        if (vendasError) throw vendasError;
        const { data: parceirosData, error: parceirosError } = await supabase.functions.invoke('list-partners');
        if (parceirosError) throw parceirosError;
        const mapaDeParceiros = {};
        if (parceirosData.users) {
          parceirosData.users.forEach(user => {
            mapaDeParceiros[user.id] = {
              nome: user.user_metadata?.nome || 'Parceiro Desconhecido',
              vendas: 0,
              faturamento: 0
            };
          });
        }
        setParceiros(mapaDeParceiros);
        setVendas(vendasData);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const dashboardData = useMemo(() => {
    if (vendas.length === 0) return { kpisMes: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 }, rankingParceiros: [], resumoPlanos: [], ultimasVendas: [] };
    const agora = new Date();
    const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const TAXA_COMISSAO = 0.4;
    const vendasDoMes = vendas.filter(v => new Date(v.created_at) >= primeiroDiaMes);
    const kpisMes = { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 };
    const resumoPlanos = {};
    const rankingParceiros = JSON.parse(JSON.stringify(parceiros));
    vendasDoMes.forEach(venda => {
      const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
      if (isPaga) {
        kpisMes.faturamento += venda.valor;
        kpisMes.vendasConfirmadas += 1;
        if (venda.id_parceiro && rankingParceiros[venda.id_parceiro]) {
          kpisMes.comissaoAPagar += venda.valor * TAXA_COMISSAO;
          rankingParceiros[venda.id_parceiro].vendas += 1;
          rankingParceiros[venda.id_parceiro].faturamento += venda.valor;
        }
        const nomePlano = venda.nome_plano || 'Não Identificado';
        resumoPlanos[nomePlano] = (resumoPlanos[nomePlano] || 0) + 1;
      }
    });
    const rankingFinal = Object.values(rankingParceiros).filter(p => p.vendas > 0).sort((a, b) => b.faturamento - a.faturamento);
    const planosFinal = Object.entries(resumoPlanos).map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => b.quantidade - a.quantidade);
    const ultimasVendas = vendas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    return { kpisMes, rankingParceiros: rankingFinal, resumoPlanos: planosFinal, ultimasVendas };
  }, [vendas, parceiros]);

  // --- RENDERIZAÇÃO COM CORES DINÂMICAS ---

  if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="notranslate">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard do Administrador</h1>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resumo do Mês Atual</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Faturamento (Vendas Pagas)" value={formatCurrency(dashboardData.kpisMes.faturamento)} icon="💰" />
        <KpiCard title="Comissão a Pagar (Parceiros)" value={formatCurrency(dashboardData.kpisMes.comissaoAPagar)} icon="🏆" />
        <KpiCard title="Nº de Vendas Pagas" value={dashboardData.kpisMes.vendasConfirmadas.toString()} icon="✅" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- RANKING DE PARCEIROS --- */}
        {/* CORREÇÃO APLICADA AQUI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ranking de Parceiros (Mês)</h2>
          <div className="overflow-y-auto max-h-80">
            {dashboardData.rankingParceiros.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Parceiro</th>
                    <th className="py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Vendas</th>
                    <th className="py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.rankingParceiros.map(p => (
                    <tr key={p.nome} className="border-t border-gray-400 dark:border-gray-700">
                      <td className="py-3 font-medium text-gray-800 dark:text-white">{p.nome}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">{p.vendas}</td>
                      <td className="py-3 font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.faturamento)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda de parceiro este mês.</p>}
          </div>
        </div>

        {/* --- RESUMO DE PLANOS --- */}
        {/* CORREÇÃO APLICADA AQUI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Planos Mais Vendidos (Mês)</h2>
          {dashboardData.resumoPlanos.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dashboardData.resumoPlanos} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis type="number" stroke="currentColor" className="text-gray-500 dark:text-gray-400" allowDecimals={false} />
                <YAxis type="category" dataKey="nome" stroke="currentColor" className="text-gray-500 dark:text-gray-400" width={120} tick={{ fontSize: 12, fill: 'currentColor' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    border: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }} 
                />
                <Legend />
                <Bar dataKey="quantidade" fill="#3b82f6" name="Nº de Vendas" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda confirmada este mês.</p>}
        </div>
      </div>

      {/* --- ÚLTIMAS VENDAS --- */}
      {/* CORREÇÃO APLICADA AQUI */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Últimas 5 Vendas Registradas</h2>
        {dashboardData.ultimasVendas.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Data</th>
                <th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Cliente</th>
                <th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Plano</th>
                <th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.ultimasVendas.map(v => (
                <tr key={v.id} className="border-t border-gray-400/50 dark:border-gray-700">
                  <td className="py-3 text-gray-900 dark:text-gray-300">{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{v.nome_cliente}</td>
                  <td className="py-3 text-gray-900 dark:text-gray-300">{v.nome_plano}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      v.status_pagamento === 'CONFIRMED' || v.status_pagamento === 'RECEIVED' 
                        ? 'bg-green-400 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
                        : 'bg-yellow-400 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>
                      {v.status_pagamento}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda registrada.</p>}
      </div>
    </div>
  );
}
