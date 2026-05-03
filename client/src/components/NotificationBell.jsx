import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, MessageSquare, AlertCircle, Trash2, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'chat': return <MessageSquare className="text-blue-500 w-4 h-4" />;
      case 'order_delivered': return <CheckCircle className="text-green-500 w-4 h-4" />;
      case 'budget_update': return <AlertCircle className="text-yellow-500 w-4 h-4" />;
      default: return <Bell className="text-gray-400 w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 glass rounded-xl text-gray-300 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 glass-card shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-white">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 border-b border-white/5 transition-colors relative group ${!n.is_read ? 'bg-accent-blue/5' : 'opacity-60'}`}
                    >
                      <div className="flex space-x-3">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1">
                          <p className={`text-xs ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>{n.message}</p>
                          <span className="text-[10px] text-gray-600 block mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.is_read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="p-1 bg-white/5 rounded hover:bg-white/10 text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2 text-center bg-white/5">
                  <button className="text-[10px] text-accent-blue hover:underline">Clear all</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
