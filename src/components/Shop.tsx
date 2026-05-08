import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Coins, Lock, Star, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';

export const Shop: React.FC = () => {
  const { profile } = useAuth();

  const items = [
    { id: 'theme-midnight', type: 'theme', name: 'Midnight OLED', price: 1000, color: 'from-black to-blue-900', icon: Palette },
    { id: 'theme-forest', type: 'theme', name: 'Deep Forest', price: 800, color: 'from-black to-emerald-900', icon: Palette },
    { id: 'badge-alpha', type: 'badge', name: 'Alpha Focus', price: 2500, color: 'from-orange-400 to-red-600', icon: Star },
    { id: 'wall-abstract', type: 'wallpaper', name: 'Abstract Flow', price: 500, color: 'bg-white/10', icon: ImageIcon },
    { id: 'effect-aura', type: 'effect', name: 'Focus Aura', price: 5000, color: 'shadow-white/20', icon: Sparkles },
    { id: 'streak-shield', type: 'util', name: 'Streak Shield', price: 300, color: 'bg-blue-400/20', icon: Lock },
  ];

  const buyItem = async (item: any) => {
    if (!profile) return;
    if (profile.coins < item.price) {
        alert("Not enough coins! Keep studying.");
        return;
    }

    if (profile.ownedItems?.includes(item.id)) {
        alert("You already own this item.");
        return;
    }

    try {
        const userRef = doc(db, 'users', profile.userId);
        await updateDoc(userRef, {
            coins: profile.coins - item.price,
            ownedItems: [...(profile.ownedItems || []), item.id]
        });
        alert(`Successfully purchased ${item.name}!`);
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-32">
      <div className="px-6 pt-8 flex items-end justify-between">
        <div>
           <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">Marketplace</span>
           <h1 className="text-white text-3xl font-bold tracking-tight">Custom Store</h1>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-2xl border border-yellow-400/20">
           <Coins className="text-yellow-400" size={16} />
           <span className="text-yellow-400 font-bold">{profile?.coins}</span>
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4">
        {items.map((item) => {
          const isOwned = profile?.ownedItems?.includes(item.id);
          const Icon = item.icon;
          return (
            <motion.button
               whileTap={{ scale: 0.95 }}
               key={item.id}
               onClick={() => buyItem(item)}
               className="flex flex-col items-start text-left bg-white/5 border border-white/10 rounded-[32px] overflow-hidden p-6 relative group"
            >
                <div className={cn(
                    "w-full aspect-square rounded-2xl bg-gradient-to-br mb-4 flex items-center justify-center transition-transform group-hover:scale-105",
                    item.color
                )}>
                    <Icon className="text-white/80" size={32} />
                </div>
                
                <span className="text-white/90 text-sm font-bold tracking-tight mb-1">{item.name}</span>
                <div className="flex items-center justify-between w-full">
                    <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{item.type}</span>
                    {isOwned ? (
                        <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Owned</span>
                    ) : (
                        <div className="flex items-center gap-1">
                            <Coins size={10} className="text-yellow-400" />
                            <span className="text-yellow-400 text-[10px] font-bold">{item.price}</span>
                        </div>
                    )}
                </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
