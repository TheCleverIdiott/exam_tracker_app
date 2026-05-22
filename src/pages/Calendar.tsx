import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { ExamFormDialog } from '../components/ExamFormDialog';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Edit2, Trash2 } from 'lucide-react';
import type { Exam } from '../lib/types';

export default function Calendar() {
  const { exams, deleteExam } = useExamStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Calendar Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate Calendar Grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage your exam schedule.</p>
        </div>
        <ExamFormDialog 
          trigger={
            <button className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
              Add Exam
            </button>
          } 
        />
      </div>
      
      <div className="glass-panel flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-[700px]">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{format(currentDate, dateFormat)}</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Today
            </button>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button 
                onClick={prevMonth}
                className="p-1.5 hover:bg-secondary transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-px h-5 bg-border"></div>
              <button 
                onClick={nextMonth}
                className="p-1.5 hover:bg-secondary transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50">
          {days.map((day) => {
            const dayExams = exams.filter(exam => isSameDay(parseISO(exam.date), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={day.toString()} 
                className={`min-h-[100px] p-2 flex flex-col bg-background transition-colors ${
                  !isCurrentMonth ? 'opacity-40 bg-muted/30' : ''
                } ${isToday(day) ? 'bg-accent/5' : 'hover:bg-secondary/50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday(day) ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayExams.length > 0 && (
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm">
                      {dayExams.length}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {dayExams.map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam)}
                      className={`w-full text-left text-xs p-1.5 rounded truncate transition-opacity hover:opacity-80 border ${
                        exam.priority === 'High' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                        exam.priority === 'Medium' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400' :
                        'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                      }`}
                    >
                      <span className="font-semibold block truncate">{exam.subjectName}</span>
                      <span className="opacity-80 truncate block">{exam.startTime}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Exam Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedExam(null)}>
          <div 
            className="glass-panel w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-r-transparent rounded-tr-lg" style={{
              borderTopColor: selectedExam.priority === 'High' ? 'hsl(var(--destructive))' : selectedExam.priority === 'Medium' ? '#f97316' : '#22c55e'
            }}></div>
            
            <h3 className="text-2xl font-bold mb-1 pr-8">{selectedExam.subjectName}</h3>
            <p className="text-muted-foreground mb-4">{selectedExam.examTitle}</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">{format(parseISO(selectedExam.date), 'EEEE, MMMM do, yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-muted-foreground">{selectedExam.startTime} - {selectedExam.endTime}</p>
                </div>
              </div>

              {selectedExam.venue && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-muted-foreground">{selectedExam.venue}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="flex gap-2">
                <ExamFormDialog 
                  examToEdit={selectedExam}
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors">
                      <Edit2 size={14} />
                      Edit
                    </button>
                  }
                />
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this exam?')) {
                      deleteExam(selectedExam.id);
                      setSelectedExam(null);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border text-destructive rounded-md hover:bg-secondary transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
              <button 
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 border border-border font-semibold rounded-lg hover:bg-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
