import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  login: (name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔑 Génère ou récupère un identifiant utilisateur persistant
  const getOrCreateUserId = (): string => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID(); // Identifiant unique
      localStorage.setItem('userId', id);
    }
    return id;
  };

  // 🧠 Tente de récupérer un utilisateur enregistré localement
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (name: string) => {
    setIsLoading(true);
    try {
      const id = getOrCreateUserId();
      const userData = { id, name };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};


