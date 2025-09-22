// src/pages/admin/AdminDashboard.jsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useVendasData } from '@/hooks/useVendasData'; // Importando nosso novo hook!

// --- Componentes de UI e Funções Auxiliares (podem até sair daqui no futuro) ---
const KpiCard = ({ title, value, icon }) => ( <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-400 dark:border-gray-700 flex items-center gap-4 shadow-sm"><div className="text-2xl md:text-3xl text-blue-500 dark:text-blue-400">{icon}</div><div className="flex-1 overflow-hidden"><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3><p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">{value}</p></div></div> );
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const STATUS_STYLES = { CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', RECEIVED:  'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', OVERDUE: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400', REFUNDED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', CHARGEBACK: 'bg-red-200 text-red-900 dark:bg-red-500/30 dark:text-red-300', CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300' };
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

// --- Componente Principal Simplificado ---
export default function AdminDashboard() {
  // A MÁGICA: Chamamos o hook e pegamos tudo pronto!
  const { loading, error, kpisMes, rankingParceirosMes, resumoPlanosMes, ultimasVendas } = useVendasData();

  if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="notranslate">
      <title>Dashboard | Painel Admin MedSinai</title>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard do Administrador</h1>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resumo do Mês Atual</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Faturamento (Vendas Pagas)" value={formatCurrency(kpisMes.faturamento)} icon="💰" />
        <KpiCard title="Comissão a Pagar (Parceiros)" value={formatCurrency(kpisMes.comissaoAPagar)} icon="🏆" />
        <KpiCard title="Nº de Vendas Pagas" value={kpisMes.vendasConfirmadas.toString()} icon="✅" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ranking de Parceiros (Mês)</h2>
          <div className="overflow-y-auto max-h-80">{rankingParceirosMes.length > 0 ? ( <table className="w-full text-left"><thead><tr><th className="py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Parceiro</th><th className="py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Vendas</th><th className="py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Faturamento</th></tr></thead><tbody>{rankingParceirosMes.map(p => ( <tr key={p.nome} className="border-t border-gray-400 dark:border-gray-700"><td className="py-3 font-medium text-gray-800 dark:text-white">{p.nome}</td><td className="py-3 text-gray-600 dark:text-gray-300">{p.vendas}</td><td className="py-3 font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.faturamento)}</td></tr> ))}</tbody></table> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda de parceiro este mês.</p>}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Planos Mais Vendidos (Mês)</h2>
          {resumoPlanosMes.length > 0 ? ( <ResponsiveContainer width="100%" height={320}><BarChart data={resumoPlanosMes} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /><XAxis type="number" stroke="currentColor" className="text-gray-500 dark:text-gray-400" allowDecimals={false} /><YAxis type="category" dataKey="nome" stroke="currentColor" className="text-gray-500 dark:text-gray-400" width={120} tick={{ fontSize: 12, fill: 'currentColor' }} /><Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e5e7eb', color: '#1f2937' }} /><Legend /><Bar dataKey="quantidade" fill="#3b82f6" name="Nº de Vendas" /></BarChart></ResponsiveContainer> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda confirmada este mês.</p>}
        </div>
      </div>
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Últimas 5 Vendas Registradas</h2>
        {ultimasVendas.length > 0 ? ( <table className="w-full text-left"><thead><tr><th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Data</th><th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Cliente</th><th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Plano</th><th className="py-2 text-sm font-semibold text-gray-900 dark:text-gray-400">Status</th></tr></thead><tbody>{ultimasVendas.map(v => ( <tr key={v.id} className="border-t border-gray-400/50 dark:border-gray-700"><td className="py-3 text-gray-900 dark:text-gray-300">{new Date(v.created_at).toLocaleString('pt-BR')}</td><td className="py-3 font-medium text-gray-900 dark:text-white">{v.nome_cliente}</td><td className="py-3 text-gray-900 dark:text-gray-300">{v.nome_plano}</td><td className="py-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(v.status_pagamento)}`}>{v.status_pagamento}</span></td></tr> ))}</tbody></table> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda registrada.</p>}
      </div>
    </div>
  );
}
