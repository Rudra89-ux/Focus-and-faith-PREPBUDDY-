import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Trophy, Zap, MessageCircle, Heart, UserPlus, Search } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';

export const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends'>('leaderboard');

  const leaderboardEntries = [
    { name: 'Alex Z.', xp: 24500, rank: 'Master', avatar: 'AZ', current: false },
    { name: 'Sarah K.', xp: 21200, rank: 'Diamond', avatar: 'SK', current: false },
    { name: 'Marcus L.', xp: 19800, rank: 'Diamond', avatar: 'ML', current: false },
    { name: 'You', xp: 15400, rank: 'Platinum', avatar: 'YO', current: true },
    { name: 'Chloe R.', xp: 14200, rank: 'Platinum', avatar: 'CR', current: false },
  ];

  const friendActivity = [
    { name: 'Sarah K.', action: 'completed a 2h Grind Session', time: '12m ago', avatar: 'SK' },
    { name: 'Marcus L.', action: 'just hit basic Master rank', time: '45m ago', avatar: 'ML' },
    { name: 'Alex Z.', action: 'started a new study room', time: '1h ago', avatar: 'AZ' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-32">
      <div className="px-6 pt-8">
        <h1 className="text-white text-3xl font-bold tracking-tight mb-6">Social</h1>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => setActiveTab('leaderboard')}
             className={cn(
               "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
               activeTab === 'leaderboard' ? "bg-white text-black" : "text-white/40"
             )}
           >
             Leaderboard
           </button>
           <button 
             onClick={() => setActiveTab('friends')}
             className={cn(
               "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
               activeTab === 'friends' ? "bg-white text-black" : "text-white/40"
             )}
           >
             Activity
           </button>
        </div>
      </div>

      <div className="px-6">
        {activeTab === 'leaderboard' ? (
          <div className="flex flex-col gap-3">
            {leaderboardEntries.map((entry, i) => (
                <div key={i} className={cn(
                    "p-4 rounded-2xl flex items-center justify-between border",
                    entry.current ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5"
                )}>
                    <div className="flex items-center gap-4">
                        <span className={cn(
                            "text-sm font-black w-4",
                            i === 0 ? "text-yellow-400" : i === 1 ? "text-white/60" : i === 2 ? "text-orange-400" : "text-white/20"
                        )}>{i + 1}</span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/5">
                            {entry.avatar}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium text-sm">{entry.name}</span>
                            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{entry.rank}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-cyan-400" />
                        <span className="text-white font-bold text-sm">{(entry.xp / 1000).toFixed(1)}k</span>
                    </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
             <div className="flex flex-col gap-4">
                {friendActivity.map((activity, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                            {activity.avatar}
                        </div>
                        <div className="flex flex-col gap-1 border-b border-white/5 pb-4 w-full">
                            <span className="text-white/90 text-sm">
                                <span className="font-bold">{activity.name}</span> {activity.action}
                            </span>
                            <div className="flex items-center justify-between">
                                <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">{activity.time}</span>
                                <div className="flex items-center gap-3">
                                    <button className="text-white/40 hover:text-white transition-colors"><Heart size={14} /></button>
                                    <button className="text-white/40 hover:text-white transition-colors"><MessageCircle size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
             
             <button className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/60 font-bold uppercase tracking-widest text-[10px]">
                <UserPlus size={14} />
                Discover Friends
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
