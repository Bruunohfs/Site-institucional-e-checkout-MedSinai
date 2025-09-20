// src/data/planosCnpj.js

// Tabela de referência de preços, usada apenas para exibição
export const precosCnpj = [
  { faixa: '1 - 50 Licenças', basico: 25.90, comissaoBasico: 12.00, farma: 39.90, comissaoFarma: 15.00 },
  { faixa: '50 - 200 Licenças', basico: 22.90, comissaoBasico: 10.00, farma: 35.90, comissaoFarma: 12.00 },
  { faixa: '200+ Licenças', basico: 19.90, comissaoBasico: 7.00, farma: 32.90, comissaoFarma: 9.00 },
];

// ===================================================================
// ==> CORREÇÃO AQUI: Adicionando a propriedade 'valorPlano' <==
// ===================================================================
// Array usado para a calculadora de simulação
export const simulacaoCnpj = [
  { id: 'cnpj_basico_1', nome: 'Plano Básico (1 a 50)', valorPlano: 25.90, comissaoRecorrente: 12.00 },
  { id: 'cnpj_basico_2', nome: 'Plano Básico (50 a 200)', valorPlano: 22.90, comissaoRecorrente: 10.00 },
  { id: 'cnpj_basico_3', nome: 'Plano Básico (200+)', valorPlano: 19.90, comissaoRecorrente: 7.00 },
  { id: 'cnpj_farma_1', nome: 'Plano Farma (1 a 50)', valorPlano: 39.90, comissaoRecorrente: 15.00 },
  { id: 'cnpj_farma_2', nome: 'Plano Farma (50 a 200)', valorPlano: 35.90, comissaoRecorrente: 12.00 },
  { id: 'cnpj_farma_3', nome: 'Plano Farma (200+)', valorPlano: 32.90, comissaoRecorrente: 9.00 },
];
