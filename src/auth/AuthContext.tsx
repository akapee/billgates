import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { logAudit } from '../services/audit';

export type Role = 'verifikator' | 'auditor' | 'supervisor' | 'superadmin';

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  canDecide: boolean;
  canInvestigate: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
  setMockRole: (role: Role) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: 'logout' | 'session_timeout') => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const IDLE_MS = 15 * 60 * 1000; 

async function fetchRole(uid: string): Promise<Role | null> {
  const snap = await getDoc(doc(db, 'staff', uid));
  const role = snap.exists() ? (snap.data().role as Role) : null;
  return role === 'verifikator' || role === 'auditor' || role === 'supervisor' || role === 'superadmin' ? role : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [mockRole, setMockRoleState] = useState<Role>('superadmin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (!u) { setRole(null); setLoading(false); return; }
    try {
      const r = await fetchRole(u.uid);
      setRole(r);
      setError(r ? null : 'Akun belum diberi peran. Hubungi administrator.');
    } catch {
      setRole(null);
      setError('Gagal memeriksa peran akun.');
    } finally {
      setLoading(false);
    }
  }), []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const r = await fetchRole(cred.user.uid);
    if (!r) {
      await signOut(auth);
      throw new Error('Akun belum diberi peran. Hubungi administrator.');
    }
    setRole(r);
    await logAudit('login');
  }, []);

  const logout = useCallback(async (reason: 'logout' | 'session_timeout' = 'logout') => {
    await logAudit(reason);
    await signOut(auth);
  }, []);

  // Auto-logout bila tidak ada aktivitas
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!user) return;
    const reset = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { void logout('session_timeout'); }, IDLE_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => { events.forEach((e) => window.removeEventListener(e, reset)); window.clearTimeout(timer.current); };
  }, [user, logout]);

  const activeRole = role || mockRole;

  const value = useMemo<AuthState>(() => ({
    user, 
    role: activeRole, 
    loading, 
    error,
    canDecide: activeRole === 'verifikator' || activeRole === 'superadmin',
    canInvestigate: activeRole === 'auditor' || activeRole === 'superadmin',
    canViewReports: activeRole === 'supervisor' || activeRole === 'superadmin',
    canManageSystem: activeRole === 'superadmin',
    setMockRole: setMockRoleState,
    login, 
    logout,
  }), [user, activeRole, loading, error, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
