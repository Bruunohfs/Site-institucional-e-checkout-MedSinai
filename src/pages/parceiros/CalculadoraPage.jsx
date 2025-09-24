// src/pages/parceiros/CalculadoraPage.jsx - VERSÃO COMPLETA E ATUALIZADA

import { useState, useMemo } from 'react';
import { planosMensais, planosAnuais } from '@/data/planos';
import { precosCnpj, simulacaoCnpj } from '@/data/planosCnpj';
import ReverseCalculator from '@/pages/parceiros/ReverseCalculator';
import CenarioCard from '@/pages/parceiros/CenarioCard';
import HelpModal from '@/pages/parceiros/HelpModal';
// ==> ATUALIZAÇÃO 1: Importando os ícones da Lucide <==
import { HelpCircle, Calculator, TrendingUp, Save, Building, MessageCircle, Info } from 'lucide-react';

// --- Funções e Componentes de UI ---
const formatCurrency = (value) => { if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const parsePreco = (precoString) => { if (typeof precoString !== 'string') return 0; return parseFloat(precoString.replace(',', '.')); };

// ==> ATUALIZAÇÃO 2: Componente ResultCard com novo design <==
const ResultCard = ({ title, value, isAnnual = false, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm flex items-center gap-4">
    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass} bg-opacity-10`}>
      {icon}
    </div>
    <div className="flex-1 overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">{formatCurrency(value)}</p>
        {isAnnual && value > 0 && <p className="text-xs text-gray-500 dark:text-gray-400">({formatCurrency(value / 12)}/mês)</p>}
      </div>
    </div>
  </div>
);

// Componentes de linha para mobile (com pequenos ajustes de estilo)
const PlanoCpfRow = ({ plano, uniqueId, quantidade, onQuantidadeChange }) => { const TAXA_COMISSAO_CPF = 0.4; const precoNumerico = parsePreco(plano.preco); const comissaoCalculada = precoNumerico * TAXA_COMISSAO_CPF; const valorTotal = comissaoCalculada * quantidade; return ( <div className="p-4 space-y-3"><h4 className="font-bold text-gray-800 dark:text-white">{plano.nome}</h4><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md"><div className="text-gray-500 dark:text-gray-400">Valor do Plano:</div><div className="font-medium text-gray-700 dark:text-gray-200 text-right">{formatCurrency(precoNumerico)}</div><div className="text-gray-500 dark:text-gray-400">Comissão (40%):</div><div className="font-medium text-gray-700 dark:text-gray-200 text-right">{formatCurrency(comissaoCalculada)}</div><div className="text-gray-500 dark:text-gray-400 self-center">Quantidade:</div><div className="text-right"><input id={uniqueId} type="number" min="0" className="w-20 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center" value={quantidade || ''} onChange={(e) => onQuantidadeChange(uniqueId, e.target.value)} placeholder="0" /></div><div className="col-span-2 border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center"><span className="font-semibold text-gray-500 dark:text-gray-400">Valor Total:</span><span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(valorTotal)}</span></div></div></div> ); };
const PlanoCnpjRow = ({ plano, quantidade, onQuantidadeChange }) => { const valorTotal = plano.comissaoRecorrente * quantidade; return ( <div className="p-4 space-y-3"><h4 className="font-bold text-gray-800 dark:text-white">{plano.nome}</h4><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md"><div className="text-gray-500 dark:text-gray-400">Valor do Plano:</div><div className="font-medium text-gray-700 dark:text-gray-200 text-right">{formatCurrency(plano.valorPlano)}</div><div className="text-gray-500 dark:text-gray-400">Comissão Recorrente:</div><div className="font-medium text-gray-700 dark:text-gray-200 text-right">{formatCurrency(plano.comissaoRecorrente)}</div><div className="text-gray-500 dark:text-gray-400 self-center">Quantidade:</div><div className="text-right"><input id={plano.id} type="number" min="0" className="w-20 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center" value={quantidade || ''} onChange={(e) => onQuantidadeChange(plano.id, e.target.value)} placeholder="0" /></div><div className="col-span-2 border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center"><span className="font-semibold text-gray-500 dark:text-gray-400">Total Recorrente:</span><span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(valorTotal)}</span></div></div></div> ); };

// --- Componente Principal da Página ---
export default function CalculadoraPage() {
  const [quantidadesCpf, setQuantidadesCpf] = useState({});
  const [quantidadesCnpj, setQuantidadesCnpj] = useState({});
  const [cenarios, setCenarios] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  const TAXA_COMISSAO_CPF = 0.4;

  const handleCpfChange = (uniqueId, value) => setQuantidadesCpf({ ...quantidadesCpf, [uniqueId]: Number(value) });
  const handleCnpjChange = (id, value) => setQuantidadesCnpj({ ...quantidadesCnpj, [id]: Number(value) });

  const totalComissaoCpf = useMemo(() => { const comissaoMensal = planosMensais.reduce((acc, p) => acc + (parsePreco(p.preco) * TAXA_COMISSAO_CPF * (quantidadesCpf[`mensal_${p.id}`] || 0)), 0); const comissaoAnual = planosAnuais.reduce((acc, p) => acc + (parsePreco(p.preco) * TAXA_COMISSAO_CPF * (quantidadesCpf[`anual_${p.id}`] || 0)), 0); return comissaoMensal + comissaoAnual; }, [quantidadesCpf]);
  const totalComissaoCnpj = useMemo(() => simulacaoCnpj.reduce((acc, p) => acc + (p.comissaoRecorrente * (quantidadesCnpj[p.id] || 0)), 0), [quantidadesCnpj]);

  const handleSaveCenario = () => { const nomeCenario = prompt("Dê um nome para esta simulação (ex: Foco em Planos Família):", `Cenário ${cenarios.length + 1}`); if (!nomeCenario) return; const resumoCpf = [...planosMensais, ...planosAnuais].map(p => { const uniqueId = p.parcelamento ? `anual_${p.id}` : `mensal_${p.id}`; const qtd = quantidadesCpf[uniqueId] || 0; return qtd > 0 ? { nome: p.nome, qtd } : null; }).filter(Boolean); const resumoCnpj = simulacaoCnpj.map(p => { const qtd = quantidadesCnpj[p.id] || 0; return qtd > 0 ? { nome: p.nome, qtd } : null; }).filter(Boolean); const novoCenario = { id: Date.now(), nome: nomeCenario, totalComissao: totalComissaoCpf + totalComissaoCnpj, resumo: [...resumoCpf, ...resumoCnpj], }; setCenarios(prevCenarios => [...prevCenarios, novoCenario]); };
  const handleRemoveCenario = (id) => { setCenarios(prevCenarios => prevCenarios.filter(c => c.id !== id)); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-10">
      <title>Calculadora | Portal do Parceiro MedSinai</title>
      
      {/* ==> ATUALIZAÇÃO 3: Botão de ajuda com novo estilo e ícone <== */}
      <button onClick={() => setShowHelp(true)} className="fixed top-20 right-4 sm:right-6 lg:right-8 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" aria-label="Ajuda">
        <HelpCircle size={24} />
      </button>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Calculadora de Ganhos</h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Simule suas vendas e visualize seu potencial de comissão.</p>
      </div>

      {/* Seção Planos CPF */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">Simulação de Planos CPF</h2>
        <ReverseCalculator />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResultCard title="Potencial de Comissão Mensal" value={totalComissaoCpf} icon={<Calculator size={24} />} colorClass="text-blue-500" />
          <ResultCard title="Potencial de Ganho Anual" value={totalComissaoCpf * 12} isAnnual={true} icon={<TrendingUp size={24} />} colorClass="text-green-500" />
        </div>
        <div className="space-y-6">
          {/* ==> ATUALIZAÇÃO 4: Cards e tabelas com novo estilo e borda reforçada <== */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold p-4 border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">Planos Recorrentes</h3>
            <div className="overflow-x-auto">
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"><th className="p-4">Plano</th><th className="p-4">Valor</th><th className="p-4">Comissão (40%)</th><th className="p-4 w-28">Quantidade</th><th className="p-4 text-right">Valor Total</th></tr></thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">{planosMensais.map(plano => { const uniqueId = `mensal_${plano.id}`; const precoNumerico = parsePreco(plano.preco); const comissaoCalculada = precoNumerico * TAXA_COMISSAO_CPF; return (<tr key={uniqueId}><td className="p-4 font-medium text-gray-800 dark:text-gray-100">{plano.nome}</td><td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(precoNumerico)}</td><td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(comissaoCalculada)}</td><td className="p-4"><input type="number" min="0" className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center" value={quantidadesCpf[uniqueId] || ''} onChange={(e) => handleCpfChange(uniqueId, e.target.value)} placeholder="0" /></td><td className="p-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(comissaoCalculada * (quantidadesCpf[uniqueId] || 0))}</td></tr>); })}</tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-300 dark:divide-gray-700">{planosMensais.map(plano => (<PlanoCpfRow key={`mensal_${plano.id}`} plano={plano} uniqueId={`mensal_${plano.id}`} quantidade={quantidadesCpf[`mensal_${plano.id}`]} onQuantidadeChange={handleCpfChange} />))}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold p-4 border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">Planos Anuais (12x)</h3>
            <div className="overflow-x-auto">
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"><th className="p-4">Plano</th><th className="p-4">Valor</th><th className="p-4">Comissão (40%)</th><th className="p-4 w-28">Quantidade</th><th className="p-4 text-right">Valor Total</th></tr></thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">{planosAnuais.map(plano => { const uniqueId = `anual_${plano.id}`; const precoNumerico = parsePreco(plano.preco); const comissaoCalculada = precoNumerico * TAXA_COMISSAO_CPF; return (<tr key={uniqueId}><td className="p-4 font-medium text-gray-800 dark:text-gray-100">{plano.nome}</td><td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(precoNumerico)}</td><td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(comissaoCalculada)}</td><td className="p-4"><input type="number" min="0" className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center" value={quantidadesCpf[uniqueId] || ''} onChange={(e) => handleCpfChange(uniqueId, e.target.value)} placeholder="0" /></td><td className="p-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(comissaoCalculada * (quantidadesCpf[uniqueId] || 0))}</td></tr>); })}</tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-300 dark:divide-gray-700">{planosAnuais.map(plano => (<PlanoCpfRow key={`anual_${plano.id}`} plano={plano} uniqueId={`anual_${plano.id}`} quantidade={quantidadesCpf[`anual_${plano.id}`]} onQuantidadeChange={handleCpfChange} />))}</div>
          </div>
        </div>
      </section>

      {/* Seção Comparador de Cenários */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-l-4 border-purple-500 pl-3">Comparador de Cenários</h2>
          <button onClick={handleSaveCenario} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <Save size={16} /> Salvar Simulação Atual
          </button>
        </div>
        {cenarios.length > 0 ? (<div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">{cenarios.map(cenario => (<CenarioCard key={cenario.id} cenario={cenario} onRemove={handleRemoveCenario} />))}</div>) : (<div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"><p className="text-gray-500 dark:text-gray-400">Faça uma simulação e clique em "Salvar" para comparar suas estratégias de venda aqui.</p></div>)}
      </section>

      {/* Seção Planos CNPJ */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-l-4 border-green-500 pl-3">Simulação de Planos Empresariais (CNPJ)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResultCard title="Potencial de Comissão Recorrente Mensal" value={totalComissaoCnpj} icon={<Building size={24} />} colorClass="text-purple-500" />
          <ResultCard title="Potencial de Ganho Anual (CNPJ)" value={totalComissaoCnpj * 12} isAnnual={true} icon={<TrendingUp size={24} />} colorClass="text-green-500" />
        </div>
        <div className="bg-blue-50 dark:bg-gray-800/50 p-6 rounded-lg border border-blue-200 dark:border-gray-700 flex flex-col sm:flex-row items-start gap-4">
  <Info size={32} className="text-blue-500 flex-shrink-0 mt-1 hidden sm:block" />
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Info size={24} className="text-blue-500 sm:hidden" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Desbloqueie Ganhos Maiores com Planos Empresariais</h3>
    </div>
    {/* ==> TEXTO EXPLICATIVO REINSERIDO AQUI <== */}
    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Oferecemos condições especiais para empresas e a sua comissão é garantida durante todo o contrato. Você tem duas formas de lucrar:</p>
    <ul className="list-disc list-inside text-left space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
      <li><strong>Indique e Ganhe:</strong> Nos envie o contato da empresa e nossa equipe assume a negociação. Se fecharmos, a comissão é sua!</li>
      <li><strong>Venda Direta:</strong> Apresente nossos planos para as empresas e feche o negócio você mesmo.</li>
    </ul>
    <p className="text-xs text-gray-500 dark:text-gray-500 mb-5">Todos os planos CNPJ são formalizados com contrato de 12 meses e emissão de nota fiscal, garantindo segurança para a empresa e <strong>comissão recorrente para você</strong> durante todo o período.</p>
    
    <a href="https://wa.me/16992291295?text=Ol%C3%A1!%20Tenho%20interesse%20em%20saber%20mais%20sobre%20os%20planos%20CNPJ%20para%20parceiros." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-md">
      <MessageCircle size={16} /> Dúvidas ou Indicações
    </a>
  </div>
</div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold p-4 border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">Tabela de Preços e Comissões (Referência )</h3>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"><th className="p-4">Faixa</th><th className="p-4">Plano Básico</th><th className="p-4">Comissão</th><th className="p-4">Plano Farma</th><th className="p-4">Comissão</th></tr></thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">{precosCnpj.map(item => (<tr key={item.faixa}><td className="p-4 font-medium text-gray-800 dark:text-gray-100">{item.faixa}</td><td className="p-4">{formatCurrency(item.basico)}</td><td className="p-4 font-semibold text-green-500">{formatCurrency(item.comissaoBasico)}</td><td className="p-4">{formatCurrency(item.farma)}</td><td className="p-4 font-semibold text-green-500">{formatCurrency(item.comissaoFarma)}</td></tr>))}</tbody>
          </table></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold p-4 border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">Simulador de Vendas</h3>
          <div className="overflow-x-auto">
            <table className="hidden md:table w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"><th className="p-4">Simulação de Vendas</th><th className="p-4">Valor do Plano</th><th className="p-4">Comissão Recorrente</th><th className="p-4 w-28">Quantidade</th><th className="p-4 text-right">Total Recorrente Mensal</th></tr></thead>
              <tbody className="divide-y divide-gray-300 dark:divide-gray-700">{simulacaoCnpj.map(plano => (<tr key={plano.id}><td className="p-4 font-medium text-gray-800 dark:text-gray-100">{plano.nome}</td><td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(plano.valorPlano)}</td><td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(plano.comissaoRecorrente)}</td><td className="p-4"><input type="number" min="0" className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center" value={quantidadesCnpj[plano.id] || ''} onChange={(e) => handleCnpjChange(plano.id, e.target.value)} placeholder="0" /></td><td className="p-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(plano.comissaoRecorrente * (quantidadesCnpj[plano.id] || 0))}</td></tr>))}</tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-300 dark:divide-gray-700">{simulacaoCnpj.map(plano => (<PlanoCnpjRow key={plano.id} plano={plano} quantidade={quantidadesCnpj[plano.id]} onQuantidadeChange={handleCnpjChange} />))}</div>
        </div>
      </section>
    </div>
  );
}
