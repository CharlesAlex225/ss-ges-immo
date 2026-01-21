"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../app/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  requestOTP: (identifier: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOTP: (identifier: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const pendingOTPs = new Map<string, string>();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('ss_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const requestOTP = async (identifier: string) => {
    console.log("🔍 Attempting login for:", identifier);

    // UPDATED: Now looking at the 'people' table
    let query = supabase.from('people').select('*');

    if (identifier.includes('@')) {
      query = query.eq('email', identifier);
    } else {
      query = query.eq('phone', identifier);
    }

    const { data, error } = await query.single();

    console.log("📥 Supabase Result:", data);
    console.log("❌ Supabase Error:", error);

    if (error || !data) {
      return { success: false, error: "Compte introuvable. (Vérifiez la table 'people')" };
    }
    
    const otp = "123456"; 
    pendingOTPs.set(identifier, otp);
    
    console.log(`✅ User found: ${data.name}. OTP: ${otp}`);
    return { success: true, otp }; 
  };

  const verifyOTP = async (identifier: string, otp: string) => {
    const correctOTP = pendingOTPs.get(identifier);
    
    if (correctOTP === otp) {
      // UPDATED: Now looking at the 'people' table
      let query = supabase.from('people').select('*');
      
      if (identifier.includes('@')) {
        query = query.eq('email', identifier);
      } else {
        query = query.eq('phone', identifier);
      }

      const { data } = await query.single();

      if (data) {
        const loggedUser: User = {
            id: data.id,
            name: data.name,
            role: data.role,
            phone: data.phone,
            email: data.email
        };
        setUser(loggedUser);
        localStorage.setItem('ss_user', JSON.stringify(loggedUser));
        pendingOTPs.delete(identifier);
        router.push('/'); 
        return { success: true };
      }
    }
    return { success: false, error: "Code invalide." };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ss_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, requestOTP, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};