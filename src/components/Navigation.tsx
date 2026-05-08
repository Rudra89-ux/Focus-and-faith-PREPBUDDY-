import React from 'react';
import { Home, Timer, CheckSquare, ShoppingBag, Users, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'focus', icon: Timer, label: 'Focus' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop' },
    { id: 'social', icon: Users, label: 'Social' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 px-6 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-2 rounded-2xl",
                  isActive && "bg-white/10"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className="text-[10px] font-medium tracking-tight uppercase opacity-60">
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -top-1 w-1 h-1 bg-white rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
