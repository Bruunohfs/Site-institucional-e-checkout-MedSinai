// src/pages/admin/MinhaContaAdmin.jsx - VERSÃO PARA O ADMIN

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from '@/lib/supabaseClient.js';
import { useNotification } from '@/components/notifications/NotificationContext';
import { User, KeyRound, Save, XCircle, CheckCircle2 } from 'lucide-react';

// --- Componentes de UI Reutilizáveis ---
const SectionCard = ({ title, icon, children }) => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">{icon}<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2></div><div className="space-y-4">{children}</div></div> );
const FormField = ({ label, id, type = "text", register, error, ...props }) => ( <div><label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><input type={type} id={id} {...register} {...props} className={`w-full p-2.5 rounded-md border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:outline-none transition`} />{error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}</div> );
const PasswordStrengthValidator = ({ password = '' }) => {
  const checks = [
    { text: 'Pelo menos 8 caracteres', valid: password.length >= 8 },
    { text: 'Pelo menos 1 letra maiúscula', valid: /[A-Z]/.test(password) },
    { text: 'Pelo menos 1 número', valid: /[0-9]/.test(password) },
    { text: 'Pelo menos 1 caractere especial (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 space-y-1.5">
      {checks.map((check, index) => (
        <div key={index} className={`flex items-center gap-2 text-xs ${check.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {check.valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          <span>{check.text}</span>
        </div>
      ))}
    </div>
  );
};

// --- Componente Principal ---
export default function MinhaContaAdmin() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  
  const { register: registerInfo, handleSubmit: handleSubmitInfo, control: controlInfo, formState: { errors: errorsInfo }, setValue: setValueInfo } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, watch: watchPassword, reset: resetPassword } = useForm({ mode: 'onChange' });

  const newPasswordValue = watchPassword('newPassword');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data: profile, error } = await supabase.from('profiles').select('nome_completo, telefone').eq('id', user.id).single();
      if (error) { addNotification('Não foi possível carregar os dados da sua conta.', 'error'); } 
      else if (profile) {
        setValueInfo('nome_completo', profile.nome_completo || '');
        setValueInfo('telefone', profile.telefone || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, setValueInfo, addNotification]);

  const onUpdateInfo = async (data) => {
    const { error } = await supabase.from('profiles').update({ nome_completo: data.nome_completo, telefone: data.telefone }).eq('id', user.id);
    if (error) { addNotification(`Erro ao atualizar dados: ${error.message}`, 'error'); } 
    else { addNotification('Dados pessoais atualizados com sucesso!', 'success'); window.dispatchEvent(new CustomEvent('profileUpdated')); }
  };

  const onUpdatePassword = async (data) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: data.currentPassword });
    if (signInError) { addNotification('A sua senha atual está incorreta.', 'error'); return; }
    const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });
    if (updateError) {
      let friendlyMessage = updateError.message.includes('New password should be different') ? 'A nova senha não pode ser igual à senha antiga.' : `Erro: ${updateError.message}`;
      addNotification(friendlyMessage, 'error');
    } else {
      addNotification('Senha alterada com sucesso!', 'success');
      resetPassword();
    }
  };

  if (loading) { return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando dados da conta...</div>; }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <title>Minha Conta | Painel Admin MedSinai</title>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Minha Conta de Administrador</h1>
      <div className="space-y-8">
        
        <SectionCard title="Dados Pessoais" icon={<User className="w-6 h-6 text-blue-500" />}>
          <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="space-y-4">
            <FormField label="Seu E-mail (não pode ser alterado)" id="email" type="email" defaultValue={user?.email} readOnly className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
            <FormField label="Nome Completo" id="nome_completo" register={registerInfo('nome_completo', { required: 'O nome é obrigatório' })} error={errorsInfo.nome_completo} />
            <div><label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label><Controller name="telefone" control={controlInfo} rules={{ required: "O telefone é obrigatório", minLength: { value: 14, message: "Telefone incompleto" } }} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]} id={name} name={name} value={value || ''} placeholder="(00) 00000-0000" className={`w-full p-2.5 rounded-md border ${errorsInfo.telefone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:outline-none transition`} onAccept={(val) => onChange(val)} /> )} />{errorsInfo.telefone && <p className="text-red-500 text-xs mt-1">{errorsInfo.telefone.message}</p>}</div>
            <div className="text-right pt-2"><button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Salvar Alterações</button></div>
          </form>
        </SectionCard>

        <SectionCard title="Alterar Senha" icon={<KeyRound className="w-6 h-6 text-orange-500" />}>
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <FormField label="Senha Atual" id="currentPassword" type="password" register={registerPassword('currentPassword', { required: 'Sua senha atual é obrigatória' })} error={errorsPassword.currentPassword} />
            <FormField label="Nova Senha" id="newPassword" type="password" register={registerPassword('newPassword', { required: 'A nova senha é obrigatória', minLength: { value: 8, message: 'A senha deve ter no mínimo 8 caracteres' }, validate: { hasUpper: value => /[A-Z]/.test(value) || 'A senha deve conter uma letra maiúscula.', hasLower: value => /[a-z]/.test(value) || 'A senha deve conter uma letra minúscula.', hasNumber: value => /[0-9]/.test(value) || 'A senha deve conter um número.', hasSpecialChar: value => /[^A-Za-z0-9]/.test(value) || 'A senha deve conter um caractere especial.', } })} error={errorsPassword.newPassword} />
            <PasswordStrengthValidator password={newPasswordValue} />
            <FormField label="Confirmar Nova Senha" id="confirmPassword" type="password" register={registerPassword('confirmPassword', { required: 'A confirmação é obrigatória', validate: value => value === watchPassword('newPassword') || 'As senhas não coincidem' })} error={errorsPassword.confirmPassword} />
            <div className="text-right pt-2"><button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Alterar Senha</button></div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
