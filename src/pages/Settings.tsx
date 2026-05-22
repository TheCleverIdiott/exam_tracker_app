import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/theme-provider';
import { useExamStore } from '../store/useExamStore';
import { User, Lock, Palette, Database, Loader2, Save, Download } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'data'>('account');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account, preferences, and data.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <button onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>
            <User size={18} /> Account Profile
          </button>
          <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>
            <Palette size={18} /> Appearance
          </button>
          <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>
            <Database size={18} /> Data Management
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 glass-panel p-6 md:p-8">
           {activeTab === 'account' && <AccountSettings />}
           {activeTab === 'appearance' && <AppearanceSettings />}
           {activeTab === 'data' && <DataSettings />}
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.displayName || '');
  const [university, setUniversity] = useState(user?.user_metadata?.university || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({
      data: { displayName, university, phone }
    });
    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: 'Profile updated successfully.' });
    setLoadingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
    }
    setLoadingPassword(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">Account Profile</h2>
        <p className="text-sm text-muted-foreground mb-6">Update your personal details.</p>
        
        {message && (
          <div className={`p-3 rounded-md mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={user?.email || ''} disabled className="mt-1 flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium">Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-sm font-medium">University / School</label>
            <input value={university} onChange={e => setUniversity(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="MIT" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number (For SMS Reminders)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="+1 (555) 000-0000" />
          </div>
          <button type="submit" disabled={loadingProfile} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loadingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
          </button>
        </form>
      </div>

      <div className="pt-8 border-t border-border">
        <h2 className="text-xl font-bold mb-1">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-6">Ensure your account is using a secure password.</p>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium">New Password</label>
            <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loadingPassword} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loadingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Appearance</h2>
      <p className="text-sm text-muted-foreground mb-6">Customize how the application looks.</p>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium">Theme</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button 
              onClick={() => setTheme('light')} 
              className={`p-4 rounded-lg border-2 text-sm font-medium transition-colors flex flex-col items-center gap-2 ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-accent hover:bg-accent/5'}`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300"></div>
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')} 
              className={`p-4 rounded-lg border-2 text-sm font-medium transition-colors flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-accent hover:bg-accent/5'}`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700"></div>
              Dark
            </button>
            <button 
              onClick={() => setTheme('system')} 
              className={`p-4 rounded-lg border-2 text-sm font-medium transition-colors flex flex-col items-center gap-2 ${theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-accent hover:bg-accent/5'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-900 border border-slate-500"></div>
              System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSettings() {
  const { exams } = useExamStore();
  
  const handleExportCSV = () => {
    // Basic CSV Generation for Exams
    const headers = ['Exam Title,Subject Name,Date,Start Time,End Time,Exam Type,Priority'];
    const rows = exams.map(e => `"${e.examTitle}","${e.subjectName}","${e.date}","${e.startTime}","${e.endTime}","${e.examType}","${e.priority}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_exams_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Data Management</h2>
      <p className="text-sm text-muted-foreground mb-6">Export or manage your study data.</p>
      
      <div className="glass-panel p-5 border-border max-w-md flex flex-col gap-4">
        <div>
          <h3 className="font-semibold mb-1">Export Data</h3>
          <p className="text-sm text-muted-foreground">Download a CSV copy of your exam schedule.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity self-start">
          <Download size={16} /> Export as CSV
        </button>
      </div>
    </div>
  );
}
