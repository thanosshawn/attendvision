"use client";

import type { User } from 'firebase/auth'; // Assuming Firebase Auth, adjust if different
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// For a real app, you'd use Firebase or another auth provider
// import { auth } from '@/lib/firebase'; // Placeholder for firebase config
// import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null; // Using Firebase User type as an example
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>; // Example sign-in
  signUp: (email: string, pass: string) => Promise<void>; // Example sign-up
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user type for simplicity if not using Firebase directly
interface MockUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication check
    const checkAuth = () => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
      setLoading(false);
    };
    checkAuth();
    // For a real app with Firebase:
    // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //   setUser(currentUser);
    //   setLoading(false);
    // });
    // return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    // Mock sign-in
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    if (email === 'admin@attend.vision' && pass === 'password') {
      const mockUser = { uid: 'mock-admin-uid', email, displayName: 'Admin User' } as unknown as User;
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
    setLoading(false);
  };

  const signUp = async (email: string, pass: string) => {
    // Mock sign-up
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
     const mockUser = { uid: `mock-uid-${Date.now()}`, email, displayName: email.split('@')[0] } as unknown as User;
    localStorage.setItem('authUser', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const signOut = async () => {
    // Mock sign-out
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('authUser');
    setUser(null);
    setLoading(false);
    // For Firebase:
    // await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
