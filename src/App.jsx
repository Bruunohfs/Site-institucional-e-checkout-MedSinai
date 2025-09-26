import { useState, useRef, useEffect } from 'react';
import bannerImage from './assets/bannermedsinai.webp';
import './App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation, Autoplay } from 'swiper/modules' ;
import 'swiper/css/navigation' ;
import { useNavigate } from 'react-router-dom';
import { planosMensais, planosAnuais } from "@/data/planos";
import useTracker from '@/hooks/useTracker';
import parceirosCinemaImg from '@/assets/logos/logoscinema.webp';
import parceirosCashbackImg from '@/assets/logos/logosmarcas.webp';
import { useSearchParams } from 'react-router-dom';
import ServicesSection from './components/ServicesSection';
import TestimonialModal from './components/TestimonialModal';
import { supabase } from '@/lib/supabaseClient';
import TestimonialCard from './components/TestimonialCard';
import ReactPixel from 'react-facebook-pixel';
import { getCookie } from '@/utils/cookieHelper';


function App() {
  useTracker();
  const [searchParams] = useSearchParams();
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const partnerIdFromUrl = searchParams.get('pid');
  const navigate = useNavigate();
  const [isAnual, setIsAnual] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const swiperRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [dynamicTestimonials, setDynamicTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

 useEffect(( ) => {
    const fetchApprovedTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar depoimentos:", error);
        setDynamicTestimonials([]); 
      } else {
        // ==================================================
        // A MUDANÇA ESTÁ AQUI
        // ==================================================
        const formattedData = data.map(item => ({
          id: item.id, // Passando o ID para a key funcionar
          name: item.name,
          // A propriedade 'role' no card espera 'occupation' ou 'role'
          occupation: item.occupation || 'Cliente MedSinai', 
          // A propriedade 'avatar' no card espera 'image_url' ou 'avatar'
          image_url: item.image_url, // Apenas passe o valor do banco (pode ser null)
          stars: item.stars,
          // A propriedade de texto no card espera 'body' ou 'text'
          body: item.body, 
        }));
        // ==================================================
        setDynamicTestimonials(formattedData);
      }
      setLoadingTestimonials(false);
    };

    fetchApprovedTestimonials();
  }, []);

  const whatsappNumber = "16992291295";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const planosAtivos = isAnual ? planosAnuais : planosMensais;

  
 const handleAssinarAgora = async (plano) => {
  const tipoPlano = isAnual ? 'anual' : 'mensal';
  const idDoPlano = plano.nome.toLowerCase().replace(/ /g, '-');

  const eventData = {
    content_name: plano.nome,
    content_ids: [idDoPlano],
    content_type: 'product',
    value: parseFloat(plano.preco.replace(',', '.')), // Corrigido para usar replace
    currency: 'BRL',
  };

  // Dispara o evento no Pixel (Client-Side)
  ReactPixel.track('InitiateCheckout', eventData);

  const fbc = getCookie('_fbc');
  const fbp = getCookie('_fbp');

  // Envia o evento para a API de Conversões (Server-Side)
  try {
    await fetch('/api/send-facebook-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'InitiateCheckout',
        eventData: eventData,
        browserData: { fbc, fbp } 
      }),
    });
  } catch (error) {
    console.error('Falha ao enviar evento InitiateCheckout para a API de Conversões:', error);
  }
  
  // Constrói a URL de destino
  let urlDestino = `/pagamento/${tipoPlano}/${idDoPlano}`;
  if (partnerIdFromUrl) {
    urlDestino += `?pid=${partnerIdFromUrl}`;
  }
  
  navigate(urlDestino);
};

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const openWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    setIsMobileMenuOpen(false);
  };

