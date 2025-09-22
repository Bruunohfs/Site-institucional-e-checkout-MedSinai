import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

const ChevronDownIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const PromoteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>;

// --- COMPONENTE DE LINHA/CARD (COM BOTÃO DE PROMOVER) ---
function LeadParceiroRow({ lead, onUpdate, userEmail, isExpanded, onToggle, onPromote }) {
  const [editableLead, setEditableLead] = useState({ ...lead });
  const [isSaving, setIsSaving] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const allStatusOptions = ['novo', 'em análise', 'aprovado', 'rejeitado'];
  const statusOptions = lead.status !== 'novo' ? allStatusOptions.filter(opt => opt !== 'novo') : allStatusOptions;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableLead(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (editableLead.status === lead.status) {
      alert("Nenhuma alteração de status para salvar.");
      return;
    }
    setIsSaving(true);
    const updatedData = {
      status: editableLead.status,
      responsavel_aprovacao: userEmail,
      data_aprovacao: new Date().toISOString(),
    };
    const { data: updatedLeadData, error } = await supabase.from('leads_parceiros').update(updatedData).eq('id', lead.id).select().single();
    setIsSaving(false);
    if (error) {
      console.error("Erro ao atualizar o lead de parceiro:", error);
      alert("Falha ao salvar as alterações.");
    } else {
      onUpdate(updatedLeadData);
      alert("Status do parceiro atualizado com sucesso!");
    }
  };

  const handlePromote = async () => {
    if (lead.status !== 'aprovado') {
      alert('Para promover, o status do candidato deve ser "Aprovado".');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja criar um usuário de parceiro para ${lead.nome}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setIsPromoting(true);
    await onPromote(lead.id);
    setIsPromoting(false);
  };

  return (
    <>
      {/* VISTA DESKTOP */}
      <tr className="hidden md:table-row bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 align-top">
        <td className="px-4 py-4">
          <div className="font-medium text-gray-900 dark:text-white">{lead.nome}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{lead.telefone}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recebido: {format(new Date(lead.created_at), 'dd/MM/yy HH:mm')}</div>
        </td>
        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2">{lead.experiencia}</p>
            <button onClick={onToggle} className={`p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} title="Ver estratégia completa">
              <ChevronDownIcon />
            </button>
          </div>
        </td>
        <td className="px-4 py-4 space-y-2">
          {lead.responsavel_aprovacao && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última atualização por:  
<strong>{lead.responsavel_aprovacao}</strong>  
em {format(new Date(lead.data_aprovacao), 'dd/MM/yy HH:mm')}
            </p>
          )}
          <select name="status" value={editableLead.status || 'novo'} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm">
            {statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
          </select>
        </td>
        <td className="px-4 py-4 text-center">
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
            {isSaving ? '...' : 'Salvar'}
          </button>
        </td>
        <td className="px-4 py-4 text-center">
          {lead.status === 'promovido' || lead.id_usuario_auth ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
              ✓ Promovido
            </span>
          ) : (
            <button
              onClick={handlePromote}
              disabled={isPromoting || lead.status !== 'aprovado'}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              <PromoteIcon />
              {isPromoting ? '...' : 'Promover'}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="hidden md:table-row bg-gray-50 dark:bg-gray-900/50">
          <td colSpan="5" className="px-6 py-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="font-bold text-md mb-2 text-gray-800 dark:text-white">Estratégia de Venda Completa:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.experiencia}</p>
            </div>
          </td>
        </tr>
      )}

      {/* VISTA MOBILE */}
      <div className="md:hidden p-4 border-b dark:border-gray-700">
        <div className="mb-4">
          <div className="font-bold text-lg text-gray-900 dark:text-white">{lead.nome}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{lead.telefone}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recebido em: {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</div>
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-300 my-2 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">"{lead.experiencia}"</p>
        <div className="space-y-3 mt-4">
          {lead.responsavel_aprovacao && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Última atualização por: <strong>{lead.responsavel_aprovacao}</strong> em {format(new Date(lead.data_aprovacao), 'dd/MM/yy HH:mm')}
              </p>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
            <select name="status" value={editableLead.status || 'novo'} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm mt-1">
              {statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
            {isSaving ? 'Salvando...' : 'Salvar Status'}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {lead.status === 'promovido' || lead.id_usuario_auth ? (
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                ✓ Parceiro Promovido
              </span>
            </div>
          ) : (
            <button
              onClick={handlePromote}
              disabled={isPromoting || lead.status !== 'aprovado'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              <PromoteIcon />
              {isPromoting ? 'Promovendo...' : 'Promover a Parceiro'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// --- COMPONENTE PRINCIPAL ---
function GerenciarLeadsParceiros() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    const fetchSessionAndLeads = async () => {
      setLoading(true);
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      }
      let query = supabase.from('leads_parceiros').select('*').order('created_at', { ascending: false });
      if (filter !== 'todos') query = query.eq('status', filter);
      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar leads de parceiros:', error);
        setError('Não foi possível carregar os leads.');
      } else {
        setLeads(data);
      }
      setLoading(false);
    };
    fetchSessionAndLeads();
  }, [filter, user]);

  const handleLeadUpdate = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(lead => (lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead)));
  };

  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

const handlePromoteLead = (leadId) => {
  // 1. Atualiza a interface imediatamente e permanentemente.
  // Esta é a nossa "fonte da verdade" visual a partir de agora.
  handleLeadUpdate({ id: leadId, status: 'promovido' });

  // 2. Dispara a Edge Function em segundo plano e NÃO espera pela resposta.
  // O código não vai parar aqui, ele continua e a função termina.
  supabase.functions.invoke('promote-lead-to-partner', {
    body: { leadId },
  });

  // 3. (Opcional) Você pode adicionar um alerta de "iniciado" se quiser.
  alert("Processo de promoção iniciado! O parceiro será criado em segundo plano.");
};

  if (loading && leads.length === 0) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidatos a Parceiros</h1>
          <p className="text-gray-600 dark:text-gray-400">Analise e gerencie os cadastros de novos parceiros.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('todos')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'todos' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Todos</button>
          <button onClick={() => setFilter('novo')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'novo' ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-gray-700'}`}>Novos</button>
          <button onClick={() => setFilter('aprovado')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'aprovado' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Aprovados</button>
          <button onClick={() => setFilter('rejeitado')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'rejeitado' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Rejeitados</button>
          <button onClick={() => setFilter('em análise')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'em análise' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Em Análise</button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          {loading && <p className="p-4 text-center">Atualizando lista...</p>}
          {!loading && leads.length === 0 && <p className="text-center p-8 text-gray-500">Nenhum candidato encontrado para este filtro.</p>}
          {!loading && leads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-300 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Candidato</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estratégia de Venda</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gerenciamento</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Promover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                  {leads.map((lead) => (
                    <LeadParceiroRow 
                      key={lead.id} 
                      lead={lead} 
                      onUpdate={handleLeadUpdate} 
                      userEmail={user?.email} 
                      isExpanded={expandedRowId === lead.id} 
                      onToggle={() => toggleRowExpansion(lead.id)}
                      onPromote={handlePromoteLead}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarLeadsParceiros;
