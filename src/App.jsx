import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthContextProvider } from '@/context/Context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import YourTasks from '@/pages/YourTasks';
import YourCalendar from '@/pages/YourCalendar';
import GroupsPage from '@/pages/GroupsPage';
import GroupsCalendar from '@/pages/GroupsCalendar';
import LandingPage from '@/pages/LandingPage';
import MainLayout from '@/components/MainLayout';
import MobileBottomBar from '@/components/mobilebar';
import Blog from '@/pages/Blog';

const ConditionalMobileBar = () => {
  const location = useLocation();
  const noMobileBarPaths = ['/', '/login', '/register','/blog'];
  if (noMobileBarPaths.includes(location.pathname)) {
    return null;
  }
  return <MobileBottomBar />;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/yourtasks" element={<MainLayout><YourTasks /></MainLayout>} />
      <Route path="/yourcalendar" element={<MainLayout><YourCalendar /></MainLayout>} />
      <Route path="/groups" element={<MainLayout><GroupsPage /></MainLayout>} />
      <Route path="/groupCalendar" element={<MainLayout><GroupsCalendar /></MainLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <Router>
        <AuthContextProvider>
          <AppContent />
          <ConditionalMobileBar />
          <Toaster richColors />
        </AuthContextProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;