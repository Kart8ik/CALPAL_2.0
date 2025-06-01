import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import  AuthContext  from '@/context/Context';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
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
import Notifications from '@/pages/Notifications.jsx';




const Navbar = () => {
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

    return (
        <nav className="flex items-center justify-between p-4 border-b bg-card text-card-foreground shrink-0">
        <div className='flex flex-row gap-2'>
        <Link to="/yourtasks" className="text-xl font-semibold hover:text-primary mt-1 mr-10">
          CalPal
        </Link>
        <Link to="/yourtasks">
          <Button variant="ghost">Your Tasks</Button>
        </Link>
        <Link to="/groups">
          <Button variant="ghost">Groups</Button>
        </Link>
        </div>
        <div className="flex space-x-2">
          <Notifications />
          <ThemeToggle />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" className="bg-background text-foreground hover:bg-primary hover:text-primary-foreground border-1">
                Logout
              </Button>
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
    )
}
export default Navbar;
