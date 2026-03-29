import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Save, Loader2, ChevronDown, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const PAGES = ['home', 'about', 'services', 'projects', 'team', 'contact', 'blog', 'industries', 'careers', 'case-studies', 'documentation'];

const quillModules = {
  toolbar: [
    ['link'],
    ['bold', 'italic', 'underline', 'strike'],
    ['clean']
  ],
};

export default function GlobalSeo() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    metaTitle: '', metaDescription: '', metaKeywords: '', h1Heading: '', 
    ogImage: '', ogTitle: '', ogImageLink: '',
    metaTitleLink: '', metaDescriptionLink: '', metaKeywordsLink: '', h1HeadingLink: ''
  });

  const fetchSeoData = async (page) => {
    setFetching(true);
    setSuccessMsg('');
    try {
      const { data } = await axios.get(`http://localhost:5001/api/seo/${page}`);
      if (data.success && data.data) {
        setFormData({
          metaTitle: data.data.metaTitle || '',
          metaDescription: data.data.metaDescription || '',
          metaKeywords: data.data.metaKeywords || '',
          h1Heading: data.data.h1Heading || '',
          ogImage: data.data.ogImage || '',
          ogTitle: data.data.ogTitle || '',
          ogImageLink: data.data.ogImageLink || '',
          metaTitleLink: data.data.metaTitleLink || '',
          metaDescriptionLink: data.data.metaDescriptionLink || '',
          metaKeywordsLink: data.data.metaKeywordsLink || '',
          h1HeadingLink: data.data.h1HeadingLink || ''
        });
      }
    } catch (err) {
      setFormData({
        metaTitle: '', metaDescription: '', metaKeywords: '', h1Heading: '', 
        ogImage: '', ogTitle: '', ogImageLink: '',
        metaTitleLink: '', metaDescriptionLink: '', metaKeywordsLink: '', h1HeadingLink: ''
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSeoData(selectedPage);
  }, [selectedPage]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleQuillChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('illusion_admin_token');
      await axios.post('http://localhost:5001/api/seo', { ...formData, pageName: selectedPage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('SEO configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save SEO configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <Globe className="w-6 h-6 text-emerald-400" /> Global Website SEO
           </h1>
           <p className="text-slate-400 text-sm mt-1">Manage titles, meta tags, and open graph for static pages.</p>
         </div>

         <div className="relative w-full sm:w-64">
           <select 
             className="w-full appearance-none bg-slate-950 border border-emerald-500/30 text-emerald-300 font-medium py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize transition-all"
             value={selectedPage}
             onChange={(e) => setSelectedPage(e.target.value)}
           >
             {PAGES.map(p => <option key={p} value={p}>{p.replace('-', ' ')} Page</option>)}
           </select>
           <ChevronDown className="w-5 h-5 text-emerald-500 absolute right-3 top-3.5 pointer-events-none" />
         </div>
      </div>

      {fetching ? (
         <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
           <p className="text-slate-400 font-medium">Loading SEO config for <span className="capitalize text-emerald-400">{selectedPage.replace('-', ' ')}</span>...</p>
         </div>
      ) : (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
           <form onSubmit={handleSubmit} className="bg-slate-900 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

              <AnimatePresence>
                {successMsg && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                     <CheckCircle2 className="w-5 h-5" /> {successMsg}
                   </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-white mb-2 tracking-wide">Primary Meta Title <span className="text-red-400">*</span></label>
                   <input required type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="e.g. Illusion - Leading Web Agency in India" />
                   <div className="mt-2 flex items-center gap-2">
                     <LinkIcon className="w-4 h-4 text-slate-500" />
                     <input type="text" name="metaTitleLink" value={formData.metaTitleLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to title (optional)" />
                   </div>
                   <p className="text-xs text-slate-500 mt-2">Format: Primary Keyword | Secondary Keyword | Brand Name</p>
                 </div>

                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-white mb-2 tracking-wide">H1 Override Heading (On-Page)</label>
                   <div className="bg-slate-950 border border-slate-700/80 rounded-xl">
                     <ReactQuill 
                       theme="snow" 
                       value={formData.h1Heading} 
                       onChange={(value) => handleQuillChange('h1Heading', value)}
                       modules={quillModules}
                       className="h1-quill"
                       placeholder="e.g. Build Your Digital Future With Us"
                     />
                   </div>
                   <div className="mt-2 flex items-center gap-2">
                     <LinkIcon className="w-4 h-4 text-slate-500" />
                     <input type="text" name="h1HeadingLink" value={formData.h1HeadingLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to heading (optional)" />
                   </div>
                 </div>

                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-white mb-2 tracking-wide">Meta Description</label>
                   <textarea name="metaDescription" rows={3} value={formData.metaDescription} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none shrink-0" placeholder="Summarize the page content for search engines..." />
                   <div className="mt-2 flex items-center gap-2">
                     <LinkIcon className="w-4 h-4 text-slate-500" />
                     <input type="text" name="metaDescriptionLink" value={formData.metaDescriptionLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to description (optional)" />
                   </div>
                   <p className="text-xs text-slate-500 mt-2">Ideal length is 150-160 characters.</p>
                 </div>
                 
                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-white mb-2 tracking-wide">Keywords</label>
                   <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="digital marketing, web design, app development" />
                   <div className="mt-2 flex items-center gap-2">
                     <LinkIcon className="w-4 h-4 text-slate-500" />
                     <input type="text" name="metaKeywordsLink" value={formData.metaKeywordsLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to keywords (optional)" />
                   </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-lg font-bold text-white mb-6">Social Sharing (Open Graph)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Social Preview Title</label>
                     <input type="text" name="ogTitle" value={formData.ogTitle} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-teal-500 transition-all outline-none" placeholder="Stand out on social media" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Social Preview Image URL</label>
                     <input type="text" name="ogImage" value={formData.ogImage} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-teal-500 transition-all outline-none" placeholder="https://..." />
                     <div className="mt-2 flex items-center gap-2">
                       <LinkIcon className="w-4 h-4 text-slate-500" />
                       <input type="text" name="ogImageLink" value={formData.ogImageLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none" placeholder="Add link to image (clickable)" />
                     </div>
                   </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 group"
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> Save Configuration</>}
                 </button>
              </div>
           </form>
         </motion.div>
      )}
    </div>
  );
}
