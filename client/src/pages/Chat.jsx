import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Download, ArrowLeft, Shield, User, X, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { getUser } from '../utils/auth';

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);   // students list (for admin view)
  const [selectedUser, setSelectedUser] = useState(null); // admin: selected student id
  const [adminId, setAdminId] = useState(null);   // student: the admin's actual DB id

  const fileRef = useRef();
  const bottomRef = useRef();
  const msgCountRef = useRef(0);
  const navigate = useNavigate();
  const user = getUser();

  // ── On mount: load admin ID or users ────────────────
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchContext = async () => {
      try {
        if (user.role === 'admin') {
          const { data } = await supabase.from('profiles').select('*').neq('role', 'admin');
          setAllUsers(data || []);
        } else {
          const { data } = await supabase.from('profiles').select('id').eq('role', 'admin').single();
          if (data) setAdminId(data.id);
        }
      } catch (err) {
        console.error('Context fetch error:', err);
      }
    };
    fetchContext();
  }, [user, navigate]);

  // ── Subscribe to real-time messages ──────────────────
  useEffect(() => {
    if (!user) return;
    const receiverId = user.role === 'admin' ? selectedUser : adminId;
    if (!receiverId) return;

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        // Check if message belongs to this conversation
        if ((msg.sender_id === user.id && msg.receiver_id === receiverId) || 
            (msg.sender_id === receiverId && msg.receiver_id === user.id)) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminId, selectedUser]);

  useEffect(() => {
    if (messages.length > msgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    msgCountRef.current = messages.length;
  }, [messages]);

  const fetchMessages = async () => {
    const receiverId = user.role === 'admin' ? selectedUser : adminId;
    if (!receiverId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (e) {
      console.error('Fetch messages error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const receiverId = user.role === 'admin' ? selectedUser : adminId;
    if (!receiverId) return;

    setSending(true);
    try {
      let file_url = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `chat/${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(filePath);
        file_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('messages').insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          message: newMessage,
          file_url: file_url
        }
      ]);

      if (error) throw error;
      setNewMessage('');
      setFile(null);
    } catch (e) {
      console.error('Send error:', e.message);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;
  const canChat = user.role === 'admin' ? !!selectedUser : !!adminId;

  return (
    <div className="pt-24 pb-10 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
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
          {user.role === 'admin' && (
            <div className="glass-card p-4 space-y-2 lg:col-span-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">Students</p>
              {allUsers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No students yet</p>
              )}
              {allUsers.map(u => (
                <button key={u.id} onClick={() => setSelectedUser(u.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-left ${
                    selectedUser === u.id ? 'bg-accent-blue/20 border border-accent-blue/30 text-white' : 'hover:bg-white/5 text-gray-400'
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{u.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className={`glass-card flex flex-col ${user.role === 'admin' ? 'lg:col-span-3' : ''}`} style={{ height: '72vh' }}>
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
                <div className="flex items-center space-x-1.5 text-green-400 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-center">
                  <MessageSquare className="w-14 h-14 text-gray-700" />
                  <p className="text-gray-500 text-sm">
                    {user.role === 'admin' && !selectedUser ? 'Select a student to view their chat' : 'No messages yet. Start the conversation! 👋'}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, i) => {
                    const isMine = String(msg.sender_id) === String(user.id);
                    return (
                      <motion.div key={msg.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[72%] px-4 py-3 shadow-lg ${isMine ? 'bg-accent-blue text-white rounded-2xl rounded-br-sm' : 'bg-white/10 text-gray-100 rounded-2xl rounded-bl-sm'}`}>
                          {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                          {msg.file_url && (
                            <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 mt-2 text-xs bg-white/15 hover:bg-white/25 rounded-lg px-3 py-2 transition-colors">
                              <Download className="w-3 h-3 flex-shrink-0" />
                              <span>View File</span>
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
              )}
              <div ref={bottomRef} />
            </div>

            {file && (
              <div className="px-4 py-2 border-t border-white/10 bg-accent-blue/10 flex items-center justify-between flex-shrink-0">
                <span className="text-sm text-blue-300 truncate">📎 {file.name}</span>
                <button onClick={() => setFile(null)}><X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" /></button>
              </div>
            )}

            <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex items-center space-x-3 flex-shrink-0">
              <button type="button" onClick={() => fileRef.current?.click()} className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 text-gray-400" />
              </button>
              <input type="file" ref={fileRef} className="hidden" onChange={e => setFile(e.target.files[0] || null)} />
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder={!canChat ? (user.role === 'admin' ? 'Select a student first...' : 'Connecting...') : 'Type your message...'}
                disabled={!canChat} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm" />
              <button type="submit" disabled={sending || !canChat} className="bg-accent-blue hover:bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-40">
                {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 text-white" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
