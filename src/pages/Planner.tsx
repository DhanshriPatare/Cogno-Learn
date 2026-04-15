import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Target, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { generateStudyPlan } from '../lib/gemini';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Planner() {
  const [topic, setTopic] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'studyPlans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(plansList);
      if (plansList.length > 0 && !activePlan) setActivePlan(plansList[0]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'studyPlans');
    });

    return () => unsubscribe();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !timeframe.trim() || loading || !auth.currentUser) return;

    setLoading(true);
    try {
      const planData = await generateStudyPlan(topic, timeframe);
      if (planData) {
        const newPlan = {
          userId: auth.currentUser.uid,
          topic,
          timeframe,
          plan: planData,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'studyPlans'), newPlan);
        setTopic('');
        setTimeframe('');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'studyPlans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="text-cosmic-indigo" />
            AI Study Planner
          </h1>
          <p className="text-white/60">Generate structured, multi-day study schedules tailored to your goals.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <GlassCard className="p-8 space-y-6">
            <h2 className="text-xl font-bold">New Study Plan</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">What are you studying?</label>
                <input
                  type="text"
                  placeholder="e.g., Advanced React Patterns"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cosmic-indigo transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">By when?</label>
                <input
                  type="text"
                  placeholder="e.g., Next Friday"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cosmic-indigo transition-all"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-cosmic-indigo py-3 rounded-xl font-bold hover:bg-cosmic-indigo/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Generate Plan</>}
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="text-xl font-bold mb-6">Recent Plans</h2>
            <div className="space-y-4">
              {plans.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setActivePlan(p)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all",
                    activePlan?._id === p._id 
                      ? "bg-cosmic-indigo/20 border-cosmic-indigo" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <p className="font-bold truncate">{p.topic}</p>
                  <p className="text-xs text-white/40">Deadline: {p.timeframe}</p>
                </button>
              ))}
              {plans.length === 0 && <p className="text-center text-white/40 py-4">No plans generated yet.</p>}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activePlan ? (
              <motion.div
                key={activePlan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <GlassCard className="p-8 bg-cosmic-indigo/10 border-cosmic-indigo/20">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">{activePlan.topic}</h2>
                    <span className="px-4 py-1 bg-cosmic-indigo rounded-full text-xs font-bold uppercase tracking-widest">Active Plan</span>
                  </div>
                  <p className="text-white/60 flex items-center gap-2">
                    <Clock size={16} />
                    Target Completion: {activePlan.timeframe}
                  </p>
                </GlassCard>

                <div className="space-y-4">
                  {activePlan.plan.map((day: any, i: number) => (
                    <GlassCard key={i} className="p-6">
                      <div className="flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-cosmic-indigo/20 text-cosmic-indigo flex items-center justify-center font-bold text-xl shrink-0">
                          {day.day}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg font-bold text-cosmic-cyan uppercase tracking-wider mb-1">Focus: {day.focus}</h3>
                            <div className="h-1 w-20 bg-cosmic-cyan/20 rounded-full" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {day.tasks.map((task: string, j: number) => (
                              <div key={j} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
                                <CheckCircle2 size={16} className="text-white/20" />
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                <Calendar size={64} className="mb-6" />
                <h2 className="text-2xl font-bold mb-2">Select or Create a Plan</h2>
                <p>Your structured learning journey will appear here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
