import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Plus, Trash2, Edit, Save, X, MapPin } from 'lucide-react';

export default function Careers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', department: '', location: 'Remote', type: 'Full-time', description: '', requirements: '', status: 'open'
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/jobs');
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
    setFormData({ title: '', department: '', location: 'Remote', type: 'Full-time', description: '', requirements: '', status: 'open' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title, department: item.department, 
      location: item.location, type: item.type, 
      description: item.description, 
      requirements: item.requirements?.join(', ') || '', 
      status: item.status
    });
    setEditingId(item._id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Parse requirements back to array splitting by comma
    const reqArray = formData.requirements.split(',').map(r => r.trim()).filter(r => r);
    const payload = { ...formData, requirements: reqArray };

    try {
      const token = localStorage.getItem('illusion_admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingId) {
        await axios.put(`http://localhost:5001/api/jobs/${editingId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:5001/api/jobs', payload, { headers });
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('illusion_admin_token');
        await axios.delete(`http://localhost:5001/api/jobs/${id}`, {
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
            <Briefcase className="w-6 h-6 text-emerald-400" /> Careers & Jobs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage open job positions for WebTech Illusion.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)] rounded-2xl p-6 mb-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Job Posting' : 'Add New Job Posting'}</h3>
                 <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Job Title *</label>
                   <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Department *</label>
                   <input required type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering, Sales" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                   <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Remote, Mumbai" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Job Type</label>
                   <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none">
                     <option value="Full-time">Full-time</option>
                     <option value="Part-time">Part-time</option>
                     <option value="Contract">Contract</option>
                     <option value="Internship">Internship</option>
                   </select>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-2">Job Description *</label>
                   <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none"></textarea>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-2">Requirements (comma-separated)</label>
                   <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" placeholder="React, Nodejs, 2 yrs experience" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none"></textarea>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                   <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none">
                     <option value="open">Open (Hiring)</option>
                     <option value="closed">Closed</option>
                   </select>
                 </div>
               </div>
               
               <div className="mt-6 flex justify-end gap-3">
                 <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Job Posting</>}
                 </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            Loading job postings...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Briefcase className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No jobs posted</h2>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Job Info</th>
                  <th className="px-6 py-4">Role/Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      key={item._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white text-base truncate max-w-xs">{item.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{item.department}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-slate-300 text-xs"><MapPin size={12}/> {item.location}</span>
                          <span className="text-emerald-400 font-semibold">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {item.status === 'open' ? (
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded w-fit border border-emerald-500/20">Open</span>
                         ) : (
                            <span className="bg-slate-500/10 text-slate-400 text-xs font-semibold px-2.5 py-1 rounded w-fit border border-slate-500/20">Closed</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => handleEdit(item)} className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors mr-2"><Edit className="w-4 h-4" /></button>
                         <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
