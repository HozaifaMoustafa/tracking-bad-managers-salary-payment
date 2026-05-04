import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Sessions } from './pages/Sessions';
import { Payments } from './pages/Payments';
import { Monthly } from './pages/Monthly';
import { Sync } from './pages/Sync';
import { Settings } from './pages/Settings';
import { Alerts } from './pages/Alerts';
import { Clients } from './pages/Clients';
import { Billing } from './pages/Billing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ClientProvider } from './context/ClientContext';
import { isLoggedIn } from './lib/auth';

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// Root: landing page for guests, redirect to dashboard for logged-in users
function RootPage() {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ClientProvider>
              <Layout />
            </ClientProvider>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="payments" element={<Payments />} />
        <Route path="monthly" element={<Monthly />} />
        <Route path="sync" element={<Sync />} />
        <Route path="settings" element={<Settings />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="clients" element={<Clients />} />
        <Route path="billing" element={<Billing />} />
      </Route>
    </Routes>
  );
}
