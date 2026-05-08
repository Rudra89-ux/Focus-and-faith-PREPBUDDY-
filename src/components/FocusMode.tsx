import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldAlert, Timer as TimerIcon, SkipForward, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';

export const FocusMode: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'Study' | 'Grind'>('Study');
  const [duration, setDuration] = useState(25);
  const [customTime, setCustomTime] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [skipsUsed, setSkipsUsed] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [distractionTime, setDistractionTime] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  
  const timerRef = useRef<any>(null);

  const durations = [25, 45, 60, 90];

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
           if (prev <= 1) {
             clearInterval(timerRef.current);
             handleSessionComplete();
             return 0;
           }
           return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  // Enforcement: Detect when user leaves the app
  useEffect(() => {
    let distractionInterval: any;
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setIsDistracted(true);
        if (mode === 'Grind') {
          // Grind mode: Immediate warning/penalty
          setIsWarning(true);
        } else {
          // Study mode: Start grace period timer (15 seconds)
          distractionInterval = setInterval(() => {
            setDistractionTime(prev => {
              if (prev >= 15) {
                clearInterval(distractionInterval);
                setIsWarning(true);
                return 15;
              }
              return prev + 1;
            });
          }, 1000);
        }
      } else {
        setIsDistracted(false);
        setDistractionTime(0);
        clearInterval(distractionInterval);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(distractionInterval);
    };
  }, [isActive, mode]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleSessionComplete = async () => {
    if (!profile) return;
    setIsActive(false);
    
    const coinsEarned = mode === 'Grind' ? duration * 2 : duration;
    const xpEarned = duration * 5;

    // Save session to Firestore
    try {
      await addDoc(collection(db, 'users', profile.userId, 'sessions'), {
        userId: profile.userId,
        startTime: new Date().toISOString(), // This should be the actual start
        durationMinutes: duration,
        mode,
        status: 'completed',
        skipsUsed,
        coinsEarned,
        xpEarned,
        distractionsDetected: 0,
      });

      // Update user stats
      const userRef = doc(db, 'users', profile.userId);
      await updateDoc(userRef, {
        coins: profile.coins + coinsEarned,
        xp: profile.xp + xpEarned,
        totalFocusMinutes: (profile.totalFocusMinutes || 0) + duration,
        streak: (profile.streak || 0) + 1, // Simple streak logic
      });

      alert(`Great job! Earned ${coinsEarned} coins and ${xpEarned} XP.`);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkip = async () => {
    const currentSkips = profile?.skipCount ?? 3;
    if (currentSkips > 0) {
      if (window.confirm(`Use 1 of your ${currentSkips} daily skips to end this session safely?`)) {
        try {
          const userRef = doc(db, 'users', profile!.userId);
          await updateDoc(userRef, {
            skipCount: currentSkips - 1
          });
          setIsActive(false);
          onClose();
        } catch (e) {
          console.error("Skip error:", e);
        }
      }
    } else {
      setIsWarning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-between py-20 px-8"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        </div>

        {/* Top Controls */}
        <div className="w-full flex justify-between items-center z-10">
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">Status</span>
            <span className="text-white text-sm font-medium">Locked in {mode}</span>
          </div>
          {!isActive && (
            <button onClick={onClose} className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center">
              <X className="text-white/40" size={18} />
            </button>
          )}
        </div>

        {/* Timer Display */}
        <div className="relative flex flex-col items-center z-10 w-full">
          {isDistracted && !isWarning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-24 bg-red-500/20 border border-red-500/40 text-red-400 px-6 py-3 rounded-2xl flex flex-col items-center gap-1 backdrop-blur-md"
            >
              <AlertTriangle size={20} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Returns in {15 - distractionTime}s or Penalty</span>
            </motion.div>
          )}
          <motion.div 
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 4, repeat: Infinity }}
            className={cn(
              "font-black tracking-tighter text-white leading-none mb-8",
              isActive ? "text-[120px]" : "text-[80px]"
            )}
          >
            {formatTime(timeLeft)}
          </motion.div>

          {!isActive && (
            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDuration(d); setIsCustomMode(false); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                        !isCustomMode && duration === d ? "bg-white text-black" : "text-white/40 hover:text-white/60"
                      )}
                    >
                      {d}m
                    </button>
                  ))}
                  <button
                    onClick={() => setIsCustomMode(true)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                      isCustomMode ? "bg-white text-black" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    Custom
                  </button>
                </div>

                {isCustomMode && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <input
                      type="number"
                      placeholder="Minutes (1-180)"
                      value={customTime}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCustomTime(e.target.value);
                        if (!isNaN(val) && val > 0 && val <= 180) {
                          setDuration(val);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-sm focus:outline-none focus:border-white/20"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-2">
                <ModeBadge label="Deep Work" active={mode === 'Study'} onClick={() => !isActive && setMode('Study')} />
                <ModeBadge label="Grind Mode" active={mode === 'Grind'} onClick={() => !isActive && setMode('Grind')} />
              </div>

              {profile && profile.blockedApps.length > 0 && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Targeting Distractions</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.blockedApps.map(app => (
                      <span key={app} className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded-md border border-white/10 uppercase tracking-tighter">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-4 z-10 max-w-xs">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="h-20 bg-white text-black rounded-[32px] font-bold text-lg flex items-center justify-center gap-2"
            >
              <Lock size={20} />
              Start Session
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                onClick={handleSkip}
                className="h-16 bg-white/5 border border-white/10 text-white rounded-[24px] font-bold flex items-center justify-center gap-3 transition-colors active:bg-white/10"
              >
                <SkipForward size={20} />
                Skip Session ({profile?.skipCount ?? 3}/3 left)
              </button>
              
              <p className="text-white/30 text-center text-[10px] uppercase font-bold tracking-widest px-4 leading-relaxed">
                You are currently in Focus Lock. Leaving the app will damage your streak and deduct coins.
              </p>
            </div>
          )}
        </div>

        {/* Warning Modal */}
        {isWarning && (
           <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-8">
              <div className="bg-[#111] border border-white/10 p-8 rounded-[40px] flex flex-col items-center text-center gap-6">
                 <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center">
                    <ShieldAlert className="text-red-400" size={40} />
                 </div>
                 <div>
                    <h2 className="text-white text-2xl font-bold tracking-tight">Skips Exhausted</h2>
                    <p className="text-white/40 text-sm mt-2">Ending now will cost you 250 coins and reset your streak. Are you sure?</p>
                 </div>
                 <div className="w-full flex flex-col gap-3">
                    <button onClick={() => setIsWarning(false)} className="w-full py-4 bg-white text-black rounded-2xl font-bold">Stay Locked In</button>
                    <button onClick={() => { setIsWarning(false); handleSessionComplete(); }} className="w-full py-4 bg-transparent text-red-400 font-bold">End & Take Penalty</button>
                 </div>
              </div>
           </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const ModeBadge = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
      active ? "bg-white text-black" : "bg-white/5 text-white/40 border border-white/5 hover:border-white/20"
    )}
  >
    {label}
  </button>
);
