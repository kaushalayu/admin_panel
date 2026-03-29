import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Globe, Users, MessageSquare, Mail, LogOut, Menu, Briefcase, Code, Monitor, X, ChevronLeft, ChevronRight, Settings, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('illusion_admin_user') || '{}');
  const isSuperAdmin = user.role === 'super_admin';
  const roleDisplay = user.role === 'super_admin' ? 'Super Admin' : user.role === 'developer' ? 'Developer' : 'SEO Manager';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', allowedRoles: ['all'] },
    { name: 'Blogs & Articles', icon: FileText, path: '/blogs', allowedRoles: ['seo_manager', 'super_admin'] },
    { name: 'Global SEO', icon: Globe, path: '/global-seo', allowedRoles: ['seo_manager', 'super_admin'] },
    { name: 'Projects', icon: Monitor, path: '/projects', allowedRoles: ['developer', 'super_admin'] },
    { name: 'Services', icon: Code, path: '/services', allowedRoles: ['developer', 'super_admin'] },
    { name: 'Careers (Jobs)', icon: Briefcase, path: '/careers', allowedRoles: ['developer', 'super_admin'] },
    { name: 'Team Members', icon: UserCheck, path: '/teams', allowedRoles: ['developer', 'super_admin'] },
    { name: 'Contact Submissions', icon: MessageSquare, path: '/contacts', allowedRoles: ['super_admin'] },
    { name: 'Newsletter Subscribers', icon: Mail, path: '/newsletters', allowedRoles: ['super_admin'] },
    { name: 'User Management', icon: Users, path: '/users', allowedRoles: ['super_admin'] },
    { name: 'Site Settings', icon: Settings, path: '/site-settings', allowedRoles: ['super_admin'] }
  ];

  const filteredMenuItems = menuItems.filter(
    item => item.allowedRoles.includes('all') || item.allowedRoles.includes(user.role)
  );

  const handleLogout = () => {
    localStorage.removeItem('illusion_admin_token');
    localStorage.removeItem('illusion_admin_user');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center ${sidebarOpen ? 'px-4' : 'justify-center px-1'} py-3 rounded-xl transition-all ${
      isActive
      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`;

  const currentMenuName = menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard';

  const SidebarContent = ({ isMobile = false, collapsed = false }) => (
    <div className="flex flex-col h-full">
      <div className={`h-16 md:h-20 flex items-center px-4 md:px-6 border-b border-slate-800 relative ${isMobile ? '' : collapsed ? 'justify-center px-1' : ''}`}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {!collapsed && (
          <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 whitespace-nowrap">
            Illusion Admin
          </span>
        )}
        {collapsed && !isMobile && (
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">I</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-1">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={navLinkClass}
            title={collapsed && !isMobile ? item.name : ''}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium whitespace-nowrap text-sm md:text-base ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      <div className={`p-2 md:p-3 border-t border-slate-800 space-y-2 ${collapsed && !isMobile ? 'px-1' : ''}`}>
        <div className={`flex items-center rounded-xl bg-slate-800/50 border border-slate-700/50 ${collapsed && !isMobile ? 'justify-center p-2' : 'px-3 py-3'}`}>
          <div className={`rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 ${collapsed && !isMobile ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10 flex-shrink-0'}`}>
            {user.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSuperAdmin ? 'bg-purple-500' : user.role === 'developer' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                {roleDisplay}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10 ${collapsed && !isMobile ? 'justify-center p-2' : 'px-3 py-2.5'}`}
          title={collapsed && !isMobile ? 'Sign Out' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
          {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 60 }}
          className="bg-slate-900 border-r border-slate-800 shadow-2xl overflow-hidden relative z-20 h-screen sticky top-0"
        >
          <SidebarContent collapsed={!sidebarOpen} />

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg z-50"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </motion.div>
      </div>

      {/* Tablet Sidebar (always visible with icons) */}
      <div className="hidden md:flex lg:hidden flex-shrink-0">
        <div className="bg-slate-900 border-r border-slate-800 shadow-2xl overflow-hidden relative z-20 h-screen sticky top-0 w-16">
          <SidebarContent collapsed={true} />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl z-40 md:hidden"
            >
              <SidebarContent isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 md:h-20 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base md:text-xl font-semibold text-white tracking-wide">{currentMenuName}</h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="px-2.5 md:px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 md:gap-2">
              <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] md:text-xs font-medium text-slate-300 hidden sm:inline">Online</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
