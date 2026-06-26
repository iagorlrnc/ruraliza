import React from 'react';
import { Target, Eye, Heart, Users2, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

const Sobre: React.FC = () => {
  useSEO('Sobre Nós', 'Saiba mais sobre a nossa história, valores e corpo técnico especializado em agronegócio.');

  const team = [
    {
      name: 'Renato Silva',
      role: 'Diretor Executivo & Corretor Sênior',
      desc: 'Mais de 15 anos de experiência em grandes transações de terras e expansão pecuária.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Dr. Arthur Mendes',
      role: 'Consultor Jurídico Agrário',
      desc: 'Especialista em georreferenciamento, regularização de posses e compliance ambiental.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Sofia Rezende',
      role: 'Engenheira Agrônoma',
      desc: 'Responsável pela análise técnica de solos, capacidade de pastagens e estudos hídricos.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    }
  ];

  return (
    <div className="space-y-16 pb-20 text-left">
      {/* Banner */}
      <section className="relative h-64 bg-primary-dark text-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
            alt="História Ruraliza"
            className="w-full h-full object-cover opacity-20 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-primary-dark/80"></div>
        </div>
        <div className="relative z-10 text-center space-y-2">
          <h1 className="font-poppins text-3xl font-bold">Sobre Nós</h1>
          <p className="text-sm text-brand-beige-dark/70">Conheça nossa trajetória, propósito e corpo técnico</p>
        </div>
      </section>

      {/* History */}
      <section className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-primary-medium uppercase tracking-widest block">Nossa Origem</span>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-primary-dark dark:text-white">
            Uma história de ligação estreita com o homem do campo
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
            Fundada em Presidente Prudente - SP, a Ruraliza Negócios nasceu a partir da união de profissionais do mercado imobiliário com engenheiros agrônomos de campo. Percebemos que a intermediação de propriedades rurais exigia um nível de conhecimento técnico que as imobiliárias urbanas comuns não conseguiam suprir.
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
            Mais do que vender terras, oferecemos uma consultoria agrária integrada. Investigamos o teor de argila do solo, a pluviosidade histórica da região, o status de reserva legal e a regularidade de divisórias antes de oferecer qualquer fazenda. É essa responsabilidade que consolidou nossa marca como sinônimo de segurança e credibilidade no agronegócio.
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden aspect-[4/3] border border-gray-200 dark:border-zinc-800 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
            alt="Fazenda soja"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="bg-white dark:bg-zinc-900/40 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-brand-beige/35 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">Missão</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Viabilizar transações imobiliárias rurais seguras, pautadas em análises técnicas, gerando valor real para investidores e produtores rurais.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-brand-beige/35 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">Visão</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Ser a consultoria imobiliária rural mais admirada do interior brasileiro, reconhecida pelo rigor técnico e regularidade documental de sua carteira.
            </p>
          </div>

          {/* Values */}
          <div className="bg-brand-beige/35 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">Valores</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Ética inegociável, transparência jurídica completa, respeito à terra e sustentabilidade, e foco na segurança do patrimônio do cliente.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-5xl px-4 space-y-10">
        <div className="text-center max-w-sm mx-auto space-y-2">
          <div className="h-10 w-10 bg-primary-medium/10 rounded-full flex items-center justify-center mx-auto text-primary-medium">
            <Users2 className="h-5 w-5" />
          </div>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-primary-dark dark:text-white">
            Nossos Especialistas
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Conheça a equipe técnica que cuida de cada etapa de sua negociação rural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow text-center flex flex-col items-center"
            >
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary-medium/20 shadow-inner">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">{t.name}</h3>
                <span className="text-[10px] text-primary-medium dark:text-primary-light font-bold block">{t.role}</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
                {t.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Credibility / Trust Stamp */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="bg-primary-dark text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between text-left">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary-light shrink-0" />
              <h3 className="font-poppins text-lg font-bold">Assessoria Imobiliária com Selo de Segurança</h3>
            </div>
            <p className="text-xs text-brand-beige-dark/75 leading-relaxed">
              Trabalhamos em estreita parceria com os principais cartórios de registro de imóveis da região. Garantimos que sua transação ocorra sem embargos, garantias cruzadas ou surpresas tributárias.
            </p>
          </div>
          <div className="bg-primary-medium/25 border border-primary-medium/35 px-4 py-3 rounded-2xl shrink-0 text-center">
            <span className="block text-[10px] text-brand-beige-dark font-semibold uppercase tracking-wider">CRECI Jurídico</span>
            <strong className="text-base text-white font-poppins block">Nº 35.421-J</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sobre;
