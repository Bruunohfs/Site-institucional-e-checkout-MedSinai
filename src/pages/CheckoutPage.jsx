import React, { useState, useEffect } from 'react'; // ✨ 1. IMPORTEI O useEffect
import { IMaskInput } from 'react-imask';
import { useParams } from 'react-router-dom';
import { planosAnuais, planosMensais } from '@/data/planos';
import { useForm, Controller } from 'react-hook-form';

// Ícone de cadeado (sem alterações)
const LockIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
  </svg>
);

function CheckoutPage() {
  // --- LÓGICA DO REACT HOOK FORM ---
  const { register, handleSubmit, control, formState: { errors, isValid }, unregister } = useForm({
    mode: 'all',
    shouldUnregister: true,
  });

  const [metodoPagamento, setMetodoPagamento] = useState(
    tipoPlano === 'anual' ? 'cartao' : 'cartao' 
  );
  const { tipoPlano, idDoPlano } = useParams();
  const arrayDeBusca = tipoPlano === 'anual' ? planosAnuais : planosMensais;
  const planoSelecionado = arrayDeBusca.find(p => p.nome.toLowerCase().replace(/ /g, '-') === idDoPlano);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
        if (metodoPagamento !== 'cartao') {
      unregister("cardNumber");
      unregister("expiryDate");
      unregister("cvv");
      unregister("cardName");
    }
  }, [metodoPagamento, unregister]);
  
  useEffect(() => {
    const isPersonalDataValid = isValid;
    let isPaymentDataValid = false;
    if (metodoPagamento === 'pix' || metodoPagamento === 'boleto') {
      isPaymentDataValid = true;
    } else if (metodoPagamento === 'cartao') {
      isPaymentDataValid = isValid;
    }
    setIsButtonDisabled(!isPersonalDataValid || !isPaymentDataValid || isProcessing);
  }, [isValid, metodoPagamento, isProcessing]);

  const handleFormSubmit = async (data) => {
    setIsProcessing(true);
    setPaymentResult(null);

    const dadosCompletos = {
      plano: {
        nome: planoSelecionado.nome,
        preco: planoSelecionado.preco,
        tipo: tipoPlano,
      },
      cliente: data,
    };

    try {
      const endpoint =
        metodoPagamento === 'boleto' ? '/api/gerar-boleto' :
        metodoPagamento === 'pix' ? '/api/gerar-pix' :
        '/api/pagar-com-cartao';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCompletos),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.details || result.error);

      if (metodoPagamento === 'boleto') {
        setPaymentResult({ success: true, type: 'boleto', url: result.boletoUrl });
      } else if (metodoPagamento === 'pix') {
        setPaymentResult({ success: true, type: 'pix', payload: result.payload, qrCodeImage: `data:image/png;base64,${result.encodedImage}` });
      } else if (metodoPagamento === 'cartao') {
        setPaymentResult({ success: true, type: 'cartao', status: result.status });
      }

    } catch (error) {
      console.error(`Erro ao processar pagamento:`, error);
      setPaymentResult({ success: false, message: error.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDERIZAÇÃO DE ERRO (sem alterações) ---
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
 
              {/* --- LÓGICA PARA PLANO MENSAL --- */}
  {tipoPlano === 'mensal' && (
    <>
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Plano Selecionado:</p>
        <p className="font-bold text-lg text-gray-900 dark:text-white">{planoSelecionado.nome} (Mensal)</p>
      </div>
      <hr className="my-2 border-gray-200 dark:border-gray-600" />
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Valor da Cobrança:</p>
        <p className="font-bold text-lg text-green-600 dark:text-green-400">R$ {planoSelecionado.preco}</p>
      </div>
    </>
  )}

            {/* --- LÓGICA PARA PLANO ANUAL --- */}
  {tipoPlano === 'anual' && (
    <>
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Plano Selecionado:</p>
        <p className="font-bold text-lg text-gray-900 dark:text-white">{planoSelecionado.nome} (Anual)</p>
      </div>
      <hr className="my-2 border-gray-200 dark:border-gray-600" />
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Valor da Cobrança:</p>
        <div className="text-right">
          <p className="font-bold text-lg text-green-600 dark:text-green-400">12x de R$ {planoSelecionado.preco}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total: R$ {(parseFloat(planoSelecionado.preco.replace(',', '.')) * 12).toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>
    </>
  )}
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
  <Controller
    name="cpf"
    control={control}
    rules={{
      required: "O CPF é obrigatório",
      minLength: {
        value: 14, // 11 dígitos + 2 pontos + 1 hífen
        message: "CPF incompleto"
      }
    }}
    render={({ field: { onChange, name, value } }) => (
      <IMaskInput
        mask="000.000.000-00"
        id={name}
        name={name}
        value={value}
        placeholder="000.000.000-00"
        className={`w-full mt-1 p-3 rounded-lg border ${errors.cpf ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`}
        onAccept={(val) => onChange(val)}
      />
    )}
  />
  {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
</div>
<div>
  <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
  <Controller
    name="dataNascimento"
    control={control}
    rules={{
      required: "A data é obrigatória",
      // A MÁGICA ESTÁ AQUI: UMA FUNÇÃO DE VALIDAÇÃO PERSONALIZADA
      validate: (value) => {
        // 1. Verifica se a data tem o formato completo (DD/MM/AAAA)
        if (value.length < 10) {
          return "Data incompleta";
        }

        // 2. Tenta converter o texto em uma data real
        const parts = value.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        const date = new Date(year, month - 1, day); // Mês no JavaScript é 0-11

        // 3. Verifica se a data é logicamente válida
        // Se o usuário digita 32/01/2000, o new Date() vira 01/02/2000.
        // Esta checagem pega essa inconsistência.
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          return "Data inválida";
        }

        // 4. Verifica se a pessoa tem uma idade razoável (entre 1 e 120 anos)
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            // Ainda não fez aniversário este ano
        }
        
        if (age < 1 || age > 120) {
            return "Data de nascimento inválida";
        }

        // 5. Se passou por tudo, a data é válida!
        return true;
      }
    }}
    render={({ field: { onChange, name, value } }) => (
      <IMaskInput
        mask="00/00/0000"
        id={name}
        name={name}
        value={value}
        placeholder="DD/MM/AAAA"
        className={`w-full mt-1 p-3 rounded-lg border ${errors.dataNascimento ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`}
        onAccept={(val) => onChange(val)}
      />
    )}
  />
  {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">{errors.dataNascimento.message}</p>}
</div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                      <input type="email" id="email" placeholder="seu@email.com" {...register("email", { required: "O e-mail é obrigatório", pattern: { value: /^\S+@\S+$/i, message: "Formato de e-mail inválido" } })} className={`w-full mt-1 p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
<div>
  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
  <Controller
    name="telefone"
    control={control}
    rules={{
      required: "O telefone é obrigatório",
      minLength: {
        value: 14, // ✨ ALTERADO PARA 14, como você sugeriu!
        message: "Telefone incompleto"
      }
    }}
    render={({ field: { onChange, name, value } }) => (
      <IMaskInput
        mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]} // Máscara dinâmica
        id={name}
        name={name}
        value={value}
        placeholder="(00) 00000-0000"
        className={`w-full mt-1 p-3 rounded-lg border ${errors.telefone ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`}
        onAccept={(val) => onChange(val)}
      />
    )}
  />
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
  {/* O botão de Cartão sempre aparece */}
  <button
    type="button"
    onClick={() => setMetodoPagamento('cartao')}
    // Se for plano anual, o botão fica "travado" no estilo ativo e desabilitado para clique
    disabled={tipoPlano === 'anual'}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      metodoPagamento === 'cartao' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'
    } ${tipoPlano === 'anual' ? 'cursor-not-allowed' : ''}`}
  >
    Cartão
  </button>

  {/* ✨ A MÁGICA: Pix e Boleto só aparecem se o plano NÃO for anual ✨ */}
  {tipoPlano !== 'anual' && (
    <>
      <button
        type="button"
        onClick={() => setMetodoPagamento('pix')}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
          metodoPagamento === 'pix' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'
        }`}
      >
        Pix
      </button>
      <button
        type="button"
        onClick={() => setMetodoPagamento('boleto')}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
          metodoPagamento === 'boleto' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'
        }`}
      >
        Boleto
      </button>
    </>
  )}

  {/* Se o plano for anual, mostramos um aviso */}
  {tipoPlano === 'anual' && (
    <div className="col-span-2 flex items-center justify-center p-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Planos anuais apenas no cartão de crédito.
      </p>
    </div>
  )}
</div>
                  
                  <div>
                    {metodoPagamento === 'cartao' && (
                      <div className="space-y-6">
                        <div>
  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número do Cartão</label>
  <Controller
    name="cardNumber"
    control={control}
    rules={{
      required: "O número do cartão é obrigatório",
      minLength: {
        value: 19, // 16 dígitos + 3 espaços
        message: "Número do cartão incompleto"
      }
    }}
    render={({ field: { onChange, name, value } }) => (
      <IMaskInput
        {...{ // Passando props individualmente
          mask: "0000 0000 0000 0000",
          id: name,
          name: name,
          value: value,
          placeholder: "0000 0000 0000 0000",
          className: `w-full mt-1 p-3 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`,
          onAccept: (val) => onChange(val) // A chave para o autofill
        }}
      />
    )}
  />
  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Validade</label>
  <Controller
    name="expiryDate"
    control={control}
    rules={{
      required: "A validade é obrigatória",
      minLength: {
        value: 5, // MM/AA
        message: "Data de validade incompleta"
      }
    }}
    render={({ field: { onChange, name, value } }) => (
      <IMaskInput
        {...{
          mask: "MM/YY",
          blocks: {
            MM: { mask: IMask.MaskedRange, from: 1, to: 12 },
            YY: { mask: IMask.MaskedRange, from: new Date().getFullYear() % 100, to: 99 }
          },
          id: name,
          name: name,
          value: value,
          placeholder: "MM/AA",
          className: `w-full mt-1 p-3 rounded-lg border ${errors.expiryDate ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`,
          onAccept: (val) => onChange(val)
        }}
      />
    )}
  />
  {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
</div>
                         <div>
  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
  <Controller
    name="cvv"
    control={control}
    rules={{
      required: "O CVV é obrigatório",
      minLength: {
        value: 3,
        message: "CVV incompleto"
      }
    }}
    render={({ field: { onChange, name, value } }) => (
      <IMaskInput
        {...{
          mask: "000[0]", // Aceita 3 ou 4 dígitos
          id: name,
          name: name,
          value: value,
          placeholder: "123",
          className: `w-full mt-1 p-3 rounded-lg border ${errors.cvv ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`,
          onAccept: (val) => onChange(val)
        }}
      />
    )}
  />
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
                {/* ✨ 4. BOTÃO ATUALIZADO */}
                <button type="submit" disabled={isButtonDisabled} className={`w-full px-8 py-4 text-lg rounded-lg font-semibold transition-colors flex items-center justify-center ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
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
               {tipoPlano === 'anual' ? (
               <p className="text-sm">Sua assinatura anual foi confirmada em 12x. Seja bem-vindo(a)!</p>
               ) : (
               <p className="text-sm">Sua assinatura mensal foi confirmada. Seja bem-vindo(a)!</p>
               )}
              <p className="text-xs mt-2">Enviamos os detalhes para o seu e-mail.</p>
              </div>
              )}
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
