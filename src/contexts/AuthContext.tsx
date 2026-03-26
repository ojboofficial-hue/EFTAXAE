import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  email: string;
  trn?: string;
}

interface AuthContextType {
  user: (UserProfile & { companyName?: string }) | null;
  loading: boolean;
  companies: Company[];
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string, companyId: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  loginWithGoogle: async () => {},
  registerCompany: async () => ({ id: '', name: '', email: '' }),
  fetchCompanies: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(UserProfile & { companyName?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchCompanies = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'companies'));
      const list: Company[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Company));
      setCompanies(list);
    } catch (error) {
      console.error('Fetch companies error:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile & { companyId?: string };
            let companyName: string | undefined;
            if (userData.companyId) {
              const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
              if (companyDoc.exists()) {
                companyName = (companyDoc.data() as Company).name;
              }
            }
            setUser({ ...userData, companyName });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    const email = username.includes('@') ? username : `${username}@emara.tax`;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (username: string, password: string, displayName: string, companyId: string) => {
    const email = username.includes('@') ? username : `${username}@emara.tax`;
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

    const userProfile = {
      id: firebaseUser.uid,
      username,
      email,
      displayName,
      role: 'corporate' as const,
      companyId,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      const userProfile = {
        id: firebaseUser.uid,
        username: firebaseUser.email?.split('@')[0] || 'user',
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        role: 'corporate' as const,
        companyId: '',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
    }
  };

  const registerCompany = async (name: string, email: string, trn?: string): Promise<Company> => {
    const companyData = { name, email, trn: trn || '', createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'companies'), companyData);
    const company: Company = { id: docRef.id, name, email, trn };
    setCompanies(prev => [...prev, company]);
    return company;
  };

  return (
    <AuthContext.Provider value={{ user, loading, companies, login, register, logout, loginWithGoogle, registerCompany, fetchCompanies }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
