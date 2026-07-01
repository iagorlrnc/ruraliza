import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Save, X, Image as ImageIcon, 
  Tag, AlertCircle 
} from 'lucide-react';
import { Categoria } from '../../types';

const CategoriasList: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Categoria> | null>(null);
  const [nome, setNome] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: api.getProperties
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Categoria> & { nome: string; tipo: string }) => api.saveCategory(payload),
    onSuccess: () => {
      showToast(
        editingCategory?.id ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.', 
        'success'
      );
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Erro ao salvar categoria. O Tipo ou Nome deve ser único.', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      showToast('Categoria excluída com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Erro ao excluir categoria.', 'error');
    }
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setNome('');
    setImagemUrl('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCategory(cat);
    setNome(cat.nome);
    setImagemUrl(cat.imagem || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setNome('');
    setImagemUrl('');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload using API method (defaults to bucket 'imoveis' as categories represent property categories)
      const url = await api.uploadFile(file, 'imoveis');
      setImagemUrl(url);
      showToast('Imagem carregada com sucesso!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao fazer upload da imagem.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showToast('Nome da categoria é obrigatório.', 'error');
      return;
    }

    saveMutation.mutate({
      id: editingCategory?.id,
      nome: nome.trim(),
      tipo: editingCategory?.tipo || nome.trim(),
      imagem: imagemUrl
    });
  };

  const handleDelete = (cat: Categoria) => {
    // Count associated properties
    const propertyCount = properties.filter(p => p.tipo === cat.tipo).length;
    
    if (propertyCount > 0) {
      showToast(
        `Não é possível excluir esta categoria. Existem ${propertyCount} imóvel(is) vinculados ao tipo "${cat.tipo}".`, 
        'error'
      );
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${cat.nome}"?`)) {
      deleteMutation.mutate(cat.id);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link 
            to="/imoveis" 
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-medium dark:text-zinc-400 dark:hover:text-primary-light font-medium transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para imóveis
          </Link>
          <h2 className="font-poppins text-xl font-bold text-gray-800 dark:text-white">
            Gestão de Categorias
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Cadastre, edite e organize as categorias de imóveis rurais exibidas na vitrine principal do site.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="rounded-xl bg-primary-dark hover:bg-primary-medium text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-medium border-t-transparent mx-auto"></div>
          <p className="text-xs text-gray-500 font-medium">Carregando categorias...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-primary-medium/10 text-primary-medium flex items-center justify-center mx-auto">
            <Tag className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Nenhuma Categoria Encontrada</h3>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Parece que não há categorias cadastradas no sistema. Comece criando uma agora mesmo.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="rounded-xl bg-primary-dark hover:bg-primary-medium text-white px-4 py-2 text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Cadastrar Primeira Categoria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = properties.filter(p => p.tipo === cat.tipo).length;
            return (
              <div 
                key={cat.id}
                className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Visual Image Banner */}
                <div className="h-36 bg-gray-100 dark:bg-zinc-800 relative overflow-hidden shrink-0">
                  {cat.imagem ? (
                    <img 
                      src={cat.imagem} 
                      alt={cat.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-primary-dark dark:text-white uppercase tracking-wider">
                    {count} {count === 1 ? 'imóvel' : 'imóveis'}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
                      {cat.nome}
                    </h3>
                    <p className="text-[10px] text-primary-medium dark:text-primary-light font-semibold tracking-wider uppercase">
                      Tipo: {cat.tipo}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition-colors border border-gray-100 dark:border-zinc-800"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="flex items-center justify-center p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Fazenda, Chácara, Sítio, Haras, Rancho"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-2">
                  Foto de Capa da Categoria
                </label>
                <div className="flex flex-col gap-3">
                  {imagemUrl ? (
                    <div className="relative h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-zinc-800">
                      <img 
                        src={imagemUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImagemUrl('')}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-750 transition-colors"
                        title="Remover Imagem"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 border-2 border-dashed border-gray-250 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800/40 text-gray-500">
                      <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-[10px]">Nenhuma foto selecionada</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-primary-medium/10 text-primary-dark dark:text-primary-light hover:bg-primary-medium/20 transition-colors cursor-pointer border border-primary-medium/10">
                      <ImageIcon className="h-4 w-4" />
                      {uploading ? 'Enviando...' : 'Carregar Imagem'}
                      <input 
                        type="file" 
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                    <input 
                      type="text"
                      value={imagemUrl}
                      onChange={(e) => setImagemUrl(e.target.value)}
                      placeholder="Ou cole a URL direta da foto..."
                      className="flex-[2] text-[10px] rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {editingCategory && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 p-3 rounded-2xl flex items-start gap-2 text-[10px] text-blue-800 dark:text-blue-400">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Caso existam imóveis cadastrados no tipo "{editingCategory.tipo}", a alteração do Nome ou Foto irá atualizar a vitrine automaticamente, sem quebrar os vínculos.
                  </span>
                </div>
              )}

              {/* Modal Footer actions */}
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/35 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || uploading}
                  className="rounded-xl bg-primary-dark hover:bg-primary-medium text-white px-5 py-2 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasList;
