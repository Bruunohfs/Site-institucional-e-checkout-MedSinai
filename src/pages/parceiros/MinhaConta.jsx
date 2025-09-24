// src/pages/parceiros/MinhaConta.jsx - VERSÃO FINAL COM DESIGN PROFISSIONAL

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from '@/lib/supabaseClient.js';
// ==> ATUALIZAÇÃO 1: Importando ícones da Lucide <==
import { User, Landmark, KeyRound, Save, AlertCircle, CheckCircle } from 'lucide-react';

// --- Componentes de UI Reutilizáveis ---
const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
      {icon}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

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
      className={`w-full p-2.5 rounded-md border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:outline-none transition`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

// ==> ATUALIZAÇÃO 2: Componente de notificação com novo estilo e ícone <==
const Notification = ({ message, type }) => {
  if (!message) return null;
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30';
  const textColor = isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
  const icon = isSuccess ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;

  return (
    <div className={`p-3 rounded-md text-sm flex items-center gap-3 ${bgColor} ${textColor}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

// --- Lista de Bancos Brasileiros (sem alteração) ---
const LISTA_BANCOS = [ { codigo: '001', nome: 'Banco do Brasil S.A.' }, { codigo: '237', nome: 'Bradesco S.A.' }, { codigo: '341', nome: 'Itaú Unibanco S.A.' }, { codigo: '104', nome: 'Caixa Econômica Federal' }, { codigo: '033', nome: 'Santander (Brasil) S.A.' }, { codigo: '745', nome: 'Citibank S.A.' }, { codigo: '399', nome: 'HSBC Bank Brasil S.A.' }, { codigo: '422', nome: 'Banco Safra S.A.' }, { codigo: '633', nome: 'Banco Rendimento S.A.' }, { codigo: '260', nome: 'Nu Pagamentos S.A. (Nubank)' }, { codigo: '077', nome: 'Banco Inter S.A.' }, { codigo: '336', nome: 'Banco C6 S.A.' }, { codigo: '290', nome: 'PagSeguro Internet S.A.' }, { codigo: '323', nome: 'Mercado Pago' }, ];

// --- Componente Principal ---
export default function MinhaContaPage() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);

  const [infoNotification, setInfoNotification] = useState({ message: '', type: '' });
  const [passwordNotification, setPasswordNotification] = useState({ message: '', type: '' });
  const [bancoNotification, setBancoNotification] = useState({ message: '', type: '' });

  const { register: registerInfo, handleSubmit: handleSubmitInfo, control: controlInfo, formState: { errors: errorsInfo }, setValue: setValueInfo } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, watch: watchPassword, reset: resetPassword } = useForm();
  const { register: registerBanco, handleSubmit: handleSubmitBanco, control: controlBanco, formState: { errors: errorsBanco }, setValue: setValueBanco } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) { console.error("Erro ao buscar perfil:", error); } 
      else if (profile) {
        setValueInfo('nome_completo', profile.nome_completo || '');
        setValueInfo('telefone', profile.telefone || '');
        setValueBanco('tipo_chave_pix', profile.tipo_chave_pix || '');
        setValueBanco('chave_pix', profile.chave_pix || '');
        setValueBanco('nome_banco', profile.nome_banco || '');
        setValueBanco('agencia', profile.agencia || '');
        setValueBanco('conta_corrente', profile.conta_corrente || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, setValueInfo, setValueBanco]);

  const showNotification = (setter, message, type, duration = 4000) => {
    setter({ message, type });
    setTimeout(() => setter({ message: '', type: '' }), duration);
  };

  const onUpdateInfo = async (data) => {
    const { error } = await supabase.from('profiles').update({ nome_completo: data.nome_completo, telefone: data.telefone }).eq('id', user.id);
    if (error) { showNotification(setInfoNotification, `Erro ao atualizar dados: ${error.message}`, 'error'); } 
    else { showNotification(setInfoNotification, 'Dados atualizados com sucesso!', 'success'); window.dispatchEvent(new CustomEvent('profileUpdated')); }
  };

  const onUpdateBanco = async (data) => {
    const { error } = await supabase.from('profiles').update({ tipo_chave_pix: data.tipo_chave_pix, chave_pix: data.chave_pix, nome_banco: data.nome_banco, agencia: data.agencia, conta_corrente: data.conta_corrente }).eq('id', user.id);
    if (error) { showNotification(setBancoNotification, `Erro ao atualizar dados bancários: ${error.message}`, 'error'); } 
    else { showNotification(setBancoNotification, 'Dados bancários atualizados com sucesso!', 'success'); }
  };

  const onUpdatePassword = async (data) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: data.currentPassword });
    if (signInError) { showNotification(setPasswordNotification, 'A sua senha atual está incorreta.', 'error'); return; }
    const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });
    if (updateError) {
      let friendlyMessage = updateError.message.includes('New password should be different') ? 'A nova senha não pode ser igual à senha antiga.' : `Erro: ${updateError.message}`;
      showNotification(setPasswordNotification, friendlyMessage, 'error');
    } else {
      showNotification(setPasswordNotification, 'Senha alterada com sucesso!', 'success');
      resetPassword();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando dados da conta...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <title>Minha Conta | Portal do Parceiro MedSinai</title>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Minha Conta</h1>
      <div className="space-y-8">
        
        <SectionCard title="Dados Pessoais" icon={<User className="w-6 h-6 text-blue-500" />}>
          <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="space-y-4">
            <FormField label="Seu E-mail (não pode ser alterado)" id="email" type="email" defaultValue={user?.email} readOnly className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
            <FormField label="Nome Completo" id="nome_completo" register={registerInfo('nome_completo', { required: 'O nome é obrigatório' })} error={errorsInfo.nome_completo} />
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <Controller name="telefone" control={controlInfo} rules={{ required: "O telefone é obrigatório", minLength: { value: 14, message: "Telefone incompleto" } }} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]} id={name} name={name} value={value || ''} placeholder="(00) 00000-0000" className={`w-full p-2.5 rounded-md border ${errorsInfo.telefone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:outline-none transition`} onAccept={(val) => onChange(val)} /> )} />
              {errorsInfo.telefone && <p className="text-red-500 text-xs mt-1">{errorsInfo.telefone.message}</p>}
            </div>
            <Notification message={infoNotification.message} type={infoNotification.type} />
            <div className="text-right pt-2"><button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Salvar Alterações</button></div>
          </form>
        </SectionCard>

        <SectionCard title="Dados de Pagamento" icon={<Landmark className="w-6 h-6 text-green-500" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-6">Preencha os dados abaixo para receber suas comissões. Priorizamos o pagamento via PIX.</p>
          <form onSubmit={handleSubmitBanco(onUpdateBanco)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipo_chave_pix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Chave PIX</label>
                <select id="tipo_chave_pix" {...registerBanco('tipo_chave_pix')} className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                  <option value="">Selecione um tipo</option><option value="CPF/CNPJ">CPF/CNPJ</option><option value="Email">E-mail</option><option value="Telefone">Telefone</option><option value="Aleatória">Chave Aleatória</option>
                </select>
              </div>
              <FormField label="Chave PIX" id="chave_pix" register={registerBanco('chave_pix')} error={errorsBanco.chave_pix} />
            </div>
            <p className="text-center text-xs text-gray-400 my-4">Ou, se preferir, preencha os dados para TED/DOC:</p>
            <div>
              <label htmlFor="nome_banco" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Banco</label>
              <select id="nome_banco" {...registerBanco('nome_banco')} className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                <option value="">Selecione seu banco</option>
                {LISTA_BANCOS.map(banco => ( <option key={banco.codigo} value={banco.nome}>{banco.codigo} - {banco.nome}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="agencia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agência (sem dígito)</label>
                <Controller name="agencia" control={controlBanco} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={'0000'} id={name} name={name} value={value || ''} placeholder="Ex: 1234" className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" onAccept={(val) => onChange(val)} /> )} />
              </div>
              <div>
                <label htmlFor="conta_corrente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conta Corrente (com dígito)</label>
                <Controller name="conta_corrente" control={controlBanco} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={'00000000-0'} id={name} name={name} value={value || ''} placeholder="Ex: 12345-6" className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" onAccept={(val) => onChange(val)} /> )} />
              </div>
            </div>
            <Notification message={bancoNotification.message} type={bancoNotification.type} />
            <div className="text-right pt-2"><button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Salvar Dados</button></div>
          </form>
        </SectionCard>

        <SectionCard title="Alterar Senha" icon={<KeyRound className="w-6 h-6 text-orange-500" />}>
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <FormField label="Senha Atual" id="currentPassword" type="password" register={registerPassword('currentPassword', { required: 'Sua senha atual é obrigatória' })} error={errorsPassword.currentPassword} />
            <FormField label="Nova Senha" id="newPassword" type="password" register={registerPassword('newPassword', { required: 'A nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres' } })} error={errorsPassword.newPassword} />
            <FormField label="Confirmar Nova Senha" id="confirmPassword" type="password" register={registerPassword('confirmPassword', { required: 'A confirmação é obrigatória', validate: value => value === watchPassword('newPassword') || 'As senhas não coincidem' })} error={errorsPassword.confirmPassword} />
            <Notification message={passwordNotification.message} type={passwordNotification.type} />
            <div className="text-right pt-2"><button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Alterar Senha</button></div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
