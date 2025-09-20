// src/components/parceiros/HelpModal.jsx

export default function HelpModal({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
      onClick={onClose} // Fecha o modal ao clicar no fundo
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Como Usar a Calculadora de Ganhos
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-3xl font-bold"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            Esta é sua ferramenta para planejar e visualizar seu sucesso como parceiro MedSinai!
          </p>

          <div>
            <h4 className="font-bold text-lg">1. Planejador de Ganhos (Calculadora Reversa)</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Objetivo:</strong> Descobrir o esforço necessário para atingir uma meta.</li>
              <li><strong>Como usar:</strong> Digite sua meta de ganho mensal no campo "Quanto você quer ganhar?". A calculadora mostrará automaticamente quantas vendas dos planos "Individual" e "Família Plus" você precisa para alcançar esse valor. Use isso para entender o poder dos planos de maior valor!</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg">2. Simulador de Vendas (CPF e CNPJ)</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Objetivo:</strong> Simular o ganho com base em uma quantidade específica de vendas.</li>
              <li><strong>Como usar:</strong> Nas tabelas "Planos CPF" e "Planos CNPJ", simplesmente digite a quantidade de vendas que você imagina fazer para cada plano. Os totais de comissão mensal e anual serão atualizados instantaneamente.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg">3. Comparador de Cenários</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Objetivo:</strong> Salvar e comparar diferentes estratégias de venda.</li>
              <li><strong>Como usar:</strong> Após fazer uma simulação nas tabelas, clique no botão <strong>"Salvar Simulação Atual"</strong>. Dê um nome para sua estratégia (ex: "Foco em Família Plus"). Seu cenário será salvo no final da página, permitindo que você compare diferentes simulações lado a lado.</li>
            </ul>
          </div>

          <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <p className="font-bold text-green-800 dark:text-green-200">Dica de Ouro:</p>
            <p className="text-green-700 dark:text-green-300">
              Combine as ferramentas! Use o <strong>Planejador</strong> para definir uma meta e depois use o <strong>Simulador</strong> e o <strong>Comparador de Cenários</strong> para descobrir as melhores combinações de vendas para chegar lá.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