const faqData = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Nossos planos mensais não têm fidelidade. Você pode cancelar quando quiser, sem multas ou burocracia, diretamente pelo seu painel de cliente. Para planos anuais, o cancelamento segue as regras do contrato, garantindo o melhor custo-benefício para você."
  },
  {
    question: "Como funciona a inclusão de dependentes?",
    answer: "Nos planos familiares, você pode incluir seus filhos menores de 18 anos sem nenhum custo adicional. O cadastro é feito de forma simples e rápida após a ativação do seu plano, e eles terão acesso aos mesmos benefícios de telemedicina."
  },
  {
    question: "Meus dados e consultas são seguros?",
    answer: "Absolutamente. Sua segurança e privacidade são nossa prioridade máxima. Todas as consultas são criptografadas de ponta a ponta e seus dados são armazenados em conformidade com a Lei Geral de Proteção de Dados (LGPD). Ninguém além de você e do médico tem acesso ao conteúdo da consulta."
  },
  {
    question: "Preciso agendar as consultas com antecedência?",
    answer: "Para Clínico Geral, o atendimento é imediato, 24 horas por dia, sem necessidade de agendamento. Para consultas com especialistas, você pode agendar um horário de sua preferência diretamente pelo aplicativo, garantindo a flexibilidade que você precisa."
  },
  {
    question: "O que acontece se eu precisar de um exame ou receita?",
    answer: "Durante a teleconsulta, o médico pode emitir receitas digitais e pedidos de exames, ambos com validade nacional e aceitos na maioria das farmácias e laboratórios. Você recebe os documentos diretamente no seu celular, com toda a segurança e validade legal."
  }
];

