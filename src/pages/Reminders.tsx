import React, { useState } from 'react';
import { useReminderStore } from '../store/useReminderStore';
import { Bell, Loader2, Trash2 } from 'lucide-react';

export default function Reminders() {
  const { reminders, addReminder, deleteReminder, fetchReminders } = useReminderStore();
  const [message, setMessage] = useState('');
  const [reminderType, setReminderType] = useState<'Recurring' | 'One-off'>('Recurring');
  const [interval, setInterval] = useState('Daily');
  const [specificTime, setSpecificTime] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyMobile, setNotifyMobile] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await addReminder({
      message,
      reminderType,
      interval: reminderType === 'Recurring' ? interval : 'One-off',
      specificTime: reminderType === 'One-off' ? new Date(specificTime).toISOString() : undefined,
      notifyEmail,
      notifyMobile
    });
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Reminders</h1>
        <p className="text-muted-foreground mt-2">Set up automated nudges to stay on track.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4 glass-panel p-6 border-border">
            <div>
              <label className="text-sm font-medium mb-1 block">Reminder Message</label>
              <input required value={message} onChange={e => setMessage(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="e.g. Spend 30 mins reviewing DSA notes" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select value={reminderType} onChange={e => setReminderType(e.target.value as any)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="Recurring">Recurring Frequency</option>
                  <option value="One-off">Specific Date & Time</option>
                </select>
              </div>
              
              {reminderType === 'Recurring' ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">Frequency</label>
                  <select value={interval} onChange={e => setInterval(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block">Date & Time</label>
                  <input type="datetime-local" required value={specificTime} onChange={e => setSpecificTime(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium block">Delivery Method</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={notifyMobile} onChange={e => setNotifyMobile(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  SMS Text Message
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground italic pt-1">Note: SMS texts require a saved phone number in Settings.</p>
            </div>
            
            <div className="pt-4">
              <button type="submit" disabled={loading || (!notifyEmail && !notifyMobile)} className="flex items-center justify-center w-full gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />} Create Reminder
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-xl tracking-tight">Active Reminders ({reminders.length})</h3>
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="glass-panel p-8 text-center text-muted-foreground border-dashed">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p>No active reminders.</p>
                <p className="text-sm mt-1">Create one to stay on top of your studies.</p>
              </div>
            ) : (
              reminders.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-semibold">{r.message}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.reminderType === 'Recurring' ? r.interval : `Scheduled for ${new Date(r.specificTime || '').toLocaleString()}`} • via {[r.notifyEmail && 'Email', r.notifyMobile && 'SMS'].filter(Boolean).join(' & ')}
                    </p>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors" title="Delete reminder">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
