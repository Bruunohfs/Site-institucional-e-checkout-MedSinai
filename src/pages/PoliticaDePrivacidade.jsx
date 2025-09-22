// /src/pages/PoliticaDePrivacidade.jsx

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

function PoliticaDePrivacidade() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16 lg:py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Última atualização: 21 de setembro de 2025
          </p>
        </div>

        <Section title="1. Nosso Compromisso com a Privacidade">
          <p>
            A MedSinai ("nós", "nosso") leva a sua privacidade e a proteção dos seus dados a sério. Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/18) e descreve de forma transparente como coletamos, utilizamos, armazenamos e protegemos os dados dos usuários ("você") da nossa plataforma de telemedicina.
          </p>
        </Section>

        <Section title="2. Definições Importantes">
          <ul>
            <li><strong>Dado Pessoal:</strong> Qualquer informação que identifique ou possa identificar você, como nome, CPF e e-mail.</li>
            <li><strong>Dado Pessoal Sensível:</strong> Dados sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico. Seus dados de saúde são considerados sensíveis.</li>
            <li><strong>Tratamento:</strong> Qualquer operação realizada com dados pessoais, como coleta, uso, acesso, armazenamento e exclusão.</li>
          </ul>
        </Section>

        <Section title="3. Coleta e Finalidade dos Dados">
          <p>Coletamos seus dados com finalidades específicas e legítimas:</p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
            <h4 className="font-bold">Dados de Cadastro e Contato</h4>
            <p><strong>O que coletamos:</strong> Nome, e-mail, telefone, CPF, data de nascimento.</p>
            <p><strong>Por que coletamos:</strong> Para criar e gerenciar sua conta, verificar sua identidade, processar pagamentos e nos comunicarmos com você. (Base legal: Execução de contrato).</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mt-4">
            <h4 className="font-bold">Dados Pessoais Sensíveis (Saúde)</h4>
            <p><strong>O que coletamos:</strong> Histórico de saúde, sintomas, diagnósticos, prescrições e outras informações compartilhadas durante a teleconsulta.</p>
            <p><strong>Por que coletamos:</strong> Para a prestação do serviço de saúde (tutela da saúde) e para permitir que o profissional realize o atendimento adequado. (Base legal: Tutela da saúde).</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mt-4">
            <h4 className="font-bold">Dados de Navegação (Cookies)</h4>
            <p><strong>O que coletamos:</strong> Endereço IP, tipo de dispositivo, navegador, páginas visitadas.</p>
            <p><strong>Por que coletamos:</strong> Para garantir a segurança da plataforma, melhorar sua experiência, personalizar o conteúdo e realizar análises estatísticas. (Base legal: Legítimo interesse).</p>
          </div>
        </Section>

        <Section title="4. Cookies e Tecnologias de Rastreamento">
          <p>
            Utilizamos cookies essenciais para o funcionamento da plataforma (ex: manter você logado) e cookies de análise para entender como nosso site é utilizado e como podemos melhorá-lo. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
          </p>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          <p>
            Seus dados são compartilhados de forma segura e apenas quando necessário:
          </p>
          <ul>
            <li><strong>Profissionais de Saúde:</strong> Seus dados de saúde são acessíveis apenas aos profissionais que lhe atendem, protegidos por sigilo profissional.</li>
            <li><strong>Operadores de Tecnologia:</strong> Empresas que nos fornecem serviços essenciais, como provedores de nuvem (para armazenamento seguro) e plataformas de pagamento. Todos possuem contratos que garantem a proteção dos seus dados.</li>
            <li><strong>Autoridades Legais:</strong> Em casos de requisição judicial ou para cumprimento de obrigação legal.</li>
          </ul>
          <p>Não vendemos ou compartilhamos seus dados para fins de marketing de terceiros.</p>
        </Section>

        <Section title="6. Segurança e Armazenamento">
          <p>
            Empregamos medidas de segurança técnicas e administrativas de ponta para proteger seus dados, como criptografia, controle de acesso e monitoramento constante. As teleconsultas são criptografadas de ponta a ponta.
          </p>
          <p>
            Seus dados são armazenados em servidores seguros, que podem estar localizados no Brasil ou no exterior (transferência internacional de dados), sempre em países que oferecem um grau de proteção de dados adequado.
          </p>
        </Section>

        <Section title="7. Seus Direitos como Titular (LGPD)">
          <p>A LGPD garante a você uma série de direitos sobre seus dados:</p>
          <ul>
            <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e quais são eles.</li>
            <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
            <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> De dados desnecessários ou tratados em desconformidade com a lei.</li>
            <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados para outro fornecedor de serviço.</li>
            <li><strong>Revogação do Consentimento:</strong> Retirar seu consentimento a qualquer momento.</li>
          </ul>
          <p>
            Para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail: <strong>contato@medsinai.com.br</strong>
          </p>
        </Section>

        <Section title="8. Alterações nesta Política">
          <p>
            Esta política pode ser atualizada para refletir melhorias em nossos serviços ou mudanças na legislação. Recomendamos que você a revise periodicamente. A data da última atualização estará sempre no topo da página.
          </p>
        </Section>
      </div>
    </div>
  );
}

export default PoliticaDePrivacidade;
