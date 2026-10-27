'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Film, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function RegisterPage() {
  const { signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha deve ter no minimo 8 caracteres.');
      return;
    }
    try {
      await signUp(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setError('Este e-mail ja esta cadastrado.');
      } else if (msg.includes('weak-password')) {
        setError('Senha muito fraca. Use pelo menos 8 caracteres.');
      } else if (msg.includes('invalid-email')) {
        setError('E-mail invalido.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-500/25 mb-4">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Visual Studio</h1>
          <p className="text-sm text-slate-400 mt-1">Crie sua conta e comece a gerar videos com codigo</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Criar nova conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caracteres"
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
                <span>Criando conta...</span>
              ) : (
                <>
                  <span>Criar Conta Gratuita</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Ja tem uma conta?{' '}
            <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
