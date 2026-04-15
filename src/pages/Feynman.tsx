import React, { useState } from 'react';
import { GraduationCap, Send, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { evaluateFeynman } from '../lib/gemini';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Feynman() {
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !explanation.trim() || loading) return;

    setLoading(true);
    try {
      const data = await evaluateFeynman(concept, explanation);
      setResult(data);
    } catch (err) {
      console.error('Evaluation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="text-cosmic-cyan" />
          Feynman Technique
        </h1>
        <p className="text-white/60">Explain a concept as if you're teaching a 10-year-old. If you can't, you don't understand it yet.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/40 uppercase">Concept</label>
            <input
              type="text"
              placeholder="e.g., Quantum Entanglement"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cosmic-cyan transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/40 uppercase">Your Explanation</label>
            <textarea
              placeholder="Explain it simply..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cosmic-cyan transition-all resize-none"
            />
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full bg-cosmic-cyan text-cosmic-900 py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Analyzing...' : 'Evaluate Explanation'}
            <Send size={20} />
          </button>
        </GlassCard>

        <div className="space-y-8">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <GlassCard className="text-center p-12">
                <div className="relative inline-block mb-6">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={377}
                      initial={{ strokeDashoffset: 377 }}
                      animate={{ strokeDashoffset: 377 - (377 * result.score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-cosmic-cyan"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{result.score}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Mastery Score</h2>
                <p className="text-white/60">{result.feedback}</p>
              </GlassCard>

              <GlassCard className="p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-400" />
                  Knowledge Gaps
                </h3>
                <div className="space-y-4">
                  {result.gaps.map((gap: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 shrink-0" />
                      <p className="text-sm text-white/80">{gap}</p>
                    </div>
                  ))}
                  {result.gaps.length === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-cosmic-cyan/10 rounded-2xl border border-cosmic-cyan/20">
                      <CheckCircle2 size={20} className="text-cosmic-cyan" />
                      <p className="text-sm text-cosmic-cyan">No significant gaps found! Excellent explanation.</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
              <Star size={64} className="mb-6" />
              <h2 className="text-2xl font-bold mb-2">Awaiting Explanation</h2>
              <p>Submit your explanation to receive a neural mastery evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
