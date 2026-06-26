import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDate, formatPhone } from '../../utils/format';
import { Search, ShieldAlert, BadgeCheck, Eye } from 'lucide-react';

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers
  });

  const filteredUsers = users.filter((u) => {
    const bLower = busca.toLowerCase();
    const matchSearch =
      u.nome.toLowerCase().includes(bLower) ||
      u.email.toLowerCase().includes(bLower) ||
      (u.telefone && u.telefone.includes(bLower));

    const matchPerfil = filtroPerfil ? u.perfil === filtroPerfil : true;
    const matchStatus = filtroStatus ? u.status === filtroStatus : true;

    return matchSearch && matchPerfil && matchStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Gestão de Usuários (CRM)</h2>
          <p className="text-xs text-gray-500 mt-0.5">Monitore os perfis dos clientes, administradores e histórico de interações.</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="sm:col-span-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail, telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
          />
        </div>
        <div>
          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
          >
            <option value="">Todos os perfis</option>
            <option value="Cliente">Clientes</option>
            <option value="Administrador">Administradores</option>
          </select>
        </div>
        <div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white dark:bg-zinc-900 skeleton-shimmer"></div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl text-center text-xs text-gray-400">
          Nenhum usuário corresponde aos filtros.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Canais de Contato</th>
                  <th className="px-6 py-4">Localização</th>
                  <th className="px-6 py-4">Data de Cadastro</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-sans">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {u.nome}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-[11px] text-gray-500 dark:text-zinc-400">
                        <span className="block font-medium">{u.email}</span>
                        <span className="block">{formatPhone(u.telefone)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                      {u.cidade || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] font-bold text-[9px] uppercase tracking-wide ${
                        u.perfil === 'Administrador'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30'
                          : 'bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30'
                      }`}>
                        {u.perfil === 'Administrador' ? (
                          <>
                            <ShieldAlert className="h-2.5 w-2.5" /> Admin
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="h-2.5 w-2.5" /> Cliente
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-[6px] font-bold text-[9px] uppercase tracking-wide ${
                        u.status === 'Ativo'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/usuarios/${u.id}`)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-600 dark:text-zinc-350 transition-colors inline-flex items-center cursor-pointer"
                        title="Ver Histórico do Usuário"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
