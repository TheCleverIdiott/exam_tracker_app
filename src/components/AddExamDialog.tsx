import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExamSchema } from '../lib/types';
import { useExamStore } from '../store/useExamStore';

export function AddExamDialog() {
  const [open, setOpen] = React.useState(false);
  const addExam = useExamStore((state) => state.addExam);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(ExamSchema.omit({ id: true, createdAt: true, updatedAt: true })),
    defaultValues: {
      priority: 'Medium',
      examType: 'Midterm',
    }
  });

  const onSubmit = (data: any) => {
    addExam(data);
    setOpen(false);
    reset();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
          Add Exam
        </button>
      </DialogPrimitive.Trigger>
      
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 glass-panel border border-border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl md:w-full overflow-y-auto max-h-[90vh]">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">Add New Exam</DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Fill in the details below to add a new exam to your schedule.
            </DialogPrimitive.Description>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject Name *</label>
                <input {...register('subjectName')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="e.g. Data Structures" />
                {errors.subjectName && <p className="text-xs text-destructive">{(errors.subjectName as any).message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Title *</label>
                <input {...register('examTitle')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="e.g. Midterm 1" />
                {errors.examTitle && <p className="text-xs text-destructive">{(errors.examTitle as any).message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <input type="date" {...register('date')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                {errors.date && <p className="text-xs text-destructive">{(errors.date as any).message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time *</label>
                  <input type="time" {...register('startTime')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time *</label>
                  <input type="time" {...register('endTime')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Type</label>
                <select {...register('examType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="Midterm">Midterm</option>
                  <option value="End Semester">End Semester</option>
                  <option value="Viva">Viva</option>
                  <option value="Practical">Practical</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select {...register('priority')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue / Building</label>
              <input {...register('venue')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="e.g. Main Hall" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <DialogPrimitive.Close asChild>
                <button type="button" className="px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition-colors">
                  Cancel
                </button>
              </DialogPrimitive.Close>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
                Save Exam
              </button>
            </div>
          </form>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
