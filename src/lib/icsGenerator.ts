import type { Exam } from './types';

export const generateIcsContent = (exams: Exam[]): string => {
  const formatIcsDate = (dateStr: string, timeStr: string) => {
    // Convert YYYY-MM-DD and HH:MM to YYYYMMDDTHHMM00
    const [year, month, day] = dateStr.split('-');
    const [hour, minute] = timeStr.split(':');
    return `${year}${month}${day}T${hour}${minute}00`;
  };

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Exam Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  exams.forEach((exam) => {
    const dtStart = formatIcsDate(exam.date, exam.startTime);
    const dtEnd = formatIcsDate(exam.date, exam.endTime);
    
    // Fallback ID
    const uid = exam.id || `${dtStart}-${exam.subjectName.replace(/\s+/g, '')}`;

    icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${exam.subjectName} - ${exam.examTitle}
DESCRIPTION:Type: ${exam.examType}\\nPriority: ${exam.priority}\\nVenue: ${exam.venue || 'TBA'}
LOCATION:${exam.venue || ''}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT30M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
`;
  });

  icsContent += `END:VCALENDAR`;
  return icsContent;
};

export const downloadIcsFile = (exams: Exam[], filename: string = 'exam_schedule.ics') => {
  const content = generateIcsContent(exams);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
