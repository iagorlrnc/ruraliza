export type PerfilUsuario = 'Administrador' | 'Corretor' | 'Cliente';
export type StatusUsuario = 'Ativo' | 'Inativo' | 'Pendente';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  creci?: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  senha?: string;
  created_at: string;
  updated_at: string;
  // CRM helper stats (calculated or aggregated)
  mensagens_enviadas_count?: number;
  imoveis_visualizados_count?: number;
  ultimo_contato?: string;
}

export type TipoImovel = 'Chácara' | 'Fazenda' | 'Sítio' | 'Rancho' | 'Terreno Rural' | 'Área Agrícola';
export type ModalidadeImovel = 'Venda' | 'Aluguel';
export type StatusImovel = 'Ativo' | 'Rascunho' | 'Excluido';

export interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: string;
  modalidade: ModalidadeImovel;
  valor: number;
  area_total: number;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
  destaque: boolean;
  status: StatusImovel;
  created_at: string;
  updated_at: string;
  imagens?: ImagemImovel[];
  visualizacoes?: number;
}

export interface ImagemImovel {
  id: string;
  imovel_id: string;
  url: string;
  ordem: number;
}

export type StatusMensagem = 'Nova' | 'Em andamento' | 'Respondida' | 'Arquivada';

export interface Mensagem {
  id: string;
  usuario_id?: string;
  imovel_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  status: StatusMensagem;
  observacao_interna?: string;
  atribuido_a_id?: string;
  atribuido_a?: Usuario;
  created_at: string;
  usuario?: Usuario;
  imovel?: Imovel;
}

export type StatusVisita = 'Pendente' | 'Confirmada' | 'Cancelada' | 'Concluída';

export interface SolicitacaoVisita {
  id: string;
  usuario_id?: string;
  imovel_id: string;
  data_solicitada: string;
  observacoes?: string;
  status: StatusVisita;
  created_at: string;
  usuario?: Usuario;
  imovel?: Imovel;
}

export interface Depoimento {
  id: string;
  nome: string;
  cargo: string;
  texto: string;
  aprovado: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  totalImoveis: number;
  imoveisVenda: number;
  imoveisAluguel: number;
  totalUsuarios: number;
  totalClientes: number;
  totalAdmins: number;
  totalMensagens: number;
  leadsMes: number;
  mensagensPendentes: number;
  solicitacoesVisita: number;
  totalVisualizacoes: number;
}

export interface Configuracoes {
  id: string;
  telefone: string;
  telefone_secundario?: string;
  email: string;
  endereco: string;
  creci: string;
  latitude?: number;
  longitude?: number;
  social_facebook?: string;
  social_instagram?: string;
  social_linkedin?: string;
  social_whatsapp?: string;
  updated_at?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  role: string;
  especializacao: string;
  telefone?: string;
  email?: string;
  foto?: string;
  creci?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  imagem?: string;
  created_at?: string;
  updated_at?: string;
  count?: number;
}

