'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Return a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-xl">Redirecting...</div>
    </div>
  );
} 