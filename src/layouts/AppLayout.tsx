import { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon, LayoutDashboard, Settings, BookOpen, Clock, LogOut, Bell } from 'lucide-react';
import { useTheme } from '../components/theme-provider';
import { useAuth } from '../contexts/AuthContext';
import { useExamStore } from '../store/useExamStore';
import { useStudyPlanStore } from '../store/useStudyPlanStore';

export default function AppLayout() {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { fetchExams } = useExamStore();
  const { fetchData } = useStudyPlanStore();

  useEffect(() => {
    fetchExams();
    fetchData();
  }, [fetchExams, fetchData]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Study Planner', path: '/planner', icon: BookOpen },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Apple Glassmorphism Style */}
      <aside className="w-64 border-r border-border glass flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg">
            <Clock size={20} />
          </div>
          <h1 className="font-semibold text-xl tracking-tight">Exam Planner</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <item.icon size={18} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-border glass sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary border border-border"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
