import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Globe, FileText, Settings, Upload, Link as LinkIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    ['link'],
    ['bold', 'italic', 'underline', 'strike'],
    ['clean']
  ],
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', category: 'web-development', format: 'Standard', image: '', imageLink: '', status: 'draft', isFeatured: false,
    slug: '', metaTitle: '', metaDescription: '', metaKeywords: '', h1Heading: '', ogImage: '', ogTitle: '',
    metaTitleLink: '', metaDescriptionLink: '', metaKeywordsLink: '', h1HeadingLink: '', ogImageLink: ''
  });

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/api/blog/${id}`).then(({ data }) => {
         if (data.success) {
           setFormData({
             ...data.data,
             slug: data.data.slug || '',
             metaTitle: data.data.metaTitle || '',
             metaDescription: data.data.metaDescription || '',
             metaKeywords: data.data.metaKeywords || '',
             h1Heading: data.data.h1Heading || '',
             ogImage: data.data.ogImage || '',
             ogTitle: data.data.ogTitle || '',
             metaTitleLink: data.data.metaTitleLink || '',
             metaDescriptionLink: data.data.metaDescriptionLink || '',
             metaKeywordsLink: data.data.metaKeywordsLink || '',
             h1HeadingLink: data.data.h1HeadingLink || '',
             ogImageLink: data.data.ogImageLink || '',
             imageLink: data.data.imageLink || ''
           });
         }
      }).catch(err => console.error(err)).finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuillChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        await axios.put(`http://localhost:5001/api/blog/${id}`, formData, config);
      } else {
        await axios.post('http://localhost:5001/api/blog', formData, config);
      }
      navigate('/blogs');
    } catch (err) {
      console.error(err);
      alert('Failed to save blog section.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-white">Loading data...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8 group">
         <button onClick={() => navigate('/blogs')} className="flex items-center text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
           <ArrowLeft className="w-5 h-5 mr-2" /> Back to Blogs
         </button>
         <h1 className="text-2xl font-bold text-white">{id ? 'Edit Article & SEO' : 'New Article & SEO'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <FileText className="w-5 h-5 text-indigo-400" /> Content Details
              </h2>
              
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Article Title</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.title} 
                        onChange={(value) => handleQuillChange('title', value)}
                        modules={quillModules}
                        className="title-quill"
                        placeholder="The Future of Web Development"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Short Excerpt</label>
                    <textarea name="excerpt" required rows={3} value={formData.excerpt} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="A brief summary for the blog card..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Content (HTML/Text)</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.content} 
                        onChange={(value) => handleQuillChange('content', value)}
                        modules={quillModules}
                        className="content-quill"
                        placeholder="<p>Write your amazing long-form content here.</p>"
                      />
                    </div>
                  </div>
               </div>
           </div>

           {/* SEO Section specifically for SEO managers */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <Globe className="w-5 h-5 text-emerald-400" /> On-Page SEO Tools
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">URL Slug</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-emerald-100 placeholder-slate-600 focus:border-emerald-500 outline-none" placeholder="future-of-web-dev" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">H1 Heading (Overrides Title in UI)</label>
                    <input type="text" name="h1Heading" value={formData.h1Heading} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-emerald-100 placeholder-slate-600 focus:border-emerald-500 outline-none" placeholder="Ultimate Guide to React in 2026" />
                    <div className="mt-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <input type="text" name="h1HeadingLink" value={formData.h1HeadingLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to heading (optional)" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">Meta Title</label>
                    <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-emerald-100 placeholder-slate-600 focus:border-emerald-500 outline-none" placeholder="Web Development Trends 2026 | Illusion" />
                    <div className="mt-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <input type="text" name="metaTitleLink" value={formData.metaTitleLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to title (optional)" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">Meta Description</label>
                    <textarea name="metaDescription" rows={3} value={formData.metaDescription} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-emerald-100 placeholder-slate-600 focus:border-emerald-500 outline-none" placeholder="Discover the latest web development..." />
                    <div className="mt-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <input type="text" name="metaDescriptionLink" value={formData.metaDescriptionLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to description (optional)" />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">Meta Keywords (Comma separated)</label>
                    <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-emerald-100 placeholder-slate-600 focus:border-emerald-500 outline-none" placeholder="react, web design, SEO, 2026" />
                    <div className="mt-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <input type="text" name="metaKeywordsLink" value={formData.metaKeywordsLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Add link to keywords (optional)" />
                    </div>
                  </div>
                 
                 {/* Open Graph (Off-Page SEO) */}
                 <div className="md:col-span-2 pt-4 border-t border-slate-800 mt-2">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> Off-Page SEO (Open Graph)</h3>
                    <div className="space-y-4">
                       <div>
                         <label className="block text-xs text-slate-400 mb-2">OG Title (For Facebook/LinkedIn previews)</label>
                         <input type="text" name="ogTitle" value={formData.ogTitle} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white placeholder-slate-600 focus:border-indigo-500 outline-none" placeholder="OG Title" />
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-2">OG Image URL (Social Thumbnail)</label>
                          <input type="text" name="ogImage" value={formData.ogImage} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white placeholder-slate-600 focus:border-indigo-500 outline-none" placeholder="https://example.com/og-image.jpg" />
                          <div className="mt-2 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-slate-500" />
                            <input type="text" name="ogImageLink" value={formData.ogImageLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Add link to image (clickable)" />
                          </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Settings Area */}
        <div className="space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
              <h3 className="font-semibold text-white mb-6 border-b border-slate-800 pb-3">Publishing Details</h3>

              <div className="space-y-5">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                   <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                     <option value="draft">Draft (Hidden)</option>
                     <option value="published">Published (Live)</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                   <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                     <option value="web-development">Web Development</option>
                     <option value="ui-ux-design">UI/UX Design</option>
                     <option value="digital-marketing">Digital Marketing</option>
                     <option value="mobile-apps">Mobile Apps</option>
                     <option value="technology">Technology</option>
                   </select>
                 </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Feature Image *</label>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {formData.image ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-700 group aspect-video">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => fileInputRef.current.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">Change</button>
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, image: '' })); fileInputRef.current.value = ''; }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploadingImage} className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-lg py-12 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors">
                        {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin mb-2" /> : <Upload className="w-8 h-8 mb-2" />}
                        <span className="text-sm font-medium">{uploadingImage ? 'Uploading...' : 'Click to upload feature image'}</span>
                        <span className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                      </button>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <input type="text" name="imageLink" value={formData.imageLink} onChange={handleChange} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Clickable link for image (optional)" />
                    </div>
                  </div>

                 <label className="flex items-center space-x-3 cursor-pointer mt-4">
                   <div className="relative">
                     <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="sr-only peer" />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                   </div>
                   <span className="text-sm font-medium text-slate-300">Feature this post</span>
                 </label>

                 <button type="submit" disabled={loading} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Article</>}
                 </button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
