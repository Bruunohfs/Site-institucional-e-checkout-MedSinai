import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import bannerImage from './assets/medsinai-banner.png';
import './App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation, Autoplay } from 'swiper/modules' ;
import 'swiper/css/navigation' ;
import carrosselImg2 from './assets/carrossel-img-2.jpg';
import carrosselImg3 from './assets/carrossel-img-3.jpeg';
import { useNavigate } from 'react-router-dom';
import { planosMensais, planosAnuais } from "@/data/planos";
import useTracker from '@/hooks/useTracker';
import parceirosCinemaImg from '@/assets/logos/logoscinema.png';
import parceirosCashbackImg from '@/assets/logos/logosmarcas.png';
import CountUp from 'react-countup';



function App() {
  useTracker();
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
    navigate(`/pagamento/${tipoPlano}/${idDoPlano}`);
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

     <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl lg:text-4,5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          <span className="block">MedSinai: Sua Saúde Completa,</span> 
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
           Seus Benefícios Ilimitados
         </span>
       </h1>
        <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8">
          O super app que cuida da sua saúde e do seu bolso, com telemedicina, clube de vantagens exclusivo e muito mais.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => scrollToSection('plans')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Ver Planos
          </button>
          <button 
            onClick={openWhatsApp}
            className="px-6 py-3 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Fale com um Consultor
          </button>
        </div>
      </div>

            <div className="relative">

            <Swiper
              ref={swiperRef}
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={false}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false
            }}
            className="rounded-2xl shadow-lg"
            >
              <SwiperSlide>
                <img
                src={bannerImage}
                alt="MedSinai - Cuidado completo"
                className="w-full h-full object-cover"
                />
                </SwiperSlide>
                <SwiperSlide>
                  <img
                  src={carrosselImg2}
                  alt="Clube de Vantagens"
                  className="w-full h-full object-cover"
                  />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                    src={carrosselImg3}
                    alt="Atendimento 24hrs"
                    className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                  </Swiper>
                  
                    <button
                    onClick={() => swiperRef.current?.swiper.slidePrev()}
                    className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80 transition"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg"  className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                </button>
                   <button
                    onClick={(  ) => swiperRef.current?.swiper.slideNext()}
                    className="absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80 transition"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
               </button>
                  </div>
               </div>
               {/* =================================================================== */}
               {/* ============ NOVA SEÇÃO DE ESTATÍSTICAS (PROVA SOCIAL) ============ */}
               {/* =================================================================== */}
<div className="py-12">
  <div className="container mx-auto">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-300 dark:border-gray-600">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        
        {/* Estatística 1: Usuários */}
        <div className="flex flex-col items-center">
          <div className="flex items-center text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            <span className="mr-1">+</span>
            <CountUp end={1000000} duration={3} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">De usuários no Brasil</p>
        </div>

        {/* Estatística 2: Atendimento */}
        <div className="flex flex-col items-center border-t-2 md:border-t-0 md:border-l-2 md:border-r-2 border-gray-200 dark:border-gray-700 py-4 md:py-0">
          <div className="flex items-center text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            <CountUp end={24} duration={3} suffix="hrs" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Atendimento</p>
        </div>

        {/* Estatística 3: Avaliação */}
        <div className="flex flex-col items-center">
          <div className="flex items-center text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            <CountUp end={4.9} duration={3} decimals={1} separator="." />
            <span className="text-yellow-400 ml-2">★★★</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Satisfação dos Usuarios</p>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
      </section>

<section className="py-16 bg-white dark:bg-gray-900 sm:py-24">
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

      <section id="services" className="py-16 px-6 bg-white dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Cuidado Completo em um Só App</span>
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Acesso a profissionais de saúde qualificados, atendimento 24h e benefícios exclusivos que cuidam da sua saúde e do seu bolso.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { icon: "🩺", title: "Clínico Geral 24h", desc: "Atendimento médico disponível 24 horas por dia, 7 dias por semana, sem filas ou agendamento." },
        { icon: "🧠", title: "Psicólogos", desc: "Cuidado integral da saúde mental com profissionais especializados." },
        { icon: "🍎", title: "Nutricionistas", desc: "Acompanhamento personalizado para alcançar seus objetivos de saúde." },
        { icon: "👶", title: "Pediatras", desc: "Cuidado especializado para a saúde de bebês, crianças e adolescentes." },
        { icon: "♀️", title: "Ginecologistas", desc: "Atenção completa à saúde da mulher em todas as fases da vida." },
        { icon: "✨", title: "Dermatologistas", desc: "Tratamento e prevenção para a saúde da sua pele, cabelos e unhas." },
        { icon: "🐕", title: "Médicos Veterinários", desc: "Cuidado completo para seus cães e gatos, garantindo a saúde de toda a família." },
        { icon: "💪", title: "Treinadores Físicos", desc: "Exercícios e orientações para manter seu corpo saudável e ativo." },
        { icon: "👨‍👩‍👧‍👦", title: "Dependentes Inclusos", desc: "Filhos menores de 18 anos inclusos sem custo adicional." },
      ].map((service, index ) => (
        <div key={index} className="text-center p-6 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="text-4xl mb-4">{service.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{service.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{service.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* =================================================================== */}
{/* ================= NOVA SEÇÃO: FAÇA O UPGRADE (AJUSTADA) ============ */}
{/* =================================================================== */}
<section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
      
      {/* Coluna da Esquerda: Título */}
      <div className="lg:col-span-1 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          “Conheça os benefícios exclusivos dos nossos Planos Plus”
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
              Saldo mensal de R$30 disponivel para ser usado na compra de medicamentos em qualquer farmácia do Brasil.
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
            className="rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"
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
        delay: 8000,
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
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Escolha o Plano Ideal para Você
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Planos flexíveis que se adaptam às suas necessidades e orçamento.
      </p>
               {/*BOTAO DE SELEÇÃO DE PLANO MENSAL E ANUAL*/}
<div className="flex justify-center mb-8">
  {/* 1. Container principal: relativo e com formato de pílula */}
  <div className="relative inline-flex bg-gray-300 dark:bg-gray-700 rounded-full p-1">
    
    {/* 2. O fundo deslizante: absoluto, com transição e movido pelo estado 'isAnual' */}
    <span
      className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] bg-green-400 dark:bg-green-500 rounded-full shadow-md transition-transform duration-300 ease-in-out
             ${isAnual ? 'transform translate-x-full' : 'transform translate-x-0'}`}
      aria-hidden="true"
    />

    {/* 3. Botões: agora são 'relative' para ficarem sobre o fundo deslizante */}
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

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {planosAtivos.map((plano) => (
        <div key={plano.id} className="border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plano.nome}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{plano.descricao}</p>
          <div className="mb-4 flex items-baseline">
            {plano.parcelamento && (
             <span className="text-xl font-semibold text-gray-500 dark:text-gray-400 mr-1">
              {plano.parcelamento}
               </span>
              )}
              <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ {plano.preco}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">/mês</span>
          </div>
          {plano.economia && <p className="text-sm text-green-600 dark:text-green-400 mb-4">{plano.economia}</p>}
          <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-300 flex-grow">
            {plano.beneficios.map((beneficio, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                {beneficio}
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
