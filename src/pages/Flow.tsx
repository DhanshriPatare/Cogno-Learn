import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Wind, Brain, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Flow() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      setTimeLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
      setIsActive(false);
      // Play sound or notification here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'focus' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]",
            mode === 'focus' ? "bg-cosmic-indigo" : "bg-cosmic-cyan"
          )}
        />
      </div>

      <div className="relative z-10 text-center space-y-12">
        <div className="flex gap-4 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mx-auto w-fit">
          <button
            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={cn(
              "px-8 py-2 rounded-xl font-bold transition-all flex items-center gap-2",
              mode === 'focus' ? "bg-cosmic-indigo text-white" : "text-white/40 hover:text-white"
            )}
          >
            <Brain size={18} />
            Focus Mode
          </button>
          <button
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={cn(
              "px-8 py-2 rounded-xl font-bold transition-all flex items-center gap-2",
              mode === 'break' ? "bg-cosmic-cyan text-cosmic-900" : "text-white/40 hover:text-white"
            )}
          >
            <Coffee size={18} />
            Short Break
          </button>
        </div>

        <div className="relative">
          <svg className="w-80 h-80 transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="150"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="150"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={942}
              animate={{ strokeDashoffset: (942 * (100 - progress)) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
              className={mode === 'focus' ? "text-cosmic-indigo" : "text-cosmic-cyan"}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              key={timeLeft}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black font-mono tracking-tighter"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mt-2">
              {mode === 'focus' ? 'Deep Work' : 'Restoration'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/60 hover:text-white"
          >
            <RotateCcw size={28} />
          </button>
          <button
            onClick={toggleTimer}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl",
              mode === 'focus' 
                ? "bg-cosmic-indigo hover:bg-cosmic-indigo/80 shadow-cosmic-indigo/40" 
                : "bg-cosmic-cyan hover:bg-cosmic-cyan/80 shadow-cosmic-cyan/40 text-cosmic-900"
            )}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
          <div className="p-4 rounded-full bg-transparent text-transparent pointer-events-none">
            <RotateCcw size={28} />
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <GlassCard className="p-6 flex items-center gap-4" hover={false}>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cosmic-cyan">
              <Wind size={24} className="animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Flow Tip</p>
              <p className="text-sm">
                {mode === 'focus' 
                  ? "Minimize distractions. Your brain takes 23 minutes to refocus after an interruption." 
                  : "Step away from screens. Hydrate and stretch to maintain neural plasticity."}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
