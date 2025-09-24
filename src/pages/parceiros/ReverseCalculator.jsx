// src/components/parceiros/ReverseCalculator.jsx - ATUALIZADO COM DESIGN PROFISSIONAL

import { useState, useMemo } from 'react';
import { planosMensais } from '@/data/planos';
// ==> ATUALIZAÇÃO 1: Importando ícones da Lucide <==
import { Target, Gem, ShieldCheck } from 'lucide-react';

// Funções auxiliares
const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parsePreco = (precoString) => {
  if (typeof precoString !== 'string') return 0;
  return parseFloat(precoString.replace(',', '.'));
};

export default function ReverseCalculator() {
  const [metaGanho, setMetaGanho] = useState('');
  const TAXA_COMISSAO_CPF = 0.4;

  const planoMaisBarato = planosMensais.find(p => p.nome === 'Individual');
  const planoMaisCaro = planosMensais.find(p => p.nome === 'Família Plus');

  const resultados = useMemo(() => {
    const meta = parseFloat(metaGanho);
    if (!meta || meta <= 0 || !planoMaisBarato || !planoMaisCaro) {
      return { qtdBarato: 0, qtdCaro: 0 };
    }
    const comissaoBarato = parsePreco(planoMaisBarato.preco) * TAXA_COMISSAO_CPF;
    const comissaoCaro = parsePreco(planoMaisCaro.preco) * TAXA_COMISSAO_CPF;
    const qtdBarato = Math.ceil(meta / comissaoBarato);
    const qtdCaro = Math.ceil(meta / comissaoCaro);
    return { qtdBarato, qtdCaro };
  }, [metaGanho, planoMaisBarato, planoMaisCaro]);

  return (
    // ==> ATUALIZAÇÃO 2: Card principal com novo estilo e borda reforçada <==
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Defina sua Meta de Ganhos
        </h3>
      </div>
      
      <div className="max-w-md mx-auto mb-6 text-center">
        <label htmlFor="meta-ganho" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Qual será sua meta de comissão este mês?
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span>
          <input
            type="number"
            id="meta-ganho"
            value={metaGanho}
            onChange={(e) => setMetaGanho(e.target.value)}
            placeholder="2000"
            className="w-full pl-10 pr-4 py-2 text-center text-lg font-semibold rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* ==> ATUALIZAÇÃO 3: Card de resultados com novo design <== */}
      {metaGanho > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-center text-sm text-gray-800 dark:text-gray-200 mb-4">
            Para atingir sua meta de <strong className="text-green-600 dark:text-green-400">{formatCurrency(parseFloat(metaGanho))}</strong>, você precisaria vender aproximadamente:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            {/* Card para o plano mais barato */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{resultados.qtdBarato}</p>
              <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>vendas do plano <strong>{planoMaisBarato.nome}</strong></span>
              </div>
            </div>
            {/* Card para o plano mais caro */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{resultados.qtdCaro}</p>
              <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <Gem className="w-4 h-4 text-gray-400" />
                <span>vendas do plano <strong>{planoMaisCaro.nome}</strong></span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Note como focar em planos de maior valor pode reduzir seu esforço de vendas!
          </p>
        </div>
      )}
    </div>
  );
}
