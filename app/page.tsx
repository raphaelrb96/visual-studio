import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronRight,
  Zap,
  Star,
  Film,
  Bot,
  Check,
  Volume2,
  Wand2,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-indigo-500/20 via-purple-600/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[750px] -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1300px] -right-48 w-96 h-96 bg-purple-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar Superior */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#060911]/85 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0a0f1d] rounded-2xl flex items-center justify-center">
                <Film className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block">Visual Studio</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block -mt-0.5">Gerador de Vídeos em 1 Clique</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#vantagens" className="hover:text-white transition-colors">Vantagens</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos SaaS</a>
            <a href="#depoimentos" className="hover:text-white transition-colors">Resultados</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 sm:px-4 py-2 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Gerar Vídeo Grátis</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Voz Neural Real + Legendas Dinâmicas + B-Roll em 1 Clique</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Digite uma frase e receba seu{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            vídeo pronto para postar
          </span>{' '}
          em segundos.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Sem timelines complicadas e sem perder horas editando. Nossa plataforma cria o <strong className="text-white">roteiro persuasivo, a locução em português, o fundo cinematográfico e as legendas palavra por palavra</strong> automaticamente.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-500/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Wand2 className="w-5 h-5 text-cyan-300" />
            <span>Criar Meu Primeiro Vídeo Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 sm:px-9 sm:py-4.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-500 text-slate-100 font-bold text-base flex items-center justify-center gap-3 backdrop-blur-xl transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Acessar o Estúdio</span>
          </Link>
        </div>

        <div className="mt-8 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            3 vídeos grátis para testar agora
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Voz em Português e Efeitos Sonoros inclusos
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Pronto para Reels, TikTok e Shorts
          </span>
        </div>

        {/* Passo a passo em 1 clique */}
        <div id="como-funciona" className="mt-16 sm:mt-20 relative max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-700/40 via-slate-900/40 to-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-2xl bg-[#090d18] border border-white/5 p-6 sm:p-10">
            <div className="text-center mb-8">
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest font-bold">Fluxo 1-Clique</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Do seu tema ao vídeo finalizado em 30 segundos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl p-6 bg-[#0e1526] border border-white/5 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black flex items-center justify-center text-sm border border-indigo-500/20 mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Digite o Tema</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Escreva apenas uma frase sobre o seu produto, serviço ou dica. Nossos agentes criam o roteiro viral completo.
                </p>
              </div>

              <div className="rounded-2xl p-6 bg-[#0e1526] border border-white/5 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-black flex items-center justify-center text-sm border border-purple-500/20 mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Voz + B-Roll Automático</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  O sistema gera a narração em voz neural, seleciona as imagens de fundo em movimento e sincroniza as legendas.
                </p>
              </div>

              <div className="rounded-2xl p-6 bg-[#0e1526] border border-white/5 text-left">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/20 mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Dê Play e Baixe</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Assista imediatamente com som real e clique em baixar para publicar nas suas redes ou campanhas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos SaaS */}
      <section id="planos" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest font-bold">Assinatura Simples</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
            Escolha seu plano e produza em escala
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Comece gratuitamente e faça upgrade quando precisar de mais volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Trial */}
          <div className="rounded-3xl p-8 bg-[#0c1222] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">Degustação</span>
              <h3 className="text-2xl font-black text-white mt-2">Teste Grátis</h3>
              <p className="text-xs text-slate-400 mt-1">Para você comprovar a velocidade agora</p>
              
              <div className="my-6">
                <span className="text-4xl font-black text-white">R$ 0</span>
                <span className="text-xs text-slate-400"> / 3 vídeos</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>3 vídeos completos com voz</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Legendas dinâmicas estilo Hormozi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Download imediato</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all"
            >
              Testar Gratuitamente
            </Link>
          </div>

          {/* Plano Criador */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#182342] to-[#0d1424] border border-indigo-500/50 flex flex-col justify-between relative shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
              Mais Assinado
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-indigo-300 tracking-wider font-bold">SaaS • Mensal</span>
              <h3 className="text-2xl font-black text-white mt-2">Plano Criador</h3>
              <p className="text-xs text-slate-300 mt-1">2 vídeos profissionais todos os dias</p>
              
              <div className="my-6">
                <span className="text-4xl font-black text-white">R$ 97</span>
                <span className="text-xs text-slate-300"> / mês</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-200 border-t border-slate-700 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span><strong>60 vídeos gerados</strong> por mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Locução Neural + Efeitos Sonoros</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Formatos 9:16, 16:9 e 1:1</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Sem marca d&apos;água</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs text-center transition-all shadow-lg shadow-indigo-600/30"
            >
              Começar Agora
            </Link>
          </div>

          {/* Plano Pro Escala */}
          <div className="rounded-3xl p-8 bg-[#0c1222] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-bold">Alto Volume</span>
              <h3 className="text-2xl font-black text-white mt-2">Plano Pro Escala</h3>
              <p className="text-xs text-slate-400 mt-1">5 vídeos por dia para múltiplos perfis</p>
              
              <div className="my-6">
                <span className="text-4xl font-black text-white">R$ 197</span>
                <span className="text-xs text-slate-400"> / mês</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span><strong>150 vídeos gerados</strong> por mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Todos os estilos e temas liberados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Prioridade máxima de geração</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Suporte VIP dedicado</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all"
            >
              Assinar Plano Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-bold">Visual Studio SaaS</span>
            <span>&copy; {new Date().getFullYear()} Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">Sobre</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacidade</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
