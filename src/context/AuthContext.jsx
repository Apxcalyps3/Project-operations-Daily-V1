/**
 * Authentication Context
 * Manages Firebase authentication state, user profiles, and session persistence.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

/* ============================================================
   Authentication Provider
   ============================================================ */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...(userDoc.exists() ? userDoc.data() : {})
          });
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signup = async (email, password, username) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      username: username,
      email: email,
      createdAt: new Date().toISOString()
    });
    return result.user;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* ============================================================
   Hook
   ============================================================ */
export const useAuth = () => useContext(AuthContext);