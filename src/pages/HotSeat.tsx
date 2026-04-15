import React, { useState, useEffect } from 'react';
import { Zap, Timer, Terminal, Send, Trophy, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getInterviewQuestion, evaluateInterviewAnswer } from '../lib/gemini';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function HotSeat() {
  const [topic, setTopic] = useState('');
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    let timer: any;
    if (started && timeLeft > 0 && !result) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !result) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, result]);

  const startChallenge = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const q = await getInterviewQuestion(topic);
      setQuestion(q);
      setStarted(true);
      setTimeLeft(60);
      setResult(null);
      setAnswer('');
    } catch (err) {
      console.error('Failed to get question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (loading || result) return;
    setLoading(true);
    try {
      const data = await evaluateInterviewAnswer(question, answer);
      setResult(data);
    } catch (err) {
      console.error('Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Zap className="text-yellow-400" />
          Hot Seat
        </h1>
        <p className="text-white/60">60 seconds. One technical question. Can you handle the pressure?</p>
      </header>

      {!started ? (
        <GlassCard className="p-12 text-center space-y-8">
          <div className="w-24 h-24 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto text-yellow-400 animate-pulse">
            <Zap size={48} />
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-bold">Choose Your Domain</h2>
            <p className="text-white/60">Enter a technology or topic you want to be grilled on.</p>
            <input
              type="text"
              placeholder="e.g., React, Data Structures, AWS..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl focus:outline-none focus:border-yellow-400 transition-all"
            />
            <button
              onClick={startChallenge}
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Start 60s Challenge'}
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "px-6 py-3 rounded-2xl font-mono text-2xl font-bold flex items-center gap-3",
                timeLeft < 10 ? "bg-red-500/20 text-red-500 animate-bounce" : "bg-white/10 text-white"
              )}>
                <Timer size={24} />
                00:{timeLeft.toString().padStart(2, '0')}
              </div>
              <span className="text-white/40 font-mono uppercase tracking-widest">Pressure Test Active</span>
            </div>
            <button 
              onClick={() => setStarted(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              Abort Mission
            </button>
          </div>

          <GlassCard className="bg-black/40 border-white/5 p-0 overflow-hidden" hover={false}>
            <div className="bg-white/5 p-4 border-b border-white/5 flex items-center gap-2">
              <Terminal size={16} className="text-yellow-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">Technical Terminal v2.5</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <p className="text-yellow-400 font-mono text-sm uppercase tracking-widest">Incoming Question:</p>
                <h2 className="text-2xl font-bold leading-relaxed">{question}</h2>
              </div>

              <div className="space-y-4">
                <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Your Response:</p>
                <textarea
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!!result}
                  placeholder="Start typing your answer..."
                  className="w-full bg-transparent border-none focus:ring-0 text-lg font-mono leading-relaxed resize-none h-48"
                />
              </div>

              {!result && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Submit Answer'}
                </button>
              )}
            </div>
          </GlassCard>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <GlassCard className={cn(
                  "text-center p-12",
                  result.hired ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"
                )}>
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6",
                    result.hired ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  )}>
                    {result.hired ? <Trophy size={40} /> : <XCircle size={40} />}
                  </div>
                  <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">
                    {result.hired ? 'Hired' : 'Rejected'}
                  </h2>
                  <p className="text-2xl font-bold mb-4">Score: {result.score}%</p>
                  <p className="text-white/60">{result.feedback}</p>
                  <button 
                    onClick={startChallenge}
                    className="mt-8 px-8 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-bold"
                  >
                    Try Again
                  </button>
                </GlassCard>

                <GlassCard className="p-8">
                  <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white/40">Evaluation Metrics</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Technical Accuracy</span>
                        <span className="text-sm font-bold">{result.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.score}%` }}
                          className="h-full bg-yellow-400"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Response Speed</span>
                        <span className="text-sm font-bold">{Math.round((timeLeft / 60) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(timeLeft / 60) * 100}%` }}
                          className="h-full bg-cosmic-cyan"
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
