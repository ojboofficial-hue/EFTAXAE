import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Handle case where auth exists but profile doesn't
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
    // Note: Firebase Auth uses email, so we assume username is email for now
    // or we can fetch the email from a mapping if needed.
    // For simplicity in this demo, we'll use email as username.
    const email = username.includes('@') ? username : `${username}@emara.tax`;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (username: string, password: string, displayName: string) => {
    const email = username.includes('@') ? username : `${username}@emara.tax`;
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    const userProfile: UserProfile = {
      id: firebaseUser.uid,
      username,
      email,
      displayName,
      role: 'corporate',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
    setUser(userProfile);
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
      const userProfile: UserProfile = {
        id: firebaseUser.uid,
        username: firebaseUser.email?.split('@')[0] || 'user',
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        role: 'corporate',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      setUser(userProfile);
    } else {
      setUser(userDoc.data() as UserProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
