import React, { useEffect, useRef } from 'react'; 
import { useForm, ValidationError } from '@formspree/react';
import empresa1 from '../assets/empresa1.jpg';
import empresa2 from '../assets/empresa2.jpg';
import empresa3 from '../assets/empresa3.webp';
import bemEstarCorporativoImg from '../assets/nr01img.webp'; 


// Ícone de check para usar nas listas de vantagens
const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
 );

function EmpresasPage() {
  // Dados para a seção de Vantagens
  const vantagensColaborador = [
    "Carência Zero.",
    "Consultas com tempo máximo de espera de 10 minutos com Clínico Geral ",
    "Acesso aos especialistas 24h em qualquer hora e lugar.",
    "Aplicativo amigável e acessível para usuários IOS e Android.",
    "Prescrições válidas em todo o território nacional.",
    "Economia com o plano de saúde corporativo e acesso ilimitado ao APP.",
    "Desconto em exames médicos, farmácias, clínicas presenciais."
  ];

  const vantagensEmpresas = [
    "Profissionais disponíveis para atendimento 24 horas por dia, 7 dias da semana.",
    "Baixo custo de aquisição e alto ROI para o colaborador.",
    "Menor taxa de absenteísmo, menos atestados e faltas ao trabalho.",
    "Atendimento direcionado diretamente para o profissional, sem triagem prévia.",
    "Consultas sem custos adicionais para filhos e dependentes menores de 18 anos.",
    "Colaboradores mais motivados, dispostos e com melhor produtividade.",
    "Zero burocracia para implementação."
  ];

  // Função para abrir o WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "16992291295";
    const message = "Olá! Gostaria de saber mais sobre os planos empresariais da MedSinai.";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank' );
  };

  // Configuração do formulário com Formspree
  const [state, handleSubmit] = useForm("xandevky"); // CODIGO DO FORMS
  const formRef = useRef();

  useEffect(() => {
    if (state.succeeded) {
      // Mostra um alerta de sucesso
      alert("Obrigado! Sua mensagem foi enviada com sucesso. Em breve nossa equipe entrará em contato");
      // Limpa o formulário
      formRef.current.reset();
    }
  }, [state.succeeded]);
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <title>Para Empresas | MedSinai Telemedicina</title>

      {/* SEÇÃO 1: HERO */}
      <section className="py-20 px-6 bg-gray-300 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-4,5xl font-bold mb-6 leading-tight">
                Conecte seus colaboradores a um ecossistema de saúde e bem-estar
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Proporcione acesso a médicos, psicólogos, nutricionistas e mais. Impulsione resultados com uma equipe saudável e motivada.
              </p>
              <button onClick={openWhatsApp} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Fale com um especialista
              </button>
            </div>
            <div className="relative">
              <img src={empresa1} alt="Equipe colaborando" className="rounded-2xl shadow-lg w-full" />
              <div className="hidden lg:block absolute -top-8 left-1/4 transform -translate-x-1/2 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-xl w-64">
                <p className="font-bold text-green-600 dark:text-green-400">+13.000 consultas por mês</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clínica geral, psicologia e mais</p>
              </div>
              <div className="hidden lg:block absolute -bottom-8 right-1/4 transform translate-x-1/2 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-xl w-64">
                <p className="font-bold text-green-600 dark:text-green-400">+14% de satisfação</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">dos colaboradores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: CUIDAR DA SAÚDE */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={empresa2} alt="Colaboradora usando o app MedSinai" loading="lazy" className="rounded-2xl shadow-lg" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8">Cuidar da saúde do colaborador é cuidar da saúde da empresa</h2>
              <ul className="space-y-6">
                <li className="flex items-start"><CheckIcon /><p><strong>40% redução de custos com saúde:</strong> Programas de telessaúde podem reduzir em até 40% os custos de saúde corporativos.</p></li>
                <li className="flex items-start"><CheckIcon /><p><strong>Queda de 36% nos gastos com saúde mental:</strong> Programas focados na saúde mental resultaram em uma diminuição de 36% nos custos.</p></li>
                <li className="flex items-start"><CheckIcon /><p><strong>+14% de satisfação dos colaboradores:</strong> A satisfação geral dos colaboradores aumentou 14% com a implementação de programas voltados aos cuidados com a saúde.</p></li>
                <li className="flex items-start"><CheckIcon /><p><strong>ROI de 4x para cada US$1 investido:</strong> Para cada US$1 investido em bem-estar, há um retorno de US$4 em ganhos com o aumento da produtividade (OMS ).</p></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: VANTAGENS */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Vantagens</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-500 dark:border-gray-700">
              <h3 className="text-3xl font-bold mb-6">Para o Colaborador</h3>
              <ul className="space-y-8">
                {vantagensColaborador.map((vantagem, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon />
                    <span>{vantagem}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-500 dark:border-gray-700">
              <h3 className="text-3xl font-bold mb-6">Para a Empresa</h3>
              <ul className="space-y-8">
                {vantagensEmpresas.map((vantagem, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon />
                    <span>{vantagem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


<section className="py-20 px-6 bg-white dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      {/* Coluna da Esquerda: Conteúdo Informativo (AGORA NA ESQUERDA) */}
      <div className="lg:order-first"> {/* Garante que este bloco venha primeiro */}
        <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase mb-2">BEM-ESTAR QUE GERA RESULTADOS</p>
        <h2 className="text-4xl font-bold mb-6 leading-tight">
          Saia na frente com uma cultura de cuidado integral
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          As novas diretrizes de saúde ocupacional (NR-01) mostram uma tendência clara: o futuro do trabalho é cuidar também da saúde mental. Empresas que investem no bem-estar psicossocial de suas equipes não apenas se adequam às novas normas, mas também constroem um ambiente mais produtivo e inovador.
        </p>
        
        <ul className="space-y-4 mb-8">
          <li className="flex items-start">
            <CheckIcon />
            <div>
              <strong className="text-gray-900 dark:text-white">Equipes mais fortes:</strong> Oferecer suporte à saúde mental, como acesso a psicólogos, fortalece a resiliência e o engajamento dos seus colaboradores.
            </div>
          </li>
          <li className="flex items-start">
            <CheckIcon />
            <div>
              <strong className="text-gray-900 dark:text-white">Solução descomplicada:</strong> Com a MedSinai, sua empresa se alinha a essa nova realidade de forma simples, oferecendo um benefício moderno e valorizado por todos.
            </div>
          </li>
        </ul>

        <button onClick={openWhatsApp} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
          Conheça a solução para sua equipe
        </button>
      </div>

      {/* Coluna da Direita: Imagem e Destaque (AGORA NA DIREITA) */}
      <div className="relative flex justify-center lg:order-last"> {/* Garante que este bloco venha por último */}
        <img 
          src={bemEstarCorporativoImg} // Troquei para a imagem 3, que parece mais adequada
          alt="Profissional sorrindo, representando bem-estar no trabalho" loading="lazy" 
          className="rounded-2xl shadow-lg w-full max-w-md object-cover aspect-[4/5]"
        />
        <div className="absolute -bottom-8 bg-green-600 dark:bg-green-500 text-white p-6 rounded-xl shadow-2xl max-w-sm mx-auto">
          <h4 className="text-xl font-bold mb-2">O Futuro é Cuidar</h4>
          <p className="text-sm text-green-100">
            A NR-01 reforça a importância do bem-estar psicossocial. Esteja à frente, transformando o cuidado em vantagem competitiva.
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* SEÇÃO 4: EQUIPE PRÓPRIA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={empresa3} alt="Equipe de profissionais de saúde MedSinai" loading="lazy" className="rounded-2xl shadow-lg" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Cuide da sua empresa com uma plataforma que possui equipe própria de especialistas
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Deixe a MedSinai transformar a sua realidade corporativa com as soluções de saúde e bem-estar pensadas para você e para seu time.
              </p>
              <button onClick={openWhatsApp} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Quero cuidar da saúde da empresa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: FORMULÁRIO */}
      <section className="py-50 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-4">
                Promova acesso à saúde de qualidade com 98,5% de satisfação
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                No aplicativo de saúde e bem-estar MedSinai o atendimento é facilitado via chat, vídeo ou ligação para ampliar o acesso à saúde no Brasil.
              </p>
            </div>
            <div className="bg-gray-300 dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h3 className="text-3xl font-bold mb-6 text-center">Fale com a gente</h3>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium mb-1">Nome*</label>
                  <input id="nome" type="text" name="nome" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                  <ValidationError prefix="Nome" field="nome" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail Corporativo*</label>
                  <input id="email" type="email" name="email" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium mb-1">Número de telefone*</label>
                  <input id="telefone" type="tel" name="telefone" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                  <ValidationError prefix="Telefone" field="telefone" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium mb-1">Nome da empresa*</label>
                  <input id="empresa" type="text" name="empresa" required className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                  <ValidationError prefix="Empresa" field="empresa" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>
                <button type="submit" disabled={state.submitting} className="w-full px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {state.submitting ? "Enviando..." : "Enviar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default EmpresasPage;
