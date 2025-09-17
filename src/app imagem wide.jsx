 <section className="relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh] bg-gray-900 mt-20"> {/* <-- MUDANÇA 1: Adicionada margem no topo */}
        {/* Container do Swiper (fundo) */}
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={false}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false
          }}
          className="absolute inset-0 w-full h-full"
        >
          <SwiperSlide>
            <img
              src={bannerImage}
              alt="MedSinai - Cuidado completo"
              className="w-full h-full object-cover object-top" // <-- MUDANÇA 2: Adicionado object-top
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={carrosselImg2}
              alt="Clube de Vantagens"
              className="w-full h-full object-cover object-center" // <-- MUDANÇA 2: Mantido como center (ou ajuste se necessário)
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={carrosselImg3}
              alt="Atendimento 24hrs"
              className="w-full h-full object-cover object-center" // <-- MUDANÇA 2: Mantido como center (ou ajuste se necessário)
            />
          </SwiperSlide>
        </Swiper>

        {/* Botões de Navegação Customizados */}
        <button
          onClick={() => swiperRef.current?.swiper.slidePrev()}
          className="absolute top-1/2 -translate-y-1/2 left-4 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={( ) => swiperRef.current?.swiper.slideNext()}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>
               {/* =================================================================== */}
               {/* ============ NOVA SEÇÃO DE ESTATÍSTICAS (PROVA SOCIAL) ============ */}
               {/* =================================================================== */}
 <section className="py-12 bg-gray-50 dark:bg-gray-900">
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
      </section>