'use client';

import { useAuth } from "@/hooks/useAuth";

export function useAdmin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  return { isAdmin, user };
} 