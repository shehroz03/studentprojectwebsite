import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft, Upload, CheckCircle, Clock, AlertCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLang } from '../context/LanguageContext';
import { allCurrencies } from '../translations';
import { getUser } from '../utils/auth';

export const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const navigate = useNavigate();
  const { t, currency, setCurrency, formatAmount } = useLang();

  const user = getUser();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
    if (user.role === 'admin') {
      api.post('/notifications/mark-read', { user_id: user.id, role: user.role, type: 'payments' }).catch(() => {});
    }
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, paymentsRes] = await Promise.all([
        api.get(`/orders/list.php?user_id=${user.id}`),
        api.get(`/payments/list.php?user_id=${user.id}`)
      ]);
      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !file || !amount) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('order_id', selectedOrder.id);
    formData.append('user_id', user.id);
    formData.append('amount', amount);
    formData.append('currency', currency.symbol);
    formData.append('proof', file);

    try {
      await api.post('/payments/upload-proof.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setSelectedOrder(null);
      setFile(null);
      setAmount('');
      fetchData();
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'verified') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusStyle = (status) => {
    if (status === 'verified') return 'text-green-500 bg-green-500/10';
    if (status === 'pending') return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="pt-24 pb-10 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('payments','title')}</h1>
            <p className="text-gray-400 text-sm">{t('payments','subtitle')}</p>
          </div>
        </div>

        {/* Success */}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl mb-6 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Payment proof uploaded! Admin will verify shortly.</span>
          </motion.div>
        )}



        {/* ── Main Grid ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Upload Proof */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-accent-blue" />
              <span>{t('payments','submitProof')}</span>
            </h2>

            {/* Bank Info */}
            <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-4 text-sm text-gray-300">
              <div className="font-semibold text-white mb-3">{t('payments','bankDetails')}</div>
              <div className="space-y-2">
                <div>Bank: <span className="text-white font-medium">MCB Bank</span></div>
                <div>Account Name: <span className="text-white font-medium">attaullah</span></div>
                <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                  <div>Account No: <span className="text-white font-medium">1635940381009310</span></div>
                  <button onClick={() => handleCopy('1635940381009310', 'acc')} type="button" className="text-accent-cyan hover:text-white transition flex items-center space-x-1">
                    <Copy className="w-4 h-4" />
                    <span className="text-[10px]">{copiedText === 'acc' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                  <div>IBAN: <span className="text-white font-medium">PK20MUCB1635940381009310</span></div>
                  <button onClick={() => handleCopy('PK20MUCB1635940381009310', 'iban')} type="button" className="text-accent-cyan hover:text-white transition flex items-center space-x-1">
                    <Copy className="w-4 h-4" />
                    <span className="text-[10px]">{copiedText === 'iban' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 text-xs text-accent-cyan border-t border-accent-blue/20 pt-2">
                Send payment in: <span className="font-bold">{currency.name} ({currency.symbol})</span>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Select Order */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">{t('payments','selectOrder')}</label>
                <select required
                  onChange={e => setSelectedOrder(orders.find(o => o.id == e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm">
                  <option value="" className="bg-gray-900">{t('payments','selectOrderPlaceholder')}</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id} className="bg-gray-900">
                      #BST-{o.id} — {o.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('payments','amountPaid')}
                </label>
                <div className="flex relative bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-blue transition-all">
                  <select
                    className="bg-black/20 text-accent-cyan font-bold px-3 py-3 border-r border-white/10 focus:outline-none cursor-pointer"
                    value={currency.code}
                    onChange={(e) => setCurrency(allCurrencies.find(c => c.code === e.target.value))}
                  >
                    {allCurrencies.map(c => <option key={c.code} value={c.code} className="bg-gray-900">{c.code} ({c.symbol})</option>)}
                  </select>
                  <input type="number" required value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent py-3 px-4 text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">{t('payments','screenshot')}</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all">
                  {file ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-500 mb-2" />
                      <span className="text-gray-500 text-sm">{t('payments','clickUpload')}</span>
                    </>
                  )}
                  <input type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={e => setFile(e.target.files[0])} required />
                </label>
              </div>

              <button type="submit" disabled={uploading}
                className="w-full bg-accent-blue hover:bg-blue-600 py-3 rounded-xl text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20">
                {uploading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Upload className="w-4 h-4" /><span>{t('payments','uploadBtn')}</span></>
                }
              </button>
            </form>
          </div>

          {/* Payment History */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-5">
              <CreditCard className="w-5 h-5 text-accent-cyan" />
              <span>{t('payments','history')}</span>
            </h2>

            {loading ? (
              <div className="text-center text-gray-500 py-10">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{t('payments','noPayments')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/8 transition-colors">
                    <div>
                      <div className="text-white font-medium text-sm">Order #BST-{p.order_id}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-white font-bold text-sm">
                        {p.currency || '$'}{parseFloat(p.amount).toLocaleString()}
                      </div>
                      <div className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full ${getStatusStyle(p.status)}`}>
                        {getStatusIcon(p.status)}
                        <span className="capitalize">{p.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
