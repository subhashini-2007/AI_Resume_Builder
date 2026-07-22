'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isMockMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith('dummy') ||
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith('your-');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    if (isMockMode) {
      // Simulate admin check or standard user based on email domain
      const role = email.includes('admin') ? 'admin' : 'user';
      const mockUser = {
        uid: role === 'admin' ? 'mock-admin-uid' : 'mock-user-uid',
        email,
        getIdToken: async () => 'mock-dev-token'
      } as any;
      
      setCurrentUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify({ uid: mockUser.uid, email: mockUser.email }));
      return { user: mockUser };
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    if (isMockMode) {
      const role = email.includes('admin') ? 'admin' : 'user';
      const mockUser = {
        uid: role === 'admin' ? 'mock-admin-uid' : 'mock-user-uid',
        email,
        getIdToken: async () => 'mock-dev-token'
      } as any;

      // Mock profile backend registration call
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-dev-token'
          },
          body: JSON.stringify({
            firstName: 'Demo',
            lastName: 'User',
            title: 'Software Engineer'
          })
        });
      } catch (err) {
        console.error('Mock profile setup failed:', err);
      }

      setCurrentUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify({ uid: mockUser.uid, email: mockUser.email }));
      return { user: mockUser };
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isMockMode) {
      setCurrentUser(null);
      localStorage.removeItem('mockUser');
      return;
    }
    return signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (isMockMode) {
      return;
    }
    return sendPasswordResetEmail(auth, email);
  };

  const getIdToken = async () => {
    if (isMockMode) {
      return 'mock-dev-token';
    }
    if (!currentUser) return null;
    return currentUser.getIdToken();
  };

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem('mockUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser({
          uid: parsed.uid,
          email: parsed.email,
          getIdToken: async () => 'mock-dev-token'
        } as any);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
