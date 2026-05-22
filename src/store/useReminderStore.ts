import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Reminder } from '../lib/types';

interface ReminderState {
  reminders: Reminder[];
  fetchReminders: () => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'nextRunAt'>) => Promise<string | undefined>;
  deleteReminder: (id: string) => Promise<void>;
}

const mapFromDB = (db: any): Reminder => ({
  id: db.id,
  userId: db.user_id,
  message: db.message,
  reminderType: db.reminder_type || 'Recurring',
  interval: db.interval,
  specificTime: db.specific_time,
  notifyEmail: db.notify_email,
  notifyMobile: db.notify_mobile,
  nextRunAt: db.next_run_at,
  createdAt: db.created_at,
});

export const useReminderStore = create<ReminderState>()((set) => ({
  reminders: [],
  
  fetchReminders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      set({ reminders: data.map(mapFromDB) });
    }
  },

  addReminder: async (reminderData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      message: reminderData.message,
      reminder_type: reminderData.reminderType,
      interval: reminderData.interval,
      specific_time: reminderData.specificTime,
      notify_email: reminderData.notifyEmail,
      notify_mobile: reminderData.notifyMobile,
    };

    const { data, error } = await supabase.from('reminders').insert(payload).select().single();
    
    if (error) {
      alert('Error creating reminder: ' + error.message);
      console.error(error);
      return;
    }

    if (data) {
      const newReminder = mapFromDB(data);
      set((state) => ({ reminders: [newReminder, ...state.reminders] }));
      return newReminder.id;
    }
  },

  deleteReminder: async (id) => {
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    await supabase.from('reminders').delete().eq('id', id);
  },
}));
