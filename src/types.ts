export enum Rank {
  Bronze = "Bronze",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  Diamond = "Diamond",
  Master = "Master",
  Legend = "Legend"
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  coins: number;
  xp: number;
  rank: Rank;
  streak: number;
  skipCount: number;
  lastSkipReset: string;
  blockedApps: string[];
  appLimits?: Record<string, number>;
  ownedItems: string[];
  activeTheme?: string;
  createdAt: string;
  totalFocusMinutes: number;
}

export interface FocusSession {
  id?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  mode: 'Study' | 'Grind';
  status: 'active' | 'completed' | 'interrupted';
  skipsUsed: number;
  coinsEarned: number;
  xpEarned: number;
  distractionsDetected: number;
}

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
  completionTime?: string;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}
