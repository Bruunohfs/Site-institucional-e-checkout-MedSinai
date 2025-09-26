import { useState } from 'react';

// Nenhuma importação de máscara é necessária aqui

export default function AddPartnerModal({ isOpen, onClose, onSave }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cupom, setCupom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!email || !password || !nome) {
      setError('Nome, e-mail e senha são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    
    // Passa apenas os dados que o modal original tinha
    const success = await onSave({ email, password, nome, cupom });
    
    setLoading(false);
    if (success) {
      handleClose();
    } else {
      setError('Não foi possível criar o usuário. Verifique os dados e tente novamente.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setNome('');
    setCupom('');
    setError('');
    onClose();
  };

  return (
    // ===================================================================
    // ==> APLICANDO O DESIGN "QUADRADO" E RESPONSIVO AO TEMA <==
    // ===================================================================
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative p-6">
        
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Criar Novo Usuário</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="nome-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Usuário</label>
            <input
              id="nome-add" type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
            <input
              id="email-add" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Provisória</label>
            <input
              id="password-add" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">O usuário poderá alterar a senha depois.</p>
          </div>
          <div>
            <label htmlFor="cupom-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cupom de Desconto (Opcional)</label>
            <input
              id="cupom-add" type="text" value={cupom} onChange={(e) => setCupom(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center mt-4">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleClose}
            className="py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
}
