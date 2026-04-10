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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'admin@wamanager.com';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (mounted) {
            if (userDoc.exists()) {
              setIsApproved(userDoc.data().approved || false);
            } else {
              await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                displayName: user.displayName || '',
                createdAt: serverTimestamp(),
                approved: false,
                role: user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'client'
              });
              setIsApproved(user.email === SUPER_ADMIN_EMAIL);
            }
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          if (mounted) setIsApproved(false);
        }
      } else {
        if (mounted) setIsApproved(false);
      }
      if (mounted) setLoading(false);
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
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
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          email, displayName,
          createdAt: serverTimestamp(),
          approved: false,
          role: 'client'
        });
      } catch (err) {
        console.error('Error creating user doc:', err);
      }
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
      try {
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
        console.error('Error creating user doc:', err);
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
        // For now, users list is managed locally since Firestore read requires permissions
        setUsers([]);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const approveUser = async (userId) => {
    try {
      await setDoc(doc(db, 'users', userId), { approved: true }, { merge: true });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u));
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  const revokeUser = async (userId) => {
    try {
      await setDoc(doc(db, 'users', userId), { approved: false }, { merge: true });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: false } : u));
    } catch (err) {
      console.error('Error revoking user:', err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await setDoc(doc(db, 'users', userId), { deleted: true, approved: false }, { merge: true });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
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
