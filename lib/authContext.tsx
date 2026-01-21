"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../app/types';
import { useRouter } from 'next/navigation';

// --- MOCK USERS (We use these for testing until we connect a Users table) ---
const MOCK_DB: User[] = [
  { id: "u1", name: "Alice Locataire", role: UserRole.TENANT, phone: "+33612345678" },
  { id: "admin1", name: "Super Admin", role: UserRole.ADMIN, phone: "+33600000000" } // Admin phone
];

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
    // Check if user is already logged in (saved in browser)
    const storedUser = localStorage.getItem('ss_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const requestOTP = async (identifier: string) => {
    // Check if user exists in our Mock List
    const found = MOCK_DB.find(u => u.phone === identifier || u.email === identifier);
    
    if (!found) {
      return { success: false, error: "Compte introuvable. (Utilisez +33612345678 pour tester)" };
    }
    
    // Generate Fake OTP
    const otp = "123456"; // Hardcoded for easy testing!
    pendingOTPs.set(identifier, otp);
    
    console.log(`[OTP] Code pour ${identifier}: ${otp}`);
    return { success: true, otp }; 
  };

  const verifyOTP = async (identifier: string, otp: string) => {
    const correctOTP = pendingOTPs.get(identifier);
    
    if (correctOTP === otp) {
      const found = MOCK_DB.find(u => u.phone === identifier || u.email === identifier);
      if (found) {
        setUser(found);
        localStorage.setItem('ss_user', JSON.stringify(found));
        pendingOTPs.delete(identifier);
        router.push('/'); // Redirect to Dashboard
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