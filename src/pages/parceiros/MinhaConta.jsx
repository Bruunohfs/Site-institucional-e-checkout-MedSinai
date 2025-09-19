// src/pages/parceiros/MinhaConta.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from '@/lib/supabaseClient.js';

// --- Componentes de UI Reutilizáveis ---
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

// --- Lista de Bancos Brasileiros ---
const LISTA_BANCOS = [
  { codigo: '001', nome: 'Banco do Brasil S.A.' },
  { codigo: '237', nome: 'Bradesco S.A.' },
  { codigo: '341', nome: 'Itaú Unibanco S.A.' },
  { codigo: '104', nome: 'Caixa Econômica Federal' },
  { codigo: '033', nome: 'Santander (Brasil) S.A.' },
  { codigo: '745', nome: 'Citibank S.A.' },
  { codigo: '399', nome: 'HSBC Bank Brasil S.A.' },
  { codigo: '422', nome: 'Banco Safra S.A.' },
  { codigo: '633', nome: 'Banco Rendimento S.A.' },
  { codigo: '260', nome: 'Nu Pagamentos S.A. (Nubank)' },
  { codigo: '077', nome: 'Banco Inter S.A.' },
  { codigo: '336', nome: 'Banco C6 S.A.' },
  { codigo: '290', nome: 'PagSeguro Internet S.A.' },
  { codigo: '323', nome: 'Mercado Pago' },
];

