import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';

// Ícone de chave para o botão de reset
const KeyIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.629 5.853M12 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10l-2 2 2 2"></path></svg>;

export default function EditPartnerModal({ parceiro, isOpen, onClose, onSave, onResetPassword }) {
  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Preenche o formulário com os dados do parceiro quando o modal abre
  useEffect(() => {
    if (parceiro) {
      setValue('nome', parceiro.user_metadata?.nome || '');
      setValue('cupom', parceiro.user_metadata?.cupom || '');
      setValue('email', parceiro.email || '');
      setValue('telefone', parceiro.user_metadata?.telefone || '');
      setResetSuccess(false); // Reseta o estado do botão de senha
      setIsResetting(false);
    }
  }, [parceiro, setValue]);

  if (!isOpen || !parceiro) return null;

  const handleSave = (data) => {
    onSave(parceiro.id, data);
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    const success = await onResetPassword(parceiro.id);
    if (success) {
      setResetSuccess(true);
    }
    setIsResetting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Editar Parceiro</h2>
        <p className="text-sm text-gray-400 mb-6">Editando: <span className="font-semibold text-white">{parceiro.email}</span></p>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome do Parceiro</label>
            <input id="nome" type="text" {...register('nome')} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
            <input id="email" type="email" {...register('email', { required: 'E-mail é obrigatório' })} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Telefone com Máscara */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
            <Controller
              name="telefone"
              control={control}
              render={({ field: { onChange, name, value } }) => (
                <IMaskInput
                  mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                  id={name} name={name} value={value || ''} placeholder="(00) 00000-0000"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  onAccept={(val) => onChange(val)}
                />
              )}
            />
          </div>

          {/* Cupom */}
          <div>
            <label htmlFor="cupom" className="block text-sm font-medium text-gray-300 mb-1">Cupom de Desconto</label>
            <input id="cupom" type="text" {...register('cupom')} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">Salvar Alterações</button>
          </div>
        </form>

        {/* Seção de Reset de Senha */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Gerenciamento de Senha</h3>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isResetting || resetSuccess}
            className="w-full flex items-center justify-center py-2 px-4 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <KeyIcon />
            {isResetting ? 'Enviando...' : (resetSuccess ? 'Link de redefinição enviado!' : 'Enviar Link de Redefinição de Senha')}
          </button>
          {resetSuccess && <p className="text-green-400 text-xs text-center mt-2">O parceiro receberá um e-mail com as instruções.</p>}
        </div>
      </div>
    </div>
  );
}
