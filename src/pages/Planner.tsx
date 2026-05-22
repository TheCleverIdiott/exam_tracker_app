import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useStudyPlanStore } from '../store/useStudyPlanStore';
import { StudyPlanModal } from '../components/StudyPlanModal';
import { 
  Plus, ChevronLeft, Calendar, FileText, CheckCircle2, 
  Link as LinkIcon, BookOpen, Trash2, Edit2, Circle, Upload
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Planner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('planId');

  const { plans, nodes, deletePlan } = useStudyPlanStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const selectedPlan = plans.find(p => p.id === planId);

  if (!planId || !selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Plans</h1>
            <p className="text-muted-foreground mt-1">Manage your centralized preparation hubs.</p>
          </div>
          <StudyPlanModal 
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                <Plus size={18} />
                Create Study Plan
              </button>
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => {
            const planNodes = nodes.filter(n => n.planId === plan.id);
            const leafNodes = planNodes.filter(n => !planNodes.some(child => child.parentId === n.id));
            const completedLeaves = leafNodes.filter(n => n.status === 'Completed').length;
            const progress = leafNodes.length > 0 ? Math.round((completedLeaves / leafNodes.length) * 100) : 0;

            return (
              <div key={plan.id} className="glass-panel p-5 hover:border-accent/50 transition-colors flex flex-col group relative cursor-pointer" onClick={() => navigate(`/planner?planId=${plan.id}`)}>
                {plan.linkedExamId && (
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                    Linked to Exam
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1 pr-16 truncate">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.category || 'General'}</p>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  {plan.targetDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Calendar size={12} /> Target: {format(parseISO(plan.targetDate), 'MMM do, yyyy')}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this entire study plan and all its contents?')) {
                        deletePlan(plan.id);
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-sm transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {plans.length === 0 && (
            <div className="col-span-full py-12 text-center glass-panel border-dashed">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Study Plans Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first study plan to start organizing your preparation.</p>
              <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg">
                Create Study Plan
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <PlanDetailView plan={selectedPlan} />;
}

function PlanDetailView({ plan }: { plan: any }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'syllabus' | 'resources'>('syllabus');
  const { nodes, resources, addNode, deleteNode, updateNode, addResource, deleteResource } = useStudyPlanStore();

  const planNodes = nodes.filter(n => n.planId === plan.id);
  const leafNodes = planNodes.filter(n => !planNodes.some(child => child.parentId === n.id));
  const completedLeaves = leafNodes.filter(n => n.status === 'Completed').length;
  const progress = leafNodes.length > 0 ? Math.round((completedLeaves / leafNodes.length) * 100) : 0;
  
  const planResources = resources.filter(r => r.planId === plan.id);

  // Modals state
  const [nodeModalOpen, setNodeModalOpen] = React.useState(false);
  const [nodeParentId, setNodeParentId] = React.useState<string | null>(null);
  const [nodeTitle, setNodeTitle] = React.useState('');

  const [resourceModalOpen, setResourceModalOpen] = React.useState(false);
  const [resourceTopicId, setResourceTopicId] = React.useState<string | null>(null);
  const [resourceType, setResourceType] = React.useState<'Link' | 'Document'>('Link');
  const [resourceTitle, setResourceTitle] = React.useState('');
  const [resourceUrl, setResourceUrl] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeTitle.trim()) {
      const id = await addNode({ planId: plan.id, parentId: nodeParentId, title: nodeTitle, status: 'Not Started', importance: 'Normal', order: 0 });
      if (id) {
        setNodeModalOpen(false);
        setNodeTitle('');
      }
    }
  };

  const handleUpdateNodeStatus = (nodeId: string, newStatus: any) => {
    const getDescendants = (id: string): string[] => {
      const children = nodes.filter(n => n.planId === plan.id && n.parentId === id);
      return children.reduce((acc, child) => [...acc, child.id, ...getDescendants(child.id)], [] as string[]);
    };
    
    const idsToUpdate = [nodeId, ...getDescendants(nodeId)];
    idsToUpdate.forEach(id => updateNode(id, { status: newStatus }));
  };

  const handleAddResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;

    let finalUrl = resourceUrl;

    if (resourceType === 'Document' && fileInputRef.current?.files?.[0]) {
      setUploading(true);
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user?.id || 'public'}/${fileName}`;

      const { error } = await supabase.storage.from('documents').upload(filePath, file);
      
      if (error) {
        alert('Error uploading file: ' + error.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      finalUrl = publicUrl;
      setUploading(false);
    } else if (resourceType === 'Document') {
      alert('Please select a file.');
      return;
    }

    await addResource({ 
      planId: plan.id, 
      topicId: resourceTopicId || undefined,
      title: resourceTitle, 
      urlOrPath: finalUrl, 
      type: resourceType, 
      tags: [] 
    });
    
    setResourceModalOpen(false);
    setResourceTitle('');
    setResourceUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="glass-panel p-6 border-accent/20">
        <button onClick={() => navigate('/planner')} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to Study Plans
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
              {plan.linkedExamId && <span className="bg-primary/10 text-primary text-xs font-bold uppercase px-2 py-1 rounded-md">Exam Linked</span>}
            </div>
            <p className="text-muted-foreground">{plan.description || plan.category || 'Organize your syllabus and resources'}</p>
          </div>
          
          <div className="w-full md:w-64 space-y-2 bg-background/50 p-4 rounded-lg border border-border">
            <div className="flex justify-between text-sm font-bold">
              <span>Overall Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('syllabus')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'syllabus' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Syllabus & Topics
        </button>
        <button 
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'resources' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Resources ({planResources.length})
        </button>
      </div>

      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Syllabus Structure</h2>
            <button 
              onClick={() => { setNodeParentId(null); setNodeModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground font-semibold rounded-md text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
          
          <div className="glass-panel p-4">
            {planNodes.filter(n => n.parentId === null).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                Your syllabus is empty. Start by adding a Subject or Unit.
              </div>
            ) : (
              <div className="space-y-2">
                {planNodes.filter(n => n.parentId === null).map(subject => (
                  <SyllabusNodeRow 
                    key={subject.id} 
                    node={subject} 
                    allNodes={planNodes} 
                    allResources={planResources}
                    level={0} 
                    onAddChild={(parentId: string) => { setNodeParentId(parentId); setNodeModalOpen(true); }}
                    onAddResource={(topicId: string) => { setResourceTopicId(topicId); setResourceType('Link'); setResourceModalOpen(true); }}
                    onUpdate={updateNode} 
                    onUpdateStatus={handleUpdateNodeStatus}
                    onDelete={deleteNode} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Study Resources</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => { setResourceTopicId(null); setResourceType('Link'); setResourceModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground font-semibold rounded-md text-sm hover:opacity-90 transition-opacity"
              >
                <LinkIcon size={16} /> Add Link
              </button>
              <button 
                onClick={() => { setResourceTopicId(null); setResourceType('Document'); setResourceModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-md text-sm hover:bg-blue-500/10 transition-colors"
              >
                <Upload size={16} /> Upload Doc
              </button>
            </div>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {planResources.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground glass-panel border-dashed">
                No resources added yet. Add a link to documentation or a YouTube video.
              </div>
            ) : (
              planResources.map(res => (
                <div key={res.id} className="glass-panel p-4 flex flex-col group relative">
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        {res.type === 'Link' ? <LinkIcon size={16} /> : <FileText size={16} />}
                      </div>
                      <div>
                        <h4 className="font-semibold line-clamp-1" title={res.title}>{res.title}</h4>
                        {res.topicId && (
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Linked to Topic</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => deleteResource(res.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive bg-background/80 backdrop-blur-sm rounded-sm transition-opacity">
                    <Trash2 size={14} />
                  </button>

                  {res.type === 'Link' ? (
                    <a href={res.urlOrPath} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 mb-2 mt-2">
                      {res.urlOrPath}
                    </a>
                  ) : (
                    <a href={res.urlOrPath} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 mb-2 mt-2">
                      View Uploaded Document
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      <DialogPrimitive.Root open={nodeModalOpen} onOpenChange={setNodeModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] w-full max-w-sm translate-x-[-50%] translate-y-[-50%] p-6 glass-panel border border-border shadow-lg sm:rounded-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <h3 className="text-lg font-bold mb-4">{nodeParentId ? 'Add Sub-topic' : 'Add Subject'}</h3>
            <form onSubmit={handleAddNodeSubmit} className="space-y-4">
              <input 
                autoFocus
                value={nodeTitle} 
                onChange={e => setNodeTitle(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                placeholder="Enter title..." 
                required 
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNodeModalOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-secondary">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90">Save</button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Add Resource Modal */}
      <DialogPrimitive.Root open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] w-full max-w-sm translate-x-[-50%] translate-y-[-50%] p-6 glass-panel border border-border shadow-lg sm:rounded-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <h3 className="text-lg font-bold mb-4">{resourceType === 'Link' ? 'Add Link' : 'Upload Document'}</h3>
            <form onSubmit={handleAddResourceSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <input 
                  autoFocus
                  value={resourceTitle} 
                  onChange={e => setResourceTitle(e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                  placeholder={resourceType === 'Link' ? 'e.g. React Docs' : 'e.g. Chapter 1 PDF'} 
                  required 
                />
              </div>
              
              {resourceType === 'Link' ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">URL *</label>
                  <input 
                    type="url"
                    value={resourceUrl} 
                    onChange={e => setResourceUrl(e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    placeholder="https://..." 
                    required 
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block">File *</label>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    required={resourceType === 'Document'} 
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Files are securely uploaded to your cloud storage.</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResourceModalOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center min-w-[80px]">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

    </div>
  );
}

function SyllabusNodeRow({ node, allNodes, allResources, level, onAddChild, onAddResource, onUpdate, onUpdateStatus, onDelete }: any) {
  const children = allNodes.filter((n: any) => n.parentId === node.id);
  const isLeaf = children.length === 0;
  const nodeResources = allResources ? allResources.filter((r: any) => r.topicId === node.id) : [];

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-background mb-2 group/row">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 ${level === 0 ? 'bg-secondary/30' : 'bg-background'}`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1" style={{ marginLeft: `${level * 20}px` }}>
            <button 
              onClick={() => onUpdateStatus(node.id, node.status === 'Completed' ? 'Not Started' : 'Completed')}
              className={`p-0.5 rounded-full transition-colors ${node.status === 'Completed' ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {node.status === 'Completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>
          </div>
          
          <div>
            <h4 className={`font-semibold ${node.status === 'Completed' ? 'line-through opacity-70' : ''}`}>{node.title}</h4>
            {nodeResources.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {nodeResources.map((res: any) => (
                  <a 
                    key={res.id} 
                    href={res.urlOrPath} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded text-[10px] font-medium"
                    title={res.title}
                  >
                    {res.type === 'Link' ? <LinkIcon size={10} /> : <FileText size={10} />}
                    <span className="truncate max-w-[120px]">{res.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pl-[20px] sm:pl-0 opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-opacity">
          {isLeaf && (
            <select 
              value={node.importance} 
              onChange={(e) => onUpdate(node.id, { importance: e.target.value })}
              className={`text-xs px-2 py-1 rounded-md border font-medium outline-none ${
                node.importance === 'High Weightage' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                node.importance === 'Skip / Deprioritize' ? 'bg-muted text-muted-foreground border-border' : 
                'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
              }`}
            >
              <option value="High Weightage">High Weightage</option>
              <option value="Important">Important</option>
              <option value="Normal">Normal</option>
              <option value="Skip / Deprioritize">Skip</option>
            </select>
          )}
          
          <button onClick={() => onAddResource(node.id)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md" title="Add Resource Link">
            <LinkIcon size={14} />
          </button>
          <button onClick={() => onAddChild(node.id)} className="p-1.5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-secondary rounded-md" title="Add Sub-topic">
            <Plus size={14} />
          </button>
          <button onClick={() => {
            const newTitle = prompt('Edit title:', node.title);
            if (newTitle) onUpdate(node.id, { title: newTitle });
          }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => {
            if(confirm(`Delete "${node.title}" and all its sub-topics?`)) onDelete(node.id);
          }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-md" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {children.length > 0 && (
        <div className="p-2 border-t border-border/50 bg-background/50 space-y-2">
          {children.map((child: any) => (
            <SyllabusNodeRow key={child.id} node={child} allNodes={allNodes} allResources={allResources} level={level + 1} onAddChild={onAddChild} onAddResource={onAddResource} onUpdate={onUpdate} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
