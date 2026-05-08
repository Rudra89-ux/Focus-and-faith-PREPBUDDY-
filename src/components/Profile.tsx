import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut, Shield, ChevronRight, BarChart3, Bell, Star, X, Smartphone, Plus } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { auth, db } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

export const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [newApp, setNewApp] = useState('');
  const popularApps = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Snapchat', 'Discord', 'Netflix', 'Reddit'];

  if (!profile) return null;

  const addBlockedApp = async (appName?: string) => {
    const targetApp = appName || newApp.trim();
    if (!targetApp || profile.blockedApps.includes(targetApp)) return;
    const userRef = doc(db, 'users', profile.userId);
    await updateDoc(userRef, {
      blockedApps: [...profile.blockedApps, targetApp]
    });
    setNewApp('');
  };

  const removeBlockedApp = async (app: string) => {
    const userRef = doc(db, 'users', profile.userId);
    await updateDoc(userRef, {
      blockedApps: profile.blockedApps.filter(a => a !== app)
    });
  };

  const updateAppLimit = async (app: string, minutes: number) => {
    const userRef = doc(db, 'users', profile.userId);
    const newLimits = { ...(profile.appLimits || {}), [app]: minutes };
    await updateDoc(userRef, { appLimits: newLimits });
  };

  return (
    <div className="flex flex-col gap-6 pb-32">
      <div className="px-6 pt-12 flex flex-col items-center gap-6">
         <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center text-4xl shadow-2xl">
                {profile.displayName[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="text-yellow-400" size={18} fill="currentColor" />
            </div>
         </div>
         
         <div className="text-center">
            <h1 className="text-white text-2xl font-bold tracking-tight">{profile.displayName}</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest mt-1">{profile.rank} Rank Member</p>
         </div>

         <div className="flex gap-4 w-full">
            <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[28px] flex flex-col items-center">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Focus Time</span>
                <span className="text-white font-bold text-lg">{Math.floor(profile.totalFocusMinutes / 60)}h</span>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[28px] flex flex-col items-center">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Best Streak</span>
                <span className="text-white font-bold text-lg">{profile.streak}d</span>
            </div>
         </div>
      </div>

      {/* Blocked Apps Section */}
      <div className="px-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Distraction Shield</h3>
          <button 
            onClick={() => alert("Simulated Shield Activated. The app will now monitor focus via System Visibility.")}
            className="text-[10px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 font-bold uppercase tracking-widest"
          >
            Grant Permissions
          </button>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {profile.blockedApps.map((app) => (
                <motion.div
                  key={app}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 group"
                >
                  <Smartphone size={12} className="text-white/40" />
                  <span className="text-xs font-medium text-white/80">{app}</span>
                  <input 
                    type="number"
                    placeholder="Limit(m)"
                    className="w-12 bg-white/5 border border-white/10 rounded-md text-[10px] text-center text-white/60 focus:outline-none"
                    value={profile.appLimits?.[app] || ''}
                    onChange={(e) => updateAppLimit(app, parseInt(e.target.value) || 0)}
                  />
                  <button onClick={() => removeBlockedApp(app)} className="text-white/20 hover:text-red-400">
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {profile.blockedApps.length === 0 && (
              <span className="text-white/20 text-xs italic">No apps blocked yet.</span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Select from installed apps</span>
            <div className="grid grid-cols-3 gap-2">
              {popularApps.filter(app => !profile.blockedApps.includes(app)).slice(0, 6).map(app => (
                <button
                  key={app}
                  onClick={() => addBlockedApp(app)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 py-2 rounded-xl text-[10px] font-medium text-white/60 transition-colors"
                >
                  + {app}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add app (e.g. Instagram)" 
              value={newApp}
              onChange={(e) => setNewApp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBlockedApp()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-white/20"
            />
            <button 
              onClick={addBlockedApp}
              className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="px-6 flex flex-col gap-4">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">System Setup</h3>
        <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shrink-0">
               <Smartphone size={24} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Install on Device</h4>
              <p className="text-white/40 text-[10px] leading-relaxed">
                To access full distractions shield and "get out" of the browser:
              </p>
            </div>
          </div>
          <div className="space-y-3 bg-black/20 p-4 rounded-2xl">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">1</span>
              <p className="text-[10px] text-white/60 leading-tight">Open this link in <b>Chrome</b> (Android) or <b>Safari</b> (iOS).</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">2</span>
              <p className="text-[10px] text-white/60 leading-tight">Tap the <b>Share</b> button or <b>Menu</b> dots.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">3</span>
              <p className="text-[10px] text-white/60 leading-tight">Select <b>"Add to Home Screen"</b> to install as a native app.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3">
         <ProfileLink icon={Settings} label="Global Settings" />
         <ProfileLink icon={Shield} label="Privacy & Security" />
         <ProfileLink icon={Bell} label="Notifications" />
         <ProfileLink icon={BarChart3} label="Detailed Analytics" />
         
         <button 
           onClick={() => signOut(auth)}
           className="w-full mt-6 py-5 bg-red-400/10 border border-red-400/20 text-red-400 rounded-[32px] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
         >
           <LogOut size={16} />
           Log Out Session
         </button>
      </div>
      
      <div className="flex flex-col items-center mt-8 pb-12">
        <span className="text-white/10 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">PrepBuddy v1.0.4</span>
        <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
};

const ProfileLink = ({ icon: Icon, label }: any) => (
  <button className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Icon size={18} className="text-white/60 group-hover:text-white transition-colors" />
        </div>
        <span className="text-white/90 text-sm font-medium">{label}</span>
    </div>
    <ChevronRight className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" size={18} />
  </button>
);
