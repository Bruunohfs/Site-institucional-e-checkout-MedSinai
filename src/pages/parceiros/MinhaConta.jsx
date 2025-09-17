import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from '@/lib/supabaseClient.js';

// Componente reutilizável para os cards de seção
const SectionCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
      {title}
    </h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// Componente reutilizável para os campos de formulário
const FormField = ({ label, id, type = "text", register, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      {...register}
      {...props}
      className={`w-full p-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

export default function MinhaContaPage() {
  const { user } = useOutletContext();
  const [infoNotification, setInfoNotification] = useState({ show: false, message: '', type: '' });
  const [passwordNotification, setPasswordNotification] = useState({ show: false, message: '', type: '' });


  // Formulário para dados pessoais
  const { register: registerInfo, handleSubmit: handleSubmitInfo, control: controlInfo, formState: { errors: errorsInfo }, setValue: setValueInfo } = useForm();

  
  // Formulário para senha
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, watch: watchPassword, reset: resetPassword } = useForm();

  // Preenche o formulário com os dados do usuário quando a página carrega
  useEffect(() => {
    if (user) {
      setValueInfo('nome', user.user_metadata?.nome || '');
      setValueInfo('telefone', user.phone || '');
    }
  }, [user, setValueInfo]);

  // Função para atualizar dados pessoais
const onUpdateInfo = async (data) => {
  const { error } = await supabase.auth.updateUser({
    // REMOVA A LINHA ABAIXO:
    // phone: data.telefone, 
    
    // E ADICIONE O TELEFONE DENTRO DOS METADADOS (data):
    data: { 
      nome: data.nome,
      telefone: data.telefone // <<< A MÁGICA ACONTECE AQUI
    }
  });

  if (error) {
    // Como não estamos mais usando o campo 'phone', o erro de SMS não deve mais acontecer.
    // Mas mantemos um tratamento de erro genérico por segurança.
    setInfoNotification({ show: true, message: `Erro ao atualizar dados: ${error.message}`, type: 'error' });
  } else {
    setInfoNotification({ show: true, message: 'Dados atualizados com sucesso!', type: 'success' });
  }
  setTimeout(() => setInfoNotification({ show: false, message: '', type: '' }), 4000);
};

  // Função para atualizar a senha
const onUpdatePassword = async (data) => {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.currentPassword,
  });

  if (signInError) {
    setPasswordNotification({ show: true, message: 'A sua senha atual está incorreta.', type: 'error' });
    setTimeout(() => setPasswordNotification({ show: false, message: '', type: '' }), 4000);
    return;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: data.newPassword
  });

  if (updateError) {
    let friendlyMessage = `Erro ao alterar senha: ${updateError.message}`; // Mensagem padrão

    // Mapeamento de erros específicos
    if (updateError.message.includes('New password should be different from the old password')) {
      friendlyMessage = 'A nova senha não pode ser igual à senha antiga.';
    }
    
    setPasswordNotification({ show: true, message: friendlyMessage, type: 'error' });
  } else {
    setPasswordNotification({ show: true, message: 'Senha alterada com sucesso!', type: 'success' });
    resetPassword();
  }
  setTimeout(() => setPasswordNotification({ show: false, message: '', type: '' }), 4000);
};

  return (
    <div className="notranslate p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        Minha Conta
      </h1>

      <div className="space-y-8">
        {/* Seção de Dados Pessoais */}
        <SectionCard title="Dados Pessoais">
          <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="space-y-4">
            <FormField
              label="Seu E-mail (não pode ser alterado)"
              id="email"
              type="email"
              defaultValue={user?.email}
              readOnly
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <FormField
              label="Nome Completo"
              id="nome"
              register={registerInfo('nome', { required: 'O nome é obrigatório' })}
              error={errorsInfo.nome}
            />
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <Controller
                name="telefone"
                control={controlInfo} // Usamos o 'control' do formulário de informações
                rules={{ 
                  required: "O telefone é obrigatório", 
                  minLength: { value: 14, message: "Telefone incompleto" } // Validação de tamanho
                }}
                render={({ field: { onChange, name, value } }) => (
                  <IMaskInput
                    mask={[
                      { mask: '(00) 0000-0000' },
                      { mask: '(00) 00000-0000' }
                    ]}
                    id={name}
                    name={name}
                    value={value || ''} // Garante que o valor nunca seja nulo
                    placeholder="(00) 00000-0000"
                    className={`w-full p-3 rounded-lg border ${errorsInfo.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    onAccept={(val) => onChange(val)} // Atualiza o formulário com o valor mascarado
                  />
                )}
              />
              {errorsInfo.telefone && <p className="text-red-500 text-xs mt-1">{errorsInfo.telefone.message}</p>}
            </div>
             {infoNotification.show && (
                <div className={`p-3 rounded-md text-sm text-center ${infoNotification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {infoNotification.message}
             </div>
              )}
            <div className="text-right">
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Salvar Alterações
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Seção de Alteração de Senha */}
        <SectionCard title="Alterar Senha">
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <FormField
              label="Senha Atual"
              id="currentPassword"
              type="password"
              register={registerPassword('currentPassword', { required: 'Sua senha atual é obrigatória' })}
              error={errorsPassword.currentPassword}
            />
            <FormField
              label="Nova Senha"
              id="newPassword"
              type="password"
              register={registerPassword('newPassword', { required: 'A nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres' } })}
              error={errorsPassword.newPassword}
            />
            <FormField
              label="Confirmar Nova Senha"
              id="confirmPassword"
              type="password"
              register={registerPassword('confirmPassword', {
                required: 'A confirmação é obrigatória',
                validate: value => value === watchPassword('newPassword') || 'As senhas não coincidem'
              })}
              error={errorsPassword.confirmPassword}
            />
             {passwordNotification.show && (
             <div className={`p-3 rounded-md text-sm text-center ${passwordNotification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
             {passwordNotification.message}
             </div>
              )}
            <div className="text-right">
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Alterar Senha
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
