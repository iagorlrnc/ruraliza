import { supabase } from '../lib/supabase';
import { mockDb } from './mockData';
import { 
  Imovel, 
  Usuario, 
  Mensagem, 
  SolicitacaoVisita, 
  Depoimento, 
  DashboardMetrics, 
  StatusMensagem, 
  StatusVisita,
  Configuracoes,
  Vendedor
} from '../types';

// Detect if Supabase is fully configured
export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return (
    !!url && 
    url !== '' && 
    !url.includes('placeholder-project') && 
    !url.includes('your-supabase-project') &&
    !!key && 
    key !== '' && 
    !key.includes('placeholder-anon-key') && 
    !key.includes('your-supabase-anon-key')
  );
};

export const api = {
  isConfigured: () => isSupabaseConfigured(),

  // --- PROPERTIES (IMOVEIS) ---
  getProperties: async (): Promise<Imovel[]> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getProperties();
    }

    const { data, error } = await supabase
      .from('tabela_imoveis')
      .select('*, tabela_imagens_imoveis(*)')
      .neq('status', 'Excluido')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties from Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      codigo: row.codigo,
      titulo: row.titulo,
      descricao: row.descricao,
      tipo: row.tipo,
      modalidade: row.modalidade,
      valor: Number(row.valor),
      area_total: Number(row.area_total),
      cidade: row.cidade,
      estado: row.estado,
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      destaque: row.destaque,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      visualizacoes: row.visualizacoes !== undefined ? Number(row.visualizacoes || 0) : mockDb.getPropertyViews(row.id),
      imagens: (row.tabela_imagens_imoveis || []).map((img: any) => ({
        id: img.id,
        imovel_id: img.imovel_id,
        url: img.url,
        ordem: img.ordem
      })).sort((a: any, b: any) => a.ordem - b.ordem)
    }));
  },

  getPropertyById: async (id: string): Promise<Imovel | undefined> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getPropertyById(id);
    }

    const { data, error } = await supabase
      .from('tabela_imoveis')
      .select('*, tabela_imagens_imoveis(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // single row empty
      console.error('Error fetching property by id from Supabase:', error);
      throw error;
    }

    if (!data || data.status === 'Excluido') return undefined;

    return {
      id: data.id,
      codigo: data.codigo,
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      modalidade: data.modalidade,
      valor: Number(data.valor),
      area_total: Number(data.area_total),
      cidade: data.cidade,
      estado: data.estado,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      destaque: data.destaque,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      visualizacoes: data.visualizacoes !== undefined ? Number(data.visualizacoes || 0) : mockDb.getPropertyViews(data.id),
      imagens: (data.tabela_imagens_imoveis || []).map((img: any) => ({
        id: img.id,
        imovel_id: img.imovel_id,
        url: img.url,
        ordem: img.ordem
      })).sort((a: any, b: any) => a.ordem - b.ordem)
    };
  },

  incrementPropertyViews: async (id: string): Promise<void> => {
    // 1. Increment locally first
    mockDb.incrementView(id);

    // 2. Try incrementing in Supabase database if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('incrementar_visualizacoes_imovel', {
          p_imovel_id: id
        });
      } catch (err) {
        console.warn('Failed to increment views on Supabase (this is normal if the SQL function or visualizacoes column is not created yet):', err);
      }
    }
  },

  saveProperty: async (property: Partial<Imovel> & { titulo: string }): Promise<Imovel> => {
    if (!isSupabaseConfigured()) {
      return mockDb.saveProperty(property);
    }

    const isNew = !property.id;
    const propertyPayload = {
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
      updated_at: new Date().toISOString()
    };

    let savedProperty: any;

    if (isNew) {
      const { data, error } = await supabase
        .from('tabela_imoveis')
        .insert([propertyPayload])
        .select()
        .single();
      if (error) throw error;
      savedProperty = data;
    } else {
      const { data, error } = await supabase
        .from('tabela_imoveis')
        .update(propertyPayload)
        .eq('id', property.id)
        .select()
        .single();
      if (error) throw error;
      savedProperty = data;
    }

    // Handle images
    if (property.imagens && property.imagens.length > 0) {
      // Delete old images
      if (!isNew) {
        await supabase
          .from('tabela_imagens_imoveis')
          .delete()
          .eq('imovel_id', savedProperty.id);
      }

      // Insert new images
      const imagesPayload = property.imagens.map((img, idx) => ({
        imovel_id: savedProperty.id,
        url: img.url,
        ordem: idx
      }));

      const { error: imgError } = await supabase
        .from('tabela_imagens_imoveis')
        .insert(imagesPayload);
      if (imgError) throw imgError;
    }

    // Fetch complete property details
    const complete = await api.getPropertyById(savedProperty.id);
    if (!complete) throw new Error('Failed to retrieve saved property');
    return complete;
  },

  deleteProperty: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return mockDb.deletePropertySoft(id);
    }

    const { error } = await supabase
      .from('tabela_imoveis')
      .update({ status: 'Excluido', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- USERS ---
  getUsers: async (): Promise<Usuario[]> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getUsers();
    }

    const { data, error } = await supabase
      .from('tabela_usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Optional: Enrich users with message counts from Supabase dynamically if needed, 
    // or just return the records
    return data || [];
  },

  getUserById: async (id: string): Promise<Usuario | undefined> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getUserById(id);
    }

    const { data, error } = await supabase
      .from('tabela_usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    // Retrieve user interactions history
    const { data: messages } = await supabase
      .from('tabela_mensagens')
      .select('id, created_at')
      .eq('usuario_id', id);
      
    return {
      ...data,
      mensagens_enviadas_count: messages?.length || 0,
      ultimo_contato: messages && messages.length > 0 ? messages[messages.length - 1].created_at : undefined
    };
  },

  saveUser: async (user: Partial<Usuario> & { nome: string; email: string }): Promise<Usuario> => {
    if (!isSupabaseConfigured()) {
      return mockDb.saveUser(user);
    }

    const emailLower = user.email.toLowerCase();
    
    // Check if user already exists
    const { data: existing } = await supabase
      .from('tabela_usuarios')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    const userPayload = {
      nome: user.nome,
      telefone: user.telefone,
      cidade: user.cidade,
      perfil: user.perfil || 'Cliente',
      status: user.status || 'Ativo',
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { data, error } = await supabase
        .from('tabela_usuarios')
        .update(userPayload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('tabela_usuarios')
        .insert([{
          id: user.id, // optional predefined UUID
          email: emailLower,
          ...userPayload
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // --- MESSAGES ---
  getMessages: async (): Promise<Mensagem[]> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getMessages();
    }

    const { data, error } = await supabase
      .from('tabela_mensagens')
      .select('*, tabela_usuarios(*), tabela_imoveis(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      usuario_id: row.usuario_id,
      imovel_id: row.imovel_id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      assunto: row.assunto,
      mensagem: row.mensagem,
      status: row.status,
      observacao_interna: row.observacao_interna,
      created_at: row.created_at,
      usuario: row.tabela_usuarios ? {
        id: row.tabela_usuarios.id,
        nome: row.tabela_usuarios.nome,
        email: row.tabela_usuarios.email,
        telefone: row.tabela_usuarios.telefone,
        cidade: row.tabela_usuarios.cidade,
        perfil: row.tabela_usuarios.perfil,
        status: row.tabela_usuarios.status,
        created_at: row.tabela_usuarios.created_at,
        updated_at: row.tabela_usuarios.updated_at
      } : undefined,
      imovel: row.tabela_imoveis ? {
        id: row.tabela_imoveis.id,
        codigo: row.tabela_imoveis.codigo,
        titulo: row.tabela_imoveis.titulo,
        descricao: row.tabela_imoveis.descricao,
        tipo: row.tabela_imoveis.tipo,
        modalidade: row.tabela_imoveis.modalidade,
        valor: row.tabela_imoveis.valor,
        area_total: row.tabela_imoveis.area_total,
        cidade: row.tabela_imoveis.cidade,
        estado: row.tabela_imoveis.estado,
        destaque: row.tabela_imoveis.destaque,
        status: row.tabela_imoveis.status,
        created_at: row.tabela_imoveis.created_at,
        updated_at: row.tabela_imoveis.updated_at
      } : undefined
    }));
  },

  registrarMensagemContato: async (payload: {
    nome: string;
    email: string;
    telefone?: string;
    assunto: string;
    mensagem: string;
    imovel_id?: string;
  }): Promise<string> => {
    if (!isSupabaseConfigured()) {
      const res = mockDb.registrarInteracaoCliente(payload);
      return res.mensagemId;
    }

    // Call the security definer database RPC
    const { data, error } = await supabase.rpc('registrar_mensagem_contato', {
      p_nome: payload.nome,
      p_email: payload.email,
      p_telefone: payload.telefone || null,
      p_assunto: payload.assunto,
      p_mensagem: payload.mensagem,
      p_imovel_id: payload.imovel_id || null
    });

    if (error) throw error;
    return data; // returns the generated user id, message id is generated in db
  },

  updateMessageStatus: async (id: string, status: StatusMensagem, observacao?: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return mockDb.updateMessageStatus(id, status, observacao);
    }

    const { error } = await supabase
      .from('tabela_mensagens')
      .update({ 
        status, 
        observacao_interna: observacao 
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- VISIT REQUESTS ---
  getVisits: async (): Promise<SolicitacaoVisita[]> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getVisits();
    }

    const { data, error } = await supabase
      .from('tabela_solicitacoes_visita')
      .select('*, tabela_usuarios(*), tabela_imoveis(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      usuario_id: row.usuario_id,
      imovel_id: row.imovel_id,
      data_solicitada: row.data_solicitada,
      observacoes: row.observacoes,
      status: row.status,
      created_at: row.created_at,
      usuario: row.tabela_usuarios,
      imovel: row.tabela_imoveis
    }));
  },

  registrarSolicitacaoVisita: async (payload: {
    nome: string;
    email: string;
    telefone?: string;
    imovel_id: string;
    data_solicitada: string;
    observacoes?: string;
  }): Promise<string> => {
    if (!isSupabaseConfigured()) {
      const res = mockDb.registrarSolicitacaoVisita(payload);
      return res.visitaId;
    }

    const { data, error } = await supabase.rpc('registrar_solicitacao_visita', {
      p_nome: payload.nome,
      p_email: payload.email,
      p_telefone: payload.telefone || null,
      p_imovel_id: payload.imovel_id,
      p_data_solicitada: payload.data_solicitada,
      p_observacoes: payload.observacoes || null
    });

    if (error) throw error;
    return data;
  },

  updateVisitStatus: async (id: string, status: StatusVisita): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return mockDb.updateVisitStatus(id, status);
    }

    const { error } = await supabase
      .from('tabela_solicitacoes_visita')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- TESTIMONIALS ---
  getTestimonials: async (): Promise<Depoimento[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_depoimentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  saveTestimonial: async (testimonial: Partial<Depoimento> & { nome: string; cargo: string; texto: string }): Promise<Depoimento> => {
    if (!isSupabaseConfigured()) {
      return mockDb.saveTestimonial(testimonial);
    }

    if (testimonial.id) {
      const { data, error } = await supabase
        .from('tabela_depoimentos')
        .update({
          nome: testimonial.nome,
          cargo: testimonial.cargo,
          texto: testimonial.texto
        })
        .eq('id', testimonial.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('tabela_depoimentos')
        .insert([{
          nome: testimonial.nome,
          cargo: testimonial.cargo,
          texto: testimonial.texto
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteTestimonial: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return mockDb.deleteTestimonial(id);
    }

    const { error } = await supabase
      .from('tabela_depoimentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  updateTestimonialApproval: async (id: string, aprovado: boolean): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return mockDb.updateTestimonialApproval(id, aprovado);
    }

    const { error } = await supabase
      .from('tabela_depoimentos')
      .update({ aprovado })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- DASHBOARD METRICS ---
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getMetrics();
    }

    // Call Supabase queries in parallel for efficiency
    try {
      const [
        propCount,
        vendaCount,
        aluguelCount,
        userCount,
        clientCount,
        adminCount,
        messageCount,
        pendingMsgCount,
        visitCount,
        viewsResult
      ] = await Promise.all([
        supabase.from('tabela_imoveis').select('id', { count: 'exact', head: true }).neq('status', 'Excluido'),
        supabase.from('tabela_imoveis').select('id', { count: 'exact', head: true }).eq('modalidade', 'Venda').neq('status', 'Excluido'),
        supabase.from('tabela_imoveis').select('id', { count: 'exact', head: true }).eq('modalidade', 'Aluguel').neq('status', 'Excluido'),
        supabase.from('tabela_usuarios').select('id', { count: 'exact', head: true }),
        supabase.from('tabela_usuarios').select('id', { count: 'exact', head: true }).eq('perfil', 'Cliente'),
        supabase.from('tabela_usuarios').select('id', { count: 'exact', head: true }).eq('perfil', 'Administrador'),
        supabase.from('tabela_mensagens').select('id', { count: 'exact', head: true }),
        supabase.from('tabela_mensagens').select('id', { count: 'exact', head: true }).in('status', ['Nova', 'Em andamento']),
        supabase.from('tabela_solicitacoes_visita').select('id', { count: 'exact', head: true }),
        supabase.from('tabela_imoveis').select('visualizacoes').neq('status', 'Excluido')
      ]);

      const mockMetrics = mockDb.getMetrics();
      const hasDatabaseViews = viewsResult.data && viewsResult.data.length > 0 && ('visualizacoes' in viewsResult.data[0]);
      
      const totalDatabaseViews = hasDatabaseViews
        ? viewsResult.data.reduce((sum: number, row: any) => sum + Number(row.visualizacoes || 0), 0)
        : mockMetrics.totalVisualizacoes;

      return {
        totalImoveis: propCount.count || 0,
        imoveisVenda: vendaCount.count || 0,
        imoveisAluguel: aluguelCount.count || 0,
        totalUsuarios: userCount.count || 0,
        totalClientes: clientCount.count || 0,
        totalAdmins: adminCount.count || 0,
        totalMensagens: messageCount.count || 0,
        mensagensPendentes: pendingMsgCount.count || 0,
        leadsMes: mockMetrics.leadsMes, // fallback to calculated monthly leads
        solicitacoesVisita: visitCount.count || 0,
        totalVisualizacoes: totalDatabaseViews
      };
    } catch (e) {
      console.warn('Failed to fetch metrics from Supabase, using mockDb fallback:', e);
      return mockDb.getMetrics();
    }
  },

  // --- CONFIGURATIONS ---
  getConfiguracoes: async (): Promise<Configuracoes> => {
    if (!isSupabaseConfigured()) {
      return {} as Configuracoes;
    }
    const { data, error } = await supabase
      .from('tabela_configuracoes')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching configurations from Supabase:', error);
      throw error;
    }
    if (!data) {
      return {} as Configuracoes;
    }
    return {
      ...data,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined
    };
  },

  saveConfiguracoes: async (config: Partial<Configuracoes>): Promise<Configuracoes> => {
    if (!isSupabaseConfigured()) {
      return mockDb.saveConfiguracoes(config);
    }
    const { data, error } = await supabase
      .from('tabela_configuracoes')
      .update({
        ...config,
        latitude: config.latitude ? Number(config.latitude) : null,
        longitude: config.longitude ? Number(config.longitude) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id || 'c0b67540-3b00-4b08-8e6f-fb9f8ee18299')
      .select()
      .single();

    if (error) {
      console.error('Error saving configurations to Supabase:', error);
      throw error;
    }
    return {
      ...data,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined
    };
  },

  // --- SELLERS ---
  getVendedores: async (): Promise<Vendedor[]> => {
    if (!isSupabaseConfigured()) {
      return mockDb.getVendedores();
    }
    const { data, error } = await supabase
      .from('tabela_vendedores')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sellers from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  saveVendedor: async (vendedor: Partial<Vendedor> & { nome: string; role: string; especializacao: string }): Promise<Vendedor> => {
    if (!isSupabaseConfigured()) {
      return mockDb.saveVendedor(vendedor);
    }
    const payload = {
      nome: vendedor.nome,
      role: vendedor.role,
      especializacao: vendedor.especializacao,
      telefone: vendedor.telefone || null,
      email: vendedor.email || null,
      foto: vendedor.foto || null,
      creci: vendedor.creci || null,
      updated_at: new Date().toISOString()
    };

    if (vendedor.id) {
      const { data, error } = await supabase
        .from('tabela_vendedores')
        .update(payload)
        .eq('id', vendedor.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('tabela_vendedores')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteVendedor: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return mockDb.deleteVendedor(id);
    }
    const { error } = await supabase
      .from('tabela_vendedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  uploadFile: async (file: File, bucket: string): Promise<string> => {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error(`Error uploading to bucket ${bucket}:`, error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
};
