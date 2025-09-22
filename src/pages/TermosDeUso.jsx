// /src/pages/TermosDeUso.jsx

import React from 'react';

// Componente de Seção para reutilização e clareza
const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-green-500 pl-4">
      {title}
    </h2>
    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
      {children}
    </div>
  </div>
);

function TermosDeUso() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16 lg:py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Termos de Uso
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Última atualização: 21 de setembro de 2025
          </p>
        </div>

        <Section title="1. Visão Geral e Aceitação">
          <p>
            Bem-vindo à MedSinai! Estes Termos de Uso regem o acesso e a utilização da nossa plataforma de saúde digital. Ao criar uma conta, agendar ou participar de uma teleconsulta, você ("Usuário" ou "Paciente") confirma que leu, compreendeu e concorda em estar vinculado a estes Termos e à nossa <a href="/politica-de-privacidade" className="text-green-600 hover:underline">Política de Privacidade</a>.
          </p>
          <p>
            Se você não concordar com estes termos, por favor, não utilize nossos serviços.
          </p>
        </Section>

        <Section title="2. Natureza dos Serviços">
          <p>
            A MedSinai é uma plataforma tecnológica que facilita o acesso a serviços de saúde, conectando pacientes a profissionais de saúde qualificados e licenciados para a realização de teleconsultas.
          </p>
          <p className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            IMPORTANTE: Nossos serviços não são adequados para emergências médicas. Em caso de situações de risco à vida, como dor no peito, dificuldade respiratória, convulsões, acidentes graves ou qualquer outra emergência, procure imediatamente um hospital ou ligue para o SAMU (192).
          </p>
        </Section>

        <Section title="3. Cadastro e Responsabilidades do Usuário">
          <p>Para utilizar a plataforma, o Usuário deve:</p>
          <ul>
            <li>Ter no mínimo 18 anos de idade e ser legalmente capaz. Menores de idade devem ser representados por seus pais ou responsáveis legais.</li>
            <li>Fornecer informações de cadastro precisas, completas e atualizadas, sendo o único responsável pela veracidade dos dados.</li>
            <li>Manter a confidencialidade de seu login e senha, responsabilizando-se por todas as atividades realizadas em sua conta.</li>
            <li>Possuir os equipamentos necessários (computador, smartphone, etc.) e uma conexão de internet estável para a realização das teleconsultas.</li>
            <li>Utilizar a plataforma de forma ética, legal e respeitosa.</li>
          </ul>
        </Section>

        <Section title="4. Agendamento, Pagamento e Cancelamento">
          <p>
            O acesso aos serviços se dá pela contratação de um dos planos (mensais ou anuais) apresentados em nosso site. O pagamento é processado de forma segura por nossos parceiros e a renovação é automática, conforme o ciclo do plano escolhido.
          </p>
          <p>
            O Usuário pode solicitar o cancelamento de sua assinatura a qualquer momento, de acordo com as regras de cada plano. Planos mensais não possuem fidelidade. Para planos anuais, as regras de cancelamento seguem o contrato específico, visando o melhor custo-benefício.
          </p>
        </Section>

        <Section title="5. Sobre a Teleconsulta">
          <p>
            A teleconsulta é um ato médico e, como tal, depende da colaboração mútua entre médico e paciente. O profissional de saúde tem autonomia para decidir, com base nas informações fornecidas e nas limitações da consulta a distância, se é seguro e apropriado emitir um diagnóstico, prescrição ou atestado.
          </p>
          <p>
            O profissional pode concluir que uma avaliação presencial é necessária e encerrar a teleconsulta, orientando o paciente a procurar um serviço físico.
          </p>
        </Section>

        <Section title="6. Prescrições, Atestados e Exames">
          <p>
            As prescrições e atestados emitidos na plataforma possuem assinatura digital e validade em todo o território nacional, conforme a legislação vigente.
          </p>
          <ul>
            <li>Não é permitida a emissão de receitas de controle especial (receitas azuis ou amarelas) via telemedicina.</li>
            <li>Atestados médicos são emitidos a critério exclusivo do médico, com base na avaliação clínica, e não podem ter data retroativa.</li>
            <li>Pedidos de exames também são emitidos digitalmente e podem ser apresentados em laboratórios de sua preferência.</li>
          </ul>
        </Section>

        <Section title="7. Privacidade e Proteção de Dados (LGPD)">
          <p>
            A MedSinai tem um compromisso sério com a sua privacidade. Todas as informações e dados de saúde são tratados como confidenciais e protegidos conforme a Lei Geral de Proteção de Dados (LGPD) e as normas de sigilo médico. Para mais detalhes, consulte nossa <a href="/politica-de-privacidade" className="text-green-600 hover:underline">Política de Privacidade</a>.
          </p>
        </Section>

        <Section title="8. Propriedade Intelectual">
          <p>
            É estritamente proibido gravar, copiar, fotografar ou distribuir qualquer conteúdo das teleconsultas. Todo o conteúdo da plataforma, incluindo software, logos, textos e design, é propriedade intelectual da MedSinai.
          </p>
        </Section>

        <Section title="9. Limitação de Responsabilidade">
          <p>
            A MedSinai atua como uma plataforma de intermediação e não se responsabiliza pela qualidade técnica da conexão de internet do usuário, nem por diagnósticos, tratamentos ou quaisquer atos médicos, que são de responsabilidade exclusiva dos profissionais de saúde.
          </p>
        </Section>

        <Section title="10. Modificações dos Termos">
          <p>
            Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento. Notificaremos os usuários sobre mudanças significativas, e a continuidade do uso da plataforma após tais alterações constituirá sua aceitação dos novos termos.
          </p>
        </Section>
      </div>
    </div>
  );
}

export default TermosDeUso;
