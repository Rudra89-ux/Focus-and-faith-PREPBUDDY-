import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { Dashboard } from '@/src/components/Dashboard';
import { FocusMode } from '@/src/components/FocusMode';
import { Tasks } from '@/src/components/Tasks';
import { Shop } from '@/src/components/Shop';
import { Social } from '@/src/components/Social';
import { Profile as ProfileView } from '@/src/components/Profile';
import { Navigation } from '@/src/components/Navigation';
import { auth } from '@/src/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Target } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
           transition={{ duration: 2, repeat: Infinity }}
        >
          <Target className="text-white" size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    const handleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login failed:", error);
      }
    };

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col items-center gap-12 z-10 text-center"
        >
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-white text-black rounded-[28px] flex items-center justify-center shadow-2xl">
                <Target size={40} />
             </div>
             <div>
                <h1 className="text-white text-4xl font-black tracking-tight mb-2">PrepBuddy</h1>
                <p className="text-white/40 text-sm max-w-[240px] px-2 leading-relaxed">
                  Turn your study hours into a competitive game with AI accountability.
                </p>
             </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full h-16 bg-white text-black rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl"
          >
            <LogIn size={20} />
            Continue with Google
          </button>
          
          <div className="flex flex-col gap-2 opacity-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">The Premium Grind</span>
            <div className="flex gap-2 justify-center">
               <div className="w-1 h-1 rounded-full bg-white" />
               <div className="w-1 h-1 rounded-full bg-white" />
               <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-black">
      <div className="max-w-md mx-auto relative min-h-screen">
        <main className="pb-32">
          {activeTab === 'dashboard' && <Dashboard onStartFocus={() => setIsFocusModeOpen(true)} />}
          {activeTab === 'tasks' && <Tasks />}
          {activeTab === 'shop' && <Shop />}
          {activeTab === 'social' && <Social />}
          {activeTab === 'focus' && (
             <div className="px-6 pt-8 text-center h-[70vh] flex flex-col items-center justify-center gap-6">
                <Target size={64} className="text-white/20 mb-4" />
                <h1 className="text-white text-2xl font-bold">Focus Mode</h1>
                <p className="text-white/40 text-sm">Enter Focus Lock to start earning rewards.</p>
                <button 
                  onClick={() => setIsFocusModeOpen(true)}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold"
                >
                  Start New Session
                </button>
             </div>
          )}
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <FocusMode isOpen={isFocusModeOpen} onClose={() => setIsFocusModeOpen(false)} />

        {/* User Profile Shortcut */}
        <button 
          onClick={() => setActiveTab('profile')}
          className="absolute top-8 right-6 w-10 h-10 border border-white/10 rounded-2xl flex items-center justify-center bg-white/5 overflow-hidden z-40 transition-all hover:border-white/20 active:scale-95"
        >
          {activeTab === 'profile' ? (
              <span className="text-white font-bold text-xs uppercase">Close</span>
          ) : (
              profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/40 font-bold text-xs uppercase">{profile?.displayName[0]}</span>
              )
          )}
        </button>

        {activeTab === 'profile' && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 bg-[#0A0A0A] z-[45] overflow-y-auto"
            >
               <ProfileView />
               <button 
                 onClick={() => setActiveTab('dashboard')}
                 className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all shadow-2xl"
               >
                 Go Back
               </button>
            </motion.div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
