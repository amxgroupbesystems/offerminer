import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, User as UserIcon, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate('/dashboard');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-500 mb-4 border border-blue-500/30">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Criar Conta</h2>
        <p className="mt-2 text-sm text-slate-400">
          Junte-se ao OfferMiner e comece a minerar ofertas
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
              <h3 className="text-lg font-medium text-white">Conta criada com sucesso!</h3>
              <p className="text-sm text-slate-400">
                Verifique seu e-mail para confirmar a criação da sua conta antes de continuar.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Ir para Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-slate-300">Nome completo</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Seu Nome"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-slate-300">Senha</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Criando conta...' : 'Cadastrar'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center text-sm text-slate-400">
              Já possui uma conta?{' '}
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Faça login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
