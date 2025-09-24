// src/pages/admin/GerenciarClientes.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export default function GerenciarClientes() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssinaturas = async () => {
      setLoading(true);
      // Usamos a relação para buscar dados do cliente junto com a assinatura!
      const { data, error } = await supabase
        .from('assinaturas')
        .select(`
          *,
          clientes ( nome, email )
        `)
        .order('data_criacao', { ascending: false });

      if (error) {
        setError('Não foi possível carregar os clientes.');
        console.error(error);
      } else {
        setAssinaturas(data);
      }
      setLoading(false);
    };
    fetchAssinaturas();
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando clientes...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Gerenciamento de Clientes e Assinaturas</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">Status da Assinatura</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">Valor Mensal</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">Data de Início</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
              {assinaturas.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white">{sub.clientes.nome}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{sub.clientes.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                    {sub.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {format(new Date(sub.data_criacao), 'dd/MM/yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
