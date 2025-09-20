// src/components/parceiros/ReverseCalculator.jsx

import { useState, useMemo } from 'react';
import { planosMensais } from '@/data/planos';

// Funções auxiliares (copiadas para manter o componente independente)
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

  // Encontra os planos chave para a comparação
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
    <div className="bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
       Descubra em segundos quanto você pode ganhar todo mês como parceiro da MedSinai
      </h3>
      
      {/* Input da Meta */}
      <div className="max-w-sm mx-auto mb-6">
        <label htmlFor="meta-ganho" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
          Qual será sua meta de ganhos este mês?
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span>
          <input
            type="number"
            id="meta-ganho"
            value={metaGanho}
            onChange={(e) => setMetaGanho(e.target.value)}
            placeholder="2000"
            className="w-full pl-10 pr-4 py-2 text-center text-lg font-semibold rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Resultados da Simulação Reversa */}
      {metaGanho > 0 && (
        <div className="bg-gray-300 dark:bg-gray-700 p-6 rounded-xl border border-gray-400 dark:border-gray-600">
          <p className="text-center text-gray-800 dark:text-gray-200">
            Para atingir sua meta de <strong className="text-green-600 dark:text-green-400">{formatCurrency(parseFloat(metaGanho))}</strong>, você precisaria vender aproximadamente:
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{resultados.qtdBarato}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">vendas do plano <strong>{planoMaisBarato.nome}</strong></p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{resultados.qtdCaro}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">vendas do plano <strong>{planoMaisCaro.nome}</strong></p>
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
