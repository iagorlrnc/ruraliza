import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useSEO } from '../hooks/useSEO';
import { formatCurrency, formatArea } from '../utils/format';
import { ESTADOS_BRASIL } from '../utils/estados';
import { maskPhone } from '../utils/masks';
import { 
  Search, 
  MapPin, 
  Ruler, 
  ArrowRight, 
  TrendingUp, 
  FileCheck2, 
  Award,
  Trees,
  Compass,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Home: React.FC = () => {
  useSEO('Início', 'Encontre as melhores fazendas, sítios, ranchos e áreas agrícolas com documentação regularizada no portal Ruraliza Negócios.');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Contact Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Evaluation Form State
  const [evalNome, setEvalNome] = useState('');
  const [evalCargo, setEvalCargo] = useState('');
  const [evalTexto, setEvalTexto] = useState('');

  // Fetch data
  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: api.getProperties
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: api.getTestimonials
  });

  const approvedTestimonials = testimonials.filter((t) => t.aprovado);

  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  // Testimonial Submit Mutation
  const testimonialMutation = useMutation({
    mutationFn: api.saveTestimonial,
    onSuccess: () => {
      showToast('Obrigado! Sua avaliação foi registrada e enviada para o painel administrativo.', 'success');
      setEvalNome('');
      setEvalCargo('');
      setEvalTexto('');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => {
      showToast('Ocorreu um erro ao enviar sua avaliação. Tente novamente.', 'error');
    }
  });

  const handleEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalNome || !evalCargo || !evalTexto) {
      showToast('Por favor, preencha todos os campos obrigatórios da avaliação.', 'error');
      return;
    }
    testimonialMutation.mutate({
      nome: evalNome,
      cargo: evalCargo,
      texto: evalTexto
    });
  };

  // Filter featured properties
  const featuredProperties = properties
    .filter((p) => p.destaque && p.status === 'Ativo');

  // Carousel states for Featured Properties
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Arrow navigation handlers for Featured Properties
  const handlePrevFeatured = () => {
    setFeaturedIndex((prev) => {
      const maxIndex = Math.max(0, featuredProperties.length - itemsPerView);
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleNextFeatured = () => {
    setFeaturedIndex((prev) => {
      const maxIndex = Math.max(0, featuredProperties.length - itemsPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerView(1);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay for featured properties
  useEffect(() => {
    if (featuredProperties.length <= 3) return;
    const maxIndex = featuredProperties.length - itemsPerView;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => {
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProperties.length, itemsPerView]);

  useEffect(() => {
    const maxIndex = Math.max(0, featuredProperties.length - itemsPerView);
    if (featuredIndex > maxIndex) {
      setFeaturedIndex(maxIndex);
    }
  }, [itemsPerView, featuredProperties.length, featuredIndex]);

  // Carousel states for Testimonials
  const [testimonialsIndex, setTestimonialsIndex] = useState(0);
  const [testimonialsItemsPerView, setTestimonialsItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setTestimonialsItemsPerView(1);
      } else {
        setTestimonialsItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay for testimonials
  useEffect(() => {
    if (approvedTestimonials.length <= 3) return;
    const maxIndex = approvedTestimonials.length - testimonialsItemsPerView;
    const interval = setInterval(() => {
      setTestimonialsIndex((prev) => {
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [approvedTestimonials.length, testimonialsItemsPerView]);

  useEffect(() => {
    const maxIndex = Math.max(0, approvedTestimonials.length - testimonialsItemsPerView);
    if (testimonialsIndex > maxIndex) {
      setTestimonialsIndex(maxIndex);
    }
  }, [testimonialsItemsPerView, approvedTestimonials.length, testimonialsIndex]);

  // Arrow navigation handlers for Testimonials
  const handlePrevTestimonials = () => {
    setTestimonialsIndex((prev) => {
      const maxIndex = Math.max(0, approvedTestimonials.length - testimonialsItemsPerView);
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleNextTestimonials = () => {
    setTestimonialsIndex((prev) => {
      const maxIndex = Math.max(0, approvedTestimonials.length - testimonialsItemsPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  // Quick Search Handler
  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/imoveis?busca=${encodeURIComponent(searchTerm)}`);
  };

  // Submit Message Mutation
  const messageMutation = useMutation({
    mutationFn: api.registrarMensagemContato,
    onSuccess: () => {
      showToast('Mensagem enviada com sucesso! Um consultor entrará em contato em breve.', 'success');
      setNome('');
      setEmail('');
      setTelefone('');
      setMensagem('');
      setCidade('');
      setEstado('');
    },
    onError: () => {
      showToast('Ocorreu um erro ao enviar a mensagem. Tente novamente.', 'error');
    }
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem || !cidade || !estado) {
      showToast('Por favor, preencha os campos obrigatórios (Nome, E-mail, Cidade, Estado e Mensagem).', 'error');
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      showToast('Por favor, insira um telefone válido.', 'error');
      return;
    }

    messageMutation.mutate({
      nome,
      email,
      telefone,
      assunto: 'Contato Geral via Site',
      mensagem,
      cidade: `${cidade} - ${estado.toUpperCase()}`
    });
  };

  // Fetch categories
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories
  });

  const categories = dbCategories.map(cat => ({
    name: cat.nome,
    type: cat.tipo,
    image: cat.imagem || '/imagesub.png',
    count: properties.filter(p => p.tipo === cat.tipo).length
  }));

  // Carousel states for Categories
  const [categoriesIndex, setCategoriesIndex] = useState(0);
  const [catItemsPerView, setCatItemsPerView] = useState(5);

  const handlePrevCat = () => {
    setCategoriesIndex((prev) => {
      const maxIndex = Math.max(0, categories.length - catItemsPerView);
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleNextCat = () => {
    setCategoriesIndex((prev) => {
      const maxIndex = Math.max(0, categories.length - catItemsPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCatItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCatItemsPerView(3);
      } else {
        setCatItemsPerView(5);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(0, categories.length - catItemsPerView);
    if (categoriesIndex > maxIndex) {
      setCategoriesIndex(maxIndex);
    }
  }, [catItemsPerView, categories.length, categoriesIndex]);

  // Autoplay for categories
  useEffect(() => {
    if (categories.length <= catItemsPerView) return;
    const maxIndex = categories.length - catItemsPerView;
    const interval = setInterval(() => {
      setCategoriesIndex((prev) => {
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [categories.length, catItemsPerView]);

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/hero.jpg" 
            alt="Fazenda Ruraliza" 
            className="w-full h-full object-cover opacity-45 dark:opacity-30 object-center"
            data-no-protect
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-medium/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-primary-light uppercase border border-primary-medium/30 backdrop-blur-md">
              <Trees className="h-3.5 w-3.5" />Imóveis Rurais
            </span>
            <img 
              src="/logonome.png" 
              alt="Ruraliza" 
              className="h-16 sm:h-24 w-auto object-contain"
              data-no-protect
            />
            
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-poppins text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            Investir no <span className="text-primary-light">campo</span><br/>é investir no <span className="text-primary-light">futuro.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-brand-beige/80 max-w-2xl mx-auto leading-relaxed"
          >
            Valorização, Rentabilidade e Segurança!
          </motion.p>

          {/* Quick Search */}
          <motion.form
            onSubmit={handleQuickSearch}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-2xl flex flex-col sm:flex-row gap-2 bg-white/90 dark:bg-zinc-900/90 p-2 rounded-lg border border-white/20 shadow-2xl backdrop-blur-md"
          >
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por cidade, estado, código ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none hero-search-input"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 px-6 text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              Pesquisar
            </button>
          </motion.form>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-primary-dark dark:text-white">
              Imóveis em Destaque
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mt-1">
              Seleção exclusiva de propriedades rurais de alto potencial selecionadas pelos nossos especialistas.
            </p>
          </div>
          <Link
            to="/imoveis"
            className="text-sm font-semibold text-primary-medium dark:text-primary-light hover:text-primary-dark transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingProperties ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm h-96 skeleton-shimmer"></div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-8 rounded-3xl shadow-sm text-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Sem informações no momento.</p>
          </div>
        ) : (
          <div className="relative w-full py-2">
            {/* Arrow Navigation Buttons */}
            {featuredProperties.length > itemsPerView && (
              <>
                <button
                  onClick={handlePrevFeatured}
                  className="absolute left-[-16px] lg:left-[-48px] top-[40%] -translate-y-1/2 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-white rounded-full p-2.5 border border-gray-200 dark:border-zinc-700 shadow-md hover:shadow-lg transition-all z-10 cursor-pointer flex items-center justify-center"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextFeatured}
                  className="absolute right-[-16px] lg:right-[-48px] top-[40%] -translate-y-1/2 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-white rounded-full p-2.5 border border-gray-200 dark:border-zinc-700 shadow-md hover:shadow-lg transition-all z-10 cursor-pointer flex items-center justify-center"
                  aria-label="Próximo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{ 
                  transform: `translateX(calc(-1 * (${featuredIndex} * (100% / ${itemsPerView}) + ${featuredIndex} * ${itemsPerView === 3 ? 8 : 24}px)))` 
                }}
              >
                {featuredProperties.map((prop, idx) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-none overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full shrink-0 w-full lg:w-[calc((100%-48px)/3)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={prop.imagens && prop.imagens.length > 0 ? prop.imagens[0].url : '/imagesub.png'}
                        alt={prop.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-primary-dark text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">
                          {prop.tipo}
                        </span>
                        <span className="bg-primary-medium text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">
                          {prop.modalidade === 'Venda' ? 'Venda' : 'Locação'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
                          <MapPin className="h-3.5 w-3.5 text-primary-medium shrink-0" />
                          <span>{prop.cidade} - {prop.estado}</span>
                        </div>
                        <h3 className="font-poppins font-bold text-base text-gray-800 dark:text-white line-clamp-1 group-hover:text-primary-medium transition-colors">
                          {prop.titulo}
                        </h3>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Ruler className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{formatArea(prop.area_total)}</span>
                        </div>
                        <div className="font-poppins font-bold text-sm text-primary-dark dark:text-primary-light">
                          {prop.modalidade === 'Aluguel' ? `${formatCurrency(prop.valor)}/mês` : formatCurrency(prop.valor)}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          to={`/imoveis/${prop.id}`}
                          className="w-full block py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] border border-gray-250 dark:border-zinc-800 text-primary-dark dark:text-primary-light hover:bg-primary-medium hover:text-white dark:hover:bg-primary-medium dark:hover:text-white font-poppins text-xs font-bold text-center transition-all cursor-pointer"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Navigation Dots if Carousel is active */}
            {featuredProperties.length > itemsPerView && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: featuredProperties.length - itemsPerView + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      featuredIndex === i 
                        ? 'w-6 bg-primary-medium' 
                        : 'w-2 bg-gray-300 dark:bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-primary-dark dark:bg-zinc-900/60 py-16 text-white transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-brand-beige">
              Categorias de Propriedades
            </h2>
            <p className="text-xs text-brand-beige-dark/70 leading-relaxed">
              Explore nossos imóveis divididos por finalidade para facilitar a sua busca técnica.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-[2px]">
              <p className="text-xs text-brand-beige-dark/60 font-medium">Nenhuma categoria cadastrada no momento.</p>
            </div>
          ) : (
            <div className="relative w-full py-2">
              {/* Arrow Navigation Buttons */}
              {categories.length > catItemsPerView && (
                <>
                  <button
                    onClick={handlePrevCat}
                    className="absolute left-[-16px] lg:left-[-48px] top-1/2 -translate-y-1/2 bg-white/10 dark:bg-zinc-800/60 hover:bg-white/20 dark:hover:bg-zinc-700/80 text-white rounded-full p-2.5 border border-white/10 shadow-md hover:shadow-lg transition-all z-10 cursor-pointer flex items-center justify-center backdrop-blur-sm"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextCat}
                    className="absolute right-[-16px] lg:right-[-48px] top-1/2 -translate-y-1/2 bg-white/10 dark:bg-zinc-800/60 hover:bg-white/20 dark:hover:bg-zinc-700/80 text-white rounded-full p-2.5 border border-white/10 shadow-md hover:shadow-lg transition-all z-10 cursor-pointer flex items-center justify-center backdrop-blur-sm"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div className="overflow-hidden w-full">
                <div 
                  className="flex transition-transform duration-500 ease-in-out gap-4"
                  style={{ 
                    transform: `translateX(calc(-1 * (${categoriesIndex} * (100% / ${catItemsPerView}) + ${categoriesIndex} * 16px)))` 
                  }}
                >
                  {categories.map((cat, idx) => (
                    <motion.div
                      key={cat.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      onClick={() => navigate(`/imoveis?tipo=${encodeURIComponent(cat.name)}`)}
                      className="group relative h-40 rounded-xl overflow-hidden cursor-pointer shadow-md shrink-0 text-left"
                      style={{
                        width: `calc((100% - ${(catItemsPerView - 1) * 16}px) / ${catItemsPerView})`
                      }}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                        data-no-protect
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 text-left">
                        <h3 className="font-poppins text-xs font-bold text-white group-hover:text-primary-light transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-[9px] text-brand-beige-dark/80 font-sans block">
                          {cat.count} {cat.count === 1 ? 'imóvel' : 'imóveis'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Dots navigation indicator */}
              {categories.length > catItemsPerView && (
                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: categories.length - catItemsPerView + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCategoriesIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        categoriesIndex === i 
                          ? 'w-6 bg-primary-light' 
                          : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Ir para slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-primary-dark dark:text-white">
            Por que escolher a Ruraliza Negócios?
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Nossa corretagem vai além da venda: oferecemos suporte de ponta a ponta para a tranquilidade do produtor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              title: 'Atendimento Especializado',
              desc: 'Corretores que compreendem a realidade agrícola e pecuária, prontos para prestar atendimento técnico.',
              icon: Compass
            },
            {
              title: 'Consultoria Rural',
              desc: 'Análise de viabilidade agronômica, levantamento de solo, infraestrutura e vocação produtiva da terra.',
              icon: TrendingUp
            },
            {
              title: 'Avaliação de Propriedades',
              desc: 'Precificação científica de imóveis rurais com base em relatórios reais do mercado de terras do agronegócio.',
              icon: Award
            },
            {
              title: 'Documentação Regularizada',
              desc: 'Auditoria jurídica completa: CAR, georreferenciamento, CCIR, ITR e certidões reais livres de pendências.',
              icon: FileCheck2
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-lg shadow-sm text-left hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 flex items-center justify-center bg-primary-medium/10 rounded-xl text-primary-medium dark:text-primary-light mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-brand-beige-dark/25 dark:bg-zinc-900/20 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-8">
          <h2 className="font-poppins text-2xl font-bold text-primary-dark dark:text-white">
            O que dizem os nossos clientes
          </h2>

          {approvedTestimonials.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Sem informações no momento.</p>
          ) : (
            <div className="relative w-full py-2">
              {/* Arrow Navigation Buttons */}
              {approvedTestimonials.length > testimonialsItemsPerView && (
                <>
                  <button
                    onClick={handlePrevTestimonials}
                    className="absolute left-[-16px] lg:left-[-48px] top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-white rounded-full p-2.5 border border-gray-200 dark:border-zinc-800/80 shadow-md hover:shadow-lg transition-all z-10 cursor-pointer flex items-center justify-center"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextTestimonials}
                    className="absolute right-[-16px] lg:right-[-48px] top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-white rounded-full p-2.5 border border-gray-200 dark:border-zinc-800/80 shadow-md hover:shadow-lg transition-all z-10 cursor-pointer flex items-center justify-center"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div className="overflow-hidden w-full">
                <div 
                  className={`flex transition-transform duration-500 ease-in-out gap-6 ${
                    approvedTestimonials.length < testimonialsItemsPerView ? 'justify-center' : ''
                  }`}
                  style={{ 
                    transform: `translateX(calc(-1 * (${testimonialsIndex} * (100% / ${testimonialsItemsPerView}) + ${testimonialsIndex} * ${testimonialsItemsPerView === 3 ? 8 : 24}px)))` 
                  }}
                >
                  {approvedTestimonials.map((dep) => (
                    <div 
                      key={dep.id} 
                      className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-lg shadow-sm flex flex-col justify-between text-left shrink-0 w-full md:w-[calc((100%-48px)/3)]"
                    >
                      <p className="text-xs text-gray-500 dark:text-zinc-400 italic leading-relaxed">
                        "{dep.texto}"
                      </p>
                      <div className="mt-4">
                        <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white">
                          {dep.nome}
                        </h4>
                        <span className="text-[10px] text-primary-medium dark:text-primary-light block font-medium">
                          {dep.cargo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Dots if Testimonials Carousel is active */}
              {approvedTestimonials.length > testimonialsItemsPerView && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: approvedTestimonials.length - testimonialsItemsPerView + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialsIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        testimonialsIndex === i 
                          ? 'w-6 bg-primary-medium' 
                          : 'w-2 bg-gray-300 dark:bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section / Form */}
      <section id="contato" className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-5"
        >
          {/* Info panel */}
          <div className="md:col-span-2 bg-primary-dark text-white p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <h3 className="font-poppins text-xl font-bold text-white">
                Fale Conosco
              </h3>
              <p className="text-xs text-brand-beige-dark/70 leading-relaxed">
                Preencha o formulário ao lado e inicie o atendimento. O cadastro é feito automaticamente no nosso CRM.
              </p>
            </div>

            <div className="space-y-3 text-xs text-brand-beige-dark/95">
              <div>
                <strong className="block text-white uppercase tracking-wider text-[10px]">Endereço</strong>
                <span>{config?.endereco || '[Endereço não cadastrado]'}</span>
              </div>
              <div>
                <strong className="block text-white uppercase tracking-wider text-[10px]">E-mail</strong>
                <span>{config?.email || '[E-mail não cadastrado]'}</span>
              </div>
              <div>
                <strong className="block text-white uppercase tracking-wider text-[10px]">Telefone / WhatsApp</strong>
                <span>
                  {config?.telefone || '[Telefone não cadastrado]'}
                  {config?.telefone_secundario ? ` / ${config.telefone_secundario}` : ''}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-brand-beige-dark/45 border-t border-brand-beige-dark/10 pt-3">
              CRECI: {config?.creci || '[CRECI não cadastrado]'}
            </div>
          </div>

          {/* Form panel */}
          <form onSubmit={handleContactSubmit} className="md:col-span-3 p-8 space-y-4 text-left">
            <h4 className="font-poppins text-base font-bold text-gray-800 dark:text-white">
              Envie sua mensagem
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Telefone / Celular
                  </label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="(18) 99999-9999"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Sorriso"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Estado *
                  </label>
                  <select
                    required
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    {ESTADOS_BRASIL.map((est) => (
                      <option key={est.sigla} value={est.sigla}>
                        {est.sigla} - {est.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Mensagem *
                </label>
                <textarea
                  rows={4}
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={messageMutation.isPending}
              className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              {messageMutation.isPending ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </motion.div>
      </section>

      {/* Customer Review / Evaluation Section */}
      <section className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-3xl p-8 shadow-lg text-left space-y-6"
        >
          <div>
            <h3 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">
              Deixe seu Depoimento
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Sua opinião é fundamental para nós! Compartilhe como foi a sua experiência com a Ruraliza Negócios e ajude outros produtores rurais. Sua avaliação aparecerá no painel administrativo e, após aprovação, será mostrada no portal.
            </p>
          </div>

          <form onSubmit={handleEvalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={evalNome}
                  onChange={(e) => setEvalNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Sua Atividade / Relação *
                </label>
                <input
                  type="text"
                  required
                  value={evalCargo}
                  onChange={(e) => setEvalCargo(e.target.value)}
                  placeholder="Ex: Produtor Rural - Fazenda Planalto"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Sua Avaliação *
              </label>
              <textarea
                rows={4}
                required
                value={evalTexto}
                onChange={(e) => setEvalTexto(e.target.value)}
                placeholder="Escreva aqui seu depoimento sobre nossos serviços, atendimento dos corretores..."
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={testimonialMutation.isPending}
              className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-white py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              {testimonialMutation.isPending ? 'Enviando avaliação...' : 'Enviar Depoimento'}
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