// --- Componente Principal ---
export default function MinhaContaPage() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);

  // Estados de Notificação
  const [infoNotification, setInfoNotification] = useState({ show: false, message: '', type: '' });
  const [passwordNotification, setPasswordNotification] = useState({ show: false, message: '', type: '' });
  const [bancoNotification, setBancoNotification] = useState({ show: false, message: '', type: '' });

  // Hooks de Formulário
  const { register: registerInfo, handleSubmit: handleSubmitInfo, control: controlInfo, formState: { errors: errorsInfo }, setValue: setValueInfo } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, watch: watchPassword, reset: resetPassword } = useForm();
  const { register: registerBanco, handleSubmit: handleSubmitBanco, control: controlBanco, formState: { errors: errorsBanco }, setValue: setValueBanco } = useForm();

  // Busca os dados do perfil na tabela 'profiles'
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) {
        console.error("Erro ao buscar perfil:", error);
      } else if (profile) {
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

  // Função para atualizar dados pessoais na tabela 'profiles'
  const onUpdateInfo = async (data) => {
    const { error } = await supabase.from('profiles').update({ nome_completo: data.nome_completo, telefone: data.telefone }).eq('id', user.id);
    if (error) {
      setInfoNotification({ show: true, message: `Erro ao atualizar dados: ${error.message}`, type: 'error' });
    } else {
      setInfoNotification({ show: true, message: 'Dados atualizados com sucesso!', type: 'success' });
    }
    setTimeout(() => setInfoNotification({ show: false, message: '', type: '' }), 4000);
  };

  // Função para atualizar dados bancários na tabela 'profiles'
  const onUpdateBanco = async (data) => {
    const { error } = await supabase.from('profiles').update({ tipo_chave_pix: data.tipo_chave_pix, chave_pix: data.chave_pix, nome_banco: data.nome_banco, agencia: data.agencia, conta_corrente: data.conta_corrente }).eq('id', user.id);
    if (error) {
      setBancoNotification({ show: true, message: `Erro ao atualizar dados bancários: ${error.message}`, type: 'error' });
    } else {
      setBancoNotification({ show: true, message: 'Dados bancários atualizados com sucesso!', type: 'success' });
    }
    setTimeout(() => setBancoNotification({ show: false, message: '', type: '' }), 4000);
  };

  // Função para atualizar a senha no sistema 'auth'
  const onUpdatePassword = async (data) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: data.currentPassword });
    if (signInError) {
      setPasswordNotification({ show: true, message: 'A sua senha atual está incorreta.', type: 'error' });
      setTimeout(() => setPasswordNotification({ show: false, message: '', type: '' }), 4000);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });
    if (updateError) {
      let friendlyMessage = `Erro ao alterar senha: ${updateError.message}`;
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

  if (loading) {
    return <div className="p-8 text-center">Carregando dados da conta...</div>;
  }

  return (
    <div className="notranslate p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Minha Conta</h1>
      <div className="space-y-8">
        {/* Seção de Dados Pessoais */}
        <SectionCard title="Dados Pessoais">
          <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="space-y-4">
            <FormField label="Seu E-mail (não pode ser alterado)" id="email" type="email" defaultValue={user?.email} readOnly className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
            <FormField label="Nome Completo" id="nome_completo" register={registerInfo('nome_completo', { required: 'O nome é obrigatório' })} error={errorsInfo.nome_completo} />
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <Controller name="telefone" control={controlInfo} rules={{ required: "O telefone é obrigatório", minLength: { value: 14, message: "Telefone incompleto" } }} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]} id={name} name={name} value={value || ''} placeholder="(00) 00000-0000" className={`w-full p-3 rounded-lg border ${errorsInfo.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none`} onAccept={(val) => onChange(val)} /> )} />
              {errorsInfo.telefone && <p className="text-red-500 text-xs mt-1">{errorsInfo.telefone.message}</p>}
            </div>
            {infoNotification.show && ( <div className={`p-3 rounded-md text-sm text-center ${infoNotification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{infoNotification.message}</div> )}
            <div className="text-right"><button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Salvar Alterações</button></div>
          </form>
        </SectionCard>

        {/* Seção de Dados de Pagamento */}
        <SectionCard title="Dados de Pagamento">
          <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-6">Preencha os dados abaixo para receber suas comissões. Priorizamos o pagamento via PIX.</p>
          <form onSubmit={handleSubmitBanco(onUpdateBanco)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipo_chave_pix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Chave PIX</label>
                <select id="tipo_chave_pix" {...registerBanco('tipo_chave_pix')} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                  <option value="">Selecione um tipo</option>
                  <option value="CPF/CNPJ">CPF/CNPJ</option>
                  <option value="Email">E-mail</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Aleatória">Chave Aleatória</option>
                </select>
              </div>
              <FormField label="Chave PIX" id="chave_pix" register={registerBanco('chave_pix')} error={errorsBanco.chave_pix} />
            </div>
            <p className="text-center text-xs text-gray-400 my-4">Ou, se preferir, preencha os dados para TED/DOC:</p>
            <div>
              <label htmlFor="nome_banco" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Banco</label>
              <select id="nome_banco" {...registerBanco('nome_banco')} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                <option value="">Selecione seu banco</option>
                {LISTA_BANCOS.map(banco => ( <option key={banco.codigo} value={banco.nome}>{banco.codigo} - {banco.nome}</option> ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="agencia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agência (sem dígito)</label>
                <Controller name="agencia" control={controlBanco} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={'0000'} id={name} name={name} value={value || ''} placeholder="Ex: 1234" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200" onAccept={(val) => onChange(val)} /> )} />
              </div>
              <div>
                <label htmlFor="conta_corrente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conta Corrente (com dígito)</label>
                <Controller name="conta_corrente" control={controlBanco} render={({ field: { onChange, name, value } }) => ( <IMaskInput mask={'00000000-0'} id={name} name={name} value={value || ''} placeholder="Ex: 12345-6" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200" onAccept={(val) => onChange(val)} /> )} />
              </div>
            </div>
            {bancoNotification.show && ( <div className={`p-3 rounded-md text-sm text-center ${bancoNotification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{bancoNotification.message}</div> )}
            <div className="text-right pt-4"><button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Salvar Dados de Pagamento</button></div>
          </form>
        </SectionCard>

        {/* Seção de Alteração de Senha */}
        <SectionCard title="Alterar Senha">
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <FormField label="Senha Atual" id="currentPassword" type="password" register={registerPassword('currentPassword', { required: 'Sua senha atual é obrigatória' })} error={errorsPassword.currentPassword} />
            <FormField label="Nova Senha" id="newPassword" type="password" register={registerPassword('newPassword', { required: 'A nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres' } })} error={errorsPassword.newPassword} />
            <FormField label="Confirmar Nova Senha" id="confirmPassword" type="password" register={registerPassword('confirmPassword', { required: 'A confirmação é obrigatória', validate: value => value === watchPassword('newPassword') || 'As senhas não coincidem' })} error={errorsPassword.confirmPassword} />
            {passwordNotification.show && ( <div className={`p-3 rounded-md text-sm text-center ${passwordNotification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{passwordNotification.message}</div> )}
            <div className="text-right"><button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Alterar Senha</button></div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
