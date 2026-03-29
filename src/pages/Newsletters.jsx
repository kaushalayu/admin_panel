import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, Search, Trash2, X, Eye, CheckCircle } from 'lucide-react';

export default function Newsletters() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingSubscriber, setViewingSubscriber] = useState(null);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.get('http://localhost:5001/api/newsletter?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setSubscribers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleUnsubscribe = async (email) => {
    if (window.confirm('Are you sure you want to forcibly unsubscribe this email?')) {
      try {
        await axios.post('http://localhost:5001/api/newsletter/unsubscribe', { email });
        fetchSubscribers();
        if (viewingSubscriber?.email === email) {
          setViewingSubscriber(prev => ({ ...prev, status: 'unsubscribed' }));
        }
      } catch (err) {
        console.error(err);
        alert('Failed to unsubscribe email');
      }
    }
  };

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-400" />
            Newsletter Subscribers
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage the people who signed up for your newsletter.</p>
        </div>
        
        <div className="relative">
           <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
           <input 
             type="text"
             placeholder="Search by email..."
             className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* View Subscriber Modal */}
      <AnimatePresence>
        {viewingSubscriber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingSubscriber(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Subscriber Details</h3>
                <button onClick={() => setViewingSubscriber(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {viewingSubscriber.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{viewingSubscriber.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {viewingSubscriber.status === 'active' ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-semibold bg-red-500/10 px-2.5 py-1 rounded-full">
                          Unsubscribed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Subscribed On</p>
                    <p className="text-white font-medium">{new Date(viewingSubscriber.createdAt).toLocaleDateString()}</p>
                  </div>
                  {viewingSubscriber.unsubscribedAt && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Unsubscribed On</p>
                      <p className="text-red-400 font-medium">{new Date(viewingSubscriber.unsubscribedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                {viewingSubscriber.status === 'active' && (
                  <button 
                    onClick={() => handleUnsubscribe(viewingSubscriber.email)}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Unsubscribe
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            Loading subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Mail className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No subscribers found</h2>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Subscribed On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((sub) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={sub._id} 
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white text-base">{sub.email}</p>
                      </td>
                      <td className="px-6 py-4">
                         {sub.status === 'active' ? (
                            <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
                         ) : (
                            <span className="text-red-400 text-xs font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">Unsubscribed</span>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                         {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-end gap-1">
                           <button 
                             onClick={() => setViewingSubscriber(sub)}
                             className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                             title="View details"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                           {sub.status === 'active' && (
                             <button 
                               onClick={() => handleUnsubscribe(sub.email)}
                               className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                               title="Unsubscribe"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
