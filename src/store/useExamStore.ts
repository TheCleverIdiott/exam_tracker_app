import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Exam } from '../lib/types';

interface ExamState {
  exams: Exam[];
  fetchExams: () => Promise<void>;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  duplicateExam: (id: string) => Promise<void>;
}

// Helpers
const mapFromDB = (db: any): Exam => ({
  id: db.id,
  subjectName: db.subject_name,
  examTitle: db.exam_title,
  courseName: db.course_name,
  university: db.university,
  semester: db.semester,
  examType: db.exam_type,
  date: db.date,
  startTime: db.start_time,
  endTime: db.end_time,
  duration: db.duration,
  venue: db.venue,
  building: db.building,
  roomNumber: db.room_number,
  hallNumber: db.hall_number,
  seatNumber: db.seat_number,
  rollNumber: db.roll_number,
  registrationNumber: db.registration_number,
  importantInstructions: db.important_instructions,
  priority: db.priority,
  notes: db.notes,
  comments: db.comments || [],
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapToDB = (exam: any, userId: string) => ({
  user_id: userId,
  subject_name: exam.subjectName,
  exam_title: exam.examTitle,
  course_name: exam.courseName,
  university: exam.university,
  semester: exam.semester,
  exam_type: exam.examType,
  date: exam.date,
  start_time: exam.startTime,
  end_time: exam.endTime,
  duration: exam.duration,
  venue: exam.venue,
  building: exam.building,
  room_number: exam.roomNumber,
  hall_number: exam.hallNumber,
  seat_number: exam.seatNumber,
  roll_number: exam.rollNumber,
  registration_number: exam.registrationNumber,
  important_instructions: exam.importantInstructions,
  priority: exam.priority,
  notes: exam.notes,
  comments: exam.comments || [],
});

export const useExamStore = create<ExamState>()((set, get) => ({
  exams: [],
  
  fetchExams: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('exams').select('*').order('date', { ascending: true });
    if (!error && data) {
      set({ exams: data.map(mapFromDB) });
    }
  },

  addExam: async (examData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbPayload = mapToDB(examData, user.id);
    const { data, error } = await supabase.from('exams').insert(dbPayload).select().single();
    
    if (error) {
      alert('Error saving exam: ' + error.message);
      console.error(error);
      return;
    }

    if (data) {
      const newExam = mapFromDB(data);
      set((state) => ({ exams: [...state.exams, newExam] }));
      return newExam.id;
    }
  },

  updateExam: async (id, examData) => {
    // Optimistic update
    set((state) => ({
      exams: state.exams.map((exam) =>
        exam.id === id ? { ...exam, ...examData, updatedAt: new Date().toISOString() } : exam
      ),
    }));

    // Network call
    const payload: any = {};
    if (examData.subjectName) payload.subject_name = examData.subjectName;
    if (examData.examTitle) payload.exam_title = examData.examTitle;
    if (examData.examType) payload.exam_type = examData.examType;
    if (examData.date) payload.date = examData.date;
    if (examData.startTime) payload.start_time = examData.startTime;
    if (examData.endTime) payload.end_time = examData.endTime;
    if (examData.priority) payload.priority = examData.priority;
    if (examData.comments) payload.comments = examData.comments;
    // ...other fields if needed for update, but typically we send full or explicit partial
    const mapped = mapToDB({ ...get().exams.find(e => e.id === id), ...examData }, (await supabase.auth.getUser()).data.user?.id!);

    await supabase.from('exams').update(mapped).eq('id', id);
  },

  deleteExam: async (id) => {
    set((state) => ({ exams: state.exams.filter((exam) => exam.id !== id) }));
    await supabase.from('exams').delete().eq('id', id);
  },

  duplicateExam: async (id) => {
    const examToDuplicate = get().exams.find((e) => e.id === id);
    if (!examToDuplicate) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = mapToDB({ ...examToDuplicate, examTitle: `${examToDuplicate.examTitle} (Copy)` }, user.id);
    const { data, error } = await supabase.from('exams').insert(payload).select().single();

    if (!error && data) {
      set((state) => ({ exams: [...state.exams, mapFromDB(data)] }));
    }
  },
}));
