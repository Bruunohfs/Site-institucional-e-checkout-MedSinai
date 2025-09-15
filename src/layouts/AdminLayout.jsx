// src/layouts/AdminLayout.jsx

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Importe o menu lateral que vamos criar a seguir
import AdminSidebar from '../pages/admin/AdminSidebar'; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lógica de segurança para proteger a rota de Admin
  useEffect(() => {
    const fetchSessionAndCheckRole = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session || error) {
        navigate('/parceiros/login');
        return;
      }

      const userRole = session.user.user_metadata?.role;

      if (userRole !== 'admin') {
        console.warn('Acesso negado: Usuário não é admin.');
        navigate('/parceiros/dashboard'); // Redireciona para a área normal
        return;
      }

      console.log('Acesso de Admin concedido.');
      setUser(session.user);
      setLoading(false);
    };

    fetchSessionAndCheckRole();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/parceiros/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Verificando permissões de administrador...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <AdminSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
