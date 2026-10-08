import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/** Halaman aplikasi hanya bisa dibuka bila sudah login DAN akun punya peran. */
export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-sm text-slate-500">Memeriksa sesi...</div>;
  if (!user || !role) return <Navigate to="/login" replace />;
  return children;
}
