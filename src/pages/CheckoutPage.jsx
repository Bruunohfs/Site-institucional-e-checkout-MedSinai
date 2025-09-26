import React, { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { useParams, useNavigate } from 'react-router-dom';
import { planosAnuais, planosMensais } from '@/data/planos';
import { useForm, Controller } from 'react-hook-form';
import IMask from 'imask';

// --- IMPORTAÇÕES PARA O RASTREAMENTO E MODAL ---
import ReactPixel from 'react-facebook-pixel';
import PurchaseSuccessModal from '@/components/modals/PurchaseSuccessModal';

// Ícone de cadeado
const LockIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
  </svg>
);

function CheckoutPage() {
  const navigate = useNavigate();
  const { tipoPlano, idDoPlano } = useParams();
  const arrayDeBusca = tipoPlano === 'anual' ? planosAnuais : planosMensais;
  const planoSelecionado = arrayDeBusca.find(p => p.nome.toLowerCase().replace(/ /g, '-') === idDoPlano);

  // --- ESTADOS PARA O MODAL DE SUCESSO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ paymentMethod: '', data: {} });

  // Lógica para encontrar os planos de Upsell e Cross-sell
  let planoAnualEquivalente = null;
  let planoPlusEquivalente = null;
  let valorEconomiaAnual = 0;
  let diferencaPrecoPlus = 0;
  let valorUpgradePixFarma = 0;

  if (planoSelecionado) {
    if (tipoPlano === 'mensal') {
      planoAnualEquivalente = planosAnuais.find(p => p.nome === planoSelecionado.nome);
      if (planoAnualEquivalente) {
        const precoAnual = parseFloat(planoAnualEquivalente.preco.replace(',', '.'));
        const precoMensal = parseFloat(planoSelecionado.preco.replace(',', '.'));
        valorEconomiaAnual = (precoMensal * 12) - (precoAnual * 12);
      }
    }
    if (!planoSelecionado.nome.includes('Plus')) {
      const arrayDeBuscaPlus = tipoPlano === 'anual' ? planosAnuais : planosMensais;
      planoPlusEquivalente = arrayDeBuscaPlus.find(p => p.nome === `${planoSelecionado.nome} Plus`);
      if (planoPlusEquivalente) {
        const precoPlus = parseFloat(planoPlusEquivalente.preco.replace(',', '.'));
        const precoAtual = parseFloat(planoSelecionado.preco.replace(',', '.'));
        diferencaPrecoPlus = precoPlus - precoAtual;
        valorUpgradePixFarma = planoPlusEquivalente.valorPixFarma || 30;
      }
    }
  }

  const handleUpgradeToAnual = () => {
    if (planoAnualEquivalente) {
      const novoIdDoPlano = planoAnualEquivalente.nome.toLowerCase().replace(/ /g, '-');
      navigate(`/pagamento/anual/${novoIdDoPlano}`, { replace: true });
    }
  };

  const handleUpgradeToPlus = () => {
    if (planoPlusEquivalente) {
      const novoIdDoPlano = planoPlusEquivalente.nome.toLowerCase().replace(/ /g, '-');
      navigate(`/pagamento/${tipoPlano}/${novoIdDoPlano}`, { replace: true });
    }
  };

  let valorEconomia = 0;
  if (tipoPlano === 'anual' && planoSelecionado) {
    const planoMensalCorrespondente = planosMensais.find(p => p.nome === planoSelecionado.nome);
    if (planoMensalCorrespondente) {
      const precoAnualNumerico = parseFloat(planoSelecionado.preco.replace(',', '.'));
      const precoMensalNumerico = parseFloat(planoMensalCorrespondente.preco.replace(',', '.'));
      valorEconomia = (precoMensalNumerico * 12) - (precoAnualNumerico * 12);
    }
  }

  const { register, handleSubmit, control, formState: { errors, isValid }, unregister, watch, setValue } = useForm({
    mode: 'all',
    shouldUnregister: true,
  });

  const [metodoPagamento, setMetodoPagamento] = useState('cartao');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const cepValue = tipoPlano === 'anual' ? watch("postalCode") : null;

  useEffect(() => {
    if (tipoPlano === 'anual' && cepValue?.length === 9) {
      fetch(`https://viacep.com.br/ws/${cepValue.replace('-', '' )}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setValue("address", data.logradouro, { shouldValidate: true });
            setValue("neighborhood", data.bairro, { shouldValidate: true });
            setValue("city", data.localidade, { shouldValidate: true });
            setValue("state", data.uf, { shouldValidate: true });
          }
        })
        .catch(err => console.error("Falha ao buscar CEP:", err));
    }
  }, [cepValue, setValue, tipoPlano]);

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
    const isPaymentDataValid = (metodoPagamento === 'pix' || metodoPagamento === 'boleto') || isValid;
    setIsButtonDisabled(!isPersonalDataValid || !isPaymentDataValid || isProcessing);
  }, [isValid, metodoPagamento, isProcessing]);

  // --- NOVA FUNÇÃO CENTRALIZADA PARA SUCESSO E RASTREAMENTO ---
const handlePurchaseSuccess = (method, purchaseDetails, formData) => {
    
    const eventData = {
      value: parseFloat(planoSelecionado.preco.replace(',', '.')),
      currency: 'BRL',
      content_name: planoSelecionado.nome,
      content_ids: [idDoPlano],
      content_type: 'product',
      num_items: 1,
    };

    const userData = {
      em: formData?.email || '',
      ph: formData?.telefone || '',
      fn: formData?.nomeCompleto?.split(' ')[0] || '',
      ln: formData?.nomeCompleto?.split(' ').slice(1).join(' ') || '',
    };

    // Dispara o evento de compra no Pixel (Client-Side)
    ReactPixel.track('Purchase', eventData);

    // ===================================================================
    // ==> A LINHA QUE FALTAVA ESTÁ AQUI <==
    // ===================================================================
    const testEventCode = 'TEST10770'; // Use o código da sua tela de teste do Facebook

    // Envia o evento de compra para a API de Conversões (Server-Side)
    fetch('/api/send-facebook-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Purchase',
        eventData: eventData,
        userData: userData,
        test_event_code: testEventCode, // Adicionando o código de teste
      }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Evento de Purchase enviado para a API de Conversões com sucesso.');
        } else {
            console.error('API de Conversões respondeu com erro:', response.status);
        }
    })
    .catch(error => {
        console.error('Falha grave ao enviar evento de Purchase para API:', error);
    });

    // Configura o conteúdo e abre o modal
    setModalContent({
      paymentMethod: method,
      data: purchaseDetails,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsProcessing(true);
    setPaymentError(null);
    const partnerIdFromStorage = localStorage.getItem('medsinai_affiliate_id');

    const dadosCompletos = {
      plano: { nome: planoSelecionado.nome, preco: planoSelecionado.preco, tipo: tipoPlano },
      cliente: data,
      referenciaParceiro: partnerIdFromStorage || null
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
        handlePurchaseSuccess('boleto', { boletoUrl: result.boletoUrl }, data);
      } else if (metodoPagamento === 'pix') {
        const purchaseDetails = {
          qrCodeUrl: `data:image/png;base64,${result.encodedImage}`,
          pixCopiaECola: result.payload
        };
        handlePurchaseSuccess('pix', purchaseDetails, data);
      } else if (metodoPagamento === 'cartao') {
        handlePurchaseSuccess('cartao', {}, data);
      }

    } catch (error) {
      console.error(`Erro ao processar pagamento:`, error);
      setPaymentError(error.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModalAndRedirect = () => {
    setIsModalOpen(false);
    // Opcional: Redirecionar para o dashboard após fechar o modal
    // navigate('/dashboard'); 
  };

  if (!planoSelecionado) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold">Plano não encontrado!</h1>
        <p>Ocorreu um erro ao carregar os detalhes do plano.</p>
      </div>
    );
  }

  return (
    <div className="notranslate">
      <title>Finalizar Pagamento | MedSinai</title>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12 px-4">
        <div className="container mx-auto">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Finalize sua Assinatura</h2>
            <p className="text-gray-600 dark:text-gray-400">Você está a um passo de ter acesso a todos os benefícios.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16 lg:items-start">

            {/* COLUNA DA ESQUERDA (Resumo do Pedido) */}
            <div className="relative mb-8 lg:mb-0 space-y-6">
              {/* Bloco 1: Resumo do Pedido */}
              <div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-500 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resumo do Pedido</h3>
                  {tipoPlano === 'mensal' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600 dark:text-gray-400">Plano Selecionado:</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{planoSelecionado.nome} (Mensal)</p>
                      </div>
                    </div>
                  )}
                  {tipoPlano === 'anual' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600 dark:text-gray-400">Plano Selecionado:</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{planoSelecionado.nome} (Anual)</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600 dark:text-gray-400">Valor da Parcela:</p>
                        <p className="font-semibold text-gray-900 dark:text-white">12x de R$ {planoSelecionado.preco}</p>
                      </div>
                    </div>
                  )}
                  <div className="my-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Benefícios inclusos:</p>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      {planoSelecionado.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                          <span>{beneficio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {tipoPlano === 'anual' && valorEconomia > 0 && (
                    <p className="text-sm text-center font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 p-2 rounded-lg my-4">
                      Você economiza R$ {valorEconomia.toFixed(2).replace('.', ',')} em 1 ano!
                    </p>
                  )}
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <div className="flex justify-between items-center text-lg mt-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Total:</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {tipoPlano === 'anual' 
                        ? `R$ ${(parseFloat(planoSelecionado.preco.replace(',', '.')) * 12).toFixed(2).replace('.', ',')}`
                        : `R$ ${planoSelecionado.preco}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Ofertas de Upsell/Cross-sell */}
              {(planoAnualEquivalente || planoPlusEquivalente) && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center lg:text-left">Clique e Turbine sua Assinatura!</h3>
                  <div className="space-y-4">
                    {planoAnualEquivalente && (
                      <button type="button" onClick={handleUpgradeToAnual} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-500 dark:border-gray-800 flex items-center gap-4 text-left hover:border-green-500 hover:ring-2 hover:ring-green-500 transition-all duration-300">
                        <div className="flex-shrink-0 bg-transparent dark:bg-transparent p-3 rounded-lg"><span className="text-2xl">🗓️</span></div>
                        <div className="flex-grow">
                          <p className="font-semibold text-blue-800 dark:text-blue-300">Economize com o Plano Anual!</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Pague <strong>R$ {planoAnualEquivalente.preco}</strong>/mês e economize <strong>R$ {valorEconomiaAnual.toFixed(2).replace('.',',')}</strong>.</p>
                        </div>
                        <div className="ml-auto text-green-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5M5 7l5 5-5 5"></path></svg></div>
                      </button>
                    )}
                    {planoPlusEquivalente && (
                      <button type="button" onClick={handleUpgradeToPlus} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-500 dark:border-gray-800 flex items-center gap-4 text-left hover:border-green-500 hover:ring-2 hover:ring-green-500 transition-all duration-300">
                        <div className="flex-shrink-0 bg-transparent dark:bg-transparent p-3 rounded-lg"><span className="text-2xl">💊</span></div>
                        <div className="flex-grow">
                          <p className="font-semibold text-blue-800 dark:text-blue-300">Adicione Pix Farma!</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Por + <strong>R$ {diferencaPrecoPlus.toFixed(2).replace('.',',')}</strong>/mês, tenha <strong>R${valorUpgradePixFarma}</strong> de crédito em farmácias todos os meses!</p>
                        </div>
                        <div className="ml-auto text-green-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* COLUNA DA DIREITA: FORMULÁRIO */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-500 dark:border-gray-800">
              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="space-y-8">
                  {/* SEÇÃO 1: DADOS DO CLIENTE */}
                  <div>
                    <div className="flex items-center mb-4"><span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white font-bold rounded-full mr-3">1</span><h3 className="text-xl font-bold text-gray-900 dark:text-white">Seus Dados</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                        <input type="text" id="nomeCompleto" placeholder="Seu nome completo" {...register("nomeCompleto", { required: "O nome é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.nomeCompleto ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} />
                        {errors.nomeCompleto && <p className="text-red-500 text-xs mt-1">{errors.nomeCompleto.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                        <input type="email" id="email" placeholder="seu@email.com" {...register("email", { required: "O e-mail é obrigatório", pattern: { value: /^\S+@\S+$/i, message: "Formato de e-mail inválido" } })} className={`w-full mt-1 p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                        <Controller name="telefone" control={control} rules={{ required: "O telefone é obrigatório", minLength: { value: 14, message: "Telefone incompleto" } }} render={({ field: { onChange, name, value } }) => (<IMaskInput mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]} id={name} name={name} value={value} placeholder="(00) 00000-0000" className={`w-full mt-1 p-3 rounded-lg border ${errors.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} onAccept={(val) => onChange(val)} />)} />
                        {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                        <Controller name="cpf" control={control} rules={{ required: "O CPF é obrigatório", minLength: { value: 14, message: "CPF incompleto" } }} render={({ field: { onChange, name, value } }) => (<IMaskInput mask="000.000.000-00" id={name} name={name} value={value} placeholder="000.000.000-00" className={`w-full mt-1 p-3 rounded-lg border ${errors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} onAccept={(val) => onChange(val)} />)} />
                        {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: SEU ENDEREÇO (APENAS PARA PLANOS ANUAIS) */}
                  {tipoPlano === 'anual' && (
                    <div>
                      <div className="flex items-center mb-4"><span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white font-bold rounded-full mr-3">2</span><h3 className="text-xl font-bold text-gray-900 dark:text-white">Seu Endereço</h3></div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                        <div className="md:col-span-2"><label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label><Controller name="postalCode" control={control} rules={{ required: "O CEP é obrigatório", minLength: { value: 9, message: "CEP incompleto" } }} render={({ field }) => (<IMaskInput {...field} mask="00000-000" placeholder="00000-000" className={`w-full mt-1 p-3 rounded-lg border ${errors.postalCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} />)} />{errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}</div>
                        <div className="md:col-span-2"><label htmlFor="addressNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label><input type="text" id="addressNumber" placeholder="123" {...register("addressNumber", { required: "O número é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.addressNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} />{errors.addressNumber && <p className="text-red-500 text-xs mt-1">{errors.addressNumber.message}</p>}</div>
                        <div className="md:col-span-4"><label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rua</label><input type="text" id="address" {...register("address", { required: "A rua é obrigatória" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} readOnly />{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}</div>
                        <div className="md:col-span-2"><label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label><input type="text" id="neighborhood" {...register("neighborhood", { required: "O bairro é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.neighborhood ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} readOnly />{errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood.message}</p>}</div>
                        <div className="md:col-span-1"><label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label><input type="text" id="city" {...register("city", { required: "A cidade é obrigatória" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} readOnly />{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}</div>
                        <div className="md:col-span-1"><label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label><input type="text" id="state" {...register("state", { required: "O estado é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} readOnly />{errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}</div>
                      </div>
                    </div>
                  )}

                  
              {/* SEÇÃO 3: FORMA DE PAGAMENTO */}
                  <div>
                    <div className="flex items-center mb-4"><span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white font-bold rounded-full mr-3">{tipoPlano === 'anual' ? '3' : '2'}</span><h3 className="text-xl font-bold text-gray-900 dark:text-white">Forma de Pagamento</h3></div>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-300 dark:bg-gray-700 p-1 mb-6">
                      <button type="button" onClick={() => setMetodoPagamento('cartao')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metodoPagamento === 'cartao' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}>Cartão</button>
                      <button type="button" onClick={() => setMetodoPagamento('pix')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metodoPagamento === 'pix' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}>Pix</button>
                      <button type="button" onClick={() => setMetodoPagamento('boleto')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metodoPagamento === 'boleto' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}>Boleto</button>
                    </div>
                    {metodoPagamento === 'cartao' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div className="md:col-span-2">
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número do Cartão</label>
                            <Controller name="cardNumber" control={control} rules={{ required: "O número do cartão é obrigatório", minLength: { value: 19, message: "Número do cartão incompleto" } }} render={({ field: { onChange, name, value } }) => (<IMaskInput mask="0000 0000 0000 0000" id={name} name={name} value={value} placeholder="0000 0000 0000 0000" className={`w-full mt-1 p-3 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} onAccept={(val) => onChange(val)} />)} />
                            {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                          </div>
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Validade</label>
                            <Controller name="expiryDate" control={control} rules={{ required: "A validade é obrigatória", minLength: { value: 5, message: "Validade incompleta" } }} render={({ field: { onChange, name, value } }) => (<IMaskInput mask="MM/YY" blocks={{ MM: { mask: IMask.MaskedRange, from: 1, to: 12 }, YY: { mask: IMask.MaskedRange, from: new Date().getFullYear() % 100, to: 99 } }} id={name} name={name} value={value} placeholder="MM/AA" className={`w-full mt-1 p-3 rounded-lg border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} onAccept={(val) => onChange(val)} />)} />
                            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
                          </div>
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                            <Controller name="cvv" control={control} rules={{ required: "O CVV é obrigatório", minLength: { value: 3, message: "CVV incompleto" } }} render={({ field: { onChange, name, value } }) => (<IMaskInput mask="000[0]" id={name} name={name} value={value} placeholder="123" className={`w-full mt-1 p-3 rounded-lg border ${errors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} onAccept={(val) => onChange(val)} />)} />
                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome no Cartão</label>
                          <input type="text" id="cardName" placeholder="Nome completo como no cartão" {...register("cardName", { required: "O nome no cartão é obrigatório" })} className={`w-full mt-1 p-3 rounded-lg border ${errors.cardName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} text-gray-900 dark:text-black`} />
                          {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName.message}</p>}
                        </div>
                      </div>
                    )}
                    {metodoPagamento === 'pix' && (
                      <div className="text-center p-4 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                        <p className="font-semibold mb-2">Pague com Pix para liberação imediata!</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Clique no botão de pagamento abaixo para gerar seu QR Code.</p>
                      </div>
                    )}
                    {metodoPagamento === 'boleto' && (
                      <div className="text-center p-4 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                        <p className="font-semibold mb-4">O boleto será enviado para o seu e-mail e pode levar até 3 dias úteis para ser compensado.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Clique no botão de pagamento abaixo para gerar e receber seu boleto.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button type="submit" disabled={isButtonDisabled} className={`w-full px-8 py-4 text-lg rounded-lg font-semibold transition-colors flex items-center justify-center ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed text-gray-600' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                    <LockIcon />
                    {isProcessing ? ' Processando...' : (
                      <>
                        {metodoPagamento === 'cartao' && ' Pagar com Segurança'}
                        {metodoPagamento === 'pix' && ' Gerar QR Code Pix'}
                        {metodoPagamento === 'boleto' && ' Gerar Boleto'}
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Pagamentos processados com segurança. Seus dados são criptografados.
                  </p>
                </div>
              </form>

              {/* Exibição de erro, caso ocorra */}
              {paymentError && (
                <div className="mt-6 p-4 rounded-lg text-center bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <h4 className="font-bold">Ocorreu um Erro</h4>
                  <p>{paymentError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Renderização do Modal de Sucesso */}
      <PurchaseSuccessModal
        isOpen={isModalOpen}
        onClose={closeModalAndRedirect}
        paymentMethod={modalContent.paymentMethod}
        data={modalContent.data}
      />
    </div>
  );
}

export default CheckoutPage;

