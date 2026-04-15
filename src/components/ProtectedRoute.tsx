import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ProtectedRoute() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isAuth === null) return <div className="flex items-center justify-center h-screen bg-cosmic-900">Loading...</div>;

  return isAuth ? <Outlet /> : <Navigate to="/login" />;
}
