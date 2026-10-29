import Link from 'next/link';
import { Mail, Phone, MessageSquare, Clock, CheckCircle2, ArrowRight, Briefcase } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100 p-6 sm:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-8">
          ← Voltar para a página inicial
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Esquerdo: Informações da Agência */}
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold inline-block">
              Atendimento Comercial &amp; Agência
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Vamos acelerar seus vídeos juntos?
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Deseja contratar nossos pacotes de agência com vídeos prontos ou tirar dúvidas sobre o software? Fale diretamente com nossa equipe.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pacotes Mensais</p>
                  <p className="font-semibold text-white">15 a 30 vídeos entregues</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">E-mail</p>
                  <p className="font-semibold text-white">contato@visualstudio.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tempo de Resposta</p>
                  <p className="font-semibold text-white">Até 2 horas em horário comercial</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0e1424]/90 border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-2">Solicitar Proposta ou Atendimento</h2>
            <p className="text-xs text-slate-400 mb-6">Preencha abaixo para receber o contato do especialista no WhatsApp ou e-mail</p>

            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Seu Nome</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Carlos Drummond"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Interesse Principal</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                  <option value="agencia-15">Quero contratar a Agência (Pacote 15 vídeos)</option>
                  <option value="agencia-30">Quero contratar a Agência (Pacote 30 vídeos)</option>
                  <option value="software">Dúvidas sobre o Software (SaaS)</option>
                  <option value="personalizado">Pacote Personalizado para Empresa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Conte um pouco sobre seu negócio</label>
                <textarea
                  rows={3}
                  placeholder="Qual é o seu nicho ou tipo de vídeo que você precisa?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Enviar Solicitação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
