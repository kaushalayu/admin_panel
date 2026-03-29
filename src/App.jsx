import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Blogs from './pages/Blogs';
import BlogForm from './pages/BlogForm';
import GlobalSeo from './pages/GlobalSeo';
import Contacts from './pages/Contacts';
import Newsletters from './pages/Newsletters';
import Users from './pages/Users';
import SiteSettings from './pages/SiteSettings';

import Projects from './pages/Projects';
import Services from './pages/Services';
import Careers from './pages/Careers';
import Teams from './pages/Teams';
import TeamForm from './pages/TeamForm';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('illusion_admin_token');
  const user = JSON.parse(localStorage.getItem('illusion_admin_user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin can bypass role checks usually
  if (user.role === 'super_admin') {
    return children;
  }

  // Check if current role is included in allowedRoles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          
          {/* SEO Routes: Accessible by SEO Manager & Super Admin (Developer via SuperAdmin bypass) */}
          <Route path="blogs" element={<ProtectedRoute allowedRoles={['super_admin', 'seo_manager', 'developer']}><Blogs /></ProtectedRoute>} />
          <Route path="blogs/new" element={<ProtectedRoute allowedRoles={['super_admin', 'seo_manager', 'developer']}><BlogForm /></ProtectedRoute>} />
          <Route path="blogs/edit/:id" element={<ProtectedRoute allowedRoles={['super_admin', 'seo_manager', 'developer']}><BlogForm /></ProtectedRoute>} />
          <Route path="global-seo" element={<ProtectedRoute allowedRoles={['super_admin', 'seo_manager', 'developer']}><GlobalSeo /></ProtectedRoute>} />
          
          {/* Developer Routes: Accessible by Developer & Super Admin */}
          <Route path="projects" element={<ProtectedRoute allowedRoles={['super_admin', 'developer']}><Projects /></ProtectedRoute>} />
          <Route path="services" element={<ProtectedRoute allowedRoles={['super_admin', 'developer']}><Services /></ProtectedRoute>} />
          <Route path="careers" element={<ProtectedRoute allowedRoles={['super_admin', 'developer']}><Careers /></ProtectedRoute>} />
          <Route path="teams" element={<ProtectedRoute allowedRoles={['super_admin', 'developer']}><Teams /></ProtectedRoute>} />
          <Route path="teams/new" element={<ProtectedRoute allowedRoles={['super_admin', 'developer']}><TeamForm /></ProtectedRoute>} />
          <Route path="teams/edit/:id" element={<ProtectedRoute allowedRoles={['super_admin', 'developer']}><TeamForm /></ProtectedRoute>} />
          
          {/* Super Admin Routes (Only Owner/Super Admin) */}
          <Route path="contacts" element={<ProtectedRoute allowedRoles={['super_admin']}><Contacts /></ProtectedRoute>} />
          <Route path="newsletters" element={<ProtectedRoute allowedRoles={['super_admin']}><Newsletters /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['super_admin']}><Users /></ProtectedRoute>} />
          <Route path="site-settings" element={<ProtectedRoute allowedRoles={['super_admin']}><SiteSettings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
