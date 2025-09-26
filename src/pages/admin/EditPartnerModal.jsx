import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from '@/lib/supabaseClient';
import { useNotification } from '../../components/notifications/NotificationContext';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

const KeyIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.629 5.853M12 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10l-2 2 2 2"></path></svg>;

export default function EditPartnerModal({ parceiro, isOpen, onClose, onSave }) {
  const { control, register, handleSubmit, setValue } = useForm();
  const { addNotification } = useNotification();
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    if (parceiro) {
      setValue('nome', parceiro.nome_completo || '');
      setValue('cupom', parceiro.cupom || '');
      setValue('email', parceiro.email || '');
      setValue('telefone', parceiro.telefone || '');
      setIsResetting(false);
    }
  }, [parceiro, setValue, isOpen]);

  if (!isOpen || !parceiro) return null;

  const handleSave = (data) => {
    const { email, ...dataToSave } = data;
    onSave(parceiro.id, dataToSave);
  };

  const executePasswordReset = async () => {
    setIsResetting(true);
    addNotification("Resetando senha para o padrão...", "info");
    try {
      const { error } = await supabase.functions.invoke('reset-partner-password', {
        body: { userId: parceiro.id },
      });
      if (error) throw new Error(error.message);
      addNotification("Senha resetada com sucesso!", "success");
    } catch (err) {
      const errorMessage = err.message.includes('{') ? JSON.parse(err.message).error : err.message;
      addNotification(`Erro ao resetar a senha: ${errorMessage}`, "error");
    } finally {
      setIsResetting(false);
      setIsConfirmationOpen(false);
    }
  };

  return (
    <>
      {/* =================================================================== */}
      {/* ==> APLICANDO O DESIGN "QUADRADO" E RESPONSIVO AO TEMA <== */}
      {/* =================================================================== */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        {/* Modal container com cantos 'rounded-lg' */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative p-6">
          
          {/* Botão de fechar no canto */}
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Editar Usuário</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Editando: <span className="font-semibold">{parceiro.email}</span></p>

          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Usuário</label>
              <input id="nome" type="text" {...register('nome')} className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input id="email" type="email" {...register('email')} disabled className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <Controller
                name="telefone"
                control={control}
                render={({ field: { onChange, name, value } }) => (
                  <IMaskInput
                    mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                    id={name} name={name} value={value || ''} placeholder="(00) 00000-0000"
                    className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    onAccept={(val) => onChange(val)}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="cupom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cupom de Desconto</label>
              <input id="cupom" type="text" {...register('cupom')} className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors">Cancelar</button>
              <button type="submit" className="py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Salvar Alterações</button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Gerenciamento de Senha</h3>
            <button
              type="button"
              onClick={() => setIsConfirmationOpen(true)}
              disabled={isResetting}
              className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <KeyIcon />
              {isResetting ? 'Resetando...' : 'Resetar Senha para Padrão'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              A senha do usuário será alterada para <strong className="font-mono text-gray-700 dark:text-gray-300">'medsinaiparceiro'</strong>.
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={executePasswordReset}
        title="Resetar Senha?"
        message="Tem certeza que deseja resetar a senha deste usuário para o padrão? Esta ação não pode ser desfeita."
      />
    </>
  );
}
