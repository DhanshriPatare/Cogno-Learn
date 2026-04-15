import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { askGemini } from '../lib/gemini';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'chatMessages'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chatMessages');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !auth.currentUser) return;

    const userMsgText = input;
    setInput('');
    setLoading(true);

    try {
      // Save user message to DB
      await addDoc(collection(db, 'chatMessages'), {
        userId: auth.currentUser.uid,
        role: 'user',
        text: userMsgText,
        createdAt: serverTimestamp()
      });

      // Get AI response
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const aiResponse = await askGemini(userMsgText, history);
      
      // Save AI message to DB
      await addDoc(collection(db, 'chatMessages'), {
        userId: auth.currentUser.uid,
        role: 'model',
        text: aiResponse,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'chatMessages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bot className="text-cosmic-indigo" />
          AI Tutor
        </h1>
        <p className="text-white/60">Ask anything, from complex physics to simple coding tips.</p>
      </header>

      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0" hover={false}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex gap-4 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                msg.role === 'user' ? "bg-cosmic-indigo text-white" : "bg-white/10 text-cosmic-cyan"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' ? "bg-cosmic-indigo text-white rounded-tr-none" : "bg-white/5 border border-white/10 rounded-tl-none"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-cosmic-cyan flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="animate-spin text-cosmic-cyan" size={16} />
                <span className="text-sm text-white/60 italic">Cogno is thinking...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none focus:border-cosmic-indigo transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-cosmic-indigo rounded-2xl hover:bg-cosmic-indigo/80 transition-all disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
