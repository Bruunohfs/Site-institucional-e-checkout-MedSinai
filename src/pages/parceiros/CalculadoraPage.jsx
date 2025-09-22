import { useState, useMemo } from 'react';
import { planosMensais, planosAnuais } from '@/data/planos';
import { precosCnpj, simulacaoCnpj } from '@/data/planosCnpj';
import ReverseCalculator from '@/pages/parceiros/ReverseCalculator';
import CenarioCard from '@/pages/parceiros/CenarioCard';
import HelpModal from '@/pages/parceiros/HelpModal';

// --- Ícone de Ajuda ---
const HelpIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
  </svg>
 );

// --- Funções e Componentes de UI ---
const formatCurrency = (value) => { if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const parsePreco = (precoString) => { if (typeof precoString !== 'string') return 0; return parseFloat(precoString.replace(',', '.')); };
const ResultCard = ({ title, value, isAnnual = false }) => ( <div className="bg-green-100 dark:bg-green-900/50 p-6 rounded-2xl text-center shadow-lg border border-green-200 dark:border-green-700"><h3 className="text-lg font-semibold text-green-800 dark:text-green-200">{title}</h3><p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2 break-all">{formatCurrency(value)}</p>{isAnnual && <p className="text-sm text-green-700 dark:text-green-300">({formatCurrency(value / 12)} / mês)</p>}</div> );
const PlanoCpfRow = ({ plano, uniqueId, quantidade, onQuantidadeChange }) => { const TAXA_COMISSAO_CPF = 0.4; const precoNumerico = parsePreco(plano.preco); const comissaoCalculada = precoNumerico * TAXA_COMISSAO_CPF; const valorTotal = comissaoCalculada * quantidade; return ( <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 md:hidden"><h4 className="font-bold text-gray-800 dark:text-white">{plano.nome}</h4><div className="flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Valor do Plano:</span><span className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(precoNumerico)}</span></div><div className="flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Comissão (40%):</span><span className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(comissaoCalculada)}</span></div><div className="flex justify-between items-center gap-4"><label htmlFor={uniqueId} className="text-sm text-gray-500 dark:text-gray-400">Quantidade:</label><input id={uniqueId} type="number" min="0" className="w-24 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-center" value={quantidade || ''} onChange={(e) => onQuantidadeChange(uniqueId, e.target.value)} placeholder="0" /></div><div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 mt-3"><span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Valor Total:</span><span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(valorTotal)}</span></div></div> ); };
const PlanoCnpjRow = ({ plano, quantidade, onQuantidadeChange }) => { const valorTotal = plano.comissaoRecorrente * quantidade; return ( <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 md:hidden"><h4 className="font-bold text-gray-800 dark:text-white">{plano.nome}</h4><div className="flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Valor do Plano:</span><span className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(plano.valorPlano)}</span></div><div className="flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Comissão Recorrente:</span><span className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(plano.comissaoRecorrente)}</span></div><div className="flex justify-between items-center gap-4"><label htmlFor={plano.id} className="text-sm text-gray-500 dark:text-gray-400">Quantidade:</label><input id={plano.id} type="number" min="0" className="w-24 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-center" value={quantidade || ''} onChange={(e) => onQuantidadeChange(plano.id, e.target.value)} placeholder="0" /></div><div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 mt-3"><span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Recorrente Mensal:</span><span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(valorTotal)}</span></div></div> ); };

