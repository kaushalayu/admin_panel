import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Loader2, Plus, Trash2, Shield, User as UserIcon, Code, Edit, X, Save, Eye } from 'lucide-react';
import API_URL from '../config/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'seo_manager' });
  const [creating, setCreating] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('illusion_admin_user') || '{}');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.get('${API_URL}/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openCreateForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'seo_manager' });
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (userObj) => {
    setFormData({ name: userObj.name, email: userObj.email, password: '', role: userObj.role });
    setEditingUser(userObj);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'seo_manager' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('illusion_admin_token');
      
      if (editingUser) {
        const updateData = { name: formData.name, role: formData.role };
        if (formData.password) updateData.password = formData.password;
        
        await axios.put(`${API_URL}/api/auth/users/${editingUser._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('${API_URL}/api/auth/create-user', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchUsers();
      closeForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save user');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('illusion_admin_token');
        await axios.delete(`${API_URL}/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-purple-400" />
            User Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage Developers and SEO Guys access to the admin panel.</p>
        </div>
        
        <button 
          onClick={openCreateForm}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.05)] rounded-2xl p-6">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-white">{editingUser ? 'Edit User' : 'Create New User'}</h3>
                 <button type="button" onClick={closeForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Adi Developer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!editingUser} className={`w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-purple-500 outline-none ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="adi@illusion.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{editingUser ? 'New Password (leave empty to keep)' : 'Set Password'}</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-purple-500 outline-none" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Assign Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-purple-500 outline-none">
                      <option value="super_admin">Super Admin (Owner)</option>
                      <option value="developer">Developer (Code features)</option>
                      <option value="seo_manager">SEO Guy (Marketing)</option>
                    </select>
                  </div>
               </div>
               <div className="mt-6 flex justify-end gap-3">
                 <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={creating} className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                   {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {editingUser ? 'Update User' : 'Create User'}</>}
                 </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {viewingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">User Details</h3>
                <button onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-white ${viewingUser.role === 'super_admin' ? 'bg-purple-600' : viewingUser.role === 'developer' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    {viewingUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{viewingUser.name}</p>
                    <p className="text-slate-400">{viewingUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Role</p>
                    <p className="text-white font-medium capitalize">{viewingUser.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Created</p>
                    <p className="text-white font-medium">{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setViewingUser(null); openEditForm(viewingUser); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
            Loading accounts...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UsersIcon className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No users found</h2>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Account Details</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Created On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((userObj) => {
                     const isSelf = userObj._id === currentUser.id;
                     return (
                    <motion.tr 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={userObj._id} 
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${userObj.role === 'super_admin' ? 'bg-purple-600' : userObj.role === 'developer' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                               {userObj.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-semibold text-white text-base flex items-center gap-2">
                               {userObj.name} {isSelf && <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">You</span>}
                             </p>
                             <p className="text-slate-500 text-xs mt-0.5">{userObj.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {userObj.role === 'super_admin' ? (
                            <span className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold bg-purple-500/10 px-3 py-1.5 rounded-full w-fit border border-purple-500/20">
                              <Shield className="w-3.5 h-3.5" /> Super Admin
                            </span>
                         ) : userObj.role === 'developer' ? (
                            <span className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-full w-fit border border-indigo-500/20">
                              <Code className="w-3.5 h-3.5" /> Developer
                            </span>
                         ) : (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20">
                              <UserIcon className="w-3.5 h-3.5" /> SEO Guy
                            </span>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {new Date(userObj.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-end gap-1">
                           <button 
                             onClick={() => setViewingUser(userObj)}
                             className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                             title="View details"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => openEditForm(userObj)}
                             className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                             title="Edit user"
                           >
                             <Edit className="w-4 h-4" />
                           </button>
                           {!isSelf && (
                             <button 
                               onClick={() => handleDelete(userObj._id)}
                               className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                               title="Delete user"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                      </td>
                    </motion.tr>
                  )})}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
