'use client';

import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  // Show loading state while redirecting
  return (
    <div className='flex h-screen items-center justify-center'>
      <Loader2 className='text-primary h-8 w-8 animate-spin' />
      <p className='ml-3 text-sm font-medium'>Redirecting...</p>
    </div>
  );
};

export default Page;
