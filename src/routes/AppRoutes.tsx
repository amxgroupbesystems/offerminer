import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { OffersPage } from '../pages/OffersPage';
import { OfferDetailsPage } from '../pages/OfferDetailsPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { MonitoredSearchesPage } from '../pages/MonitoredSearchesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ProtectedRoute, PublicOnlyRoute } from '../components/AuthGuard';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas (acessíveis apenas se NÃO logado) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      </Route>

      {/* Rotas Protegidas (acessíveis apenas se logado) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ofertas" element={<OffersPage />} />
          <Route path="/ofertas/:id" element={<OfferDetailsPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/pesquisas" element={<MonitoredSearchesPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

