import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Globe, Search, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config/api';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.get('${API_URL}/api/blog/admin/all?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setBlogs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const token = localStorage.getItem('illusion_admin_token');
        await axios.delete(`${API_URL}/api/blog/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBlogs();
      } catch (err) {
        console.error(err);
        alert('Failed to delete blog.');
      }
    }
  };

  const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Blogs & SEO
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage articles and their on-page SEO settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search blogs..."
              className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link 
            to="/blogs/new" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create Blog
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            Loading blogs...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Globe className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No blogs found</h2>
            <p className="text-sm mt-1">Create your first blog post to start managing SEO</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">SEO Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredBlogs.map((blog) => {
                    const hasSeo = blog.metaTitle && blog.metaDescription;

                    return (
                    <motion.tr 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={blog._id} 
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={blog.image || 'https://via.placeholder.com/50'} alt={blog.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-white text-base truncate max-w-sm">{blog.title}</p>
                            <p className="text-xs text-slate-500 capitalize">{blog.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${blog.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasSeo ? (
                           <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                             <Globe className="w-3 h-3" /> Optimized
                           </span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full w-fit">
                             Missing SEO Tags
                           </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/blogs/edit/${blog._id}`} 
                            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Edit & Add SEO"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(blog._id)}
                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
