import React, { useState, useEffect } from 'react';
import { Smile, Send, Wind, Target, Zap, Waves, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { analyzeMood } from '../lib/gemini';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Mood() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodData, setMoodData] = useState<any>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || loading || !auth.currentUser) return;

    setLoading(true);
    try {
      const data = await analyzeMood(description);
      if (data) {
        setMoodData(data);
        await addDoc(collection(db, 'moodLogs'), {
          userId: auth.currentUser.uid,
          ...data,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'moodLogs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 min-h-[calc(100vh-160px)] flex flex-col">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Smile className="text-cosmic-cyan" />
          Zen State Engine
        </h1>
        <p className="text-white/60">Describe your current state. Let AI curate an immersive emotional release.</p>
      </header>

      {!moodData ? (
        <GlassCard className="max-w-2xl mx-auto p-12 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">How are you feeling?</h2>
            <p className="text-white/60">Be as descriptive as you like. Your words will shape the experience.</p>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="I'm feeling a bit overwhelmed with exams and need to find some focus..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-lg focus:outline-none focus:border-cosmic-cyan transition-all resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-cosmic-cyan text-cosmic-900 py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Begin Immersion'}
          </button>
        </GlassCard>
      ) : (
        <div className="flex-1 relative rounded-[40px] overflow-hidden">
          {/* Immersive Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ 
              backgroundImage: `url('https://picsum.photos/seed/${moodData.imageKeyword}/1920/1080')`,
            }}
          >
            <div 
              className="absolute inset-0 transition-colors duration-1000"
              style={{ backgroundColor: `${moodData.overlayColor}80` }}
            />
          </div>

          <div className="relative z-10 h-full flex flex-col p-12">
            <div className="flex justify-between items-start">
              <GlassCard className="max-w-md" hover={false}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{moodData.mood}</span>
                  <h2 className="text-2xl font-bold uppercase tracking-widest">Current State</h2>
                </div>
                <p className="text-lg leading-relaxed">{moodData.suggestion}</p>
                <button 
                  onClick={() => setMoodData(null)}
                  className="mt-6 text-sm text-white/40 hover:text-white transition-colors"
                >
                  ← Reset State
                </button>
              </GlassCard>

              <div className="flex flex-col gap-4">
                {['Smash', 'Breathe', 'Pop', 'Ripple', 'Burn'].map((game) => (
                  <button
                    key={game}
                    onClick={() => setActiveGame(game)}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-bold transition-all backdrop-blur-xl border flex items-center gap-3",
                      activeGame === game 
                        ? "bg-white text-cosmic-900 border-white scale-105" 
                        : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                    )}
                  >
                    {game === 'Smash' && <Target size={20} />}
                    {game === 'Breathe' && <Wind size={20} />}
                    {game === 'Pop' && <Zap size={20} />}
                    {game === 'Ripple' && <Waves size={20} />}
                    {game === 'Burn' && <Flame size={20} />}
                    {game}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {activeGame === 'Breathe' && <BreatheGame key="breathe" />}
                {activeGame === 'Smash' && <SmashGame key="smash" />}
                {activeGame === 'Pop' && <PopGame key="pop" />}
                {activeGame === 'Ripple' && <RippleGame key="ripple" />}
                {activeGame === 'Burn' && <BurnGame key="burn" />}
                {!activeGame && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-2xl font-bold opacity-60">Select an activity to release your energy</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BreatheGame() {
  const [phase, setPhase] = useState('Inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          if (phase === 'Inhale') { setPhase('Hold'); return 4; }
          if (phase === 'Hold') { setPhase('Exhale'); return 4; }
          if (phase === 'Exhale') { setPhase('Inhale'); return 4; }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div className="text-center space-y-12">
      <motion.div
        animate={{ 
          scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 0.8 : 1.5,
          opacity: phase === 'Hold' ? 0.8 : 1
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-64 h-64 rounded-full bg-white/20 backdrop-blur-3xl border border-white/30 flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.2)]"
      >
        <div className="text-4xl font-bold">{count}</div>
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-4xl font-black uppercase tracking-[0.2em]">{phase}</h3>
        <p className="text-white/60">Follow the rhythm of the sphere</p>
      </div>
    </div>
  );
}

function SmashGame() {
  const [targets, setTargets] = useState<{id: number, x: number, y: number}[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (targets.length < 5) {
        setTargets(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        }]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targets]);

  const smash = (id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 text-2xl font-bold">Targets Smashed: {score}</div>
      {targets.map(t => (
        <motion.button
          key={t.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => smash(t.id)}
          className="absolute w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
          style={{ left: `${t.x}%`, top: `${t.y}%` }}
        >
          <Target size={32} />
        </motion.button>
      ))}
    </div>
  );
}

function PopGame() {
  const [bubbles, setBubbles] = useState<{id: number, x: number, size: number}[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * 90 + 5,
        size: Math.random() * 40 + 40
      }]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {bubbles.map(b => (
        <motion.button
          key={b.id}
          initial={{ y: '110%' }}
          animate={{ y: '-10%' }}
          transition={{ duration: 8, ease: "linear" }}
          onClick={() => setBubbles(prev => prev.filter(p => p.id !== b.id))}
          className="absolute rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/30"
          style={{ left: `${b.x}%`, width: b.size, height: b.size }}
        >
          <Zap size={b.size / 2} className="opacity-20" />
        </motion.button>
      ))}
    </div>
  );
}

function RippleGame() {
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);

  const addRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <div className="w-full h-full cursor-crosshair relative" onClick={addRipple}>
      {ripples.map(r => (
        <motion.div
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute w-20 h-20 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${r.x}%`, top: `${r.y}%` }}
        />
      ))}
      <p className="absolute bottom-0 w-full text-center text-white/40 italic">Click anywhere to create ripples of calm</p>
    </div>
  );
}

function BurnGame() {
  const [text, setText] = useState('');
  const [burning, setBurning] = useState(false);

  const handleBurn = () => {
    if (!text.trim()) return;
    setBurning(true);
    setTimeout(() => {
      setText('');
      setBurning(false);
    }, 2000);
  };

  return (
    <div className="max-w-xl w-full space-y-8">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your frustrations here..."
          className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-xl focus:outline-none focus:border-orange-500 transition-all resize-none h-64"
        />
        <AnimatePresence>
          {burning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-orange-600/40 to-transparent rounded-3xl pointer-events-none flex items-center justify-center"
            >
              <motion.div
                animate={{ y: [-20, -100], opacity: [1, 0], scale: [1, 2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-orange-500"
              >
                <Flame size={64} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        onClick={handleBurn}
        disabled={burning || !text.trim()}
        className="w-full bg-orange-600 py-4 rounded-2xl font-bold hover:bg-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Flame size={24} />
        Incinerate Frustrations
      </button>
    </div>
  );
}
