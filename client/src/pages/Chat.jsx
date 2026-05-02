import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Download, ArrowLeft, Shield, User, X, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getUser } from '../utils/auth';

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);   // students list (for admin view)
  const [unreadCounts, setUnreadCounts] = useState({}); // admin: unread per student
  const [selectedUser, setSelectedUser] = useState(null); // admin: selected student id
  const [adminId, setAdminId] = useState(null);   // student: the admin's actual DB id

  const fileRef = useRef();
  const bottomRef = useRef();
  const msgCountRef = useRef(0); // tracks previous message count
  const navigate = useNavigate();
  const user = getUser();

  // ── On mount: load user list → derive adminId for students ────────────────
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    api.get('/admin/users.php')
      .then(res => {
        const users = res.data;
        if (user.role === 'admin') {
          setAllUsers(users.filter(u => u.role !== 'admin'));
        } else {
          const admin = users.find(u => u.role === 'admin');
          if (admin) setAdminId(admin.id);
        }
      })
      .catch(console.error);
  }, []);

  // ── Poll messages when adminId or selectedUser is ready ───────────────────
  useEffect(() => {
    if (!user) return;
    if (user.role === 'user' && !adminId) return; // wait for adminId

    const fetch = () => {
      fetchMessages();
      if (user.role === 'admin') fetchAdminUnreadCounts();
    };
    fetch();
    const timer = setInterval(fetch, 3000);
    return () => clearInterval(timer);
  }, [adminId, selectedUser]);

  const fetchAdminUnreadCounts = async () => {
    try {
      const res = await api.get('/admin/users.php'); // we could reuse this to fetch users, but let's just fetch notifications
      // Actually we need a way to get counts per user. For now we will just show a general badge, or we can fetch the total and if it's > 0, we can re-fetch users if we had a specific endpoint. Since we don't, I will just call the general mark-read when opening a chat.
    } catch(e) {}
  };

  // ── Auto scroll — only when NEW messages arrive, not on initial load ────────
  useEffect(() => {
    if (messages.length > msgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    msgCountRef.current = messages.length;
  }, [messages]);

  // ── Fetch messages ─────────────────────────────────────────────────────────
  const fetchMessages = async () => {
    try {
      let url = null;

      if (user.role === 'admin') {
        if (selectedUser) url = `/chat/messages.php?user1=${user.id}&user2=${selectedUser}`;
      } else {
        if (adminId) url = `/chat/messages.php?user1=${user.id}&user2=${adminId}`;
      }

      if (!url) { setMessages([]); setLoading(false); return; }

      const res = await api.get(url);
      setMessages(res.data || []);

      // Mark as read
      if (res.data && res.data.length > 0) {
        api.post('/notifications/mark-read', {
          user_id: user.id,
          role: user.role,
          type: 'chat',
          related_id: user.role === 'admin' ? selectedUser : adminId
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Fetch messages error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const receiverId = user.role === 'admin' ? selectedUser : adminId;
    if (!receiverId) return;

    setSending(true);
    const formData = new FormData();
    formData.append('sender_id', String(user.id));
    formData.append('receiver_id', String(receiverId));
    formData.append('message', newMessage);
    if (file) formData.append('file', file);

    try {
      await api.post('/chat/send.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewMessage('');
      setFile(null);
      await fetchMessages();
    } catch (e) {
      console.error('Send error:', e.response?.data || e.message);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const canChat = user.role === 'admin' ? !!selectedUser : !!adminId;

  return (
    <div className="pt-24 pb-10 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Support Chat</h1>
            <p className="text-gray-400 text-sm">Real-time communication with BST HUB team</p>
          </div>
        </div>

        <div className={`grid gap-6 ${user.role === 'admin' ? 'lg:grid-cols-4' : ''}`}>

          {/* Admin sidebar — student list */}
          {user.role === 'admin' && (
            <div className="glass-card p-4 space-y-2 lg:col-span-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">Students</p>
              {allUsers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No students yet</p>
              )}
              {allUsers.map(u => (
                <button key={u.id} onClick={() => setSelectedUser(u.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-left ${
                    selectedUser === u.id
                      ? 'bg-accent-blue/20 border border-accent-blue/30 text-white'
                      : 'hover:bg-white/5 text-gray-400'
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{u.name}</div>
                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chat window */}
          <div
            className={`glass-card flex flex-col ${user.role === 'admin' ? 'lg:col-span-3' : ''}`}
            style={{ height: '72vh' }}
          >
            {/* Chat header */}
            <div className="p-4 border-b border-white/10 flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {user.role === 'admin'
                    ? (selectedUser ? allUsers.find(u => u.id === selectedUser)?.name || 'Student' : '← Select a student')
                    : 'BST HUB Support Team'}
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                </div>
              )}
              {!loading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-center">
                  <MessageSquare className="w-14 h-14 text-gray-700" />
                  <p className="text-gray-500 text-sm">
                    {user.role === 'admin' && !selectedUser
                      ? 'Select a student to view their chat'
                      : 'No messages yet. Start the conversation! 👋'}
                  </p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((msg, i) => {
                  const isMine = String(msg.sender_id) === String(user.id);
                  return (
                    <motion.div key={msg.id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[72%] px-4 py-3 shadow-lg ${
                        isMine
                          ? 'bg-accent-blue text-white rounded-2xl rounded-br-sm'
                          : 'bg-white/10 text-gray-100 rounded-2xl rounded-bl-sm'
                      }`}>
                        {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                        {msg.file_path && (
                          <a href={`http://localhost:8000/uploads/${msg.file_path}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center space-x-2 mt-2 text-xs bg-white/15 hover:bg-white/25 rounded-lg px-3 py-2 transition-colors">
                            <Download className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{msg.file_name || 'Download File'}</span>
                          </a>
                        )}
                        <div className={`text-[10px] mt-1.5 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* File preview */}
            {file && (
              <div className="px-4 py-2 border-t border-white/10 bg-accent-blue/10 flex items-center justify-between flex-shrink-0">
                <span className="text-sm text-blue-300 truncate">📎 {file.name}</span>
                <button onClick={() => setFile(null)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>
            )}

            {/* Input bar */}
            <form onSubmit={handleSend}
              className="p-4 border-t border-white/10 flex items-center space-x-3 flex-shrink-0">
              <button type="button" onClick={() => fileRef.current?.click()}
                title="Attach file"
                className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 text-gray-400" />
              </button>
              <input type="file" ref={fileRef} className="hidden"
                onChange={e => setFile(e.target.files[0] || null)} />

              <input type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={
                  !canChat
                    ? (user.role === 'admin' ? 'Select a student first...' : 'Connecting to support...')
                    : 'Type your message...'
                }
                disabled={!canChat}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm disabled:opacity-40"
              />
              <button type="submit"
                disabled={sending || !canChat}
                className="bg-accent-blue hover:bg-blue-600 p-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
                {sending
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="w-5 h-5 text-white" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
