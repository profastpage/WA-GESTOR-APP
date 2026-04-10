import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, orderBy } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'admin@wamanager.com';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user is approved
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsApproved(userDoc.data().approved || false);
        } else {
          // New user - create doc with approved=false
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName || '',
            createdAt: serverTimestamp(),
            approved: false,
            role: user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'client'
          });
          setIsApproved(user.email === SUPER_ADMIN_EMAIL);
        }
      } else {
        setIsApproved(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      // Create user doc with approved=false
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
        approved: false,
        role: 'client'
      });
    } catch (err) {
      setError(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check if user exists, if not create with approved=false
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName || '',
          createdAt: serverTimestamp(),
          approved: false,
          role: result.user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'client'
        });
      }
    } catch (err) {
      setError(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError('Error al cerrar sesión');
    }
  }, []);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  return { user, loading, error, login, register, loginWithGoogle, logout, isSuperAdmin, isApproved };
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const approveUser = async (userId) => {
    await setDoc(doc(db, 'users', userId), { approved: true }, { merge: true });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u));
  };

  const revokeUser = async (userId) => {
    await setDoc(doc(db, 'users', userId), { approved: false }, { merge: true });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: false } : u));
  };

  const deleteUser = async (userId) => {
    // Note: This only removes the Firestore doc, not the Firebase Auth user
    // To fully delete, you'd need Firebase Admin SDK
    await setDoc(doc(db, 'users', userId), { deleted: true, approved: false }, { merge: true });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return { users, loading, approveUser, revokeUser, deleteUser };
}

function getAuthError(code) {
  const errors = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
    'auth/cancelled-popup-request': 'Otra ventana emergente está abierta'
  };
  return errors[code] || 'Error de autenticación';
}
