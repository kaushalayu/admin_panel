import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, Search, CheckCircle, Clock, X, Eye, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import API_URL from '../config/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingContact, setViewingContact] = useState(null);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.get('${API_URL}/api/contact?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setContacts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      await axios.patch(`${API_URL}/api/contact/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      if (viewingContact?._id === id) {
        setViewingContact(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const token = localStorage.getItem('illusion_admin_token');
        await axios.delete(`${API_URL}/api/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchContacts();
        if (viewingContact?._id === id) {
          setViewingContact(null);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete contact');
      }
    }
  };

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            Contact Submissions
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage leads and inquiries directly from your website.</p>
        </div>
        
        <div className="relative">
           <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
           <input 
             type="text"
             placeholder="Search by name or email..."
             className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <AnimatePresence>
        {viewingContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingContact(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Contact Details</h3>
                <button onClick={() => setViewingContact(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {viewingContact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{viewingContact.name}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Mail className="w-4 h-4" /> {viewingContact.email}
                    </div>
                    {viewingContact.phone && (
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Phone className="w-4 h-4" /> {viewingContact.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                {viewingContact.projectType && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Project Type</p>
                    <p className="text-white font-medium capitalize">{viewingContact.projectType.replace('-', ' ')}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-slate-500 mb-2">Message</p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                    "{viewingContact.message}"
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">
                    Received: {new Date(viewingContact.createdAt).toLocaleString()}
                  </p>
                  {viewingContact.status === 'read' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4" /> Read
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange(viewingContact._id, 'read')}
                      className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Clock className="w-4 h-4" /> Mark as Read
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { handleDelete(viewingContact._id); }}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                {viewingContact.status !== 'read' && (
                  <button 
                    onClick={() => handleStatusChange(viewingContact._id, 'read')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Read
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
            Loading submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No submissions found</h2>
            <p className="text-sm mt-1">When someone contacts you, it will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Client Details</th>
                  <th className="px-6 py-4">Message Preview</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((contact) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={contact._id} 
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 align-top">
                        <p className="font-semibold text-white">{contact.name}</p>
                        <p className="text-slate-500 text-xs">{contact.email}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                         <p className="text-slate-400 text-xs truncate max-w-xs">{contact.message}</p>
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-xs">
                         {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 align-top">
                         {contact.status === 'read' ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                              <CheckCircle className="w-3.5 h-3.5" /> Read
                            </span>
                         ) : (
                            <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
                              <Clock className="w-3.5 h-3.5" /> New
                            </span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-end gap-1">
                           <button 
                             onClick={() => setViewingContact(contact)}
                             className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                             title="View details"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(contact._id)}
                             className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                             title="Delete"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
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
