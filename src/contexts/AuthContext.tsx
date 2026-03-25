import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

export interface Company {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: (UserProfile & { companyName?: string }) | null;
  loading: boolean;
  companies: Company[];
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string, companyId: string) => Promise<void>;
  logout: () => Promise<void>;
  registerCompany: (name: string, email: string, trn?: string) => Promise<Company>;
  fetchCompanies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  companies: [],
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  registerCompany: async () => ({ id: '', name: '', email: '' }),
  fetchCompanies: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(UserProfile & { companyName?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Check auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const companiesList = await response.json();
        setCompanies(companiesList);
      }
    } catch (error) {
      console.error('Fetch companies error:', error);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const register = async (username: string, password: string, displayName: string, companyId: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName, companyId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    // After registration, log them in
    await login(username, password);
  };

  const registerCompany = async (name: string, email: string, trn?: string): Promise<Company> => {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, trn }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Company registration failed');
    }

    const company = await response.json();
    setCompanies([...companies, company]);
    return company;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, companies, login, register, logout, registerCompany, fetchCompanies }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
