import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Edit, Trash2, Image as ImageIcon, Users } from 'lucide-react';
import API_URL from '../config/api';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('illusion_admin_token');
      const { data } = await axios.get('${API_URL}/api/team/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setTeams(data.data);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      const token = localStorage.getItem('illusion_admin_token');
      await axios.delete(`${API_URL}/api/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(teams.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team member');
    }
  };

  const filteredTeams = teams.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> Team Members
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your team members displayed on the website.</p>
        </div>
        
        <Link
          to="/teams/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Team Member
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>

        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No team members found.</p>
            <Link to="/teams/new" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
              Add your first team member
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all group"
              >
                <div className="relative h-48 bg-slate-900">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'
                  }`}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="text-indigo-400 text-sm mb-2">{member.role}</p>
                  {member.specialization && (
                    <p className="text-slate-500 text-xs mb-3">{member.specialization}</p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/teams/edit/${member._id}`}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
