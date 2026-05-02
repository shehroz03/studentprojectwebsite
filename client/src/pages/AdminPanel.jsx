import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, CheckCircle, Search, Filter, Eye, Edit, X, Download, MessageSquare, Send, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { getUser } from '../utils/auth';

export const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [profiles, setProfiles] = useState({}); // map of user_id -> profile data
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles to link names/emails
      const { data: profs } = await supabase.from('profiles').select('*');
      const profileMap = {};
      profs?.forEach(p => profileMap[p.id] = p);
      setProfiles(profileMap);

      // 2. Fetch orders & payments
      const [ordersRes, paymentsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false })
      ]);
      
      setOrders(ordersRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId);
      
      if (error) throw error;
      setPayments(payments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert("Failed to update payment status: " + err.message);
    }
  };

  const handleDeliverAssignment = async (e) => {
    e.preventDefault();
    const file = e.target.delivery_file.files[0];
    if (!file) return alert("Please select a file to deliver");

    try {
      setLoading(true);
      
      // Upload final file
      const fileExt = file.name.split('.').pop();
      const fileName = `delivery_${selectedOrder.id}_${Math.random()}.${fileExt}`;
      const filePath = `deliveries/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(filePath);
      
      // Update order with final file URL
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed', 
          attachment_url: publicUrlData.publicUrl // Overwriting or adding to attachment_url for delivery
        })
        .eq('id', selectedOrder.id);

      if (updateError) throw updateError;

      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o));
      setSelectedOrder(null);
      alert("Assignment delivered successfully!");
    } catch (err) {
      alert("Failed to deliver assignment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const filteredPayments = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Command Center</h1>
            <p className="text-gray-400">Manage orders, students, payments, and system status.</p>
          </div>
          <button 
            onClick={() => navigate('/chat')}
            className="flex items-center space-x-2 bg-accent-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Support Chat</span>
          </button>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<ShoppingBag className="text-blue-500" />} title="Total Orders" value={orders.length} />
          <StatCard icon={<Users className="text-purple-500" />} title="Total Students" value={Object.keys(profiles).length} />
          <StatCard icon={<CheckCircle className="text-green-500" />} title="Completed Orders" value={orders.filter(o => o.status === 'completed').length} />
          <StatCard icon={<DollarSign className="text-accent-cyan" />} title="Total Payments" value={payments.filter(p => p.status === 'verified').length} />
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select 
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex space-x-4 w-full md:w-auto">
              <button onClick={() => { setActiveTab('orders'); setFilter('all'); }} className={`px-6 py-2 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === 'orders' ? 'bg-accent-blue text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Orders</button>
              <button onClick={() => { setActiveTab('payments'); setFilter('all'); }} className={`px-6 py-2 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === 'payments' ? 'bg-accent-blue text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Payments</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-500">Loading data...</div>
            ) : activeTab === 'orders' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Order & Student</th>
                    <th className="px-6 py-4 font-medium">Deadline</th>
                    <th className="px-6 py-4 font-medium">Budget</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-500">No orders found.</td></tr>}
                  {filteredOrders.map((order) => {
                    const student = profiles[order.user_id] || {};
                    return (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5">
                          <div className="text-white font-medium">#{order.id.slice(0,8)} - {order.title}</div>
                          <div className="text-accent-blue text-xs font-semibold">{student.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-gray-500 text-xs">{new Date(order.deadline).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-5 text-white font-semibold">
                          {order.currency || '$'}{parseFloat(order.budget).toLocaleString()}
                        </td>
                        <td className="px-6 py-5">
                          <select 
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-transparent border border-white/10 focus:outline-none ${getStatusColor(order.status)}`}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          >
                            <option value="pending" className="bg-primary">Pending</option>
                            <option value="in-progress" className="bg-primary">In Progress</option>
                            <option value="completed" className="bg-primary">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Payment & Student</th>
                    <th className="px-6 py-4 font-medium">For Order #</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-500">No payments found.</td></tr>}
                  {filteredPayments.map((payment) => {
                    const student = profiles[payment.user_id] || {};
                    return (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5">
                          <div className="text-white font-medium">Payment #{payment.id.slice(0,8)}</div>
                          <div className="text-accent-blue text-xs font-semibold">{student.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-5 text-gray-300">#{payment.order_id?.slice(0,8)}</td>
                        <td className="px-6 py-5 text-white font-semibold">
                          {payment.currency || '$'}{parseFloat(payment.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-5">
                          <select 
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-transparent border border-white/10 focus:outline-none ${getStatusColor(payment.status)}`}
                            value={payment.status}
                            onChange={(e) => handleUpdatePaymentStatus(payment.id, e.target.value)}
                          >
                            <option value="pending" className="bg-primary">Pending</option>
                            <option value="verified" className="bg-primary">Verified</option>
                            <option value="rejected" className="bg-primary">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setSelectedPayment(payment)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="View Proof">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      <AnimatePresence>
        {selectedOrder && (
          <Modal onClose={() => setSelectedOrder(null)} title={`Order Details`}>
            <div className="space-y-4 text-white">
              <div><span className="text-gray-400 text-sm">Title:</span><div className="font-medium text-lg">{selectedOrder.title}</div></div>
              <div><span className="text-gray-400 text-sm">Description:</span><div className="text-gray-300 bg-white/5 p-3 rounded-lg mt-1 text-sm whitespace-pre-wrap">{selectedOrder.description || 'No description provided.'}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-400 text-sm">Budget:</span><div className="font-bold">{selectedOrder.currency}{selectedOrder.budget}</div></div>
                <div><span className="text-gray-400 text-sm">Deadline:</span><div className="font-bold">{new Date(selectedOrder.deadline).toLocaleDateString()}</div></div>
              </div>

              {selectedOrder.attachment_url && (
                <div className="pt-4 border-t border-white/10">
                  <a href={selectedOrder.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 bg-accent-blue/10 text-accent-blue px-4 py-2 rounded-lg hover:bg-accent-blue/20 transition-colors text-sm font-bold w-full justify-center">
                    <Download className="w-4 h-4" />
                    <span>Download Attachment</span>
                  </a>
                </div>
              )}

              <div className="pt-6 border-t border-white/10">
                <h4 className="font-bold mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Final Delivery</span>
                </h4>
                <form onSubmit={handleDeliverAssignment} className="space-y-4">
                  <input type="file" name="delivery_file" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20">
                    Deliver to Student
                  </button>
                </form>
              </div>
            </div>
          </Modal>
        )}

        {selectedPayment && (
          <Modal onClose={() => setSelectedPayment(null)} title={`Payment Proof`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-400 text-sm">Amount:</span><div className="text-white font-bold">{selectedPayment.currency}{selectedPayment.amount}</div></div>
              </div>
              {selectedPayment.proof_url && (
                <div className="pt-4 border-t border-white/10">
                  <a href={selectedPayment.proof_url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-white/10">
                    <img src={selectedPayment.proof_url} alt="Proof" className="w-full h-auto max-h-[400px] object-contain bg-black/50" />
                  </a>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="glass-card p-6 flex items-center space-x-4">
    <div className="bg-white/5 p-4 rounded-2xl">{icon}</div>
    <div>
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'text-yellow-500';
    case 'in-progress': return 'text-blue-500';
    case 'verified': return 'text-green-500';
    case 'completed': return 'text-green-500';
    case 'rejected': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-primary border border-white/10 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </motion.div>
  </div>
);