const comoFuncionaSteps = [
  {
    icon: "🔑",
    title: "1. Ative seu Plano",
    description: "Após a compra, você recebe um código de ativação exclusivo por e-mail."
  },
  {
    icon: "📱",
    title: "2. Baixe o App",
    description: "Baixe o aplicativo Medsinai na App Store ou Play Store e insira seu código."
  },
  {
    icon: "💬",
    title: "3. Fale com um Médico",
    description: "Pronto! Inicie uma consulta por chat ou vídeo com um especialista, 24h por dia."
  }
];

  return (
    <div className="w-full">
    <title>MedSinai | Telemedicina para Você e sua Família</title>

<section className="relative bg-gray-100 dark:bg-gray-800 pt-12 pb-24 lg:pb-32">
  <div className="container mx-auto px-0 lg:px-6">
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-10 lg:gap-x-12 items-center">
      
      {/* Coluna do Texto (sem alterações) */}
      <div className="lg:col-span-2 text-left px-6 lg:px-0"> 
        {/* ... conteúdo do texto ... */}
        <p className="text-base font-semibold text-blue-500 dark:text-blue-400">
          A telemedicina salva vidas
        </p>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white my-4 leading-tight">
          Tenha médicos 
          <br className="hidden lg:block" /> disponíveis 24h por dia, 
          <br className="hidden lg:block" /> aonde estiver!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Cuidado completo para sua família e seus pets,
          <br className="hidden lg:block" /> com especialistas a um clique, sem filas ou longas esperas.
        </p>
        <div className="flex justify-start">
          <button 
            onClick={() => scrollToSection('plans')}
            className="px-24 py-3 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-lg font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            Ver Planos
          </button>
        </div>
      </div>

      {/* Coluna da Imagem */}
      <div className="lg:col-span-3 w-full aspect-video overflow-hidden rounded-none lg:rounded-2xl lg:shadow-lg">
        {/* 
          A MÁGICA ESTÁ AQUI:
          - Usamos 'object-[25%_50%]' para definir o foco.
          - 25% na horizontal: Puxa o ponto de foco para a esquerda do centro.
          - 50% na vertical: Mantém o alinhamento vertical no centro.
          - Você pode experimentar outros valores como 20%, 30%, 40% até achar o enquadramento perfeito!
        */}
        <img
          src={bannerImage}
          alt="MedSinai - Saúde para toda a família"
          className="w-full h-full object-cover object-[35%_50%]" 
        />
      </div>

    </div>
  </div>
</section>

<section className="py-16 bg-white dark:bg-gray-900 sm:py-20">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    {/* Título da Seção */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
        Simples, rápido e na palma da sua mão
      </h2>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
        Tenha acesso a médicos de qualidade em apenas 3 passos.
      </p>
    </div>

    {/* Grid que renderiza os passos dinamicamente */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {comoFuncionaSteps.map((step, index) => (
        <div key={index} className="text-center p-6 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-md hover:shadow-xl">
          <div className="text-4xl mb-4">{step.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<ServicesSection />

{/* =================================================================== */}
{/* ================= NOOVA SEÇÃO: FAÇA O UPGRADE (AJUSTADA) =========== */}
{/* =================================================================== */}
<section className="py-16 px-6 bg-white dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
      
      {/* Coluna da Esquerda: Título */}
      <div className="lg:col-span-1 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Conheça os benefícios exclusivos dos nossos Planos Plus:
        </h2>
        <div className="inline-block w-36 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mt-4"></div>
      </div>

      {/* Coluna da Direita: Cards de Benefícios */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Card 1: Farma (Estilo ajustado) */}
        <div className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-600">
          {/* Ícone de Emoji */}
          <div className="mr-6 text-5xl">
            💊
          </div>
          {/* Texto */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Pix Farma</h3>
            <p className="text-base text-gray-800 dark:text-gray-300">
              Saldo mensal de <strong>R$30</strong> disponivel para ser usado na compra de medicamentos em qualquer farmácia do Brasil.
            </p>
          </div>
        </div>

        {/* Card 2: Lab/Exames (Estilo ajustado) */}
        <div className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-600">
          {/* Ícone de Emoji */}
          <div className="mr-6 text-5xl">
            🧪
          </div>
          {/* Texto */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Clinicas e Laboratorios</h3>
            <p className="text-base text-gray-800 dark:text-gray-300">
              Exames e Consultas presenciais com descontos exclusivos em nossa rede credenciada.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

 {/* =================================================================== */}
      {/* ============ NOVA SEÇÃO: CLUBE DE VANTAGENS (COM LOGOS LOCAIS) ====== */}
      {/* =================================================================== */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800 sm:py-24">
  <div className="container mx-auto px-4">
    {/* Título Principal */}
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Um Clube de Vantagens de Verdade
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        Com MedSinai+, seu bem-estar vai além da saúde. Tenha acesso a benefícios exclusivos que cuidam também do seu bolso e do seu lazer.
      </p>
    </div>

    <div className="space-y-16"> {/* Aumentei o espaço entre os cards */}
      
      {/* Card de Benefício: CINEMA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left">
          <h3 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">50% de Desconto em Cinemas</span>
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sua paixão pela sétima arte vale a metade do preço! Compre ingressos com 50% de desconto nas maiores redes de cinema do país, diretamente pelo nosso app.
          </p>
        </div>
        <div>
          <img 
            src={parceirosCinemaImg} 
            alt="Parceiros de cinema: Cinemark, Cinépolis, Moviecom, GrupoCine, Cineart" loading="lazy"
            className="rounded-2xl shadow-lg transform hover:scale-105nom transition-transform duration-300"
          />
        </div>
      </div>

      {/* Card de Benefício: CASHBACK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left lg:order-last">
          <h3 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Até 5% de Cashback</span>
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Suas compras viram dinheiro de volta! Acesse as maiores lojas do Brasil pelo nosso app e receba até 5% de cashback em eletrônicos, moda, farmácias e muito mais.
          </p>
        </div>
        <div className="lg:order-first">
          <img 
            src={parceirosCashbackImg} 
            alt="Parceiros de cashback: Nike, Netshoes, Kabum, Electrolux, Natura, Casas Bahia, Gol" loading="lazy"
            className="rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

    </div>
  </div>
</section>

<section id="plans" className="py-16 px-6 bg-white dark:bg-gray-900">
  <div className="container mx-auto">
    
    {/* Parte 1: Título e Parágrafo (ficam estáticos) */}
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Escolha o Plano Ideal para Você
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Planos flexíveis que se adaptam às suas necessidades e orçamento.
      </p>
    </div>

    {/* 
      ===================================================================
      ==> A MÁGICA FINAL ACONTECE AQUI <==
      Esta div envolve APENAS o seletor e é ela que se torna sticky.
      O 'top-16' (ou o valor que você precisar) cria o espaço para o seu header.
      ===================================================================
    */}
    <div className="
      sticky top-16 z-20 
      py-4 
      bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm 
      -mx-6 px-6 mb-8
      lg:static lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none 
      lg:m-0 lg:p-0 lg:mb-12
    ">
      <div className="flex justify-center">
        <div className="relative inline-flex bg-gray-300 dark:bg-gray-700 rounded-full p-1 shadow-inner">
          <span
            className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] bg-green-400 dark:bg-green-500 rounded-full shadow-md transition-transform duration-300 ease-in-out
                  ${isAnual ? 'transform translate-x-full' : 'transform translate-x-0'}`}
            aria-hidden="true"
          />
          <button 
            onClick={() => setIsAnual(false)}
            className={`relative px-6 py-2 rounded-full text-sm font-semibold z-10 transition-colors duration-300
                      ${!isAnual ? 'text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}>
            Mensal
          </button>
          <button 
            onClick={() => setIsAnual(true)}
            className={`relative px-6 py-2 rounded-full text-sm font-semibold z-10 transition-colors duration-300
                      ${isAnual ? 'text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}>
            Anual
          </button>
        </div>
      </div>
    </div>

    {/* Parte 3: A Grade de Planos (continua normal) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {planosAtivos.map((plano) => (
        <div key={plano.id} className="border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plano.nome}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 min-h-[20px]">{plano.descricao}</p>
          </div>
          <div className="mb-4 min-h-[50px]">
            <div className="flex items-baseline whitespace-nowrap">
              {plano.parcelamento && (
                <span className="text-xl font-semibold text-gray-500 dark:text-gray-400 mr-1">
                  {plano.parcelamento}
                </span>
              )}
              <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">R$ {plano.preco}</span>
              {!isAnual && (
                <span className="text-gray-600 dark:text-gray-400 ml-1">/mês</span>
              )}
            </div>
            {plano.economia && <p className="text-sm text-green-600 dark:text-green-400 mt-1">{plano.economia}</p>}
          </div>
          <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-300 flex-grow">
            {plano.beneficios.map((beneficio, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handleAssinarAgora(plano)}
            className="w-full mt-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Assinar Agora
          </button>
        </div>
      ))}
    </div>
  </div>
</section>
{/* SEÇÃO DE DEPOIMENTOS */}
<section className="py-16 bg-gray-100 dark:bg-gray-800 sm:py-24">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Milhares de vidas transformadas
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Veja o que alguns de nossos clientes estão dizendo sobre a MedSinai.
      </p>
    </div>

    {loadingTestimonials ? (
      <p className="text-center">Carregando depoimentos...</p>
    ) : (
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        loop={dynamicTestimonials.length > 2}
        autoplay={{ delay: 5000, disableOnInteraction: true }}
        breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 30 } }}
        className="pb-10"
      >
        {dynamicTestimonials.map((testimonial) => (
          // A ÚNICA MUDANÇA É AQUI: de key={index} para key={testimonial.id}
          <SwiperSlide key={testimonial.id} className="h-auto">
            <TestimonialCard testimonial={testimonial} />
          </SwiperSlide>
        ))}
      </Swiper>
    )}
  </div>
</section>
      {/* Seção do CTA para enviar depoimento */}
      <section className="bg-gray-100 dark:bg-gray-800 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Gostou do nosso serviço?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Sua história pode inspirar outras pessoas a cuidarem melhor da saúde. Adoraríamos ouvir sua experiência com a MedSinai.
          </p>
          <button 
            onClick={() => setIsTestimonialModalOpen(true)}
            className="inline-block px-10 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            Enviar meu Depoimento
          </button>
        </div>
      </section>

    {/* FAQ PERGUNTAS E RESPOSTAS */}

<section className="py-16 bg-white dark:bg-gray-900 sm:py-24">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    {/* Grid principal que divide a seção em duas colunas em telas grandes */}
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16">
      
      {/* Coluna da Esquerda: Título e Descrição */}
      <div className="mb-12 lg:mb-0 lg:pr-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Ficou com alguma dúvida?
        </h2>
        <p className="text-x2 text-gray-600 dark:text-gray-400">
          Confira as perguntas mais frequentes
        </p>
      </div>

      {/* Coluna da Direita: Acordeão de Perguntas */}
      <div className="space-y-3">
        {faqData.map((faq, index) => (
          // Cada item do FAQ agora tem sua própria div com borda e sombra
          <div key={index} className="bg-gray-300/75 dark:bg-gray-800 border border-gray-400 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Cabeçalho da Pergunta (Clicável) */}
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              <span>{faq.question}</span>
              {/* Ícone de Seta que Gira */}
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 text-green-500 ${openFaq === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {/* Corpo da Resposta (Expansível) */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-96 mt-4' : 'max-h-0'}`}
            >
              <p className="text-gray-600 dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
        <TestimonialModal 
        isOpen={isTestimonialModalOpen} 
        onClose={() => setIsTestimonialModalOpen(false)} 
      />
    </div>
  )
}

export default App
