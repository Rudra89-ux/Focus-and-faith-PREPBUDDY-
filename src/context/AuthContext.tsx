import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, Rank } from '@/src/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = doc(db, 'users', u.uid);
        return onSnapshot(userDoc, async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            
            // Daily Skip Reset Logic
            const today = new Date().toDateString();
            const lastReset = data.lastSkipReset ? new Date(data.lastSkipReset).toDateString() : '';
            
            if (today !== lastReset) {
              await setDoc(userDoc, { 
                skipCount: 3, 
                lastSkipReset: new Date().toISOString() 
              }, { merge: true });
            }

            setProfile(data);
          } else {
            // Initialize profile
            const newProfile: UserProfile = {
              userId: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'Goal Getter',
              coins: 0,
              xp: 0,
              rank: Rank.Bronze,
              streak: 0,
              skipCount: 3,
              lastSkipReset: new Date().toISOString(),
              blockedApps: [],
              ownedItems: [],
              createdAt: new Date().toISOString(),
              totalFocusMinutes: 0,
            };
            setDoc(userDoc, newProfile);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
