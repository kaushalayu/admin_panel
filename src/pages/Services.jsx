import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Code as CodeIcon, Loader2, Plus, Trash2, Edit, Save, X } from 'lucide-react';

export default function Services() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', shortDescription: '', icon: '', content: '', status: 'published'
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/services');
      if (data.success) setItems(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ title: '', shortDescription: '', icon: '', content: '', status: 'published' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title, shortDescription: item.shortDescription, 
      icon: item.icon || '', content: item.content || '', status: item.status
    });
    setEditingId(item._id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingId) {
        await axios.put(`http://localhost:5001/api/services/${editingId}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5001/api/services', formData, { headers });
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('illusion_admin_token');
        await axios.delete(`http://localhost:5001/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CodeIcon className="w-6 h-6 text-pink-400" /> Services Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage the services offered by WebTech Illusion.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.05)] rounded-2xl p-6 mb-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                 <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Service Title *</label>
                   <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-pink-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Icon Text or URL (Optional)</label>
                   <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-pink-500 outline-none" placeholder="e.g. Globe" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-2">Short Description *</label>
                   <textarea required name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-pink-500 outline-none"></textarea>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-2">Detailed Content (Optional) - HTML allowed</label>
                   <textarea name="content" value={formData.content} onChange={handleChange} rows="5" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-pink-500 outline-none"></textarea>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Publish Status</label>
                   <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-pink-500 outline-none">
                     <option value="published">Published</option>
                     <option value="draft">Draft</option>
                   </select>
                 </div>
               </div>
               
               <div className="mt-6 flex justify-end gap-3">
                 <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={saving} className="bg-pink-600 hover:bg-pink-500 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Service</>}
                 </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-2" />
            Loading services...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <CodeIcon className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No services found</h2>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-pink-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 font-bold border border-pink-500/20">
                  {item.icon?.[0] || 'S'}
                </div>
                {item.status === 'draft' && <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded">DRAFT</span>}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-6">{item.shortDescription}</p>
              
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button onClick={() => handleEdit(item)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Edit size={16} /></button>
                <button onClick={() => handleDelete(item._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
