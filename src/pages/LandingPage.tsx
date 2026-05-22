import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, Clock, Bell, ArrowRight, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../components/theme-provider';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // If already authenticated, go straight to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: "Interactive Study Planner",
      description: "Break down large syllabuses into manageable, trackable topic nodes.",
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Universal Calendar Sync",
      description: "Export your exam schedule as an .ics file directly into Google or Apple Calendar.",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Built-In Pomodoro",
      description: "Stay focused with a global Pomodoro timer that links directly to your study topics.",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Smart Reminders",
      description: "Set recurring or specific-time reminders via SMS and Email.",
      icon: Bell,
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <LayoutDashboard size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Exam Planner</span>
        </div>
        
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
          <Link to="/login" className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center relative z-10 pt-20 pb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          The Ultimate Student OS
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
          Master Your Schedule. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ace Your Exams.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          A powerful, all-in-one platform to organize your syllabus, track your study time, and sync your deadlines securely to the cloud.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center">
            Start Planning Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="px-8 py-4 bg-secondary text-foreground text-lg font-semibold rounded-full hover:bg-secondary/80 transition-colors w-full sm:w-auto justify-center flex">
            I already have an account
          </Link>
        </div>

        {/* Social Proof / Mini feature list */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Cloud Synced</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Free to Use</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> No Ads Ever</div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-secondary/30 border-t border-border py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Stop juggling between calendar apps, to-do lists, and timer websites. Exam Planner brings your entire study workflow into one beautiful interface.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-border py-12 text-center relative z-10">
        <div className="container mx-auto px-6">
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-6">Ready to get organized?</h2>
          <Link to="/register" className="px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-full hover:opacity-90 transition-opacity">
            Create Free Account
          </Link>
          <p className="text-sm text-muted-foreground mt-8">© {new Date().getFullYear()} Exam Planner. Built for PuiPui, Hehe.</p>
        </div>
      </footer>
    </div>
  );
}
