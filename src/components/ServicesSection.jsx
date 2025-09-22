// src/components/ServicesSection.jsx (VERSÃO FINAL COM ANIMAÇÃO ORQUESTRADA)

import { motion } from "framer-motion";
import celularEsquerdoImg from "@/assets/celular-esquerdo.webp";
import celularDireitoImg from "@/assets/celular-direito.webp";

const especialidadesData = [
  { title: "Clínico Geral 24h", description: "Atendimento médico disponível 24 horas por dia, 7 dias por semana, sem filas ou agendamento." },
  { title: "Psicólogos", description: "Cuidado integral da saúde mental com profissionais especializados." },
  { title: "Nutricionistas", description: "Acompanhamento personalizado para alcançar seus objetivos de saúde." },
  { title: "Pediatras", description: "Cuidado especializado para a saúde de bebês, crianças e adolescentes." },
  { title: "Ginecologistas", description: "Atenção completa à saúde da mulher em todas as fases da vida." },
  { title: "Dermatologistas", description: "Tratamento e prevenção para a saúde da sua pele, cabelos e unhas." },
  { title: "Médicos Veterinários", description: "Cuidado completo para seus pets, garantindo a saúde de toda a família." },
  { title: "Treinadores Físicos", description: "Exercícios e orientações para manter seu corpo saudável e ativo." },
];

// ===================================================================
// ==> A MÁGICA DA ORQUESTRAÇÃO ACONTECE AQUI <==
// ===================================================================

// --- Variants da Animação ---
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { 
      // Atraso entre cada filho da animação principal
      staggerChildren: 0.2 
    },
  },
};

// Nova variant para o container dos elementos visuais (argolas e celulares)
const visualContainerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

// Novas variants para as argolas
const ringVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const rightPhoneVariants = {
  hidden: { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 },
  visible: { opacity: 1, scale: 1, x: "25%", rotate: 10, transition: { duration: 0.9, ease: [0.68, -0.55, 0.27, 1.55] } },
};

const leftPhoneVariants = {
  hidden: { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 },
  visible: { opacity: 1, scale: 1, x: "-25%", rotate: -10, transition: { duration: 0.9, ease: [0.68, -0.55, 0.27, 1.55] } },
};

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="py-16 bg-gray-100 dark:bg-gray-800 sm:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Saúde sem Complicações
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Descubra por que a MedSinai é a solução completa para o seu bem-estar e da sua família.
          </p>
        </div>

        <motion.div
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {/* NOVO Container para os elementos visuais, que herda a animação */}
          <motion.div
            className="relative h-96 flex justify-center items-center lg:order-first"
            variants={visualContainerVariants}
          >
            {/* Argolas agora usam variants */}
            <motion.div 
              className="absolute w-[450px] h-[450px] border-4 border-green-400/30 dark:border-green-900/40 rounded-full shadow-2xl shadow-green-400/20 dark:shadow-green-900/30" 
              variants={ringVariants}
            />
            <motion.div 
              className="absolute w-[300px] h-[300px] border-4 border-blue-400/30 dark:border-blue-900/40 rounded-full shadow-2xl shadow-blue-400/20 dark:shadow-blue-900/30" 
              variants={ringVariants}
            />
            
            {/* Celulares agora usam variants */}
            <motion.img src={celularDireitoImg} alt="App Medsinai no celular" loading="lazy" className="absolute w-64 object-contain z-10" variants={rightPhoneVariants} />
            <motion.img src={celularEsquerdoImg} alt="App Medsinai no celular" loading="lazy" className="absolute w-64 object-contain z-20" variants={leftPhoneVariants} />
          </motion.div>

          {/* Coluna de Especialidades */}
          <motion.div
            className="lg:order-last"
            variants={textVariants}
          >
            <div className="pt-0 lg:pt-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center lg:text-left">
                Tudo em um unico app
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {especialidadesData.map((item) => (
                  <div key={item.title} className="flex items-start">
                    <svg className="w-8 h-8 mr-6 flex-shrink-0 mt-1" viewBox="0 0 20 20">
                      <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor: "#4ade80" }} /><stop offset="100%" style={{ stopColor: "#60a5fa" }} /></linearGradient></defs>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" fill="url(#gradient)"></path>
                    </svg>
                    <div>
                      <p className="text-[20px] font-bold text-gray-800 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
