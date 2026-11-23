import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import Users from './pages/Users.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const { booting } = useAuth();

  if (booting) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading Nexus Admin...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
