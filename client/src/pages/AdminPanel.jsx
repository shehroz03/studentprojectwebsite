import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, CheckCircle, Search, Filter, Eye, Edit, X, Download, MessageSquare, Send, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { getUser } from '../utils/auth';

export const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          api.get('/admin/orders.php'),
          api.get('/payments/list.php')
        ]);
        setOrders(ordersRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.post('/admin/update-status.php', {
        order_id: orderId,
        status: newStatus
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await api.post('/payments/verify.php', {
        payment_id: paymentId,
        status: newStatus
      });
      setPayments(payments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert("Failed to update payment status");
    }
  };

  const handleDeliverAssignment = async (e) => {
    e.preventDefault();
    const file = e.target.delivery_file.files[0];
    if (!file) return alert("Please select a file to deliver");

    const formData = new FormData();
    formData.append('order_id', selectedOrder.id);
    formData.append('final_file', file);

    try {
      setLoading(true);
      await api.post('/admin/deliver.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed', final_file: 'delivered' } : o));
      setSelectedOrder(null);
      alert("Assignment delivered successfully!");
    } catch (err) {
      alert("Failed to deliver assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    const message = e.target.announcement.value;
    if (!message) return;
    try {
      await api.post('/admin/announce.php', { message });
      e.target.reset();
      alert("Announcement sent to all users!");
    } catch (err) { alert("Failed to send announcement"); }
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    const admin_budget = e.target.admin_budget.value;
    try {
      await api.post('/admin/counter-offer.php', { order_id: selectedOrder.id, admin_budget });
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, admin_budget } : o));
      setSelectedOrder(null);
      alert("Counter-offer sent to student!");
    } catch (err) { alert("Failed to send counter-offer"); }
  };

  const handleSendPrivateNotification = async (e) => {
    e.preventDefault();
    const message = e.target.private_msg.value;
    if (!message) return;
    try {
      await api.post('/admin/send-notification.php', { user_id: selectedOrder.user_id, message });
      e.target.reset();
      alert("Private notification sent to student!");
    } catch (err) { alert("Failed to send notification"); }
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

        {/* Announcement Section */}
        <div className="glass-card p-6 mb-12 bg-accent-blue/5 border-accent-blue/20">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-accent-blue" />
            <span>Send Global Announcement</span>
          </h2>
          <form onSubmit={handleSendAnnouncement} className="flex gap-4">
            <input 
              name="announcement" 
              placeholder="Enter message for all users..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent-blue"
              required
            />
            <button type="submit" className="bg-accent-blue hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-bold transition-all">Send</button>
          </form>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<ShoppingBag className="text-blue-500" />} title="Total Orders" value={orders.length} />
          <StatCard icon={<Users className="text-purple-500" />} title="Total Students" value={new Set(orders.map(o => o.user_id)).size} />
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
                    <th className="px-6 py-4 font-medium">Type & Deadline</th>
                    <th className="px-6 py-4 font-medium">Budget</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-500">No orders found.</td></tr>}
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-white font-medium">#{order.id} - {order.title}</div>
                        <div className="text-accent-blue text-xs font-semibold">{order.student_name} ({order.student_email})</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-gray-300 font-medium">{order.service_type || 'Custom'}</div>
                        <div className="text-gray-500 text-xs">{order.deadline}</div>
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
                          <button onClick={() => navigate('/chat')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Chat with Student">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Payment ID & Student</th>
                    <th className="px-6 py-4 font-medium">For Order #</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-500">No payments found.</td></tr>}
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-white font-medium">Payment #{payment.id}</div>
                        <div className="text-accent-blue text-xs font-semibold">{payment.student_name} ({payment.student_email})</div>
                      </td>
                      <td className="px-6 py-5 text-gray-300">#{payment.order_id}</td>
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
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && (
          <Modal onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder.id} Details`}>
            <div className="space-y-4">
              <div><span className="text-gray-400 text-sm">Title:</span><div className="text-white font-medium text-lg">{selectedOrder.title}</div></div>
              <div><span className="text-gray-400 text-sm">Student:</span><div className="text-white">{selectedOrder.student_name} ({selectedOrder.student_email})</div></div>
              <div><span className="text-gray-400 text-sm">Type:</span><div className="text-white">{selectedOrder.service_type || 'Custom'}</div></div>
              <div><span className="text-gray-400 text-sm">Description:</span><div className="text-gray-300 bg-white/5 p-3 rounded-lg mt-1 text-sm whitespace-pre-wrap">{selectedOrder.description || 'No description provided.'}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Budget:</span>
                  <div className="text-white font-bold">{selectedOrder.currency || '$'}{selectedOrder.budget}</div>
                </div>
                <div><span className="text-gray-400 text-sm">Deadline:</span><div className="text-white font-bold">{selectedOrder.deadline}</div></div>
              </div>

              {/* Counter Offer Section */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-gray-400 text-sm block mb-2">Budget Counter-Offer:</span>
                <form onSubmit={handleCounterOffer} className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-cyan font-bold">{selectedOrder.currency || '$'}</span>
                    <input 
                      type="number" 
                      name="admin_budget" 
                      placeholder="Propose new budget" 
                      defaultValue={selectedOrder.admin_budget}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                    Send Offer
                  </button>
                </form>
                {selectedOrder.admin_budget && (
                  <p className="text-[10px] text-accent-cyan mt-1">Current counter-offer: {selectedOrder.currency || '$'}{selectedOrder.admin_budget}</p>
                )}
              </div>

              {/* Private Message Section */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-gray-400 text-sm block mb-2">Send Private Notification:</span>
                <form onSubmit={handleSendPrivateNotification} className="flex space-x-2">
                  <input 
                    name="private_msg" 
                    placeholder="Message for this student..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none"
                    required
                  />
                  <button type="submit" className="bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                    Send
                  </button>
                </form>
              </div>
              {selectedOrder.attachment && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-gray-400 text-sm block mb-2">Student Attachment:</span>
                  <a href={`${API_BASE_URL.replace('/api', '')}/uploads/${selectedOrder.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 bg-accent-blue/10 text-accent-blue px-4 py-2 rounded-lg hover:bg-accent-blue/20 transition-colors text-sm font-bold w-full justify-center">
                    <Download className="w-4 h-4" />
                    <span>Download Assignment Brief</span>
                  </a>
                </div>
              )}

              {/* Delivery Section */}
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Final Assignment Delivery</span>
                </h4>
                
                {selectedOrder.status === 'completed' ? (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-sm flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>This assignment has already been delivered.</span>
                  </div>
                ) : (
                  <form onSubmit={handleDeliverAssignment} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Upload Completed File</label>
                      <input 
                        type="file" 
                        name="delivery_file"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-600/20"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Deliver Assignment to Student</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Modal>
        )}

        {selectedPayment && (
          <Modal onClose={() => setSelectedPayment(null)} title={`Payment #${selectedPayment.id} Details`}>
            <div className="space-y-4">
              <div><span className="text-gray-400 text-sm">Student:</span><div className="text-white">{selectedPayment.student_name} ({selectedPayment.student_email})</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-400 text-sm">For Order:</span><div className="text-white font-bold">#{selectedPayment.order_id}</div></div>
                <div>
                  <span className="text-gray-400 text-sm">Amount Paid:</span>
                  <div className="text-white font-bold">{selectedPayment.currency || '$'}{selectedPayment.amount}</div>
                </div>
              </div>
              {selectedPayment.proof_file && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-gray-400 text-sm block mb-2">Payment Proof:</span>
                  <a href={`${API_BASE_URL.replace('/api', '')}/uploads/${selectedPayment.proof_file}`} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-white/10 hover:border-accent-blue transition-colors">
                    <img src={`${API_BASE_URL.replace('/api', '')}/uploads/${selectedPayment.proof_file}`} alt="Payment Proof" className="w-full h-auto max-h-[300px] object-contain bg-black/50" />
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