// --- Componente Principal da Página ---
export default function CalculadoraPage() {
  const [quantidadesCpf, setQuantidadesCpf] = useState({});
  const [quantidadesCnpj, setQuantidadesCnpj] = useState({});
  const [cenarios, setCenarios] = useState([]);
  const [showHelp, setShowHelp] = useState(false); // <-- ESTADO QUE FALTAVA

  const TAXA_COMISSAO_CPF = 0.4;

  const handleCpfChange = (uniqueId, value) => setQuantidadesCpf({ ...quantidadesCpf, [uniqueId]: Number(value) });
  const handleCnpjChange = (id, value) => setQuantidadesCnpj({ ...quantidadesCnpj, [id]: Number(value) });

  const totalComissaoCpf = useMemo(() => { const comissaoMensal = planosMensais.reduce((acc, p) => acc + (parsePreco(p.preco) * TAXA_COMISSAO_CPF * (quantidadesCpf[`mensal_${p.id}`] || 0)), 0); const comissaoAnual = planosAnuais.reduce((acc, p) => acc + (parsePreco(p.preco) * TAXA_COMISSAO_CPF * (quantidadesCpf[`anual_${p.id}`] || 0)), 0); return comissaoMensal + comissaoAnual; }, [quantidadesCpf]);
  const totalComissaoCnpj = useMemo(() => simulacaoCnpj.reduce((acc, p) => acc + (p.comissaoRecorrente * (quantidadesCnpj[p.id] || 0)), 0), [quantidadesCnpj]);

  const handleSaveCenario = () => { const nomeCenario = prompt("Dê um nome para esta simulação (ex: Foco em Planos Família):", `Cenário ${cenarios.length + 1}`); if (!nomeCenario) return; const resumoCpf = [...planosMensais, ...planosAnuais].map(p => { const uniqueId = p.parcelamento ? `anual_${p.id}` : `mensal_${p.id}`; const qtd = quantidadesCpf[uniqueId] || 0; return qtd > 0 ? { nome: p.nome, qtd } : null; }).filter(Boolean); const resumoCnpj = simulacaoCnpj.map(p => { const qtd = quantidadesCnpj[p.id] || 0; return qtd > 0 ? { nome: p.nome, qtd } : null; }).filter(Boolean); const novoCenario = { id: Date.now(), nome: nomeCenario, totalComissao: totalComissaoCpf + totalComissaoCnpj, resumo: [...resumoCpf, ...resumoCnpj], }; setCenarios(prevCenarios => [...prevCenarios, novoCenario]); };
  const handleRemoveCenario = (id) => { setCenarios(prevCenarios => prevCenarios.filter(c => c.id !== id)); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12">
      <title>Calculadora | Portal do Parceiro MedSinai</title>
      
      <button onClick={() => setShowHelp(true)} className="fixed top-6 right-4 sm:right-6 lg:right-8 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" aria-label="Ajuda">
        <HelpIcon />
      </button>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="relative">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calculadora de Ganhos</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Simule suas vendas e visualize seu potencial de comissão.</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 border-l-4 border-green-500 pl-4">Simulação de Planos CPF</h2>
        <ReverseCalculator />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"><ResultCard title="Potencial de Comissão Mensal" value={totalComissaoCpf} /><ResultCard title="Potencial de Ganho Anual" value={totalComissaoCpf * 12} isAnnual={true} /></div>
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">Planos Recorrentes</h3>
            <table className="hidden md:table w-full table-fixed">
              <thead><tr className="text-left text-sm text-gray-500 dark:text-gray-400"><th className="py-2">Plano</th><th className="py-2">Valor do Plano</th><th className="py-2">Comissão (40%)</th><th className="py-2 w-24">Quantidade</th><th className="py-2 text-right">Valor Total</th></tr></thead>
              <tbody>{planosMensais.map(plano => { const uniqueId = `mensal_${plano.id}`; const precoNumerico = parsePreco(plano.preco); const comissaoCalculada = precoNumerico * TAXA_COMISSAO_CPF; return (<tr key={uniqueId} className="border-t border-gray-200 dark:border-gray-700"><td className="py-3 font-medium text-gray-800 dark:text-gray-100">{plano.nome}</td><td className="py-3 text-gray-600 dark:text-gray-300">{formatCurrency(precoNumerico)}</td><td className="py-3 text-gray-600 dark:text-gray-300">{formatCurrency(comissaoCalculada)}</td><td className="py-3"><input type="number" min="0" className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={quantidadesCpf[uniqueId] || ''} onChange={(e) => handleCpfChange(uniqueId, e.target.value)} placeholder="0" /></td><td className="py-3 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(comissaoCalculada * (quantidadesCpf[uniqueId] || 0))}</td></tr>); })}</tbody>
            </table>
            <div className="md:hidden">{planosMensais.map(plano => (<PlanoCpfRow key={`mensal_${plano.id}`} plano={plano} uniqueId={`mensal_${plano.id}`} quantidade={quantidadesCpf[`mensal_${plano.id}`]} onQuantidadeChange={handleCpfChange} />))}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">Planos Anuais (12x)</h3>
            <table className="hidden md:table w-full table-fixed">
              <thead><tr className="text-left text-sm text-gray-500 dark:text-gray-400"><th className="py-2">Plano</th><th className="py-2">Valor do Plano</th><th className="py-2">Comissão (40%)</th><th className="py-2 w-24">Quantidade</th><th className="py-2 text-right">Valor Total</th></tr></thead>
              <tbody>{planosAnuais.map(plano => { const uniqueId = `anual_${plano.id}`; const precoNumerico = parsePreco(plano.preco); const comissaoCalculada = precoNumerico * TAXA_COMISSAO_CPF; return (<tr key={uniqueId} className="border-t border-gray-200 dark:border-gray-700"><td className="py-3 font-medium text-gray-800 dark:text-gray-100">{plano.nome}</td><td className="py-3 text-gray-600 dark:text-gray-300">{formatCurrency(precoNumerico)}</td><td className="py-3 text-gray-600 dark:text-gray-300">{formatCurrency(comissaoCalculada)}</td><td className="py-3"><input type="number" min="0" className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={quantidadesCpf[uniqueId] || ''} onChange={(e) => handleCpfChange(uniqueId, e.target.value)} placeholder="0" /></td><td className="py-3 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(comissaoCalculada * (quantidadesCpf[uniqueId] || 0))}</td></tr>); })}</tbody>
            </table>
            <div className="md:hidden">{planosAnuais.map(plano => (<PlanoCpfRow key={`anual_${plano.id}`} plano={plano} uniqueId={`anual_${plano.id}`} quantidade={quantidadesCpf[`anual_${plano.id}`]} onQuantidadeChange={handleCpfChange} />))}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-gray-800 dark:text-white border-l-4 border-purple-500 pl-4">Comparador de Cenários</h2><button onClick={handleSaveCenario} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">Salvar Simulação Atual</button></div>
        {cenarios.length > 0 ? (<div className="flex gap-6 overflow-x-auto pb-4">{cenarios.map(cenario => (<CenarioCard key={cenario.id} cenario={cenario} onRemove={handleRemoveCenario} />))}</div>) : (<div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"><p className="text-gray-500 dark:text-gray-400">Faça uma simulação nas calculadoras e clique em "Salvar Simulação Atual" para começar a comparar suas estratégias de venda.</p></div>)}
      </section>

      <section>
        <div className="bg-blue-50 dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md border border-blue-200 dark:border-gray-700"><div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8"><div className="flex-shrink-0 text-6xl lg:text-7xl">🏢</div><div className="flex-grow text-center lg:text-left"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Desbloqueie Ganhos Maiores com Planos Empresariais (CNPJ)</h2><p className="text-gray-700 dark:text-gray-300 mb-4">Oferecemos condições especiais para empresas e a sua comissão é garantida durante todo o contrato. Você tem duas formas de lucrar:</p><ul className="list-disc list-inside text-left space-y-2 mb-5 text-gray-600 dark:text-gray-400"><li><strong>Indique e Ganhe:</strong> Nos envie o contato da empresa e nossa equipe assume a negociação. Se fecharmos, a comissão é sua!</li><li><strong>Venda Direta:</strong> Apresente nossos planos para as empresas e feche o negócio você mesmo.</li></ul><p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Todos os planos CNPJ são formalizados com contrato de 12 meses e emissão de nota fiscal, garantindo segurança para a empresa e <strong>comissão recorrente para você</strong> durante todo o período.</p></div><div className="flex-shrink-0 w-full lg:w-auto"><a href="https://wa.me/16992291295?text=Ol%C3%A1!%20Tenho%20interesse%20em%20saber%20mais%20sobre%20os%20planos%20CNPJ%20para%20parceiros." target="_blank" rel="noopener noreferrer" className="w-full lg:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>Dúvidas ou Indicações</a></div></div></div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 border-l-4 border-green-500 pl-4">Simulação de Planos Empresariais (CNPJ )</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"><ResultCard title="Potencial de Comissão Recorrente Mensal" value={totalComissaoCnpj} /><ResultCard title="Potencial de Ganho Anual (CNPJ)" value={totalComissaoCnpj * 12} isAnnual={true} /></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8"><h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">Tabela de Preços e Comissões (Referência)</h3><div className="overflow-x-auto"><table className="w-full min-w-[600px]"><thead><tr className="text-left text-sm text-gray-500 dark:text-gray-400"><th className="py-2">Faixa</th><th className="py-2">Plano Básico</th><th className="py-2">Comissão</th><th className="py-2">Plano Farma</th><th className="py-2">Comissão</th></tr></thead><tbody>{precosCnpj.map(item => (<tr key={item.faixa} className="border-t border-gray-200 dark:border-gray-700"><td className="py-3 font-medium text-gray-800 dark:text-gray-100">{item.faixa}</td><td className="py-3">{formatCurrency(item.basico)}</td><td className="py-3 font-semibold text-green-500">{formatCurrency(item.comissaoBasico)}</td><td className="py-3">{formatCurrency(item.farma)}</td><td className="py-3 font-semibold text-green-500">{formatCurrency(item.comissaoFarma)}</td></tr>))}</tbody></table></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">Simulador de Vendas</h3>
          <table className="hidden md:table w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="py-2">Simulação de Vendas</th>
                <th className="py-2">Valor do Plano</th>
                <th className="py-2">Comissão Recorrente</th>
                <th className="py-2 w-24">Quantidade</th>
                <th className="py-2 text-right">Total Recorrente Mensal</th>
              </tr>
            </thead>
            <tbody>
              {simulacaoCnpj.map(plano => (
                <tr key={plano.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-100">{plano.nome}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{formatCurrency(plano.valorPlano)}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{formatCurrency(plano.comissaoRecorrente)}</td>
                  <td className="py-3">
                    <input type="number" min="0" className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={quantidadesCnpj[plano.id] || ''} onChange={(e) => handleCnpjChange(plano.id, e.target.value)} placeholder="0" />
                  </td>
                  <td className="py-3 text-right font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(plano.comissaoRecorrente * (quantidadesCnpj[plano.id] || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="md:hidden">
            {simulacaoCnpj.map(plano => (
              <PlanoCnpjRow 
                key={plano.id} 
                plano={plano} 
                quantidade={quantidadesCnpj[plano.id]} 
                onQuantidadeChange={handleCnpjChange} 
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
