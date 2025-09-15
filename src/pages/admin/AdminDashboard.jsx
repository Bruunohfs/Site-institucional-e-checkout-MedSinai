// src/pages/admin/AdminDashboard.jsx

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard do Administrador</h1>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Bem-vindo ao seu Centro de Controle!</h2>
        <p className="text-gray-400 mt-2">
          Este é o seu painel de administração. Use o menu à esquerda para gerenciar parceiros,
          adicionar materiais de apoio e visualizar relatórios de negócio.
        </p>
        <p className="text-gray-400 mt-4">
          As próximas etapas do nosso desenvolvimento (Sprints 2 e 3) irão popular
          as seções de "Parceiros" e "Conteúdo" com funcionalidades.
        </p>
      </div>
    </div>
  );
}
