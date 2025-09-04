// DENTRO DE: src/pages/CheckoutPage.jsx

import React, { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { useParams } from 'react-router-dom';
import { planosAnuais, planosMensais } from '@/data/planos';
import { useForm, Controller } from 'react-hook-form';

// Ícone de cadeado
const LockIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
  </svg>
);

function CheckoutPage() {
  // --- LÓGICA DO REACT HOOK FORM ---
  const { register, handleSubmit, control, formState: { errors, isValid } } = useForm({
    mode: 'onTouched'
  });

  // --- LÓGICA DO COMPONENTE ---
  const [metodoPagamento, setMetodoPagamento] = useState('cartao');
  const { tipoPlano, idDoPlano } = useParams();
  const arrayDeBusca = tipoPlano === 'anual' ? planosAnuais : planosMensais;
  const planoSelecionado = arrayDeBusca.find(p => p.nome.toLowerCase().replace(/ /g, '-') === idDoPlano);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // --- FUNÇÃO DE SUBMIT ---
  const handleFormSubmit = async (data) => {
    setIsProcessing(true);
    setPaymentResult(null);

    const dadosCompletos = {
      plano: {
        nome: planoSelecionado.nome,
        preco: planoSelecionado.preco,
      },
      cliente: data,
    };

    try {
      let endpoint = '';
      let payload = {};

      // LÓGICA PARA CADA MÉTODO DE PAGAMENTO
      if (metodoPagamento === 'cartao') {
        // 1. TOKENIZAÇÃO DO CARTÃO
        Asaas.CreditCard.tokenize({
          customer_name: data.cardName,
          credit_card_number: data.cardNumber.replace(/ /g, ''),
          credit_card_brand: "VISA", // Pode ser melhorado para detectar a bandeira
          credit_card_token: "", // Este campo é necessário pela SDK
          credit_card_expiry_month: data.expiryDate.split('/')[0],
          credit_card_expiry_year: `20${data.expiryDate.split('/')[1]}`,
          credit_card_ccv: data.cvv,
        }, async (response) => {
          if (response.success) {
            // 2. TOKEN GERADO! AGORA CHAMA NOSSA API
            endpoint = '/api/pagar-com-cartao';
            payload = { ...dadosCompletos, creditCardToken: response.credit_card_token };
            
            try {
              const apiResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              const result = await apiResponse.json();
              if (!apiResponse.ok) throw new Error(result.details || result.error);

              setPaymentResult({ success: true, type: 'cartao', status: result.status });
            } catch (error) {
              setPaymentResult({ success: false, message: error.message });
            } finally {
              setIsProcessing(false);
            }

          } else {
            // Falha na tokenização
            const errorReason = response.errors?.[0]?.description || 'Dados do cartão inválidos.';
            setPaymentResult({ success: false, message: errorReason });
            setIsProcessing(false);
          }
        });
        return; 
      } 
      
      // LÓGICA PARA BOLETO E PIX
      else {
        endpoint = metodoPagamento === 'boleto' ? '/api/gerar-boleto' : '/api/gerar-pix';
        payload = dadosCompletos;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.details || result.error);

        if (metodoPagamento === 'boleto') {
          setPaymentResult({ success: true, type: 'boleto', url: result.boletoUrl });
        } else if (metodoPagamento === 'pix') {
          setPaymentResult({ success: true, type: 'pix', payload: result.payload, qrCodeImage: `data:image/png;base64,${result.encodedImage}` });
        }
      }
    } catch (error) {
      console.error(`Erro ao chamar a API de ${metodoPagamento}:`, error);
      setPaymentResult({ success: false, message: error.message || 'Não foi possível conectar ao servidor de pagamento.' });
    } finally {
      if (metodoPagamento !== 'cartao') {
        setIsProcessing(false);
      }
    }
  };

  // --- RENDERIZAÇÃO DE ERRO ---
  if (!planoSelecionado) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold">Plano não encontrado!</h1>
        <p>Ocorreu um erro ao carregar os detalhes do plano.</p>
      </div>
    );
  }

  // --- O COMPONENTE EM SI (JSX) ---
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Finalize sua Assinatura</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Você está a um passo de ter acesso a todos os benefícios.</p>

            {/* Resumo do Pedido */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-8 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Plano Selecionado:</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{planoSelecionado.nome}</p>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-600" />
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Valor Mensal:</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">R$ {planoSelecionado.preco}</p>
              </div>
            </div>

            {/* Formulário de Pagamento */}
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-8">

                {/* SEÇÃO 1: DADOS DO CLIENTE */}
                <div>
                  <div className="flex items-center mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white font-bold rounded-full mr-3">1</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Seus Dados</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                      <input type="text" id="nomeCompleto" placeholder="Seu nome completo" {...register("nomeCompleto", { required: "O nome é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.nomeCompleto ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />
                      {errors.nomeCompleto && <p className="text-red-500 text-xs mt-1">{errors.nomeCompleto.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                      <Controller name="cpf" control={control} rules={{ required: "O CPF é obrigatório" }} render={({ field }) => (<IMaskInput {...field} mask="000.000.000-00" id="cpf" placeholder="000.000.000-00" className={`w-full mt-1 p-3 rounded-lg border ${errors.cpf ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />)} />
                      {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                      <Controller name="dataNascimento" control={control} rules={{ required: "A data é obrigatória" }} render={({ field }) => (<IMaskInput {...field} mask="00/00/0000" id="dataNascimento" placeholder="DD/MM/AAAA" className={`w-full mt-1 p-3 rounded-lg border ${errors.dataNascimento ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />)} />
                      {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">{errors.dataNascimento.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                      <input type="email" id="email" placeholder="seu@email.com" {...register("email", { required: "O e-mail é obrigatório", pattern: { value: /^\S+@\S+$/i, message: "Formato de e-mail inválido" } })} className={`w-full mt-1 p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                      <Controller name="telefone" control={control} rules={{ required: "O telefone é obrigatório" }} render={({ field }) => (<IMaskInput {...field} mask="(00) 00000-0000" id="telefone" placeholder="(00) 00000-0000" className={`w-full mt-1 p-3 rounded-lg border ${errors.telefone ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />)} />
                      {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone.message}</p>}
                    </div>
                  </div>
                </div>

                {/* SEÇÃO 2: DADOS DE PAGAMENTO */}
                <div>
                  <div className="flex items-center mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white font-bold rounded-full mr-3">2</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Forma de Pagamento</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1 mb-6">
                    <button type="button" onClick={() => setMetodoPagamento('cartao')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metodoPagamento === 'cartao' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}>Cartão</button>
                    <button type="button" onClick={() => setMetodoPagamento('pix')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metodoPagamento === 'pix' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}>Pix</button>
                    <button type="button" onClick={() => setMetodoPagamento('boleto')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metodoPagamento === 'boleto' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}>Boleto</button>
                  </div>
                  
                  <div>
                    {metodoPagamento === 'cartao' && (
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número do Cartão</label>
                          <Controller name="cardNumber" control={control} rules={{ required: "O número do cartão é obrigatório" }} render={({ field }) => (<IMaskInput {...field} mask="0000 0000 0000 0000" id="cardNumber" placeholder="0000 0000 0000 0000" className={`w-full mt-1 p-3 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />)} />
                          {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Validade</label>
                            <Controller name="expiryDate" control={control} rules={{ required: "A validade é obrigatória" }} render={({ field }) => (<IMaskInput {...field} mask="MM/YY" blocks={{ MM: { mask: IMask.MaskedRange, from: 1, to: 12 }, YY: { mask: IMask.MaskedRange, from: 24, to: 99 } }} id="expiryDate" placeholder="MM/AA" className={`w-full mt-1 p-3 rounded-lg border ${errors.expiryDate ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />)} />
                            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
                          </div>
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                            <Controller name="cvv" control={control} rules={{ required: "O CVV é obrigatório" }} render={({ field }) => (<IMaskInput {...field} mask="0000" id="cvv" placeholder="123" className={`w-full mt-1 p-3 rounded-lg border ${errors.cvv ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />)} />
                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome no Cartão</label>
                          <input type="text" id="cardName" placeholder="Nome completo como no cartão" {...register("cardName", { required: "O nome no cartão é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.cardName ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />
                          {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName.message}</p>}
                        </div>
                      </div>
                    )}

                    {metodoPagamento === 'pix' && (
                      <div className="text-center p-4 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                        {!paymentResult || !paymentResult.success || paymentResult.type !== 'pix' ? (
                          <>
                            <p className="font-semibold mb-2">Pague com Pix para liberação imediata!</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Clique no botão de pagamento abaixo para gerar seu QR Code.</p>
                          </>
                        ) : (
                          <div>
                            <h4 className="font-bold text-lg mb-2 text-green-600 dark:text-green-400">QR Code Gerado!</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Aponte a câmera do seu celular ou use o código abaixo.</p>
                            <img src={paymentResult.qrCodeImage} alt="QR Code Pix" className="mx-auto my-4 border-4 border-white dark:border-gray-700 rounded-lg shadow-lg" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pix Copia e Cola:</p>
                            <div className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 p-3 rounded-md text-xs break-all font-mono cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => navigator.clipboard.writeText(paymentResult.payload)} title="Clique para copiar">
                              {paymentResult.payload}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {metodoPagamento === 'boleto' && (
                      <div className="text-center p-4 border-dashed border-2 border-gray-300 rounded-lg">
                        <p className="font-semibold mb-4">O boleto será enviado para o seu e-mail e pode levar até 3 dias úteis para ser compensado.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Clique no botão de pagamento abaixo para gerar e receber seu boleto.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <div className="mt-8">
                <button type="submit" disabled={!isValid || isProcessing} className={`w-full px-8 py-4 text-lg rounded-lg font-semibold transition-colors flex items-center justify-center ${!isValid || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                  <LockIcon />
                  {isProcessing ? ' Processando...' : (
                    <>
                      {metodoPagamento === 'cartao' && ' Pagar com Segurança'}
                      {metodoPagamento === 'pix' && ' Gerar QR Code Pix'}
                      {metodoPagamento === 'boleto' && ' Gerar Boleto'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Área de Resultado do Pagamento (Unificada) */}
            {paymentResult && (
              <div className={`mt-6 p-4 rounded-lg text-center ${
                paymentResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                
                {/* --- MENSAGENS DE SUCESSO --- */}
                {paymentResult.success && (
                  <>
                    {paymentResult.type === 'boleto' && (
                      <div>
                        <h4 className="font-bold mb-2">Boleto Gerado com Sucesso!</h4>
                        <a href={paymentResult.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
                          Clique aqui para visualizar o Boleto
                        </a>
                        <p className="text-xs mt-2">O boleto também foi enviado para o seu e-mail.</p>
                      </div>
                    )}
                    {paymentResult.type === 'cartao' && (
                      <div>
                        <h4 className="font-bold text-lg">Pagamento Aprovado!</h4>
                        <p className="text-sm">Seja bem-vindo(a)! Enviamos os detalhes da sua assinatura para o seu e-mail.</p>
                      </div>
                    )}
                    {/* A mensagem de sucesso do Pix não é necessária aqui, pois o QR Code já é o sucesso */}
                  </>
                )}

                {/* --- MENSAGEM DE ERRO --- */}
                {!paymentResult.success && (
                  <div>
                    <h4 className="font-bold">Ocorreu um Erro</h4>
                    <p>{paymentResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          Pagamentos processados com segurança. Seus dados são criptografados.
        </p>
      </div>
    </div>
  );
}

export default CheckoutPage;
