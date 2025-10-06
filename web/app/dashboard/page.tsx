'use client';

import Hero from '@/components/ui/neural-network-hero';
import { signOut } from 'next-auth/react';

const Dashboard = () => {
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth' });
  };

  return (
    <Hero
      title='Welcome to Your Dashboard'
      description='Experience the power of zero-knowledge proof authentication with a stunning neural network visualization. Your secure workspace awaits.'
      badgeText='ZKP Powered'
      badgeLabel='Secure'
      ctaButtons={[
        { text: 'Logout', onClick: handleLogout, primary: true },
        { text: 'View docs', href: '#docs' },
      ]}
      microDetails={['Privacy First', 'Neural Design', 'Real-time Animation']}
    />
  );
};

export default Dashboard;
