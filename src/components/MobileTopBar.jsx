import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import Notifications from '@/pages/Notifications.jsx';

const MobileTopBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 w-full flex items-center justify-between bg-card border-b border-border p-4 h-16 shadow-top md:hidden z-50">
      <Link to="/yourtasks" className="text-3xl font-bold text-foreground">
        Calpal
      </Link>
      <div className='flex items-center gap-4'>
        <Notifications />
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default MobileTopBar; 