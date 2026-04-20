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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/form/:id" element={<FormEditor />} />
        <Route path="/form/:id/responses" element={<ResponsesDashboard />} />
        <Route path="/f/:id" element={<RespondentView />} />
        <Route path="/formulario/:id" element={<RespondentView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
