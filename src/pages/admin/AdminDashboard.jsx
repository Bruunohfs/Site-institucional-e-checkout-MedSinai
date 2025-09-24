import { useVendasData } from '@/hooks/useVendasData';
import { useClientData } from '@/hooks/useClientData';
import { DollarSign, Users, UserCheck, UserX, TrendingUp, CheckCircle, Clock, AlertTriangle, XCircle, Handshake, ShoppingCart } from 'lucide-react';

// --- Funções Auxiliares (sem alterações) ---
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const STATUS_STYLES = { CONFIRMED: 'text-green-600 dark:text-green-400', RECEIVED: 'text-green-600 dark:text-green-400', PENDING: 'text-yellow-600 dark:text-yellow-400', OVERDUE: 'text-orange-500 dark:text-orange-400', REFUNDED: 'text-gray-500', CHARGEBACK: 'text-red-600 dark:text-red-500', CANCELLED: 'text-red-600 dark:text-red-500', DEFAULT: 'text-gray-500' };
const getStatusInfo = (status) => {
  const statusMap = {
    CONFIRMED: { text: 'Confirmado', icon: <CheckCircle size={14} className="inline mr-1" />, style: STATUS_STYLES.CONFIRMED },
    RECEIVED: { text: 'Recebido', icon: <CheckCircle size={14} className="inline mr-1" />, style: STATUS_STYLES.RECEIVED },
    PENDING: { text: 'Pendente', icon: <Clock size={14} className="inline mr-1" />, style: STATUS_STYLES.PENDING },
    OVERDUE: { text: 'Atrasado', icon: <AlertTriangle size={14} className="inline mr-1" />, style: STATUS_STYLES.OVERDUE },
    REFUNDED: { text: 'Devolvido', icon: <XCircle size={14} className="inline mr-1" />, style: STATUS_STYLES.REFUNDED },
    CHARGEBACK: { text: 'Estornado', icon: <XCircle size={14} className="inline mr-1" />, style: STATUS_STYLES.CHARGEBACK },
    CANCELLED: { text: 'Cancelado', icon: <XCircle size={14} className="inline mr-1" />, style: STATUS_STYLES.CANCELLED },
    DEFAULT: { text: 'Desconhecido', icon: <AlertTriangle size={14} className="inline mr-1" />, style: STATUS_STYLES.DEFAULT },
  };
  return statusMap[status] || statusMap.DEFAULT;
};

// ===================================================================
// ==> ATUALIZADO: KpiCard agora aceita uma prop de cor para o ícone <==
// ===================================================================
const KpiCard = ({ title, value, icon: Icon, colorClass = 'text-gray-400' }) => (
  <div className="bg-white dark:bg-gray-800/50 p-5 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <Icon className={`${colorClass} dark:opacity-80`} size={22} />
    </div>
    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
  </div>
);

const DashboardPanel = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
    {children}
  </div>
);

// --- Componente Principal com Ícones Coloridos ---
export default function AdminDashboard() {
  const { loading: loadingVendas, error: errorVendas, kpisMes, rankingParceirosMes, resumoPlanosMes, ultimasVendas } = useVendasData();
  const { loading: loadingClientes, error: errorClientes, clientKpis } = useClientData();

  const loading = loadingVendas || loadingClientes;
  const error = errorVendas || errorClientes;

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-center text-gray-500 dark:text-gray-400">Carregando dashboard...</div></div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-center text-red-500">{error}</div></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <title>Dashboard | Painel Admin</title>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Geral</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral do seu negócio em tempo real.</p>
      </header>
      
      <section className="space-y-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-4">Métricas Gerais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* =================================================================== */}
            {/* ==> ATUALIZADO: Passando a prop 'colorClass' para cada card <== */}
            {/* =================================================================== */}
            <KpiCard title="Receita Mensal (MRR)" value={formatCurrency(clientKpis.mrr)} icon={TrendingUp} colorClass="text-green-500" />
            <KpiCard title="Clientes Ativos" value={clientKpis.clientesAtivos.toString()} icon={UserCheck} colorClass="text-green-500" />
            <KpiCard title="Clientes Inativos" value={clientKpis.clientesInativos.toString()} icon={UserX} colorClass="text-red-500" />
            <KpiCard title="Total de Clientes" value={clientKpis.totalClientes.toString()} icon={Users} colorClass="text-blue-500" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-4">Resumo do Mês Atual</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Faturamento (Vendas Pagas)" value={formatCurrency(kpisMes.faturamento)} icon={DollarSign} colorClass="text-green-500" />
            <KpiCard title="Comissão a Pagar" value={formatCurrency(kpisMes.comissaoAPagar)} icon={Handshake} colorClass="text-orange-500" />
            <KpiCard title="Nº de Vendas Pagas" value={kpisMes.vendasConfirmadas.toString()} icon={ShoppingCart} colorClass="text-blue-500" />
          </div>
        </div>
      </section>

      {/* O restante do código permanece exatamente igual */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <DashboardPanel title="Planos Mais Vendidos (Mês)">
            {resumoPlanosMes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Plano</th>
                      <th className="py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Vendas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumoPlanosMes.map(plano => (
                      <tr key={plano.nome} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-4 px-2 font-medium text-gray-800 dark:text-white">{plano.nome}</td>
                        <td className="py-4 px-2 text-right font-semibold text-blue-600 dark:text-blue-400">{plano.quantidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda confirmada este mês.</p>}
          </DashboardPanel>

          <DashboardPanel title="Últimas Vendas Registradas">
            {ultimasVendas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                      <th className="py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Plano</th>
                      <th className="py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasVendas.map(v => {
                      const statusInfo = getStatusInfo(v.status_pagamento);
                      return (
                        <tr key={v.id} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-4 px-2">
                            <p className="font-medium text-gray-800 dark:text-white">{v.nome_cliente}</p>
                            <p className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                          </td>
                          <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">{v.nome_plano}</td>
                          <td className={`py-4 px-2 text-sm font-medium text-right ${statusInfo.style}`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda registrada.</p>}
          </DashboardPanel>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <DashboardPanel title="Ranking de Parceiros (Mês)">
            {rankingParceirosMes.length > 0 ? (
              <ul className="space-y-4">
                {rankingParceirosMes.map((p, index) => (
                  <li key={p.nome} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5 text-center">{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{p.nome}</p>
                        <p className="text-xs text-gray-500">{p.vendas} vendas</p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.faturamento)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Nenhuma venda de parceiro este mês.</p>}
          </DashboardPanel>
        </div>
      </section>
    </div>
  );
}
