import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Calendar, DollarSign, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLang } from '../context/LanguageContext';
import { allCurrencies } from '../translations';

export const OrderSubmission = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    budget: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const { currency, setCurrency } = useLang();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('user_id', user.id);
    data.append('title', formData.title);
    data.append('service_type', 'Custom Project'); // Required by backend
    data.append('description', formData.description);
    data.append('deadline', formData.deadline);
    data.append('budget', formData.budget);
    data.append('currency', currency.symbol);
    if (formData.file) {
      data.append('attachment', formData.file); // Backend expects 'attachment'
    }

    try {
      await api.post('/orders/create.php', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error("Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Submit New Order</h2>
            <p className="text-gray-400">Provide details about your assignment or project for our experts.</p>
          </div>



          {success ? (
            <div className="text-center py-10">
              <div className="bg-green-500/20 text-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Order Submitted!</h3>
              <p className="text-gray-400">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Order Title</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                      placeholder="e.g. Data Structures Assignment"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="date" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Project Description</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                  placeholder="Tell us more about your requirements, word count, specific instructions, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Budget</label>
                  <div className="flex relative bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-blue transition-all">
                    <select
                      className="bg-black/20 text-accent-cyan font-bold px-3 py-3 border-r border-white/10 focus:outline-none cursor-pointer"
                      value={currency.code}
                      onChange={(e) => setCurrency(allCurrencies.find(c => c.code === e.target.value))}
                    >
                      {allCurrencies.map(c => <option key={c.code} value={c.code} className="bg-gray-900">{c.code} ({c.symbol})</option>)}
                    </select>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-transparent py-3 px-4 text-white placeholder-gray-600 focus:outline-none"
                      placeholder="0.00"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Attachments (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                    />
                    <label 
                      htmlFor="file-upload"
                      className="w-full bg-white/5 border border-white/10 border-dashed rounded-xl py-3 px-4 text-gray-400 flex items-center justify-center space-x-2 cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{formData.file ? formData.file.name : 'Upload Guidelines/Files'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-accent-blue hover:bg-blue-600 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
