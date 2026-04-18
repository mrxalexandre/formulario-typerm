/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import FormEditor from './pages/FormEditor';
import RespondentView from './pages/RespondentView';
import ResponsesDashboard from './pages/ResponsesDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAdmin') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/admin/form/:id" element={<ProtectedRoute><FormEditor /></ProtectedRoute>} />
        <Route path="/admin/form/:id/responses" element={<ProtectedRoute><ResponsesDashboard /></ProtectedRoute>} />
        <Route path="/f/:id" element={<RespondentView />} />
        <Route path="/formulario/:id" element={<RespondentView />} />
      </Routes>
    </BrowserRouter>
  );
}
