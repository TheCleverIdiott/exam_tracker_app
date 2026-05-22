import { create } from 'zustand';

export type PomodoroMode = 'Focus' | 'Short Break' | 'Long Break';

interface PomodoroState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  
  mode: PomodoroMode;
  setMode: (mode: PomodoroMode) => void;
  
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  
  linkedTaskId: string | null;
  setLinkedTaskId: (taskId: string | null) => void;

  resetTimer: () => void;
}

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  'Focus': 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  
  mode: 'Focus',
  setMode: (mode) => set({ mode, timeLeft: MODE_DURATIONS[mode], isRunning: false }),
  
  timeLeft: MODE_DURATIONS['Focus'],
  setTimeLeft: (time) => set((state) => ({ 
    timeLeft: typeof time === 'function' ? time(state.timeLeft) : time 
  })),
  
  isRunning: false,
  setIsRunning: (isRunning) => set({ isRunning }),
  
  linkedTaskId: null,
  setLinkedTaskId: (linkedTaskId) => set({ linkedTaskId }),

  resetTimer: () => {
    const { mode } = get();
    set({ timeLeft: MODE_DURATIONS[mode], isRunning: false });
  }
}));
