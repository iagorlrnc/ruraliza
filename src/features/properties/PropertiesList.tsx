import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency, formatArea } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2, Search, Star, Eye, Tag, X } from 'lucide-react';
import DetalheImovel from '../../pages/DetalheImovel';

const PropertiesList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: api.getProperties
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteProperty,
    onSuccess: () => {
      showToast('Propriedade excluída com sucesso (Soft Delete).', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      showToast('Erro ao excluir propriedade.', 'error');
    }
  });

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o imóvel ${code}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const bLower = busca.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(bLower) ||
      p.codigo.toLowerCase().includes(bLower) ||
      p.cidade.toLowerCase().includes(bLower) ||
      p.tipo.toLowerCase().includes(bLower)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Gestão de Imóveis</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Cadastre, edite e organize o catálogo de propriedades rurais.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to="/imoveis/categorias"
              className="rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 py-2.5 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Tag className="h-4 w-4" /> Categorias
            </Link>
            <Link
              to="/imoveis/novo"
              className="rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-2.5 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-primary-dark/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Novo Imóvel
            </Link>
          </div>
        )}
      </div>

      {/* Search Input bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 px-4 py-3 rounded-2xl shadow-sm">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Pesquisar por título, código interno, tipo ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
        />
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white dark:bg-zinc-900 skeleton-shimmer"></div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl text-center space-y-3">
          <p className="text-xs text-gray-500">Nenhum imóvel corresponde aos critérios.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Cód.</th>
                  <th className="px-6 py-4">Imóvel</th>
                  <th className="px-6 py-4">Visualizações</th>
                  <th className="px-6 py-4">Localização</th>
                  <th className="px-6 py-4">Área</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-center">Destaque</th>
                  <th className="px-6 py-4">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-sans">
                {filteredProperties.map((prop) => (
                  <tr 
                    key={prop.id} 
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className="hover:bg-primary-medium/5 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-primary-medium dark:text-primary-light">
                      {prop.codigo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 dark:text-white line-clamp-1 max-w-[200px]">
                        {prop.titulo}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {prop.modalidade === 'Venda' ? 'Venda' : 'Aluguel'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1 text-gray-550 dark:text-zinc-400 font-mono font-medium">
                         <Eye className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {prop.visualizacoes || 0}
                       </span>
                     </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                      {prop.cidade} - {prop.estado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatArea(prop.area_total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-zinc-200">
                      {formatCurrency(prop.valor)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {prop.destaque ? (
                        <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-700">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-[6px] font-bold text-[9px] uppercase tracking-wide ${
                        prop.status === 'Ativo'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {prop.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/imoveis/editar/${prop.id}`); }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-600 dark:text-zinc-350 transition-colors inline-flex items-center cursor-pointer"
                          title="Editar Imóvel"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(prop.id, prop.codigo); }}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-600 transition-colors inline-flex items-center cursor-pointer"
                          title="Excluir Imóvel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulated Public Detail Modal */}
      {selectedPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-beige dark:bg-zinc-950 w-full max-w-7xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-medium animate-pulse" />
                <div>
                  <h3 className="font-poppins text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                    Visualização do Anúncio
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPropertyId(null)}
                className="rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-350 p-2.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <X className="h-4 w-4" /> Fechar
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              <DetalheImovel id={selectedPropertyId} isPreview={true} onClose={() => setSelectedPropertyId(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesList;
