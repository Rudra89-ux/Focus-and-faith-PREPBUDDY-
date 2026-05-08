import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Coins, Trophy, ChevronRight, Zap, Target, Star, Brain } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { generateAccountabilityMessage } from '@/src/services/geminiService';
import { Rank } from '@/src/types';

import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { startOfWeek } from 'date-fns';

export const Dashboard: React.FC<{ onStartFocus: () => void }> = ({ onStartFocus }) => {
  const { profile } = useAuth();
  const [aiMessage, setAiMessage] = useState("Analyzing your performance...");
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      if (!profile) return;
      
      try {
        // Fetch sessions from this week
        const weekStart = startOfWeek(new Date()).toISOString();
        const q = query(
          collection(db, 'users', profile.userId, 'sessions'),
          where('startTime', '>=', weekStart)
        );
        const snapshot = await getDocs(q);
        const count = snapshot.size;
        setSessionCount(count);

        const msg = await generateAccountabilityMessage({
          sessionsThisWeek: count,
          totalHours: Math.floor(profile.totalFocusMinutes / 60),
          distractions: 5, // Hypothetical for now
          streak: profile.streak,
          rank: profile.rank,
        });
        setAiMessage(msg);
      } catch (e) {
        console.error(e);
      }
    }
    
    fetchStats();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header / Profile Summary */}
      <div className="flex items-center justify-between px-6 pt-8">
        <div className="flex flex-col">
          <span className="text-white/40 text-xs font-medium uppercase tracking-[0.2em]">PrepBuddy</span>
          <h1 className="text-white text-2xl font-semibold tracking-tight mt-1">Hello, {profile.displayName}</h1>
        </div>
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            {/* Rank-based icon would go here */}
            <Star className="text-white/80" size={20} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 px-6">
        <StatCard icon={Flame} label="Streak" value={`${profile.streak} Days`} color="text-orange-400" />
        <StatCard icon={Coins} label="Coins" value={profile.coins.toString()} color="text-yellow-400" />
        <StatCard icon={Trophy} label="Rank" value={profile.rank} color="text-purple-400" />
        <StatCard icon={Zap} label="XP" value={profile.xp.toString()} color="text-cyan-400" />
      </div>

      {/* AI Coach Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 p-6 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Brain size={80} />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">AI Accountability</span>
        </div>
        <p className="text-white/90 text-sm leading-relaxed italic">"{aiMessage}"</p>
      </motion.div>

      {/* Primary Action Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onStartFocus}
        className="mx-6 h-20 bg-white text-black rounded-[32px] flex items-center justify-between px-8 group transition-all"
      >
        <div className="flex flex-col items-start translate-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Ready to work?</span>
          <span className="text-xl font-bold tracking-tight -mt-1">Enter Focus Lock</span>
        </div>
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
          <ChevronRight className="text-white" size={20} />
        </div>
      </motion.button>

      {/* Daily Missions */}
      <div className="px-6">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Daily Missions</h3>
        <div className="flex flex-col gap-3">
          <MissionItem 
            label="Total Study Time" 
            progress={Math.min(profile.totalFocusMinutes, 120)} 
            total={120} 
            reward={100} 
          />
          <MissionItem 
            label="Weekly Session Goal" 
            progress={sessionCount} 
            total={10} 
            reward={200} 
          />
          <MissionItem 
            label="Current Streak" 
            progress={profile.streak} 
            total={7} 
            reward={300} 
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white/5 border border-white/10 p-5 rounded-[28px] flex flex-col gap-1">
    <Icon className={cn("mb-2", color)} size={18} />
    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{label}</span>
    <span className="text-white font-semibold text-lg">{value}</span>
  </div>
);

const MissionItem = ({ label, progress, total, reward }: any) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
    <div className="flex flex-col gap-1">
      <span className="text-white/90 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all" 
            style={{ width: `${(progress / total) * 100}%` }} 
          />
        </div>
        <span className="text-white/30 text-[10px]">{progress}/{total}</span>
      </div>
    </div>
    <div className="flex items-center gap-1.5 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
      <Coins className="text-yellow-400" size={10} />
      <span className="text-yellow-400 text-[10px] font-bold">+{reward}</span>
    </div>
  </div>
);
