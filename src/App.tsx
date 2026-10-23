import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { TenantDashboard } from './pages/admin/TenantDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import Storefront from './pages/Storefront.tsx'; // 👈 Import your new Storefront component

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/store/:slug" element={<Storefront />} /> {/* 👈 Public customer storefront route */}

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin/tenants" element={<TenantDashboard />} />
                </Route>

                {/* Root fallback redirect */}
                <Route path="*" element={<Navigate to="/admin/tenants" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;