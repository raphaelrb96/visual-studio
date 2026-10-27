'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Film, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('E-mail ou senha incorretos.');
      } else if (msg.includes('too-many-requests')) {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Erro ao fazer login. Verifique suas credenciais.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-500/25 mb-4">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Visual Studio</h1>
          <p className="text-sm text-slate-400 mt-1">Plataforma de Video as Code &amp; Motion Graphics</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Entrar na sua conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Senha</label>
                <a href="#" className="text-xs text-indigo-400 hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Ainda nao tem conta?{' '}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Cadastre-se gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
