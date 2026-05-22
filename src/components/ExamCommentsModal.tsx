import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, MessageSquare, Trash2 } from 'lucide-react';
import { useExamStore } from '../store/useExamStore';
import { format, parseISO } from 'date-fns';

interface ExamCommentsModalProps {
  examId: string;
  trigger: React.ReactNode;
}

export function ExamCommentsModal({ examId, trigger }: ExamCommentsModalProps) {
  const [open, setOpen] = React.useState(false);
  const { exams, updateExam } = useExamStore();
  const [newComment, setNewComment] = React.useState('');
  
  const exam = exams.find(e => e.id === examId);
  if (!exam) return null;

  const comments = exam.comments || [];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: crypto.randomUUID(),
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    updateExam(exam.id, {
      ...exam,
      comments: [...comments, comment]
    });
    
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Delete this comment?')) {
      updateExam(exam.id, {
        ...exam,
        comments: comments.filter((c: any) => c.id !== commentId)
      });
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        {trigger}
      </DialogPrimitive.Trigger>
      
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] flex flex-col w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 glass-panel border border-border p-6 shadow-lg sm:rounded-xl max-h-[80vh]">
          
          <div className="flex flex-col space-y-1.5 mb-2">
            <DialogPrimitive.Title className="text-xl font-bold leading-none tracking-tight flex items-center gap-2">
              <MessageSquare size={20} /> Comments: {exam.subjectName}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Add personal notes, thoughts, or reminders specifically for this exam.
            </DialogPrimitive.Description>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[200px]">
            {comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                No comments yet. Add your first note below!
              </div>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="bg-secondary/50 p-3 rounded-lg relative group">
                  <p className="text-sm text-foreground whitespace-pre-wrap pr-6">{comment.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                    {format(parseISO(comment.createdAt), 'MMM do, yyyy • h:mm a')}
                  </p>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive rounded-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="pt-4 border-t border-border mt-auto">
            <div className="flex gap-2">
              <input 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Type your comment..."
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Post
              </button>
            </div>
          </form>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
