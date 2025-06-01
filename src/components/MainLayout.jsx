import React from 'react';
import Navbar from '@/components/navbar'; // Your existing standard desktop navbar
import MobileTopBar from './MobileTopBar'; // Import the new MobileTopBar

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop Navbar Wrapper: Only shows on md screens and larger */}
      {/* Assumes Navbar component handles its own fixed positioning and styling (e.g., bg, shadow, z-index) */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Mobile Top Bar: Only shows on screens smaller than md */}
      <MobileTopBar />
      
      {/* Main content area */}
      {/* Updated pt-16 for mobile to account for MobileTopBar (h-16), md:pt-0 to remove it on larger screens */}
      {/* Kept pb-16 for mobile to account for MobileBottomBar, md:pb-0 to remove it on larger screens */}
      <main className="flex-1 flex pt-16 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 