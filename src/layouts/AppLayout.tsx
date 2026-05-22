import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Menu, X, Calendar as CalendarIcon, LayoutDashboard, Settings, BookOpen, Clock, LogOut, Bell } from 'lucide-react';
import { useTheme } from '../components/theme-provider';
import { useAuth } from '../contexts/AuthContext';
import { useExamStore } from '../store/useExamStore';
import { useStudyPlanStore } from '../store/useStudyPlanStore';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { usePomodoroStore } from '../store/usePomodoroStore';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { fetchExams } = useExamStore();
  const { fetchData } = useStudyPlanStore();

  useEffect(() => {
    fetchExams();
    fetchData();
  }, [fetchExams, fetchData]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Study Planner', path: '/planner', icon: BookOpen },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Sidebar */}
          <aside className="relative w-64 h-full border-r border-border glass flex flex-col bg-background shadow-2xl">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg">
                  <Clock size={20} />
                </div>
                <h1 className="font-semibold text-xl tracking-tight">Planner</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:bg-secondary rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
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
        </div>
      )}

      {/* Desktop Sidebar - Apple Glassmorphism Style */}
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
        <header className="h-16 border-b border-border glass sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-foreground hover:bg-secondary rounded-md" aria-label="Open Menu">
              <Menu size={24} />
            </button>
            <span className="font-semibold tracking-tight text-lg ml-1">Exam Planner</span>
          </div>
          <div className="hidden md:flex flex-1"></div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => usePomodoroStore.getState().setIsOpen(true)}
              className="px-3 py-1.5 flex items-center gap-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-sm transition-colors"
            >
              <Clock size={16} /> Timer
            </button>
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
            <div className="w-8 h-8 rounded-full bg-secondary border border-border hidden sm:block"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
      
      <PomodoroTimer />
    </div>
  );
}
