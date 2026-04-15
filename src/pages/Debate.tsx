import React, { useState } from 'react';
import { Swords, Send, Trophy, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { sparWithAI } from '../lib/gemini';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Debate() {
  const [topic, setTopic] = useState('');
  const [argument, setArgument] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [advantage, setAdvantage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!argument.trim() || loading) return;

    const userArg = { role: 'user', text: argument };
    setHistory(prev => [...prev, userArg]);
    setArgument('');
    setLoading(true);

    try {
      const result = await sparWithAI(topic, argument, history);
      if (result) {
        const aiArg = { role: 'model', text: result.rebuttal };
        setHistory(prev => [...prev, aiArg]);
        setAdvantage(result.logicScore);
      }
    } catch (err) {
      console.error('Debate error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Swords className="text-cosmic-neon" />
          Devil's Advocate
        </h1>
        <p className="text-white/60">Sharpen your logic by debating against a relentless AI opponent.</p>
      </header>

      {!started ? (
        <GlassCard className="max-w-xl mx-auto p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-cosmic-neon/20 rounded-3xl flex items-center justify-center mx-auto text-cosmic-neon">
            <Swords size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Choose Your Battleground</h2>
            <p className="text-white/60">What topic would you like to debate today?</p>
          </div>
          <input
            type="text"
            placeholder="e.g., Is AI a threat to creativity?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-cosmic-neon transition-all"
          />
          <button
            onClick={() => topic && setStarted(true)}
            className="w-full bg-cosmic-neon py-4 rounded-2xl font-bold hover:opacity-90 transition-all"
          >
            Enter the Arena
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="h-[500px] flex flex-col p-0" hover={false}>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {history.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col gap-2",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm max-w-[80%]",
                      msg.role === 'user' 
                        ? "bg-cosmic-indigo text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && <p className="text-white/40 italic text-sm">AI is formulating a rebuttal...</p>}
              </div>
              <form onSubmit={handleDebate} className="p-6 border-t border-white/10 flex gap-4">
                <input
                  type="text"
                  placeholder="Defend your position..."
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none focus:border-cosmic-neon transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="p-3 bg-cosmic-neon rounded-2xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </form>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="text-center p-8">
              <h3 className="text-lg font-bold mb-6">Advantage Meter</h3>
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  animate={{ width: `${advantage}%` }}
                  className="h-full bg-gradient-to-r from-red-500 via-cosmic-indigo to-cosmic-cyan transition-all duration-1000"
                />
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/20 -translate-x-1/2" />
              </div>
              <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-wider">
                <span className="text-red-400">AI Rebuttal</span>
                <span className="text-cosmic-cyan">Your Logic</span>
              </div>
              <div className="mt-8">
                <div className={cn(
                  "text-4xl font-bold mb-2",
                  advantage > 50 ? "text-cosmic-cyan" : "text-red-400"
                )}>
                  {advantage}%
                </div>
                <p className="text-sm text-white/60">
                  {advantage > 70 ? "You're crushing it! Keep the pressure on." : 
                   advantage > 40 ? "A balanced debate. Strengthen your core argument." :
                   "The AI is picking apart your logic. Re-evaluate your stance."}
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-cosmic-neon" />
                Debate Tips
              </h3>
              <ul className="text-sm text-white/60 space-y-3">
                <li>• Avoid logical fallacies like ad hominem.</li>
                <li>• Use empirical evidence where possible.</li>
                <li>• Acknowledge valid points to build credibility.</li>
                <li>• Keep your rebuttals focused on the core topic.</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
