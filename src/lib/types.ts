import { z } from 'zod';

export const ExamTypeSchema = z.enum([
  'Midterm',
  'End Semester',
  'Viva',
  'Practical',
  'Assignment',
  'Project',
  'Custom',
]);

export const PrioritySchema = z.enum(['High', 'Medium', 'Low']);

export const CommentSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  createdAt: z.string(),
});

export const ExamSchema = z.object({
  id: z.string(),
  subjectName: z.string().min(1, 'Subject name is required'),
  examTitle: z.string().min(1, 'Exam title is required'),
  courseName: z.string().optional(),
  university: z.string().optional(),
  semester: z.string().optional(),
  examType: ExamTypeSchema,
  date: z.string(), // ISO date string
  startTime: z.string(), // HH:mm
  endTime: z.string(), // HH:mm
  duration: z.number().optional(), // in minutes
  venue: z.string().optional(),
  building: z.string().optional(),
  roomNumber: z.string().optional(),
  hallNumber: z.string().optional(),
  seatNumber: z.string().optional(),
  rollNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  importantInstructions: z.string().optional(),
  priority: PrioritySchema.default('Medium'),
  notes: z.string().optional(),
  comments: z.array(CommentSchema).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Exam = z.infer<typeof ExamSchema>;
export type ExamType = z.infer<typeof ExamTypeSchema>;
export type Priority = z.infer<typeof PrioritySchema>;

// --- New Study Planner Schemas ---

export const StudyPlanSchema = z.object({
  id: z.string(),
  linkedExamId: z.string().optional(),
  name: z.string().min(1, 'Plan name is required'),
  category: z.string().optional(),
  description: z.string().optional(),
  targetDate: z.string().optional(), // ISO date string
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const NodeStatusSchema = z.enum(['Not Started', 'In Progress', 'Completed']);
export const NodeImportanceSchema = z.enum(['High Weightage', 'Important', 'Normal', 'Skip / Deprioritize']);

export const SyllabusNodeSchema = z.object({
  id: z.string(),
  planId: z.string(),
  parentId: z.string().nullable(), // null means it's a root (Subject). Otherwise it's a Unit or Topic.
  title: z.string().min(1, 'Title is required'),
  status: NodeStatusSchema.default('Not Started'),
  importance: NodeImportanceSchema.default('Normal'),
  notes: z.string().optional(),
  order: z.number().default(0), // for drag and drop sorting
});

export const ResourceTypeSchema = z.enum(['Link', 'Document']);

export const StudyResourceSchema = z.object({
  id: z.string(),
  planId: z.string(),
  topicId: z.string().optional(), // Optionally link a resource directly to a topic
  type: ResourceTypeSchema,
  title: z.string().min(1, 'Title is required'),
  urlOrPath: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type SyllabusNode = z.infer<typeof SyllabusNodeSchema>;
export type StudyResource = z.infer<typeof StudyResourceSchema>;
export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type NodeImportance = z.infer<typeof NodeImportanceSchema>;

export interface Reminder {
  id: string;
  userId: string;
  message: string;
  reminderType: 'Recurring' | 'One-off';
  interval: string;
  specificTime?: string;
  notifyEmail: boolean;
  notifyMobile: boolean;
  nextRunAt: string;
  createdAt: string;
}
