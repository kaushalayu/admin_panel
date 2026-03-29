import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Loader2, Plus, Trash2, Edit, Save, X, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react';

export default function Projects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '', client: '', category: '', description: '', image: '', link: '', status: 'published'
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/projects');
      if (data.success) setItems(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', client: '', category: '', description: '', image: '', link: '', status: 'published' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title, client: item.client || '', category: item.category, 
      description: item.description, image: item.image, link: item.link || '', status: item.status
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
        await axios.put(`http://localhost:5001/api/projects/${editingId}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5001/api/projects', formData, { headers });
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('illusion_admin_token');
        await axios.delete(`http://localhost:5001/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Monitor className="w-6 h-6 text-indigo-400" /> Projects Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Add and manage portfolio projects displayed on the frontend.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)] rounded-2xl p-6 mb-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Project' : 'Add New Project'}</h3>
                 <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Project Title *</label>
                   <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                   <input required type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Web Dev, App Dev" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Client Name (Optional)</label>
                   <input type="text" name="client" value={formData.client} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Featured Image *</label>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {formData.image ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={formData.image} alt="Preview" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, image: '' })); fileInputRef.current.value = ''; }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploadingImage} className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-lg py-8 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors">
                        {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin mb-2" /> : <Upload className="w-8 h-8 mb-2" />}
                        <span className="text-sm">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</span>
                      </button>
                    )}
                  </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Live Demo Link (Optional)</label>
                   <input type="text" name="link" value={formData.link} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Publish Status</label>
                   <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none">
                     <option value="published">Published</option>
                     <option value="draft">Draft</option>
                   </select>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                   <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none"></textarea>
                 </div>
               </div>
               
               <div className="mt-6 flex justify-end gap-3">
                 <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Project</>}
                 </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            Loading projects...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <Monitor className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No projects found</h2>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600"><Monitor size={48} /></div>
                )}
                {item.status === 'draft' && <span className="absolute top-2 right-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">DRAFT</span>}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white truncate pr-2">{item.title}</h3>
                  {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300"><ExternalLink size={16} /></a>}
                </div>
                <p className="text-sm font-medium text-indigo-400 mb-3">{item.category} {item.client && `• ${item.client}`}</p>
                <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                
                <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
