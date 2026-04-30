import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../_utils/translations';

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  profile_image: string | null;
  language: string;
  created_at: string;
};

type AppContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  language: string;
  t: (key: string) => string;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLanguage: (lang: string) => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const AppContext = createContext<AppContextType | null>(null);

const API_URL = 'http://192.168.43.252:5000/api';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState('English');

  const checkAuth = async () => {
    setLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        const response = await fetch(`${API_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
          setLanguageState(userData.language || 'English');
        } else {
          await AsyncStorage.removeItem('userToken');
        }
      }
    } catch (error) {
      console.log('Auth check error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (newToken: string, userData: User) => {
    await AsyncStorage.setItem('userToken', newToken);
    setToken(newToken);
    setUser(userData);
    setLanguageState(userData.language || 'English');
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    if (user && token) {
      updateUser({ language: lang });
      await fetch(`${API_URL}/profile/language`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ language: lang })
      });
    }
  };

  const t = (key: string): string => {
    const langObj = translations[language] || translations['English'];
    return langObj[key] || translations['English'][key] || key;
  };

  return (
    <AppContext.Provider value={{ user, token, loading, language, t, login, logout, updateUser, setLanguage, checkAuth }}>
      {children}
    </AppContext.Provider>
  );
};

