import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Zap, Target, Award, Clock } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUser({ ...docSnap.data(), createdAt: currentUser.metadata.creationTime || new Date().toISOString() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const totalProd = user?.productivity.reduce((a: number, b: number) => a + b, 0) || 0;
  const rank = totalProd > 500 ? 'Neural Architect' : totalProd > 200 ? 'Cognitive Explorer' : 'Awaiting Link';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="text-cosmic-indigo" />
          Neural Profile
        </h1>
        <p className="text-white/60">Manage your cognitive identity and track your evolution.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="md:col-span-1 p-8 text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-cosmic-indigo to-cosmic-neon flex items-center justify-center text-4xl font-bold shadow-2xl shadow-cosmic-indigo/20">
              {user?.name?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-cosmic-cyan rounded-2xl flex items-center justify-center text-cosmic-900 border-4 border-cosmic-900">
              <Shield size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-cosmic-cyan font-bold uppercase tracking-widest text-xs mt-1">{rank}</p>
          </div>
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Mail size={16} />
              {user?.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Clock size={16} />
              Joined {new Date(user?.createdAt).toLocaleDateString()}
            </div>
          </div>
        </GlassCard>

        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <Zap className="text-yellow-400 mb-2" size={24} />
              <p className="text-2xl font-bold">{totalProd}</p>
              <p className="text-xs text-white/40 uppercase font-bold">Total Focus Points</p>
            </GlassCard>
            <GlassCard className="p-6">
              <Award className="text-cosmic-neon mb-2" size={24} />
              <p className="text-2xl font-bold">{Math.floor(totalProd / 100)}</p>
              <p className="text-xs text-white/40 uppercase font-bold">Neural Milestones</p>
            </GlassCard>
          </div>

          <GlassCard className="p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Target size={20} className="text-cosmic-cyan" />
              Neural Link Integrity
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Cognitive Consistency</span>
                  <span className="text-sm font-bold">84%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cosmic-indigo w-[84%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Knowledge Retention</span>
                  <span className="text-sm font-bold">92%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cosmic-cyan w-[92%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Focus Endurance</span>
                  <span className="text-sm font-bold">67%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cosmic-neon w-[67%]" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
