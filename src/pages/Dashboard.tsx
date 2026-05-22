import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { useStudyPlanStore } from '../store/useStudyPlanStore';
import { ExamFormDialog } from '../components/ExamFormDialog';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Clock, MapPin, AlertCircle, Edit2, Trash2, BookOpen, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExamCommentsModal } from '../components/ExamCommentsModal';

export default function Dashboard() {
  const { exams, deleteExam } = useExamStore();
  const { plans, nodes, addPlan } = useStudyPlanStore();
  const [filter, setFilter] = useState<'All' | 'Next 7 Days' | 'Next 30 Days'>('All');
  const navigate = useNavigate();

  const now = new Date();
  
  // Filter and sort exams
  const upcomingExams = exams
    .filter((exam) => {
      const examDate = parseISO(`${exam.date}T${exam.startTime}`);
      if (isBefore(examDate, now)) return false; // skip past exams
      
      if (filter === 'Next 7 Days') {
        return isBefore(examDate, addDays(now, 7));
      }
      if (filter === 'Next 30 Days') {
        return isBefore(examDate, addDays(now, 30));
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = parseISO(`${a.date}T${a.startTime}`);
      const dateB = parseISO(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

  const handleCreateOrGoToPlan = async (exam: any) => {
    const existingPlan = plans.find(p => p.linkedExamId === exam.id);
    if (existingPlan) {
      navigate(`/planner?planId=${existingPlan.id}`);
    } else {
      const newPlanId = await addPlan({
        name: exam.examTitle,
        linkedExamId: exam.id,
        targetDate: exam.date,
        category: exam.subjectName
      });
      if (newPlanId) {
        navigate(`/planner?planId=${newPlanId}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your upcoming exams.</p>
        </div>
        <ExamFormDialog 
          trigger={
            <button className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
              Add Exam
            </button>
          } 
        />
      </div>
      
      {/* Global Countdown */}
      {nextExam ? (
        <div className="glass-panel p-8 text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
          <p className="text-sm font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-2">Next Exam</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">{nextExam.subjectName}</h2>
          <p className="text-muted-foreground mb-6">{nextExam.examTitle} • {format(parseISO(nextExam.date), 'MMMM do, yyyy')}</p>
          <div className="flex justify-center gap-4 md:gap-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-bold font-mono text-foreground">03</span>
              <span className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-wider">Days</span>
            </div>
            <span className="text-4xl md:text-6xl font-bold text-muted-foreground/20">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-bold font-mono text-foreground">14</span>
              <span className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-wider">Hours</span>
            </div>
            <span className="text-4xl md:text-6xl font-bold text-muted-foreground/20">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-bold font-mono text-foreground">21</span>
              <span className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-wider">Mins</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 text-center border-dashed">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Upcoming Exams</h2>
          <p className="text-muted-foreground">You have a clear schedule. Add an exam to see the countdown.</p>
        </div>
      )}

      {/* Upcoming Exams List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold tracking-tight">Upcoming Schedule</h3>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="All">All Upcoming</option>
            <option value="Next 7 Days">Next 7 Days</option>
            <option value="Next 30 Days">Next 30 Days</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingExams.map((exam) => {
            const linkedPlan = plans.find(p => p.linkedExamId === exam.id);
            const planNodes = linkedPlan ? nodes.filter(n => n.planId === linkedPlan.id) : [];
            const leafNodes = planNodes.filter(n => !planNodes.some(child => child.parentId === n.id));
            const completedLeaves = leafNodes.filter(n => n.status === 'Completed').length;
            const progress = leafNodes.length > 0 ? Math.round((completedLeaves / leafNodes.length) * 100) : 0;
            const pendingTasks = leafNodes.length - completedLeaves;

            return (
              <div key={exam.id} className="glass-panel p-5 hover:border-accent/50 transition-colors flex flex-col group relative">
                {exam.priority === 'High' && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-r-[30px] border-t-destructive/80 border-r-transparent rounded-tr-lg"></div>
                )}
                
                <div className="flex justify-between items-start mb-3 pr-6">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {exam.examType}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                    exam.priority === 'High' ? 'text-destructive bg-destructive/10' : 
                    exam.priority === 'Medium' ? 'text-orange-500 bg-orange-500/10' : 
                    'text-green-500 bg-green-500/10'
                  }`}>
                    {exam.priority}
                  </span>
                </div>

                {/* Actions (Edit / Delete) */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md border border-border">
                  <ExamFormDialog 
                    examToEdit={exam}
                    trigger={
                      <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-sm transition-colors" title="Edit Exam">
                        <Edit2 size={14} />
                      </button>
                    }
                  />
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this exam?')) {
                        deleteExam(exam.id);
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-sm transition-colors" title="Delete Exam"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h4 className="text-lg font-bold mb-1 line-clamp-1">{exam.subjectName}</h4>
                <p className="text-sm font-medium text-muted-foreground mb-4">{exam.examTitle}</p>
                
                <div className="mt-auto space-y-2 text-sm mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(parseISO(exam.date), 'MMM do, yyyy')}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {exam.startTime} - {exam.endTime}
                  </div>
                  {exam.venue && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="truncate">{exam.venue}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border mt-2 space-y-3">
                  {linkedPlan ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-green-600 dark:text-green-400">Study Plan Linked ✅</span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground text-right uppercase tracking-wider font-semibold">
                        {pendingTasks} Tasks Pending
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-muted-foreground text-center py-2 border border-dashed border-border/50 rounded-md">
                      No study plan linked
                    </div>
                  )}
                  
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => handleCreateOrGoToPlan(exam)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-lg transition-colors text-sm"
                    >
                      <BookOpen size={16} />
                      {linkedPlan ? 'Go To Study Plan' : 'Create Study Plan'}
                    </button>
                    <ExamCommentsModal 
                      examId={exam.id}
                      trigger={
                        <button className="flex items-center justify-center px-4 bg-secondary text-secondary-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-lg transition-colors relative" title="Comments">
                          <MessageSquare size={18} />
                          {exam.comments && exam.comments.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                              {exam.comments.length}
                            </span>
                          )}
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {upcomingExams.length === 0 && (
            <div className="col-span-full py-8 text-center glass-panel border-dashed">
              <p className="text-muted-foreground">No exams found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Exams</h3>
          <p className="text-3xl font-bold mt-2">{exams.length}</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{upcomingExams.length}</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-muted-foreground">High Priority</h3>
          <p className="text-3xl font-bold mt-2 text-destructive">
            {exams.filter(e => e.priority === 'High' && isAfter(parseISO(`${e.date}T${e.startTime}`), now)).length}
          </p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
            {exams.filter(e => isBefore(parseISO(`${e.date}T${e.startTime}`), addDays(now, 7)) && isAfter(parseISO(`${e.date}T${e.startTime}`), now)).length}
          </p>
        </div>
      </div>
    </div>
  );
}
