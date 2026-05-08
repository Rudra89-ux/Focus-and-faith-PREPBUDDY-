import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Circle, Calendar, Trash2, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Task } from '@/src/types';
import { cn } from '@/src/lib/utils';

export const Tasks: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'users', profile.userId, 'tasks'),
      where('userId', '==', profile.userId)
    );
    return onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });
  }, [profile]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !profile) return;

    try {
      await addDoc(collection(db, 'users', profile.userId, 'tasks'), {
        userId: profile.userId,
        title: newTaskTitle,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      });
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!profile || !task.id) return;
    const taskRef = doc(db, 'users', profile.userId, 'tasks', task.id);
    await updateDoc(taskRef, {
      isCompleted: !task.isCompleted,
      completionTime: !task.isCompleted ? new Date().toISOString() : null,
    });

    if (!task.isCompleted) {
        // Award some XP for completion
        const userRef = doc(db, 'users', profile.userId);
        await updateDoc(userRef, {
            xp: (profile.xp || 0) + 10,
            coins: (profile.coins || 0) + 2
        });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!profile) return;
    await deleteDoc(doc(db, 'users', profile.userId, 'tasks', taskId));
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 pb-32">
      <div className="px-6 pt-8">
        <div className="flex items-end justify-between mb-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">Focus Tasks</h1>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{completedCount}/{tasks.length} Completed</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/[0.03]">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-700"
           />
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group p-5 rounded-[28px] border transition-all flex items-center justify-between",
                task.isCompleted 
                  ? "bg-white/5 border-white/5 opacity-60" 
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    task.isCompleted 
                      ? "bg-white text-black" 
                      : "border-2 border-white/20 hover:border-white"
                  )}
                >
                  {task.isCompleted && <Check size={12} strokeWidth={4} />}
                </button>
                <span className={cn(
                  "text-sm font-medium transition-all truncate max-w-[200px]",
                  task.isCompleted ? "text-white/40 line-through" : "text-white/90"
                )}>
                  {task.title}
                </span>
              </div>
              
              <button 
                onClick={() => task.id && deleteTask(task.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Task Button */}
      {!isAdding ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="fixed bottom-32 right-6 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl z-40"
        >
          <Plus size={24} />
        </motion.button>
      ) : (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="fixed bottom-0 left-0 right-0 p-6 bg-black/90 backdrop-blur-3xl border-t border-white/10 z-[60]"
        >
          <form onSubmit={addTask} className="max-w-md mx-auto">
            <input
              autoFocus
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-white/20 mb-4"
            />
            <div className="flex gap-3">
               <button 
                 type="button"
                 onClick={() => setIsAdding(false)}
                 className="flex-1 py-4 text-white/40 font-bold uppercase tracking-widest text-[10px]"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 className="flex-1 py-4 bg-white text-black rounded-2xl font-bold"
               >
                 Create Task
               </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
