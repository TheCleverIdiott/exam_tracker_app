import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useExamStore } from '../store/useExamStore';
import { useStudyPlanStore } from '../store/useStudyPlanStore';
import { useNavigate } from 'react-router-dom';

interface StudyPlanModalProps {
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyPlanModal({ trigger, open, onOpenChange }: StudyPlanModalProps) {
  const { exams } = useExamStore();
  const { plans, addPlan } = useStudyPlanStore();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<'select' | 'existing' | 'custom'>('select');

  const { register: registerCustom, handleSubmit: handleCustomSubmit, reset: resetCustom } = useForm();
  const [selectedExamId, setSelectedExamId] = React.useState('');

  const unlinkedExams = exams.filter(e => !plans.some(p => p.linkedExamId === e.id));

  React.useEffect(() => {
    if (open) {
      setMode('select');
      setSelectedExamId('');
      resetCustom({ name: '', category: '', targetDate: '', description: '' });
    }
  }, [open, resetCustom]);

  const onExamSelectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return;
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) return;

    const newPlanId = await addPlan({
      name: exam.examTitle,
      linkedExamId: exam.id,
      targetDate: exam.date,
      category: exam.subjectName
    });
    
    if (newPlanId) {
      onOpenChange(false);
      navigate(`/planner?planId=${newPlanId}`);
    }
  };

  const onCustomSubmit = async (data: any) => {
    const newPlanId = await addPlan({
      name: data.name,
      category: data.category,
      targetDate: data.targetDate,
      description: data.description
    });
    
    if (newPlanId) {
      onOpenChange(false);
      navigate(`/planner?planId=${newPlanId}`);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        {trigger}
      </DialogPrimitive.Trigger>
      
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 glass-panel border border-border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
            <DialogPrimitive.Title className="text-xl font-bold leading-none tracking-tight">
              Create Study Plan
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Choose how you want to create your new study plan.
            </DialogPrimitive.Description>
          </div>

          {mode === 'select' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <button 
                onClick={() => setMode('existing')}
                className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="font-semibold mb-1">From Existing Exam</h3>
                <p className="text-xs text-muted-foreground">Link directly to an exam in your dashboard</p>
              </button>
              
              <button 
                onClick={() => setMode('custom')}
                className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="font-semibold mb-1">Custom Plan</h3>
                <p className="text-xs text-muted-foreground">Create a blank plan for anything else</p>
              </button>
            </div>
          )}

          {mode === 'existing' && (
            <form onSubmit={onExamSelectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Exam</label>
                <select 
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="" disabled>-- Select an unlinked exam --</option>
                  {unlinkedExams.map(e => (
                    <option key={e.id} value={e.id}>{e.examTitle} ({e.subjectName})</option>
                  ))}
                </select>
                {unlinkedExams.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">All your exams already have linked study plans!</p>
                )}
              </div>
              
              <div className="flex justify-between pt-4 mt-6">
                <button type="button" onClick={() => setMode('select')} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  ← Back
                </button>
                <button type="submit" disabled={!selectedExamId} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                  Create & Link
                </button>
              </div>
            </form>
          )}

          {mode === 'custom' && (
            <form onSubmit={handleCustomSubmit(onCustomSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Study Plan Name *</label>
                <input {...registerCustom('name', { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Machine Learning Prep" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <input {...registerCustom('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Interview Prep" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Date</label>
                  <input type="date" {...registerCustom('targetDate')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea {...registerCustom('description')} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Brief details about this plan..." />
              </div>
              
              <div className="flex justify-between pt-4 mt-6">
                <button type="button" onClick={() => setMode('select')} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  ← Back
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Create Plan
                </button>
              </div>
            </form>
          )}

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
