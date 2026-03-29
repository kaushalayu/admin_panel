import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FileText, Globe, Users, TrendingUp, Eye, Heart, Clock, 
  ArrowUpRight, ArrowDownRight, Briefcase, Code, Mail,
  MessageSquare, Bell, Zap, Server, Activity, Calendar,
  ChevronRight, Star, ExternalLink, Loader2, Plus, Settings
} from 'lucide-react';
import API_URL from '../config/api';

const MotionDiv = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={className}
  >
    {children}
  </motion.div>
);

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const numericValue = parseInt(value) || 0;
    const duration = 1500;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}{suffix}</span>;
};

export default function DashboardHome() {
  const user = JSON.parse(localStorage.getItem('illusion_admin_user') || '{}');
  const isSuperAdmin = user.role === 'super_admin';
  const isDeveloper = user.role === 'developer';
  
  const [stats, setStats] = useState({
    blogs: 0, projects: 0, services: 0, contacts: 0, subscribers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity] = useState([
    { id: 1, type: 'blog', action: 'New blog published', time: '2 mins ago', icon: FileText, color: 'text-blue-400' },
    { id: 2, type: 'contact', action: 'New contact inquiry', time: '15 mins ago', icon: MessageSquare, color: 'text-green-400' },
    { id: 3, type: 'project', action: 'Project updated', time: '1 hour ago', icon: Briefcase, color: 'text-purple-400' },
    { id: 4, type: 'subscriber', action: 'New newsletter signup', time: '2 hours ago', icon: Mail, color: 'text-pink-400' },
    { id: 5, type: 'seo', action: 'SEO score improved', time: '3 hours ago', icon: Globe, color: 'text-amber-400' },
  ]);
  
  const [quickStats] = useState([
    { label: 'Total Views', value: '125.4K', change: '+12.5%', trend: 'up', color: 'text-emerald-400' },
    { label: 'Avg Time on Page', value: '3:42', change: '+8.2%', trend: 'up', color: 'text-blue-400' },
    { label: 'Bounce Rate', value: '32.1%', change: '-5.3%', trend: 'down', color: 'text-purple-400' },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [blogsRes, projectsRes, servicesRes, statsRes] = await Promise.allSettled([
        axios.get('${API_URL}/api/blog/admin/all?limit=1', { headers }),
        axios.get('${API_URL}/api/projects', { headers }),
        axios.get('${API_URL}/api/services', { headers }),
        axios.get('${API_URL}/admin/api/stats', { headers }),
      ]);

      setStats({
        blogs: blogsRes.status === 'fulfilled' ? blogsRes.value.data.pagination?.totalRecords || 0 : 0,
        projects: projectsRes.status === 'fulfilled' ? projectsRes.value.data.count || 0 : 0,
        services: servicesRes.status === 'fulfilled' ? servicesRes.value.data.count || 0 : 0,
        contacts: statsRes.status === 'fulfilled' ? statsRes.value.data.data.totalContacts || 0 : 0,
        subscribers: statsRes.status === 'fulfilled' ? statsRes.value.data.data.totalSubscribers || 0 : 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      name: 'Total Blogs', 
      value: stats.blogs, 
      icon: FileText, 
      color: 'blue',
      gradient: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      path: '/blogs',
      description: 'Articles & content'
    },
    { 
      name: 'Projects', 
      value: stats.projects, 
      icon: Briefcase, 
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      path: '/projects',
      description: 'Portfolio work'
    },
    { 
      name: 'Services', 
      value: stats.services, 
      icon: Code, 
      color: 'pink',
      gradient: 'from-pink-500/20 to-pink-600/10',
      border: 'border-pink-500/30',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      path: '/services',
      description: 'Our offerings'
    },
    { 
      name: 'Contacts', 
      value: stats.contacts, 
      icon: MessageSquare, 
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      path: '/contacts',
      description: 'Inquiries received'
    },
    ...(isSuperAdmin ? [{
      name: 'Subscribers',
      value: stats.subscribers,
      icon: Mail,
      color: 'amber',
      gradient: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      path: '/newsletters',
      description: 'Newsletter list'
    }] : []),
  ];

  const quickActions = [
    { name: 'Write Article', icon: FileText, color: 'blue', path: '/blogs/new' },
    { name: 'Add Project', icon: Plus, color: 'purple', path: '/projects' },
    { name: 'Global SEO', icon: Globe, color: 'emerald', path: '/global-seo' },
    { name: 'Add Service', icon: Code, color: 'pink', path: '/services' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <MotionDiv delay={0}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{user.name}</span>
              </h1>
              <p className="text-slate-400 mt-2">Here's what's happening with your website today.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-400">System Online</span>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
          ))
        ) : (
          statCards.map((stat, i) => (
            <MotionDiv key={stat.name} delay={0.1 + i * 0.05}>
              <a href={stat.path} className="block group">
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} border ${stat.border} p-4 md:p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                    </div>
                    
                    <p className="text-xs md:text-sm text-slate-400 mb-1">{stat.name}</p>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      <AnimatedCounter value={stat.value} />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 hidden md:block">{stat.description}</p>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </a>
            </MotionDiv>
          ))
        )}
      </div>

      {/* Quick Actions & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Actions */}
        <MotionDiv delay={0.4} className="lg:col-span-1">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <a key={action.name} href={action.path} className="group">
                  <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-${action.color}-500/50 hover:bg-${action.color}-500/10 transition-all`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-slate-300 text-center">{action.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </MotionDiv>

        {/* Quick Stats */}
        <MotionDiv delay={0.5} className="lg:col-span-2">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickStats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <h4 className="text-xl md:text-2xl font-bold text-white">{stat.value}</h4>
                    <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mini Chart Placeholder */}
            <div className="mt-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Traffic Overview</span>
                <span className="text-xs text-emerald-400">Last 7 days</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm"
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Recent Activity & Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Activity */}
        <MotionDiv delay={0.6} className="lg:col-span-2">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Recent Activity
            </h3>
            <div className="space-y-1">
              {recentActivity.map((activity, i) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </MotionDiv>

        {/* Server Status & Role Info */}
        <MotionDiv delay={0.7} className="space-y-4">
          {/* Server Status */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Server Status
            </h3>
            <div className="space-y-3">
              {[
                { name: 'API Server', status: 'Operational', color: 'bg-emerald-500' },
                { name: 'Database', status: 'Connected', color: 'bg-emerald-500' },
                { name: 'File Storage', status: 'Active', color: 'bg-emerald-500' },
              ].map((server) => (
                <div key={server.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
                  <span className="text-sm text-slate-300">{server.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${server.color} animate-pulse`}></span>
                    <span className="text-xs font-medium text-emerald-400">{server.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Role */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-5">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Your Role
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-2 ${
                isSuperAdmin ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 
                isDeveloper ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              }`}>
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {isSuperAdmin && 'Full access to all features'}
              {isDeveloper && 'Can manage projects, services, and content'}
              {!isSuperAdmin && !isDeveloper && 'Can manage blogs and SEO settings'}
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Bottom Stats Bar */}
      <MotionDiv delay={0.8}>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3">
              <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <h4 className="text-2xl font-bold text-white">125.4K</h4>
              <p className="text-xs text-slate-400">Total Views</p>
            </div>
            <div className="text-center p-3">
              <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <h4 className="text-2xl font-bold text-white">2.3K</h4>
              <p className="text-xs text-slate-400">Engagements</p>
            </div>
            <div className="text-center p-3">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-2xl font-bold text-white">3:42</h4>
              <p className="text-xs text-slate-400">Avg. Time</p>
            </div>
            <div className="text-center p-3">
              <ExternalLink className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-2xl font-bold text-white">45</h4>
              <p className="text-xs text-slate-400">Countries</p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
