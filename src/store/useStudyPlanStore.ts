import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { StudyPlan, SyllabusNode, StudyResource } from '../lib/types';

interface StudyPlanState {
  plans: StudyPlan[];
  nodes: SyllabusNode[];
  resources: StudyResource[];
  
  fetchData: () => Promise<void>;
  
  // Plan Operations
  addPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updatePlan: (id: string, plan: Partial<StudyPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  
  // Node Operations
  addNode: (node: Omit<SyllabusNode, 'id'>) => Promise<string | undefined>;
  updateNode: (id: string, node: Partial<SyllabusNode>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  
  // Resource Operations
  addResource: (resource: Omit<StudyResource, 'id' | 'createdAt'>) => Promise<string | undefined>;
  deleteResource: (id: string) => Promise<void>;
}

// Helpers
const mapPlanFromDB = (db: any): StudyPlan => ({
  id: db.id,
  linkedExamId: db.linked_exam_id,
  name: db.name,
  category: db.category,
  description: db.description,
  targetDate: db.target_date,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapNodeFromDB = (db: any): SyllabusNode => ({
  id: db.id,
  planId: db.plan_id,
  parentId: db.parent_id,
  title: db.title,
  status: db.status,
  importance: db.importance,
  notes: db.notes,
  order: db.order,
});

const mapResourceFromDB = (db: any): StudyResource => ({
  id: db.id,
  planId: db.plan_id,
  topicId: db.topic_id,
  type: db.type,
  title: db.title,
  urlOrPath: db.url_or_path,
  description: db.description,
  tags: db.tags || [],
  createdAt: db.created_at,
});

export const useStudyPlanStore = create<StudyPlanState>()((set, get) => ({
  plans: [],
  nodes: [],
  resources: [],
  
  fetchData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [plansRes, nodesRes, resourcesRes] = await Promise.all([
      supabase.from('study_plans').select('*'),
      supabase.from('syllabus_nodes').select('*'),
      supabase.from('resources').select('*')
    ]);

    if (!plansRes.error) set({ plans: plansRes.data.map(mapPlanFromDB) });
    if (!nodesRes.error) set({ nodes: nodesRes.data.map(mapNodeFromDB) });
    if (!resourcesRes.error) set({ resources: resourcesRes.data.map(mapResourceFromDB) });
  },
  
  addPlan: async (planData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      linked_exam_id: planData.linkedExamId,
      name: planData.name,
      category: planData.category,
      description: planData.description,
      target_date: planData.targetDate,
    };
    
    const { data, error } = await supabase.from('study_plans').insert(payload).select().single();
    
    if (error) {
      alert('Error creating study plan: ' + error.message);
      console.error(error);
      return;
    }

    if (data) {
      const newPlan = mapPlanFromDB(data);
      set((state) => ({ plans: [...state.plans, newPlan] }));
      return newPlan.id;
    }
  },
  
  updatePlan: async (id, planData) => {
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan.id === id ? { ...plan, ...planData, updatedAt: new Date().toISOString() } : plan
      ),
    }));

    const payload: any = {};
    if (planData.name) payload.name = planData.name;
    if (planData.category) payload.category = planData.category;
    if (planData.description) payload.description = planData.description;
    if (planData.targetDate) payload.target_date = planData.targetDate;

    await supabase.from('study_plans').update(payload).eq('id', id);
  },
  
  deletePlan: async (id) => {
    set((state) => ({
      plans: state.plans.filter((plan) => plan.id !== id),
      nodes: state.nodes.filter((node) => node.planId !== id),
      resources: state.resources.filter((res) => res.planId !== id),
    }));
    await supabase.from('study_plans').delete().eq('id', id);
  },
  
  addNode: async (nodeData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      plan_id: nodeData.planId,
      parent_id: nodeData.parentId,
      title: nodeData.title,
      status: nodeData.status,
      importance: nodeData.importance,
      notes: nodeData.notes,
      order: nodeData.order,
    };

    const { data, error } = await supabase.from('syllabus_nodes').insert(payload).select().single();
    if (!error && data) {
      const newNode = mapNodeFromDB(data);
      set((state) => ({ nodes: [...state.nodes, newNode] }));
      return newNode.id;
    }
  },
  
  updateNode: async (id, nodeData) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...nodeData } : node
      ),
    }));

    const payload: any = {};
    if (nodeData.title) payload.title = nodeData.title;
    if (nodeData.status) payload.status = nodeData.status;
    if (nodeData.importance) payload.importance = nodeData.importance;
    if (nodeData.notes) payload.notes = nodeData.notes;

    await supabase.from('syllabus_nodes').update(payload).eq('id', id);
  },
  
  deleteNode: async (id) => {
    const getDescendantIds = (parentId: string, currentNodes: SyllabusNode[]): string[] => {
      const children = currentNodes.filter(n => n.parentId === parentId);
      return children.reduce((acc, child) => {
        return [...acc, child.id, ...getDescendantIds(child.id, currentNodes)];
      }, [] as string[]);
    };

    const currentNodes = get().nodes;
    const idsToDelete = new Set([id, ...getDescendantIds(id, currentNodes)]);

    set((state) => ({
      nodes: state.nodes.filter((node) => !idsToDelete.has(node.id)),
    }));

    // Relying on ON DELETE CASCADE from DB, so we only need to delete the parent
    await supabase.from('syllabus_nodes').delete().eq('id', id);
  },
  
  addResource: async (resData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      plan_id: resData.planId,
      topic_id: resData.topicId,
      type: resData.type,
      title: resData.title,
      url_or_path: resData.urlOrPath,
      description: resData.description,
      tags: resData.tags,
    };

    const { data, error } = await supabase.from('resources').insert(payload).select().single();
    if (!error && data) {
      const newRes = mapResourceFromDB(data);
      set((state) => ({ resources: [...state.resources, newRes] }));
      return newRes.id;
    }
  },
  
  deleteResource: async (id) => {
    set((state) => ({ resources: state.resources.filter((res) => res.id !== id) }));
    await supabase.from('resources').delete().eq('id', id);
  },
}));
