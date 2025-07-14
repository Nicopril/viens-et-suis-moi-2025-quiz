
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as firestoreService from '../services/storageService';

interface UserContextType {
  user: User | null;
  login: (name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for new week on app load - this can trigger winner calculation
    firestoreService.checkAndResetForNewWeek().catch(console.error);
    
    // Load user from session storage on initial load
    const storedUser = firestoreService.getUserFromSession();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string) => {
    setIsLoading(true);
    try {
      const newUser = await firestoreService.findOrCreateUser(name);
      firestoreService.saveUserToSession(newUser);
      setUser(newUser);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    firestoreService.clearUserFromSession();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};