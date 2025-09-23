import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { useNotification } from '../../components/notifications/NotificationContext';

// Componente LeadRow (sem alterações desta vez)
function LeadRow({ lead, onUpdate, userEmail, renderAs }) {
  const { addNotification } = useNotification();
  const [editableLead, setEditableLead] = useState({ ...lead });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditableLead({ ...lead });
  }, [lead]);

  const baseStatusOptions = ['novo', 'em negociação', 'fechado', 'perdido'];
  const statusOptions = lead.status !== 'novo' 
    ? baseStatusOptions.filter(option => option !== 'novo') 
    : baseStatusOptions;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableLead(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = {
      status: editableLead.status,
      anotacoes: editableLead.anotacoes,
      responsavel_contato: userEmail,
      data_ultimo_contato: new Date().toISOString(),
    };

    const { error } = await supabase.from('leads_empresas').update(updatedData).eq('id', lead.id);

    setIsSaving(false);
    
    if (error) {
      addNotification(`Falha ao salvar: ${error.message}`, 'error');
    } else {
      onUpdate({ ...lead, ...updatedData });
      addNotification("Lead atualizado com sucesso!", 'success');
    }
  };

  const formattedLastContact = lead.data_ultimo_contato
    ? `por ${lead.responsavel_contato || 'N/A'} em ${format(new Date(lead.data_ultimo_contato), 'dd/MM/yy HH:mm')}`
    : 'Nenhum contato registrado';

  if (renderAs === 'card') {
    return (
      <div className="p-4">
        <div className="mb-4">
          <div className="font-bold text-lg text-gray-900 dark:text-white">{lead.nome_empresa}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{lead.nome}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Recebido em: {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</div>
        </div>
        <div className="space-y-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Último contato: {formattedLastContact}</div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
            <select name="status" value={editableLead.status || 'novo'} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm mt-1">
              {statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Anotações</label>
            <textarea name="anotacoes" value={editableLead.anotacoes || ''} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm mt-1" placeholder="Adicionar anotação..."/>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <tr className="bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/50 align-top">
      <td className="px-4 py-4">
        <div className="font-medium text-gray-900 dark:text-white">{lead.nome_empresa}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{lead.nome}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Recebido em: {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{lead.telefone}</div>
      </td>
      <td className="px-4 py-4 space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">Último contato: {formattedLastContact}</div>
        <select name="status" value={editableLead.status || 'novo'} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm">
          {statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
        </select>
        <textarea name="anotacoes" value={editableLead.anotacoes || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm" placeholder="Adicionar anotação..."/>
      </td>
      <td className="px-4 py-4 text-center">
        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
          {isSaving ? '...' : 'Salvar'}
        </button>
      </td>
    </tr>
  );
}

function GerenciarLeadsEmpresas() {
  const { addNotification } = useNotification();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    const fetchSessionAndLeads = async () => {
      setLoading(true);
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      }

      let query = supabase.from('leads_empresas').select('*').order('created_at', { ascending: false });

      if (filter !== 'todos') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      
      if (error) {
        setError('Não foi possível carregar os leads.');
        addNotification('Não foi possível carregar os leads.', 'error');
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

  if (loading && leads.length === 0) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Leads de Empresas</h1>
          <p className="text-gray-600 dark:text-gray-400">Filtre, atualize o status e adicione anotações para cada lead.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('todos')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'todos' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Todos</button>
          <button onClick={() => setFilter('novo')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'novo' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Novos</button>
          <button onClick={() => setFilter('em negociação')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'em negociação' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Em Negociação</button>
          <button onClick={() => setFilter('fechado')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'fechado' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Fechados</button>
          <button onClick={() => setFilter('perdido')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'perdido' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Perdidos</button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          {loading && <p className="p-4 text-center">Atualizando lista...</p>}
          {!loading && leads.length === 0 && (
            <p className="text-center p-8 text-gray-500">Nenhum lead encontrado para este filtro.</p>
          )}
          {!loading && leads.length > 0 && (
            <>
              {/* TABELA PARA DESKTOP */}
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full">
                  {/* =================================================================== */}
                  {/* ==> ALTERAÇÃO FINAL APLICADA AQUI <== */}
                  {/* =================================================================== */}
                  <thead className="bg-gray-300 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider w-1/4">Lead</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider w-1/4">Contato</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider w-2/4">Gerenciamento</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                    {leads.map((lead) => (
                      <LeadRow 
                        key={`row-${lead.id}`} 
                        lead={lead} 
                        onUpdate={handleLeadUpdate} 
                        userEmail={user?.email} 
                        renderAs="row"
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* LISTA DE CARDS PARA MOBILE */}
              <div className="md:hidden divide-y divide-gray-300 dark:divide-gray-700">
                {leads.map((lead) => (
                  <LeadRow 
                    key={`card-${lead.id}`} 
                    lead={lead} 
                    onUpdate={handleLeadUpdate} 
                    userEmail={user?.email} 
                    renderAs="card"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarLeadsEmpresas;
