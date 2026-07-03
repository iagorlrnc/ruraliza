import { Imovel, Usuario, Mensagem, SolicitacaoVisita, Depoimento, DashboardMetrics, StatusMensagem, StatusVisita, Configuracoes, Vendedor, Categoria } from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'ruraliza_properties',
  USERS: 'ruraliza_users',
  MESSAGES: 'ruraliza_messages',
  VISITS: 'ruraliza_visits',
  TESTIMONIALS: 'ruraliza_testimonials',
  METRICS_VIEWS: 'ruraliza_property_views',
  CONFIG: 'ruraliza_config',
  SELLERS: 'ruraliza_sellers',
  CATEGORIES: 'ruraliza_categories'
};

const INITIAL_PROPERTIES: Imovel[] = [
  {
    id: 'prop-1',
    codigo: 'FL0001',
    titulo: 'Fazenda Sol Nascente - Sorriso MT',
    descricao: 'Excelente propriedade para agricultura de alta produtividade. Solo argiloso acima de 35%, topografia plana a suave ondulada, excelente regime de chuvas. Conta com casa sede confortável, barracão para máquinas agrícolas, poço artesiano de alta vazão, energia trifásica e curral para manejo. Totalmente regularizada com CAR, Geo e reserva legal preservada.',
    tipo: 'Fazenda',
    modalidade: 'Venda',
    valor: 18500000,
    area_total: 1200,
    cidade: 'Sorriso',
    estado: 'MT',
    latitude: -12.5441,
    longitude: -55.7226,
    destaque: true,
    status: 'Ativo',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    imagens: [
      { id: 'img-1-1', imovel_id: 'prop-1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', ordem: 0 },
      { id: 'img-1-2', imovel_id: 'prop-1', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', ordem: 1 },
      { id: 'img-1-3', imovel_id: 'prop-1', url: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80', ordem: 2 }
    ]
  },
  {
    id: 'prop-2',
    codigo: 'CH0002',
    titulo: 'Chácara Bela Vista - Bonito MS',
    descricao: 'Lindo refúgio em Bonito, ideal para lazer ou ecoturismo. A propriedade possui acesso privativo a um rio de águas cristalinas, pomar diversificado, casa sede com varanda aconchegante, quiosque com churrasqueira, energia elétrica instalada e poço artesiano. Cercada por belezas naturais preservadas.',
    tipo: 'Chácara',
    modalidade: 'Venda',
    valor: 680000,
    area_total: 5,
    cidade: 'Bonito',
    estado: 'MS',
    latitude: -21.1218,
    longitude: -56.4820,
    destaque: true,
    status: 'Ativo',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    imagens: [
      { id: 'img-2-1', imovel_id: 'prop-2', url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80', ordem: 0 },
      { id: 'img-2-2', imovel_id: 'prop-2', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', ordem: 1 }
    ]
  },
  {
    id: 'prop-3',
    codigo: 'RA0003',
    titulo: 'Rancho Beira Rio - Rifaina SP',
    descricao: 'Espetacular rancho à beira da represa de Rifaina. Imóvel de alto padrão com píer privativo para barcos, piscina com borda infinita integrada com área gourmet, 4 suítes espaçosas, paisagismo impecável. Conexão completa de energia e internet por fibra. Uma verdadeira joia para locação de temporada ou moradia.',
    tipo: 'Rancho',
    modalidade: 'Aluguel',
    valor: 4500,
    area_total: 12,
    cidade: 'Rifaina',
    estado: 'SP',
    latitude: -20.0822,
    longitude: -47.4247,
    destaque: true,
    status: 'Ativo',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    imagens: [
      { id: 'img-3-1', imovel_id: 'prop-3', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', ordem: 0 },
      { id: 'img-3-2', imovel_id: 'prop-3', url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80', ordem: 1 }
    ]
  },
  {
    id: 'prop-4',
    codigo: 'SI0004',
    titulo: 'Sítio Recanto Feliz - Bragança Paulista',
    descricao: 'Sítio produtivo com infraestrutura completa para cultivo de hortaliças ou criação de animais de pequeno porte. Possui duas estufas ativas, casa para caseiro, casa sede estilo rústico reformada, nascente de água limpa, lago para peixes, pastagem formada e divisões de piquetes. Apenas 15 minutos do centro da cidade.',
    tipo: 'Sítio',
    modalidade: 'Venda',
    valor: 1200000,
    area_total: 45,
    cidade: 'Bragança Paulista',
    estado: 'SP',
    latitude: -22.9519,
    longitude: -46.5419,
    destaque: false,
    status: 'Ativo',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    imagens: [
      { id: 'img-4-1', imovel_id: 'prop-4', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', ordem: 0 },
      { id: 'img-4-2', imovel_id: 'prop-4', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', ordem: 1 }
    ]
  },
  {
    id: 'prop-5',
    codigo: 'AG0005',
    titulo: 'Área Agrícola Planalto - Rio Verde GO',
    descricao: 'Área agrícola consolidada com plantio contínuo de grãos. Solo extremamente corrigido, índice pluviométrico excelente, região valorizada de Rio Verde. Acesso por estrada cascalhada transitável o ano todo. Possui apenas energia elétrica no local e demarcações de divisa regularizadas.',
    tipo: 'Área Agrícola',
    modalidade: 'Venda',
    valor: 12000000,
    area_total: 350,
    cidade: 'Rio Verde',
    estado: 'GO',
    latitude: -17.7915,
    longitude: -50.9201,
    destaque: false,
    status: 'Ativo',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    imagens: [
      { id: 'img-5-1', imovel_id: 'prop-5', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80', ordem: 0 },
      { id: 'img-5-2', imovel_id: 'prop-5', url: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80', ordem: 1 }
    ]
  },
  {
    id: 'prop-6',
    codigo: 'FA0006',
    titulo: 'Fazenda Histórica Santa Maria - Uberlândia MG',
    descricao: 'Bela fazenda mineira, com mais de 100 anos de história e infraestrutura de ponta. Sede colonial totalmente restaurada e climatizada, curral completo com balança eletrônica e tronco de contenção, pastagens rotacionadas prontas para engorda de gado de corte, confinamento ativo, e 200 hectares destinados ao plantio de silagem. Água em abundância com ribeirão na divisa e represas internas.',
    tipo: 'Fazenda',
    modalidade: 'Venda',
    valor: 25000000,
    area_total: 850,
    cidade: 'Uberlândia',
    estado: 'MG',
    latitude: -18.9186,
    longitude: -48.2772,
    destaque: true,
    status: 'Ativo',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    imagens: [
      { id: 'img-6-1', imovel_id: 'prop-6', url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80', ordem: 0 },
      { id: 'img-6-2', imovel_id: 'prop-6', url: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80', ordem: 1 }
    ]
  }
];

const INITIAL_USERS: Usuario[] = [
  {
    id: 'user-admin-1',
    nome: 'Renato Silva',
    email: 'contato@ruralizanegocios.com.br',
    telefone: '(11) 99999-9999',
    cidade: 'Palmas',
    perfil: 'Administrador',
    status: 'Ativo',
    senha: 'admin123',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-corretor-1',
    nome: 'Marcos Corretor',
    email: 'corretor@ruralizanegocios.com.br',
    telefone: '(18) 99777-6655',
    cidade: 'Palmas',
    perfil: 'Corretor',
    status: 'Ativo',
    senha: 'corretor123',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-pendente-1',
    nome: 'Julia Candidata',
    email: 'julia@ruralizanegocios.com.br',
    telefone: '(18) 99666-5544',
    cidade: 'Regente Feijó',
    perfil: 'Corretor',
    status: 'Pendente',
    senha: 'julia123',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-client-1',
    nome: 'Geraldo Magela',
    email: 'geraldo.magela@gmail.com',
    telefone: '(34) 98877-6655',
    cidade: 'Uberaba',
    perfil: 'Cliente',
    status: 'Ativo',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    mensagens_enviadas_count: 2,
    imoveis_visualizados_count: 4,
    ultimo_contato: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-client-2',
    nome: 'Ana Cláudia Fontes',
    email: 'ana.fontes@outlook.com',
    telefone: '(67) 99112-2334',
    cidade: 'Campo Grande',
    perfil: 'Cliente',
    status: 'Ativo',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    mensagens_enviadas_count: 1,
    imoveis_visualizados_count: 2,
    ultimo_contato: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_MESSAGES: Mensagem[] = [
  {
    id: 'msg-1',
    usuario_id: 'user-client-1',
    imovel_id: 'prop-1',
    nome: 'Geraldo Magela',
    email: 'geraldo.magela@gmail.com',
    telefone: '(34) 98877-6655',
    assunto: 'Interesse em Compra',
    mensagem: 'Olá, gostaria de saber se a Fazenda Sol Nascente possui pista de pouso homologada ou pista de terra utilizável de fácil acesso. Aguardo retorno.',
    status: 'Nova',
    observacao_interna: 'Cliente demonstrou muito interesse, atua na pecuária e quer expandir.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    usuario_id: 'user-client-2',
    imovel_id: 'prop-2',
    nome: 'Ana Cláudia Fontes',
    email: 'ana.fontes@outlook.com',
    telefone: '(67) 99112-2334',
    assunto: 'Dúvidas Gerais',
    mensagem: 'Gostei muito da Chácara Bela Vista. É possível parcelar uma parte do valor de compra diretamente com o proprietário ou aceita permuta em apartamento na capital?',
    status: 'Em andamento',
    observacao_interna: 'Liguei no dia 23/06 para alinhar as condições de pagamento.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-3',
    usuario_id: 'user-client-1',
    imovel_id: undefined,
    nome: 'Geraldo Magela',
    email: 'geraldo.magela@gmail.com',
    telefone: '(34) 98877-6655',
    assunto: 'Consultoria Rural',
    mensagem: 'Olá, gostaria de fazer uma avaliação técnica do meu sítio no triângulo mineiro. Vocês prestam este serviço na região?',
    status: 'Respondida',
    observacao_interna: 'Contato respondido via WhatsApp pelo corretor Renato.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_VISITS: SolicitacaoVisita[] = [
  {
    id: 'visit-1',
    usuario_id: 'user-client-1',
    imovel_id: 'prop-1',
    data_solicitada: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Gostaria de agendar a visita no período da manhã. Estarei na região e posso me deslocar com carro próprio.',
    status: 'Pendente',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_TESTIMONIALS: Depoimento[] = [
  {
    id: 'dep-1',
    nome: 'João da Silva',
    cargo: 'Produtor Rural - Fazenda Sol Nascente',
    texto: 'A Ruraliza Negócios nos ajudou a encontrar a área perfeita para expandir nossa plantação de soja. Atendimento técnico especializado e de extrema confiança.',
    aprovado: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'dep-2',
    nome: 'Maria Oliveira',
    cargo: 'Investidora de Imóveis',
    texto: 'Excelente assessoria na compra do nosso rancho de lazer. Todo o processo de verificação documental foi ágil e transparente. Recomendo muito!',
    aprovado: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'dep-3',
    nome: 'Carlos Rezende',
    cargo: 'Pecuarista - Sítio Jatobá',
    texto: 'Profissionais que realmente entendem do homem do campo. Desde a avaliação do pasto até a documentação final, o atendimento foi impecável.',
    aprovado: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_CONFIG: Configuracoes = {
  id: 'c0b67540-3b00-4b08-8e6f-fb9f8ee18299',
  telefone: '(18) 3222-1234',
  telefone_secundario: '(18) 99888-7766',
  email: 'contato@ruralizanegocios.com.br',
  endereco: 'Av. Coronel José Soares Marcondes, 1500 - Centro, Palmas - TO',
  creci: '35.421-J',
  latitude: -10.180000,
  longitude: -48.330000,
  social_facebook: 'https://facebook.com/ruraliza',
  social_instagram: 'https://instagram.com/ruraliza',
  social_linkedin: 'https://linkedin.com/company/ruraliza',
  social_whatsapp: 'https://wa.me/5518998887766'
};

const INITIAL_SELLERS: Vendedor[] = [
  {
    id: 'vendedor-1',
    nome: 'Renato Silva',
    role: 'Diretor Executivo & Corretor Sênior',
    especializacao: 'Grandes transações de terras e expansão pecuária',
    telefone: '(18) 99888-7766',
    email: 'contato@ruralizanegocios.com.br',
    foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    creci: '12345-F',
    created_at: new Date().toISOString()
  },
  {
    id: 'vendedor-2',
    nome: 'Dr. Arthur Mendes',
    role: 'Consultor Jurídico Agrário',
    especializacao: 'Georreferenciamento, regularização de posses e compliance ambiental',
    telefone: '(18) 99888-7767',
    email: 'arthur@ruralizanegocios.com.br',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    creci: '23456-F',
    created_at: new Date().toISOString()
  },
  {
    id: 'vendedor-3',
    nome: 'Sofia Rezende',
    role: 'Engenheira Agrônoma',
    especializacao: 'Análise técnica de solos, capacidade de pastagens e estudos hídricos',
    telefone: '(18) 99888-7768',
    email: 'sofia@ruralizanegocios.com.br',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    creci: '34567-F',
    created_at: new Date().toISOString()
  },
  {
    id: 'vendedor-4',
    nome: 'Guilherme Franco',
    role: 'Corretor Comercial',
    especializacao: 'Chácaras de alto padrão e ranchos fluviais de lazer',
    telefone: '(18) 99888-7769',
    email: 'guilherme@ruralizanegocios.com.br',
    foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    creci: '45678-F',
    created_at: new Date().toISOString()
  }
];

// Initialize localStorage if keys do not exist
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(INITIAL_TESTIMONIALS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(INITIAL_SELLERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.METRICS_VIEWS)) {
    localStorage.setItem(STORAGE_KEYS.METRICS_VIEWS, JSON.stringify({
      'prop-1': 148,
      'prop-2': 94,
      'prop-3': 120,
      'prop-4': 45,
      'prop-5': 32,
      'prop-6': 210
    }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    const initialCategories: Categoria[] = [
      { id: 'cat-1', nome: 'Fazendas', tipo: 'Fazenda', imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-2', nome: 'Chácaras', tipo: 'Chácara', imagem: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-3', nome: 'Sítios', tipo: 'Sítio', imagem: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-4', nome: 'Ranchos', tipo: 'Rancho', imagem: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-5', nome: 'Terrenos Rurais', tipo: 'Terreno Rural', imagem: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-6', nome: 'Áreas Agrícolas', tipo: 'Área Agrícola', imagem: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=400&q=80' }
    ];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  }
};

initializeStorage();

export const mockDb = {
  // --- PROPERTIES ---
  getProperties: (): Imovel[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    const list: Imovel[] = data ? JSON.parse(data).filter((p: Imovel) => p.status !== 'Excluido') : [];
    return list.map(p => ({
      ...p,
      visualizacoes: mockDb.getPropertyViews(p.id)
    }));
  },

  getPropertyById: (id: string): Imovel | undefined => {
    const list = mockDb.getProperties();
    return list.find(p => p.id === id);
  },

  incrementView: (id: string) => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.METRICS_VIEWS);
    if (data) {
      const views = JSON.parse(data);
      views[id] = (views[id] || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.METRICS_VIEWS, JSON.stringify(views));
    }
  },

  getPropertyViews: (id: string): number => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.METRICS_VIEWS);
    if (data) {
      const views = JSON.parse(data);
      return views[id] || 0;
    }
    return 0;
  },

  saveProperty: (property: Partial<Imovel> & { titulo: string }): Imovel => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPERTIES) || '[]');
    let saved: Imovel;

    if (property.id) {
      const index = list.findIndex((p: Imovel) => p.id === property.id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...property,
          updated_at: new Date().toISOString()
        };
        saved = list[index];
      } else {
        throw new Error('Property not found');
      }
    } else {
      const id = 'prop-' + Math.random().toString(36).substr(2, 9);
      saved = {
        id,
        codigo: property.codigo || 'IM' + Math.floor(1000 + Math.random() * 9000),
        titulo: property.titulo,
        descricao: property.descricao || '',
        tipo: property.tipo || 'Fazenda',
        modalidade: property.modalidade || 'Venda',
        valor: property.valor || 0,
        area_total: property.area_total || 0,
        cidade: property.cidade || '',
        estado: property.estado || '',
        latitude: property.latitude,
        longitude: property.longitude,
        destaque: property.destaque || false,
        status: property.status || 'Ativo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        imagens: property.imagens || []
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(list));
    return saved;
  },

  deletePropertySoft: (id: string): boolean => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPERTIES) || '[]');
    const index = list.findIndex((p: Imovel) => p.id === id);
    if (index !== -1) {
      list[index].status = 'Excluido';
      list[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(list));
      return true;
    }
    return false;
  },

  // --- USERS ---
  getUsers: (): Usuario[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getUserById: (id: string): Usuario | undefined => {
    const list = mockDb.getUsers();
    return list.find(u => u.id === id);
  },

  saveUser: (user: Partial<Usuario> & { nome: string; email: string }): Usuario => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let saved: Usuario;

    const emailLower = user.email.toLowerCase();
    const existingIndex = list.findIndex((u: Usuario) => u.email.toLowerCase() === emailLower);

    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...user,
        email: emailLower,
        updated_at: new Date().toISOString()
      };
      saved = list[existingIndex];
    } else {
      const id = user.id || 'user-' + Math.random().toString(36).substr(2, 9);
      saved = {
        id,
        nome: user.nome,
        email: emailLower,
        telefone: user.telefone,
        cidade: user.cidade || '',
        creci: user.creci || '',
        perfil: user.perfil || 'Cliente',
        status: user.status || 'Ativo',
        senha: user.senha || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mensagens_enviadas_count: user.mensagens_enviadas_count || 0,
        imoveis_visualizados_count: user.imoveis_visualizados_count || 0,
        ultimo_contato: user.ultimo_contato
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    return saved;
  },

  deleteUser: (id: string): boolean => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const filtered = list.filter((u: Usuario) => u.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));

      // Cascade to messages and visits by setting usuario_id to null
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
      const updatedMessages = messages.map((m: any) => m.usuario_id === id ? { ...m, usuario_id: null } : m);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));

      const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
      const updatedVisits = visits.map((v: any) => v.usuario_id === id ? { ...v, usuario_id: null } : v);
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updatedVisits));

      return true;
    }
    return false;
  },

  // --- MESSAGES (LEADS) ---
  getMessages: (): Mensagem[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const list: Mensagem[] = data ? JSON.parse(data) : [];
    
    // Enrich with user and property details
    const users = mockDb.getUsers();
    const properties = mockDb.getProperties();

    return list.map(msg => ({
      ...msg,
      usuario: users.find(u => u.id === msg.usuario_id),
      atribuido_a: msg.atribuido_a_id ? users.find(u => u.id === msg.atribuido_a_id) : undefined,
      imovel: msg.imovel_id ? properties.find(p => p.id === msg.imovel_id) : undefined
    }));
  },

  registrarInteracaoCliente: (payload: {
    nome: string;
    email: string;
    telefone?: string;
    assunto: string;
    mensagem: string;
    imovel_id?: string;
    cidade?: string;
  }): { usuarioId: string; mensagemId: string } => {
    // 1. Create or update user
    const user = mockDb.saveUser({
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      cidade: payload.cidade || undefined,
      perfil: 'Cliente',
      status: 'Ativo',
      ultimo_contato: new Date().toISOString()
    });

    // Increment user metrics
    const users = mockDb.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].mensagens_enviadas_count = (users[userIndex].mensagens_enviadas_count || 0) + 1;
      if (payload.imovel_id) {
        users[userIndex].imoveis_visualizados_count = (users[userIndex].imoveis_visualizados_count || 0) + 1;
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // 2. Create message
    initializeStorage();
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    const msgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    
    const newMessage: Mensagem = {
      id: msgId,
      usuario_id: user.id,
      imovel_id: payload.imovel_id,
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      assunto: payload.assunto,
      mensagem: payload.mensagem,
      status: 'Nova',
      created_at: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    return { usuarioId: user.id, mensagemId: msgId };
  },

  updateMessageStatus: (id: string, status: StatusMensagem, observacao?: string, atribuidoAId?: string | null): boolean => {
    initializeStorage();
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    const index = messages.findIndex((m: Mensagem) => m.id === id);
    if (index !== -1) {
      messages[index].status = status;
      if (observacao !== undefined) {
        messages[index].observacao_interna = observacao;
      }
      if (atribuidoAId !== undefined) {
        messages[index].atribuido_a_id = atribuidoAId === null ? undefined : atribuidoAId;
      }
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      return true;
    }
    return false;
  },

  // --- VISIT REQUESTS ---
  getVisits: (): SolicitacaoVisita[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.VISITS);
    const list: SolicitacaoVisita[] = data ? JSON.parse(data) : [];
    
    const users = mockDb.getUsers();
    const properties = mockDb.getProperties();

    return list.map(v => ({
      ...v,
      usuario: users.find(u => u.id === v.usuario_id),
      imovel: properties.find(p => p.id === v.imovel_id) as Imovel
    }));
  },

  registrarSolicitacaoVisita: (payload: {
    nome: string;
    email: string;
    telefone?: string;
    imovel_id: string;
    data_solicitada: string;
    observacoes?: string;
    cidade?: string;
  }): { usuarioId: string; visitaId: string } => {
    // 1. Create or update user
    const user = mockDb.saveUser({
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      cidade: payload.cidade || undefined,
      perfil: 'Cliente',
      status: 'Ativo',
      ultimo_contato: new Date().toISOString()
    });

    // Increment metrics
    const users = mockDb.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].mensagens_enviadas_count = (users[userIndex].mensagens_enviadas_count || 0) + 1;
      users[userIndex].imoveis_visualizados_count = (users[userIndex].imoveis_visualizados_count || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // 2. Create visit request
    initializeStorage();
    const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
    const visitId = 'visit-' + Math.random().toString(36).substr(2, 9);

    const newVisit: SolicitacaoVisita = {
      id: visitId,
      usuario_id: user.id,
      imovel_id: payload.imovel_id,
      data_solicitada: payload.data_solicitada,
      observacoes: payload.observacoes,
      status: 'Pendente',
      created_at: new Date().toISOString()
    };
    visits.push(newVisit);
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));

    // Also register message for user interaction history
    mockDb.registrarInteracaoCliente({
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      imovel_id: payload.imovel_id,
      assunto: 'Agendamento de Visita',
      mensagem: `Solicitou visita para o imóvel no dia ${new Date(payload.data_solicitada).toLocaleString('pt-BR')}. Obs: ${payload.observacoes || 'Nenhuma'}`
    });

    return { usuarioId: user.id, visitaId: visitId };
  },

  updateVisitStatus: (id: string, status: StatusVisita): boolean => {
    initializeStorage();
    const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
    const index = visits.findIndex((v: SolicitacaoVisita) => v.id === id);
    if (index !== -1) {
      visits[index].status = status;
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
      return true;
    }
    return false;
  },

  // --- TESTIMONIALS ---
  getTestimonials: (): Depoimento[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    return data ? JSON.parse(data) : [];
  },

  saveTestimonial: (depoimento: Partial<Depoimento> & { nome: string; texto: string; cargo: string }): Depoimento => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TESTIMONIALS) || '[]');
    let saved: Depoimento;

    if (depoimento.id) {
      const index = list.findIndex((d: Depoimento) => d.id === depoimento.id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...depoimento
        };
        saved = list[index];
      } else {
        throw new Error('Testimonial not found');
      }
    } else {
      const id = 'dep-' + Math.random().toString(36).substr(2, 9);
      saved = {
        id,
        nome: depoimento.nome,
        cargo: depoimento.cargo,
        texto: depoimento.texto,
        aprovado: depoimento.aprovado ?? false,
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
    return saved;
  },

  deleteTestimonial: (id: string): boolean => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TESTIMONIALS) || '[]');
    const filtered = list.filter((d: Depoimento) => d.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  updateTestimonialApproval: (id: string, aprovado: boolean): boolean => {
    initializeStorage();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TESTIMONIALS) || '[]');
    const index = list.findIndex((d: Depoimento) => d.id === id);
    if (index !== -1) {
      list[index].aprovado = aprovado;
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
      return true;
    }
    return false;
  },

  // --- METRICS ---
  getMetrics: (): DashboardMetrics => {
    const properties = mockDb.getProperties();
    const users = mockDb.getUsers();
    const messages = mockDb.getMessages();
    const visits = mockDb.getVisits();

    const imoveisVenda = properties.filter(p => p.modalidade === 'Venda').length;
    const imoveisAluguel = properties.filter(p => p.modalidade === 'Aluguel').length;
    
    const totalClientes = users.filter(u => u.perfil === 'Cliente').length;
    const totalAdmins = users.filter(u => u.perfil === 'Administrador' || u.perfil === 'Corretor').length;
    
    const mensagensPendentes = messages.filter(m => m.status === 'Nova' || m.status === 'Em andamento').length;

    // Calculate visits
    const totalVisits = visits.length;

    // View counts
    const viewsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.METRICS_VIEWS) || '{}');
    const totalViews = Object.values(viewsData).reduce((a: any, b: any) => a + b, 0) as number;

    // Calculate leads in the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // A lead is a customer who sent a message or created an account this month
    const leadsThisMonth = users.filter(u => {
      const uDate = new Date(u.created_at);
      return u.perfil === 'Cliente' && uDate >= firstDayOfMonth;
    }).length;

    return {
      totalImoveis: properties.length,
      imoveisVenda,
      imoveisAluguel,
      totalUsuarios: users.length,
      totalClientes,
      totalAdmins,
      totalMensagens: messages.length,
      mensagensPendentes,
      leadsMes: leadsThisMonth,
      solicitacoesVisita: totalVisits,
      totalVisualizacoes: totalViews
    };
  },

  // --- CONFIGURATIONS ---
  getConfiguracoes: (): Configuracoes => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : INITIAL_CONFIG;
  },

  saveConfiguracoes: (config: Partial<Configuracoes>): Configuracoes => {
    initializeStorage();
    const current = mockDb.getConfiguracoes();
    const updated = {
      ...current,
      ...config,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    return updated;
  },

  // --- SELLERS ---
  getVendedores: (): Vendedor[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.SELLERS);
    return data ? JSON.parse(data) : [];
  },

  saveVendedor: (vendedor: Partial<Vendedor> & { nome: string; role: string; especializacao: string }): Vendedor => {
    initializeStorage();
    const list = mockDb.getVendedores();
    let saved: Vendedor;

    if (vendedor.id) {
      const index = list.findIndex(v => v.id === vendedor.id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...vendedor,
          updated_at: new Date().toISOString()
        };
        saved = list[index];
      } else {
        throw new Error('Vendedor não encontrado');
      }
    } else {
      const id = 'vendedor-' + Math.random().toString(36).substr(2, 9);
      saved = {
        id,
        nome: vendedor.nome,
        role: vendedor.role,
        especializacao: vendedor.especializacao,
        telefone: vendedor.telefone,
        email: vendedor.email,
        foto: vendedor.foto || '/imagesub.png',
        creci: vendedor.creci,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(list));
    return saved;
  },

  deleteVendedor: (id: string): boolean => {
    initializeStorage();
    const list = mockDb.getVendedores();
    const filtered = list.filter(v => v.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  getCategories: (): Categoria[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  saveCategory: (category: Partial<Categoria> & { nome: string; tipo: string }): Categoria => {
    initializeStorage();
    const list = mockDb.getCategories();
    let saved: Categoria;

    const existingIndex = list.findIndex(c => c.id === category.id);
    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...category,
        updated_at: new Date().toISOString()
      };
      saved = list[existingIndex];
    } else {
      const id = category.id || 'cat-' + Math.random().toString(36).substr(2, 9);
      saved = {
        id,
        nome: category.nome,
        tipo: category.tipo,
        imagem: category.imagem || '/imagesub.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    return saved;
  },

  deleteCategory: (id: string): boolean => {
    initializeStorage();
    const list = mockDb.getCategories();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
      return true;
    }
    return false;
  }
};
