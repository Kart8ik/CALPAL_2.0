import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListChecks, Users, LogOut } from 'lucide-react';
import  AuthContext  from '@/context/Context';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";


const MobileBottomBar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Optionally, show an error toast or message to the user
    }
  };

  const navItems = [
    { path: '/yourtasks', icon: ListChecks, label: 'Your Tasks' },
    { path: '/groups', icon: Users, label: 'Groups' }
    // Add other items like Notifications here if needed
    // { path: '/notifications', icon: Bell, label: 'Alerts' },
  ];

  

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-card border-t border-border shadow-top md:hidden z-50">
      {/* shadow-top is a custom class you might need to define if you want a top shadow, e.g., shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] */}
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.label} // Using label as key assuming paths could be dynamic in more complex scenarios, but path is fine too.
            to={item.path}
            className="flex flex-col items-center justify-center text-foreground hover:text-primary focus:text-primary focus:outline-none transition-colors p-2 rounded-md w-1/4 min-w-0" // Added min-w-0 for better flex handling
          >
            <item.icon size={24} strokeWidth={1.5} />
            <span className="text-xs mt-1 truncate">{item.label}</span>
          </Link>
        ))}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              aria-label="Logout"
              className="flex flex-col items-center justify-center text-foreground hover:text-destructive focus:text-destructive focus:outline-none transition-colors p-2 rounded-md w-1/4 min-w-0"
            >
              <LogOut size={24} strokeWidth={1.5} />
              <span className="text-xs mt-1 truncate">Logout</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                You will be returned to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='border-1 border-foreground shadow-md hover:border-none'>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </nav>
  );
};

export default MobileBottomBar;
