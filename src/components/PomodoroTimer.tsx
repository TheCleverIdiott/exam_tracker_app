import { useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { Play, Pause, SkipForward, Minus } from 'lucide-react';
import { useStudyPlanStore } from '../store/useStudyPlanStore';

export function PomodoroTimer() {
  const { 
    isOpen, setIsOpen, 
    mode, setMode, 
    timeLeft, setTimeLeft, 
    isRunning, setIsRunning,
    resetTimer,
    linkedTaskId
  } = usePomodoroStore();
  
  const { nodes } = useStudyPlanStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play a sound when timer finishes
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        // ignore
      }
      
      // Auto-switch mode
      if (mode === 'Focus') {
        setMode('Short Break');
      } else {
        setMode('Focus');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, setMode, setIsRunning, setTimeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const linkedTask = linkedTaskId ? nodes.find(n => n.id === linkedTaskId) : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 glass-panel shadow-2xl border-border bg-background/80 backdrop-blur-xl overflow-hidden rounded-2xl transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className={`h-1.5 w-full ${mode === 'Focus' ? 'bg-primary' : 'bg-green-500'}`} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
            <button 
              onClick={() => setMode('Focus')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${mode === 'Focus' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Focus
            </button>
            <button 
              onClick={() => setMode('Short Break')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${mode === 'Short Break' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Break
            </button>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:bg-secondary rounded-full">
            <Minus size={16} />
          </button>
        </div>

        {/* Task Info */}
        {linkedTask && (
          <div className="mb-4 text-center px-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Focusing On</p>
            <p className="text-sm font-semibold truncate text-foreground">{linkedTask.title}</p>
          </div>
        )}

        {/* Timer Display */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="text-6xl font-extrabold font-mono tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              isRunning ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'
            }`}
          >
            {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={() => {
              resetTimer();
              if (mode === 'Focus') setMode('Short Break');
              else setMode('Focus');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Skip to next phase"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
