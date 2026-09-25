import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm font-medium">Carregando sessão...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm font-medium">Carregando...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
