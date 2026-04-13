/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import FormEditor from './pages/FormEditor';
import RespondentView from './pages/RespondentView';
import ResponsesDashboard from './pages/ResponsesDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/form/:id" element={<FormEditor />} />
        <Route path="/admin/form/:id/responses" element={<ResponsesDashboard />} />
        <Route path="/f/:id" element={<RespondentView />} />
      </Routes>
    </BrowserRouter>
  );
}
