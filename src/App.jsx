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

function App() {
  const navigate = useNavigate();
  const [isAnual, setIsAnual] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const swiperRef = useRef(null)
  const [theme, setTheme] = useState('light');

  const handleThemeSwitch = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add('dark');
  } else {
      document.documentElement.classList.remove('dark');
  }
},[theme]);

  const whatsappNumber = "16992291295"
  const whatsappUrl = `https://wa.me/${whatsappNumber}`
  const planosAtivos = isAnual ? planosAnuais : planosMensais;

  const handleAssinarAgora = (plano) => {
    const tipoPlano = isAnual ? 'anual' : 'mensal';
    const idDoPlano = plano.nome.toLowerCase().replace(/ /g, '-');
    navigate(`/pagamento/${tipoPlano}/${idDoPlano}`);
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const openWhatsApp = () => {
    window.open(whatsappUrl, '_blank')
    setIsMobileMenuOpen(false)
  }

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

          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">+1M</div>
              <div className="text-gray-600 dark:text-gray-400">Usuários</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">24h</div>
              <div className="text-gray-600 dark:text-gray-400">Atendimento</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">4.9</div>
              <div className="text-gray-600 dark:text-gray-400">Avaliação</div>
            </div>
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
        { icon: "🐕", title: "Médicos Veterinários", desc: "Cuidado completo para seus pets, garantindo a saúde de toda a família." },
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
<section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Clube de Vantagens <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">que Cuida do Seu Bolso</span>
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Além de cuidar da sua saúde, o MedSinai oferece benefícios exclusivos que fazem a diferença no seu dia a dia.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { icon: "💳", title: "Cashback", desc: "Receba parte do valor gasto em compras de volta", value: "Até 5%" },
        { icon: "🎬", title: "Cinema", desc: "Compre ingressos com desconto direto pelo app", value: "Até 55% off" },
        { icon: "💊", title: "Pix Farma", desc: "Crédito mensal para compra de medicamentos", value: "R$ 30/mês" },
        { icon: "🏥", title: "Clínicas", desc: "Acesso a rede credenciada com preços especiais", value: "Descontos" }
      ].map((benefit, index) => (
        <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:shadow-lg">
          <div className="text-4xl mb-4">{benefit.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{benefit.desc}</p>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{benefit.value}</div>
        </div>
      ))}
    </div>
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
      
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button 
            onClick={() => setIsAnual(false)}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              !isAnual 
                ? 'bg-pink-200 text-pink-800' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button 
            onClick={() => setIsAnual(true)}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isAnual 
                ? 'bg-blue-200 text-blue-800' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
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

      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Pronto para ter acesso a saúde de onde estiver?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Fale com um de nossos especialistas e descubra como o MedSinai pode transformar a sua vida.</p>
          <div className="flex justify-center">
            <button 
              onClick={openWhatsApp}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Falar com Especialista
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
