import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Building, Phone, Mail, Globe, Share2, FileText, RefreshCw } from 'lucide-react';
import API_URL from '../config/api';

const API_BASE = API_URL;

export default function SiteSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [message, setMessage] = useState('');

  const groups = [
    { id: 'company', name: 'Company Info', icon: Building },
    { id: 'contact', name: 'Contact Details', icon: Phone },
    { id: 'social', name: 'Social Links', icon: Share2 },
    { id: 'footer', name: 'Footer Settings', icon: FileText },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/settings`);
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.put(`${API_BASE}/api/settings`, 
        { settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInitDefaults = async () => {
    setInitLoading(true);
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.post(`${API_BASE}/api/settings/init`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setSettings(data.data);
        setMessage('Default settings loaded!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitLoading(false);
    }
  };

  const settingFields = {
    company: [
      { key: 'company_name', label: 'Company Name', type: 'text', placeholder: 'Your Company Name' },
      { key: 'company_tagline', label: 'Tagline', type: 'text', placeholder: 'Your Catchy Tagline' },
      { key: 'company_description', label: 'Description', type: 'textarea', placeholder: 'About your company...' },
      { key: 'company_logo', label: 'Logo URL', type: 'url', placeholder: 'https://example.com/logo.png' },
    ],
    contact: [
      { key: 'contact_email', label: 'Email Address', type: 'email', placeholder: 'contact@company.com' },
      { key: 'contact_phone', label: 'Phone Number', type: 'text', placeholder: '+91 98765 43210' },
      { key: 'contact_whatsapp', label: 'WhatsApp Number', type: 'text', placeholder: '919876543210' },
      { key: 'contact_address', label: 'Address', type: 'text', placeholder: 'City, State, Country' },
    ],
    social: [
      { key: 'social_facebook', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/yourpage' },
      { key: 'social_twitter', label: 'Twitter URL', type: 'url', placeholder: 'https://twitter.com/yourpage' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/yourpage' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/yourprofile' },
      { key: 'social_github', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/yourusername' },
    ],
    footer: [
      { key: 'footer_copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2024 Company Name' },
      { key: 'footer_tagline', label: 'Footer Tagline', type: 'text', placeholder: 'Your tagline here' },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Settings className="w-6 h-6 text-indigo-400" />
            </div>
            Site Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your website settings and company information</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleInitDefaults}
            disabled={initLoading}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
          >
            {initLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Load Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${message.includes('Failed') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}
        >
          {message}
        </motion.div>
      )}

      {/* Settings Groups */}
      <div className="grid gap-6">
        {groups.map((group) => {
          const Icon = group.icon;
          const fields = settingFields[group.id] || [];
          
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-800/30">
                <h2 className="text-lg font-semibold text-white flex items-center gap-3">
                  <Icon className="w-5 h-5 text-indigo-400" />
                  {group.name}
                </h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Section - Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-indigo-400" />
          About Quick Stats
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          <strong className="text-slate-300">Quick Stats (Views, Time, Bounce Rate)</strong> ke liye aapko Google Analytics ya any other analytics service integrate karna hoga. 
          Currently yeh static/demo values hain. 
          <br /><br />
          <strong className="text-slate-300">Real-time stats</strong> ke liye options hain:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Google Analytics 4 (GA4) API integration</li>
            <li>Cloudflare Analytics</li>
            <li>Vercel Analytics</li>
            <li>Custom analytics database tracking</li>
          </ul>
          <br />
          <span className="text-amber-400">Ye feature future mein add kiya ja sakta hai.</span>
        </p>
      </div>
    </div>
  );
}
