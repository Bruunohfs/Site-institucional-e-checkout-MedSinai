import React, { useEffect, useRef } from 'react'; 
import { useForm, ValidationError } from '@formspree/react';
import { IMaskInput } from 'react-imask';

// Novas imagens sugeridas para a página de parceiros
import parceiroHeroImg from '../assets/parceiro-hero.webp'; // Sugestão: Imagem de uma pessoa trabalhando de forma flexível (notebook em um café, etc.)
import parceiroPortalImg from '../assets/parceiro-portal.webp'; // Sugestão: Um print ou montagem da tela do portal do parceiro

// Ícone de check (reutilizado)
const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

// Ícone de cifrão para a seção de ganhos
const MoneyIcon = () => (
    <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const LaptopIcon = () => (
    <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

function ParceirosPage() {
  // Lista de benefícios para ser um parceiro MedSinai
  const beneficiosParceiro = [
    "Comissões recorrentes e atrativas em todos os planos vendidos.",
    "Acesso a um portal exclusivo para gerenciar suas vendas e comissões.",
    "Painel de controle (dashboard) com gráficos e análises de performance.",
    "Material de apoio completo: banners, vídeos e textos prontos para usar.",
    "Flexibilidade para trabalhar de onde quiser e quando quiser.",
    "Treinamento e suporte contínuo da nossa equipe.",
    "Faça parte de um mercado em plena expansão: o de saúde e bem-estar."
  ];

  // Configuração do formulário com Formspree (use um NOVO código de formulário)
  // É recomendado criar um novo formulário no Formspree para os parceiros
  const [state, handleSubmit] = useForm("mnnberrp");
  const formRef = useRef();

  useEffect(() => {
    if (state.succeeded) {
      alert("Cadastro enviado com sucesso! Nossa equipe analisará seu perfil e entrará em contato em breve. Bem-vindo ao time MedSinai!");
      formRef.current.reset();
    }
  }, [state.succeeded]);
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <title>Seja um Parceiro | MedSinai</title>

      {/* SEÇÃO 1: HERO */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-4xl font-bold mb-6 leading-tight">
                Seja Parceiro da Saúde do Futuro
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Leve saúde e bem-estar para mais pessoas e seja recompensado por isso. Ofereça planos de telemedicina com uma marca de confiança e construa uma fonte de renda recorrente.
              </p>
              <a href="#formulario-parceiro" className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Quero ser um Parceiro
              </a>
            </div>
            <div>
              <img src={parceiroHeroImg} alt="Pessoa trabalhando com flexibilidade" className="rounded-2xl shadow-lg w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: COMO FUNCIONA E BENEFÍCIOS */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Uma Parceria de Sucesso</h2>
            <p className="text-xm text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
              Oferecemos tudo que você precisa para começar a vender e lucrar.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700">
              <h3 className="text-3xl font-bold mb-6">Seus Benefícios Exclusivos</h3>
              <ul className="space-y-4">
                {beneficiosParceiro.map((beneficio, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon />
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
                <div className="flex items-start gap-6">
                    <MoneyIcon />
                    <div>
                        <h4 className="text-2xl font-bold">Comissões Recorrentes</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Receba comissões não apenas na primeira venda, mas todos os meses enquanto o cliente estiver ativo. Construa uma renda passiva e previsível.</p>
                    </div>
                </div>
                <div className="flex items-start gap-6">
                   <LaptopIcon />
                    <div>
                        <h4 className="text-2xl font-bold">Portal do Parceiro</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Uma plataforma completa para você gerar seus links de venda, acompanhar seus resultados em tempo real e solicitar saques de forma simples e rápida.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: PORTAL DO PARCEIRO */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 leading-tight">
                Sua Ferramenta Completa para o Sucesso
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Nosso Portal do Parceiro foi desenhado para ser intuitivo e poderoso. Gere links de venda personalizados, acesse materiais de marketing e veja seus ganhos crescerem em um só lugar.
              </p>
            </div>
            <div>
              <img src={parceiroPortalImg} alt="Dashboard do Portal do Parceiro MedSinai" loading="lazy" className="rounded-2xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: FORMULÁRIO DE CADASTRO */}
      <section id="formulario-parceiro" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      {/* Coluna da Esquerda: Texto Motivacional */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold mb-4 leading-tight">
          Levar saúde a quem precisa nunca foi tão simples.
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Junte-se a centenas de parceiros que estão transformando o acesso à saúde no Brasil e sendo recompensados por isso. O próximo passo é seu.
        </p>
      </div>

      {/* Coluna da Direita: Formulário */}
      <div className="bg-gray-300 dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700">
        <h3 className="text-3xl font-bold mb-6 text-center">Cadastre-se para ser um Parceiro</h3>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-2">Seu Nome Completo*</label>
            <input id="nome" type="text" name="nome" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            <ValidationError prefix="Nome" field="nome" errors={state.errors} className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">E-mail*</label>
            <input id="email" type="email" name="email" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium mb-2">Seu WhatsApp (com DDD)*</label>
            <IMaskInput
              mask={[
                { mask: '(00) 0000-0000' },
                { mask: '(00) 00000-0000' }
              ]}
              id="telefone"
              name="telefone"
              required
              className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              placeholder="(00) 00000-0000"
            />
            <ValidationError prefix="Telefone" field="telefone" errors={state.errors} className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label htmlFor="experiencia" className="block text-sm font-medium mb-2">Como você pretende vender os planos MedSinai?*</label>
            <textarea id="experiencia" name="experiencia" rows="4" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Ex: Redes sociais, indicação para amigos, porta a porta..."></textarea>
            <ValidationError prefix="Experiencia" field="experiencia" errors={state.errors} className="text-red-500 text-sm mt-1" />
          </div>
          <button type="submit" disabled={state.submitting} className="w-full px-8 py-2 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
            {state.submitting ? "Enviando Cadastro..." : "Quero Ser Parceiro"}
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

    </div>
  );
}

export default ParceirosPage;
