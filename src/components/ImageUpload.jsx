import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, Link as LinkIcon, Loader2, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUpload({ label, value, onChange, placeholder = "Upload an image or paste a URL" }) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' or 'url'
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Max 5MB allowed.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        onChange(data.url);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Reset input so they can upload same file again if they delete
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearImage = () => onChange('');

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-slate-300 mb-2 flex justify-between items-end">
        <span>{label}</span>
        <button 
          type="button" 
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          {mode === 'upload' ? <><LinkIcon size={12}/> Use URL instead</> : <><UploadCloud size={12}/> Upload instead</>}
        </button>
      </label>

      {mode === 'url' ? (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none" 
          placeholder={placeholder}
        />
      ) : (
        <div className="relative">
          {value ? (
            <div className="relative w-full h-32 rounded-lg border border-slate-700 overflow-hidden group">
              <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"><UploadCloud size={16}/></button>
                 <button type="button" onClick={clearImage} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500"><X size={16}/></button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`w-full h-32 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-slate-400 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? (
                <><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" /><span className="text-sm">Uploading...</span></>
              ) : (
                <><ImageIcon className="w-8 h-8 mb-2 opacity-50" /><span className="text-sm">Click to upload image</span><span className="text-xs opacity-50 mt-1">PNG, JPG up to 5MB</span></>
              )}
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      )}
    </div>
  );
}
