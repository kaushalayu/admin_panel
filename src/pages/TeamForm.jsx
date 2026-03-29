import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Upload, X, Plus } from 'lucide-react';

export default function TeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', role: '', specialization: '', bio: '', skills: [], experience: '', image: '', status: 'active', order: 0
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/api/team/${id}`).then(({ data }) => {
        if (data.success) {
          setFormData({
            ...data.data,
            skills: data.data.skills || []
          });
        }
      }).catch(err => console.error(err)).finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.post('http://localhost:5001/api/upload', uploadFormData, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (id) {
        await axios.put(`http://localhost:5001/api/team/${id}`, formData, config);
      } else {
        await axios.post('http://localhost:5001/api/team', formData, config);
      }
      navigate('/teams');
    } catch (err) {
      console.error(err);
      alert('Failed to save team member.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-white">Loading data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/teams')} className="flex items-center text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Teams
        </button>
        <h1 className="text-2xl font-bold text-white">{id ? 'Edit Team Member' : 'Add Team Member'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role *</label>
            <input type="text" name="role" required value={formData.role} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Full Stack Developer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Specialization</label>
            <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="React, Node.js, MongoDB" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Experience</label>
            <input type="text" name="experience" value={formData.experience} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="4+ Years" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Brief description about the team member..." />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                placeholder="Add a skill and press Enter" 
              />
              <button type="button" onClick={handleAddSkill} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Order</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Photo *</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {formData.image ? (
            <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-slate-700 group">
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button type="button" onClick={() => fileInputRef.current.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">Change</button>
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, image: '' })); fileInputRef.current.value = ''; }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Remove</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploadingImage} className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl py-12 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors">
              {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin mb-2" /> : <Upload className="w-8 h-8 mb-2" />}
              <span className="text-sm font-medium">{uploadingImage ? 'Uploading...' : 'Click to upload photo'}</span>
            </button>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Team Member</>}
        </button>
      </form>
    </div>
  );
}
