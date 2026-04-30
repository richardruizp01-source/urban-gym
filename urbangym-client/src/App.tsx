import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReservasPage from './pages/ReservasPage';
import ClasesPage from './pages/ClasesPage';
import MaquinasPage from './pages/MaquinasPage';
import SedesPage from './pages/SedesPage';
import PagosPage from './pages/PagosPage';
import QRPage from './pages/QRPage';
import PerfilProgreso from './pages/PerfilProgreso';
import RutinasPage from './pages/RutinasPage';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/reservas" element={<ProtectedRoute><ReservasPage /></ProtectedRoute>} />
      <Route path="/clases" element={<ProtectedRoute><ClasesPage /></ProtectedRoute>} />
      <Route path="/maquinas" element={<ProtectedRoute><MaquinasPage /></ProtectedRoute>} />
      <Route path="/sedes" element={<ProtectedRoute><SedesPage /></ProtectedRoute>} />
      <Route path="/pagos" element={<ProtectedRoute><PagosPage /></ProtectedRoute>} />
      <Route path="/qr" element={<ProtectedRoute><QRPage /></ProtectedRoute>} />
      <Route path="/progreso" element={<ProtectedRoute><PerfilProgreso /></ProtectedRoute>} />
      <Route path="/rutinas" element={<ProtectedRoute><RutinasPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;