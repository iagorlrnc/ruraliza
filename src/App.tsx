import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Subdomain Helper
import { isAdminSubdomain } from './utils/subdomain';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Imoveis from './pages/Imoveis';
import DetalheImovel from './pages/DetalheImovel';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';

// Administrative Pages
import AdminLogin from './features/auth/AdminLogin';
import Dashboard from './features/dashboard/Dashboard';
import PropertiesList from './features/properties/PropertiesList';
import PropertyForm from './features/properties/PropertyForm';
import MessagesList from './features/messages/MessagesList';
import UsersList from './features/users/UsersList';
import UserDetails from './features/users/UserDetails';
import TestimonialsList from './features/testimonials/TestimonialsList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App: React.FC = () => {
  const isHoldingAdminArea = isAdminSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              {isHoldingAdminArea ? (
                /* ==========================================
                   ROUTES FOR SUBDOMAIN: admin.*
                   ========================================== */
                <Routes>
                  {/* Public Login Route inside admin subdomain */}
                  <Route path="/login" element={<AdminLogin />} />

                  {/* Protected Admin Routes */}
                  <Route element={<AdminLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/imoveis" element={<PropertiesList />} />
                    <Route path="/imoveis/novo" element={<PropertyForm />} />
                    <Route path="/imoveis/editar/:id" element={<PropertyForm />} />
                    <Route path="/mensagens" element={<MessagesList />} />
                    <Route path="/usuarios" element={<UsersList />} />
                    <Route path="/usuarios/:id" element={<UserDetails />} />
                    <Route path="/depoimentos" element={<TestimonialsList />} />
                  </Route>

                  {/* Fallback to Dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              ) : (
                /* ==========================================
                   ROUTES FOR PUBLIC WEBSITE: domain.com
                   ========================================== */
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/imoveis" element={<Imoveis />} />
                    <Route path="/imoveis/:id" element={<DetalheImovel />} />
                    <Route path="/sobre" element={<Sobre />} />
                    <Route path="/contato" element={<Contato />} />
                  </Route>

                  {/* Fallback to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
