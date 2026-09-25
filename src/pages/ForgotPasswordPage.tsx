import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao solicitar a redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-500 mb-4 border border-blue-500/30">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Recuperar Senha</h2>
        <p className="mt-2 text-sm text-slate-400">
          Informe seu e-mail para receber um link de redefinição
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-4 shadow-xl border border-slate-800 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white">E-mail enviado!</h3>
              <p className="text-sm text-slate-400">
                Instruções para redefinir sua senha foram enviadas para seu e-mail.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Voltar para o Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-slate-300">E-mail</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center text-sm text-slate-400">
              Lembrou sua senha?{' '}
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Voltar para Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
