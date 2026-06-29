import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ships from './pages/Ships';
import Berths from './pages/Berths';
import DockingRequests from './pages/DockingRequests';
import Cargo from './pages/Cargo';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes - All authenticated users */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/ships" element={<ProtectedRoute><Ships /></ProtectedRoute>} />
              <Route path="/berths" element={<ProtectedRoute><Berths /></ProtectedRoute>} />
              <Route path="/docking" element={<ProtectedRoute><DockingRequests /></ProtectedRoute>} />
              <Route path="/cargo" element={<ProtectedRoute><Cargo /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Admin + Port Officer only */}
              <Route path="/reports" element={<ProtectedRoute roles={['Admin', 'Port Officer']}><Reports /></ProtectedRoute>} />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
