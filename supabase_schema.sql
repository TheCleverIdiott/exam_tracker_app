-- Create Exams Table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  subject_name TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  course_name TEXT,
  university TEXT,
  semester TEXT,
  exam_type TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER,
  venue TEXT,
  building TEXT,
  room_number TEXT,
  hall_number TEXT,
  seat_number TEXT,
  roll_number TEXT,
  registration_number TEXT,
  important_instructions TEXT,
  priority TEXT DEFAULT 'Medium',
  notes TEXT,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Study Plans Table
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  linked_exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  target_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Syllabus Nodes Table
CREATE TABLE syllabus_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES syllabus_nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  importance TEXT DEFAULT 'Normal',
  notes TEXT,
  "order" INTEGER DEFAULT 0
);

-- Create Resources Table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES syllabus_nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  url_or_path TEXT NOT NULL,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create Policies so users can only see their own data
CREATE POLICY "Users can manage their own exams" ON exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own study plans" ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own syllabus nodes" ON syllabus_nodes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own resources" ON resources FOR ALL USING (auth.uid() = user_id);

-- Set up storage bucket (if you haven't already created one named 'documents' in the dashboard)
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) ON CONFLICT DO NOTHING;
create policy "Anyone can read documents" on storage.objects for select using ( bucket_id = 'documents' );
create policy "Authenticated users can upload documents" on storage.objects for insert with check ( bucket_id = 'documents' and auth.role() = 'authenticated' );
create policy "Users can update their own documents" on storage.objects for update with check ( bucket_id = 'documents' and auth.uid() = owner );
create policy "Users can delete their own documents" on storage.objects for delete using ( bucket_id = 'documents' and auth.uid() = owner );

-- Create Reminders Table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  interval TEXT NOT NULL, -- e.g. 'Daily', 'Weekly'
  notify_email BOOLEAN DEFAULT false,
  notify_mobile BOOLEAN DEFAULT false,
  next_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
