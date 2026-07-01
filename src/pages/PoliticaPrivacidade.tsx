import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const PoliticaPrivacidade: React.FC = () => {
  const { darkMode } = useTheme();
  return (
    <div className="bg-brand-beige-light dark:bg-zinc-950 min-h-screen py-16 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-10 text-left">
        
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="h-14 w-14 flex items-center justify-center mx-auto">
            <img 
              src={darkMode ? '/logo.png' : '/logolight.png'} 
              alt="Ruraliza" 
              className="h-12 w-auto object-contain"
              data-no-protect="true"
            />
          </div>
          <h1 className="font-poppins text-3xl font-extrabold text-gray-800 dark:text-white sm:text-4xl tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Última atualização: 01 de Julho de 2026 • Em conformidade com a LGPD (Lei nº 13.709/2018)
          </p>
        </div>

        {/* Introduction Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-poppins text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-primary-medium shrink-0" />
            1. Compromisso com a sua Segurança
          </h2>
          <p className="text-xs text-gray-650 dark:text-zinc-400 leading-relaxed font-sans">
            A <strong>Ruraliza Negócios</strong> valoriza a sua privacidade e tem o compromisso de proteger todos os dados pessoais que você compartilha conosco. Esta Política de Privacidade explica de forma clara e transparente como coletamos, guardamos, processamos e protegemos suas informações quando você navega em nosso portal, solicita o contato de corretores ou manifesta interesse em adquirir/alugar imóveis rurais.
          </p>
        </div>

        {/* Data We Collect */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="font-poppins text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-primary-medium shrink-0" />
            2. Quais Dados Coletamos e Para Quê?
          </h2>
          
          <div className="space-y-4 text-xs font-sans text-gray-650 dark:text-zinc-400">
            <p className="leading-relaxed">
              Coletamos informações em momentos específicos de sua interação conosco para oferecer o melhor atendimento imobiliário possível. Veja os detalhes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50/80 dark:bg-zinc-950/40 border border-gray-200/60 dark:border-zinc-800/60 rounded-2xl space-y-2">
                <span className="block font-bold text-gray-800 dark:text-white">Formulários de Contato</span>
                <p className="text-[10px] leading-relaxed text-gray-500 dark:text-zinc-400">
                  Ao enviar propostas ou dúvidas sobre fazendas e chácaras, coletamos seu <strong>Nome, E-mail, Telefone e Cidade</strong>. Usamos esses dados exclusivamente para que nosso corretor responsável entre em contato direto para sanar suas dúvidas ou prosseguir com as negociações.
                </p>
              </div>

              <div className="p-4 bg-gray-50/80 dark:bg-zinc-950/40 border border-gray-200/60 dark:border-zinc-800/60 rounded-2xl space-y-2">
                <span className="block font-bold text-gray-800 dark:text-white">Solicitações de Visita</span>
                <p className="text-[10px] leading-relaxed text-gray-500 dark:text-zinc-400">
                  Ao agendar uma visita física a um imóvel rural listado, solicitamos seus dados básicos de identificação e contato. O objetivo é a sua própria segurança física e a segurança do proprietário da terra a ser visitada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Policy Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="font-poppins text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-primary-medium shrink-0" />
            3. Como usamos os Cookies?
          </h2>
          
          <div className="space-y-4 text-xs font-sans text-gray-650 dark:text-zinc-400 leading-relaxed">
            <p>
              Os cookies são pequenos arquivos de texto armazenados no seu navegador. Eles servem para dar inteligência e fluidez à sua navegação. Nós os dividimos em três categorias:
            </p>

            <ul className="space-y-3 list-disc pl-4">
              <li>
                <strong className="text-gray-800 dark:text-white">Essenciais (Segurança e Operação):</strong> Mantêm logada a sua conta de administrador/corretor e garantem o carregamento correto dos dados de segurança.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-white">Funcionais (Preferências):</strong> Lembram escolhas personalizadas feitas por você, tais como a escolha do tema do portal (**Modo Claro / Modo Escuro**).
              </li>
              <li>
                <strong className="text-gray-800 dark:text-white">Analíticos e Marketing:</strong> Coletam relatórios de uso agregados (páginas visitadas, cliques, tempo de tela) por meio de ferramentas como o Google Analytics, ajudando a Ruraliza a calibrar melhor os anúncios de imóveis rurais.
              </li>
            </ul>

            <div className="bg-primary-medium/5 border border-primary-medium/20 p-4 rounded-2xl text-[10px] leading-relaxed text-primary-dark dark:text-primary-light font-medium flex items-start gap-2.5">
              <Shield className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Você pode revisar ou revogar suas autorizações de cookies a qualquer momento clicando no link <strong>"Preferências de Cookies"</strong> no rodapé de nosso site e alterando os interruptores do banner de controle de privacidade.
              </span>
            </div>
          </div>
        </div>

        {/* Rights & Data Deletion */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150/40 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-poppins text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="h-4.5 w-4.5 text-primary-medium shrink-0" />
            4. Seus Direitos (LGPD) e Exclusão de Dados
          </h2>
          <div className="space-y-3 text-xs font-sans text-gray-650 dark:text-zinc-400 leading-relaxed">
            <p>
              Conforme previsto no artigo 18 da LGPD, você possui plenos direitos sobre seus dados pessoais, incluindo:
            </p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>Confirmação da existência de tratamento de seus dados.</li>
              <li>Acesso livre às suas informações guardadas.</li>
              <li>Correção de dados incompletos ou inexatos.</li>
              <li><strong>Exclusão definitiva</strong> dos seus dados de nosso banco de dados.</li>
            </ol>
            <p className="mt-2">
              Caso você deseje que a Ruraliza remova por completo suas informações de contato de nosso CRM, basta enviar uma mensagem pelo nosso formulário de contato público ou diretamente para o e-mail: <a href="mailto:contato@ruralizanegocios.com.br" className="text-primary-medium hover:underline font-bold">contato@ruralizanegocios.com.br</a>. Processaremos sua solicitação de eliminação em até 5 dias úteis.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-medium hover:text-primary-dark transition-colors"
          >
            Voltar para o Início <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
