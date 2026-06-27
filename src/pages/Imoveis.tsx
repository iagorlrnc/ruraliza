import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useSEO } from '../hooks/useSEO';
import { formatCurrency, formatArea } from '../utils/format';
import { Search, MapPin, Ruler, Filter, RotateCcw } from 'lucide-react';

const Imoveis: React.FC = () => {
  useSEO('Catálogo de Imóveis', 'Catálogo completo de fazendas, sítios, ranchos e chácaras disponíveis para venda e locação.');
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [modalidade, setModalidade] = useState(searchParams.get('modalidade') || '');
  const [cidade, setCidade] = useState(searchParams.get('cidade') || '');
  const [estado, setEstado] = useState(searchParams.get('estado') || '');
  
  const [precoMin, setPrecoMin] = useState(searchParams.get('precoMin') || '');
  const [precoMax, setPrecoMax] = useState(searchParams.get('precoMax') || '');
  const [areaMin, setAreaMin] = useState(searchParams.get('areaMin') || '');
  const [areaMax, setAreaMax] = useState(searchParams.get('areaMax') || '');
  const [sortBy, setSortBy] = useState('recentes');

  // Synchronize state from query parameters on mount or URL changes
  useEffect(() => {
    setBusca(searchParams.get('busca') || '');
    setTipo(searchParams.get('tipo') || '');
    setModalidade(searchParams.get('modalidade') || '');
    setCidade(searchParams.get('cidade') || '');
    setEstado(searchParams.get('estado') || '');
    setPrecoMin(searchParams.get('precoMin') || '');
    setPrecoMax(searchParams.get('precoMax') || '');
    setAreaMin(searchParams.get('areaMin') || '');
    setAreaMax(searchParams.get('areaMax') || '');
  }, [searchParams]);

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: api.getProperties
  });

  // Apply filters on the client-side for rapid real-time performance
  const filteredProperties = properties.filter((prop) => {
    // 1. Status Check
    if (prop.status !== 'Ativo') return false;

    // 2. Text Search (title, code, description, city)
    if (busca) {
      const bLower = busca.toLowerCase();
      const matchText = 
        prop.titulo.toLowerCase().includes(bLower) ||
        prop.codigo.toLowerCase().includes(bLower) ||
        prop.descricao.toLowerCase().includes(bLower) ||
        prop.cidade.toLowerCase().includes(bLower);
      if (!matchText) return false;
    }

    // 3. Type
    if (tipo && prop.tipo !== tipo) return false;

    // 4. Modalidade (Venda/Aluguel)
    if (modalidade && prop.modalidade !== modalidade) return false;

    // 5. Cidade
    if (cidade && !prop.cidade.toLowerCase().includes(cidade.toLowerCase())) return false;

    // 6. Estado
    if (estado && prop.estado.toLowerCase() !== estado.toLowerCase()) return false;

    // 7. Preço Min
    if (precoMin && prop.valor < Number(precoMin)) return false;

    // 8. Preço Max
    if (precoMax && prop.valor > Number(precoMax)) return false;

    // 9. Área Min
    if (areaMin && prop.area_total < Number(areaMin)) return false;

    // 10. Área Max
    if (areaMax && prop.area_total > Number(areaMax)) return false;

    return true;
  });

  // Sort properties based on active sorting criteria
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'preco-asc') {
      return a.valor - b.valor;
    }
    if (sortBy === 'preco-desc') {
      return b.valor - a.valor;
    }
    if (sortBy === 'views-desc') {
      return (b.visualizacoes || 0) - (a.visualizacoes || 0);
    }
    if (sortBy === 'area-desc') {
      return b.area_total - a.area_total;
    }
    // Default to 'recentes' (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Unique list of cities and states for options dropdown
  const uniqueCities = Array.from(new Set(properties.map(p => p.cidade))).filter(Boolean);
  const uniqueStates = Array.from(new Set(properties.map(p => p.estado))).filter(Boolean);

  const applyFilters = () => {
    const params: any = {};
    if (busca) params.busca = busca;
    if (tipo) params.tipo = tipo;
    if (modalidade) params.modalidade = modalidade;
    if (cidade) params.cidade = cidade;
    if (estado) params.estado = estado;
    if (precoMin) params.precoMin = precoMin;
    if (precoMax) params.precoMax = precoMax;
    if (areaMin) params.areaMin = areaMin;
    if (areaMax) params.areaMax = areaMax;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setBusca('');
    setTipo('');
    setModalidade('');
    setCidade('');
    setEstado('');
    setPrecoMin('');
    setPrecoMax('');
    setAreaMin('');
    setAreaMax('');
    setSearchParams({});
  };

  // Run apply filters when text filters update or inputs change
  const handleInputChange = (setter: Function, val: string) => {
    setter(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="text-left">
        <h1 className="font-poppins text-3xl font-bold text-primary-dark dark:text-white">
          Nossas Propriedades Rurais
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Explore e filtre chácaras, fazendas e sítios com consultoria profissional dedicada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-2xl shadow-sm text-left h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
            <h2 className="font-poppins text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-medium" /> Filtros Avançados
            </h2>
            <button
              onClick={clearFilters}
              className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors font-medium uppercase tracking-wider"
            >
              <RotateCcw className="h-3 w-3" /> Limpar
            </button>
          </div>

          <div className="space-y-4">
            {/* Busca Geral */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Busca Rápida
              </label>
              <input
                type="text"
                placeholder="Nome, código, cidade..."
                value={busca}
                onChange={(e) => handleInputChange(setBusca, e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Tipo do Imóvel
              </label>
              <select
                value={tipo}
                onChange={(e) => handleInputChange(setTipo, e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
              >
                <option value="">Todos os tipos</option>
                <option value="Chácara">Chácara</option>
                <option value="Fazenda">Fazenda</option>
                <option value="Sítio">Sítio</option>
                <option value="Rancho">Rancho</option>
                <option value="Terreno Rural">Terreno Rural</option>
                <option value="Área Agrícola">Área Agrícola</option>
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Modalidade
              </label>
              <select
                value={modalidade}
                onChange={(e) => handleInputChange(setModalidade, e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
              >
                <option value="">Qualquer modalidade</option>
                <option value="Venda">Venda</option>
                <option value="Aluguel">Locação / Aluguel</option>
              </select>
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Cidade
                </label>
                <select
                  value={cidade}
                  onChange={(e) => handleInputChange(setCidade, e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-2 focus:outline-none dark:text-white"
                >
                  <option value="">Todas</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => handleInputChange(setEstado, e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-2 focus:outline-none dark:text-white"
                >
                  <option value="">Todos</option>
                  {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Faixa de Preço */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Preço (R$)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={precoMin}
                  onChange={(e) => handleInputChange(setPrecoMin, e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2 px-2.5 focus:outline-none dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={precoMax}
                  onChange={(e) => handleInputChange(setPrecoMax, e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2 px-2.5 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Faixa de Área */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Área (ha)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={areaMin}
                  onChange={(e) => handleInputChange(setAreaMin, e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2 px-2.5 focus:outline-none dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={areaMax}
                  onChange={(e) => handleInputChange(setAreaMax, e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2 px-2.5 focus:outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-white py-2.5 text-xs font-bold transition-colors cursor-pointer shadow-md text-center"
          >
            Aplicar Filtros
          </button>
        </aside>

        {/* Properties Catalog Grid */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-medium text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 px-5 py-3 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Mostrando <strong className="text-gray-800 dark:text-white">{filteredProperties.length}</strong> de <strong className="text-gray-800 dark:text-white">{properties.filter(p => p.status === 'Ativo').length}</strong> propriedades
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="sort-by" className="font-bold text-gray-700 dark:text-zinc-350">Classificar por:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold rounded-lg border border-gray-250 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-1 px-2 focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="recentes">Mais recentes</option>
                <option value="views-desc">Mais visualizados</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
                <option value="area-desc">Maior área</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl h-80 skeleton-shimmer shadow-sm"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl shadow-sm text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary-medium/10 text-primary-medium mx-auto flex items-center justify-center">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-base text-gray-800 dark:text-white">Sem informações no momento</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Não há imóveis disponíveis cadastrados no sistema.
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl shadow-sm text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary-medium/10 text-primary-medium mx-auto flex items-center justify-center">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-base text-gray-800 dark:text-white">Nenhum imóvel encontrado</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Tente ajustar os filtros, expandir a faixa de preço ou limpar os campos de busca para recomeçar.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 bg-primary-dark hover:bg-primary-medium text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="group bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-left h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={prop.imagens && prop.imagens.length > 0 ? prop.imagens[0].url : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'}
                      alt={prop.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-primary-dark text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                        {prop.tipo}
                      </span>
                      <span className="bg-primary-medium text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                        {prop.modalidade === 'Venda' ? 'Venda' : 'Aluguel'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-zinc-400 font-medium">
                        <MapPin className="h-3 w-3 text-primary-medium shrink-0" />
                        <span>{prop.cidade} - {prop.estado}</span>
                      </div>
                      <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-medium transition-colors">
                        {prop.titulo}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-600 dark:text-zinc-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{formatArea(prop.area_total)}</span>
                      </div>
                      <div className="font-poppins font-bold text-xs text-primary-dark dark:text-primary-light">
                        {prop.modalidade === 'Aluguel' ? `${formatCurrency(prop.valor)}/mês` : formatCurrency(prop.valor)}
                      </div>
                    </div>

                    <div>
                      <Link
                        to={`/imoveis/${prop.id}`}
                        className="w-full block py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] border border-gray-250 dark:border-zinc-800 text-primary-dark dark:text-primary-light hover:bg-primary-medium hover:text-white dark:hover:bg-primary-medium dark:hover:text-white font-poppins text-xs font-bold text-center transition-all cursor-pointer"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Imoveis;
