// src/components/parceiros/CenarioCard.jsx

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function CenarioCard({ cenario, onRemove }) {
  return (
    <div className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white break-words">{cenario.nome}</h4>
        <button 
          onClick={() => onRemove(cenario.id)}
          className="text-xs text-red-500 hover:text-red-700 ml-2"
          title="Remover cenário"
        >
          &#x2715; {/* Ícone de 'X' */}
        </button>
      </div>
      
      <div className="flex-grow space-y-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Comissão Mensal Total</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(cenario.totalComissao)}</p>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Resumo da Simulação:</p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 max-h-40 overflow-y-auto pr-2">
            {cenario.resumo.length > 0 ? (
              cenario.resumo.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.nome}</span>
                  <span className="font-medium">{item.qtd}</span>
                </li>
              ))
            ) : (
              <li>Nenhuma venda simulada.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
