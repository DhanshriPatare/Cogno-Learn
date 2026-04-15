import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, LogIn } from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import GlassCard from '../components/GlassCard';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Initialize user document in Firestore for new users
        await setDoc(userDocRef, {
          name: user.displayName || 'Anonymous Explorer',
          email: user.email,
          productivity: [0, 0, 0, 0, 0, 0, 0],
          activityLog: [{
            type: 'target',
            description: 'Neural link established via Google. Welcome to Cogno-Learn!',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString()
          }]
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cosmic-900 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-cosmic-indigo/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-cosmic-neon/20 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-cyan via-cosmic-indigo to-cosmic-neon bg-clip-text text-transparent mb-2">
            Cogno-Learn
          </h1>
          <p className="text-white/60">Your AI-Powered Cognitive Journey Starts Here</p>
        </div>

        <GlassCard className="p-8 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Explorer</h2>
            <p className="text-white/40 text-sm">Sign in with Google to sync your neural progress across devices.</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-cosmic-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/90 disabled:opacity-50 shadow-xl shadow-white/10"
          >
            {loading ? (
              'Connecting...'
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
              </>
            )}
          </button>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-xs text-white/20 uppercase tracking-widest font-bold">Secure Neural Link</p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
