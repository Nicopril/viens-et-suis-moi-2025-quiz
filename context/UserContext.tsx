import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Utilisateur',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (name: string) => {
    setIsLoading(true);
    try {
      const result = await signInAnonymously(auth);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        setUser({
          id: result.user.uid,
          name,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la connexion anonyme :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};


