import { useState, useRef, useEffect } from 'react';
import bannerImage from './assets/medsinai-banner.png';
import './App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation, Autoplay } from 'swiper/modules' ;
import 'swiper/css/navigation' ;
import { useNavigate } from 'react-router-dom';
import { planosMensais, planosAnuais } from "@/data/planos";
import useTracker from '@/hooks/useTracker';
import parceirosCinemaImg from '@/assets/logos/logoscinema.png';
import parceirosCashbackImg from '@/assets/logos/logosmarcas.png';
import { useSearchParams } from 'react-router-dom';
import beneficiosHero from './assets/beneficios-hero.jpg';





function App() {
  useTracker();
  const [searchParams] = useSearchParams();
  const partnerIdFromUrl = searchParams.get('pid');
  const navigate = useNavigate();
  const [isAnual, setIsAnual] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const swiperRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);

  const whatsappNumber = "16992291295";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const planosAtivos = isAnual ? planosAnuais : planosMensais;

  const handleAssinarAgora = (plano) => {
  const tipoPlano = isAnual ? 'anual' : 'mensal';
  const idDoPlano = plano.nome.toLowerCase().replace(/ /g, '-');
  
  // Constrói a URL base
  let urlDestino = `/pagamento/${tipoPlano}/${idDoPlano}`;

  // Se houver um ID de parceiro na URL, anexe-o
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

  const testimonials = [
  {
    name: "Juliana M.",
    role: "Mãe do Theo",
    avatar: "https://i.pravatar.cc/150?img=1", // Foto aleatória de mulher
    stars: 5,
    text: "Salvação para uma mãe! Falei com um pediatra às 2h da manhã sem sair de casa. A tranquilidade de ter um médico a qualquer hora não tem preço. Recomendo demais!"
  },
  {
    name: "Carlos S.",
    role: "Profissional de TI, 48 anos",
    avatar: "https://i.pravatar.cc/150?img=32", // Foto aleatória de homem
    stars: 5,
    text: "Consegui renovar minhas receitas de uso contínuo em uma consulta rápida por vídeo, sem precisar faltar ao trabalho. Economizei tempo e dinheiro. O serviço é prático e eficiente."
  },
  {
    name: "Mariana L.",
    role: "Estudante Universitária",
    avatar: "https://i.pravatar.cc/150?img=25", // Foto aleatória de mulher jovem
    stars: 5,
    text: "Tive uma crise de ansiedade e consegui falar com um psicólogo na mesma hora. O acolhimento foi incrível e me ajudou a passar pelo momento. Cuidar da saúde mental ficou mais fácil."
  },
  {
    name: "Roberto F.",
    role: "Dono do Paçoca",
    avatar: "https://i.pravatar.cc/150?img=60", // Foto aleatória de homem mais velho
    stars: 5,
    text: "Meu cachorro comeu algo que não devia no fim de semana. Falei com um veterinário pelo app, que me orientou sobre o que fazer. O Paçoca ficou bem e eu, muito mais tranquilo."
  },
  {
    name: "Fernanda P.",
    role: "Viajante Frequente",
    avatar: "https://i.pravatar.cc/150?img=47", // Foto aleatória de mulher
    stars: 5,
    text: "Estava em uma viagem a trabalho e tive uma reação alérgica. Um dermatologista me atendeu por vídeo e prescreveu a medicação, que comprei com desconto pelo app. Fantástico!"
  },
  {
    name: "Lucas G.",
    role: "Praticante de Musculação",
    avatar: "https://i.pravatar.cc/150?img=12", // Foto aleatória de homem jovem
    stars: 5,
    text: "Tirei várias dúvidas sobre suplementação e dieta com a nutricionista. O acompanhamento ajuda muito a manter o foco e alcançar meus objetivos na academia. Valeu muito a pena!"
  }
];

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
    description: "Baixe o aplicativo Medsinai na App Store ou Google Play e insira seu código."
  },
  {
    icon: "💬",
    title: "3. Fale com um Médico",
    description: "Pronto! Inicie uma consulta por chat ou vídeo com um especialista, 24h por dia."
  }
];

  return (
    <div className="w-full">

<section className="relative py-12 px-6 bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-32">
  <div className="container mx-auto">
    
    {/* 
      ESTRUTURA RESPONSIVA:
      - Padrão (mobile): flex-col (empilhado)
      - Telas grandes (lg): grid com 2 colunas
    */}
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-y-10 lg:gap-x-8 items-center">
      

      <div className="text-left"> 
  <p className="text-base font-semibold text-blue-500 dark:text-blue-400">
    A telemedicina salva vidas
  </p>
<h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white my-4 leading-tight">
  Tenha médicos 
  <br className="hidden lg:block" /> disponíveis 24h por dia, 
  <br className="hidden lg:block" /> aonde estiver!
</h1>
  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
     Cuidado completo para sua família e seus pets, aonde estiver!
     <br className="hidden lg:block" /> com especialistas a um clique, sem filas ou longas esperas.
  </p>
  
  <div className="flex justify-start"> {/* 2. Remove 'justify-center' */}
    <button 
      onClick={() => scrollToSection('plans')}
      className="px-24 py-3 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-lg font-bold hover:opacity-90 transition-opacity shadow-md"
    >
      Ver Planos
    </button>
  </div>
</div>


 <div className="w-full aspect-video rounded-2xl shadow-lg overflow-hidden">
  <img
    src={bannerImage}
    alt="MedSinai - Saúde para toda a família"
    className="w-full h-full object-cover" 
  />
</div>

    </div>
  </div>
</section>
<section className="py-16 bg-white dark:bg-gray-900 sm:py-0">
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
 <section id="services" className="py-16 bg-white dark:bg-gray-900 sm:py-24">
    <div className="container mx-auto px-4">
      
      {/* Grid principal com duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* ================================================= */}
        {/* === COLUNA DA ESQUERDA: IMAGEM (AGORA SIMPLES) === */}
        {/* ================================================= */}
        <div className="px-4 lg:px-0"> {/* Adicionado um padding para respiro no mobile */}
          <img 
            src={beneficiosHero} // Sua imagem com as especialidades
            alt="Aplicativo MedSinai mostrando todas as especialidades disponíveis" 
            className="rounded-2xl shadow-4xl w-full h-auto" 
          />
        </div>

        {/* COLUNA DA DIREITA: TEXTO E LISTA DE BENEFÍCIOS */}
        <div>
          {/* Título e Subtítulo */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Saúde sem Complicações
            </h2>
            <p className="text-xm text-gray-600 dark:text-gray-400">
              Descubra por que a MedSinai é a solução completa para o seu bem-estar e da sua família.
            </p>
          </div>

          {/* Lista de Benefícios (Refinada) */}
          <ul className="space-y-8">
            
            {/* Benefício 1: Atendimento Imediato (Ícone de Raio) */}
            <li className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-5">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Atendimento Imediato e Ilimitado</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fale com Clínicos Gerais, Pediatras e Veterinários 24h por dia, sem agendamento, sem triagem e sem custos extras. É só chamar e ser atendido.
                </p>
              </div>
            </li>

            {/* Benefício 2: Mais Especialidades (Ícone de Calendário) */}
            <li className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-5">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Mais Especialistas à sua Disposição</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Acesso ilimitado a Psicólogos, Nutricionistas, Dermatologistas e muito mais, com a flexibilidade de agendar suas consultas no melhor horário para você.
                </p>
              </div>
            </li>

            {/* Benefício 3: Dependentes Inclusos (Ícone de Família) */}
            <li className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-5">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M12 12a4 4 0 110-8 4 4 0 010 8z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Família Protegida, Sem Custo Adicional</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Inclua seus filhos e dependentes menores de 18 anos em seu plano sem pagar nada a mais por isso. O cuidado se estende a quem você mais ama.
                </p>
              </div>
            </li>

          </ul>
        </div>
      </div>
    </div>
  </section>

{/* =================================================================== */}
{/* ================= NOOVA SEÇÃO: FAÇA O UPGRADE (AJUSTADA) =========== */}
{/* =================================================================== */}
<section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
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
      <section className="py-16 bg-white dark:bg-gray-900 sm:py-24">
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
            alt="Parceiros de cinema: Cinemark, Cinépolis, Moviecom, GrupoCine, Cineart" 
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
            alt="Parceiros de cashback: Nike, Netshoes, Kabum, Electrolux, Natura, Casas Bahia, Gol" 
            className="rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

    </div>
  </div>
</section>

<section className="py-16 bg-white dark:bg-gray-900 sm:py-24">
  <div className="container mx-auto px-4">
    {/* Título da Seção */}
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Milhares de vidas transformadas
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Veja o que nossos clientes estão dizendo sobre a MedSinai.
      </p>
    </div>

    {/* Carrossel Swiper */}
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={30} // Espaço entre os slides
      slidesPerView={1} // Padrão para telas pequenas
      loop={true}
      autoplay={{
        delay: 5000,
        disableOnInteraction: true,
      }}
      breakpoints={{
        // Quando a tela for >= 640px, mostra 2 slides
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        // Quando a tela for >= 1024px, mostra 3 slides
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      }}
      className="pb-10" // Adiciona um padding inferior para a navegação não cortar
    >
      {testimonials.map((testimonial, index) => (
        <SwiperSlide key={index}>
          <div className="h-full bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-grow mb-6">
              <div className="flex items-center mb-4">
                {/* Estrelas de Avaliação */}
                {[...Array(testimonial.stars)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300">"{testimonial.text}"</p>
            </div>
            <div className="flex items-center">
              <img className="w-12 h-12 rounded-full object-cover mr-4" src={testimonial.avatar} alt={testimonial.name} />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
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
    </div>
  )
}

export default App
