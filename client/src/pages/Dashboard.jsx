import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, Plus, MessageSquare, CreditCard, User, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { getUser } from '../utils/auth';
import { useLang } from '../context/LanguageContext';

export const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState({ chat: 0, payments: 0, orders: 0 });
  const { t, currency, formatAmount } = useLang();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const fetchNotifs = async () => {
      // Simplistic notification fetch: count messages for this user
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id);
        
        if (!error) setNotifs(prev => ({ ...prev, chat: count || 0 }));
      } catch (err) {}
    };

    fetchNotifs();
    const timer = setInterval(fetchNotifs, 10000); // 10s polling for chat count
    return () => clearInterval(timer);
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'in-progress': return 'text-blue-500 bg-blue-500/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const totalSpent = orders.reduce((acc, o) => acc + parseFloat(o.budget || 0), 0);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('dashboard','welcome')}, {user?.name}! 👋</h1>
            <p className="text-gray-400">{t('dashboard','subtitle')}</p>
          </div>
          <Link to="/order-submission"
            className="flex items-center space-x-2 bg-accent-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            <span>{t('dashboard','placeOrder')}</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<ShoppingBag className="text-accent-blue" />} title={t('dashboard','totalOrders')} value={orders.length} />
          <StatCard icon={<Clock className="text-yellow-500" />} title={t('dashboard','inProgress')} value={orders.filter(o => o.status === 'in-progress').length} />
          <StatCard icon={<CheckCircle className="text-green-500" />} title={t('dashboard','completed')} value={orders.filter(o => o.status === 'completed').length} />
          <StatCard icon={<CreditCard className="text-accent-cyan" />} title={t('dashboard','totalSpent')} value={formatAmount(totalSpent)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders Table */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{t('dashboard','recentOrders')}</h3>
              <button className="text-accent-blue text-sm font-semibold hover:underline">{t('dashboard','viewAll')}</button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20 text-center text-gray-500">{t('dashboard','loading')}</div>
              ) : orders.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="text-gray-500">{t('dashboard','noOrders')}</div>
                  <Link to="/order-submission" className="text-accent-blue hover:underline">{t('dashboard','createFirst')}</Link>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-white/5">
                      <th className="px-6 py-4 font-medium">{t('dashboard','orderTitle')}</th>
                      <th className="px-6 py-4 font-medium">{t('dashboard','deadline')}</th>
                      <th className="px-6 py-4 font-medium">{t('dashboard','budget')}</th>
                      <th className="px-6 py-4 font-medium">{t('dashboard','status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                        <td className="px-6 py-5">
                          <div className="text-white font-medium group-hover:text-accent-blue transition-colors">{order.title}</div>
                          <div className="text-gray-500 text-xs">ID: #BST-{order.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-5 text-gray-300">{new Date(order.deadline).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                          <div className="text-white font-semibold">
                            {order.currency || '$'}{parseFloat(order.budget).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] w-fit font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                              {t('status', order.status) || order.status}
                            </span>
                            {order.attachment_url && (
                              <a 
                                href={order.attachment_url} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center space-x-1.5 text-accent-cyan hover:text-white transition-colors text-xs font-bold bg-white/5 px-2 py-1.5 rounded-lg border border-white/10 hover:bg-accent-cyan/20"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>View File</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-6">{t('dashboard','quickLinks')}</h3>
              <div className="space-y-3">
                <QuickLink to="/chat" icon={<MessageSquare />} label={t('dashboard','supportChat')} count={notifs.chat} />
                <QuickLink to="/payments" icon={<CreditCard />} label={t('dashboard','payments')} count={notifs.payments} />
                <QuickLink to="/profile" icon={<User />} label={t('dashboard','profileSettings')} />
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20 border border-accent-blue/20 p-6 rounded-[24px] relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-white font-bold mb-2">{t('dashboard','needHelp')}</h3>
                <p className="text-gray-300 text-sm mb-4">{t('dashboard','helpText')}</p>
                <Link to="/chat">
                  <button className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
                    {t('dashboard','contactSupport')}
                  </button>
                </Link>
              </div>
              <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform">
                <GraduationCap size={120} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-card p-6 flex items-center space-x-4">
    <div className="bg-white/5 p-4 rounded-2xl">{icon}</div>
    <div>
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  </motion.div>
);

const QuickLink = ({ icon, label, count, to }) => (
  <Link to={to} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white group">
    <div className="flex items-center space-x-3">
      <span className="group-hover:text-accent-blue transition-colors">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    {count > 0 && <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">{count}</span>}
  </Link>
);

const GraduationCap = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
