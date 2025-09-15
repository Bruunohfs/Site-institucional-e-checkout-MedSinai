import { useState } from 'react';

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
      setError('E-mail, senha e nome são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    
    // Chama a função onSave passando os dados e aguarda o resultado
    const success = await onSave({ email, password, nome, cupom });
    
    setLoading(false);
    // Se a criação foi bem-sucedida, limpa os campos e fecha o modal
    if (success) {
      setEmail('');
      setPassword('');
      setNome('');
      setCupom('');
      onClose();
    } else {
      // Se falhou, a mensagem de erro será exibida (definida no componente pai)
      // Podemos adicionar uma mensagem genérica aqui também se quisermos.
      setError('Não foi possível criar o parceiro. Verifique os dados e tente novamente.');
    }
  };

  const handleClose = () => {
    // Limpa os campos ao fechar
    setEmail('');
    setPassword('');
    setNome('');
    setCupom('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Criar Novo Parceiro</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="nome-add" className="block text-sm font-medium text-gray-300 mb-1">Nome do Parceiro</label>
            <input
              id="nome-add"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email-add" className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
            <input
              id="email-add"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password-add" className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <input
              id="password-add"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
             <p className="text-xs text-gray-500 mt-1">O parceiro poderá alterar a senha depois.</p>
          </div>
          <div>
            <label htmlFor="cupom-add" className="block text-sm font-medium text-gray-300 mb-1">Cupom de Desconto (Opcional)</label>
            <input
              id="cupom-add"
              type="text"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleClose}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Parceiro'}
          </button>
        </div>
      </div>
    </div>
  );
}
