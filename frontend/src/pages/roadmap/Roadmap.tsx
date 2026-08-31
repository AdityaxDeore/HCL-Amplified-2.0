import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, Lock, Loader2, ChevronRight,
  Filter, Search, Edit3, X, Check, ArrowRight, AlertCircle,
  Map, Calendar, Target, Trash2, RefreshCcw, Sparkles, HelpCircle,
  Compass, PlayCircle, Layers, ShieldAlert
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { roadmapApi } from '../../api/roadmapApi';
import { recommendationApi } from '../../api/recommendationApi';
import { gapApi } from '../../api/gapApi';

const statusConfig = {
  completed:   { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Completed' },
  in_progress: { icon: Loader2,      color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  label: 'In Progress' },
  not_started: { icon: Circle,       color: 'text-gray-400',    bg: 'bg-gray-50',    border: 'border-gray-200',    label: 'Not Started' },
  locked:      { icon: Lock,         color: 'text-gray-300',    bg: 'bg-gray-50',    border: 'border-gray-100',    label: 'Locked / Blocked' },
  skipped:     { icon: X,            color: 'text-orange-400',  bg: 'bg-orange-50',  border: 'border-orange-200',  label: 'Skipped' },
};

// Semantic Importance Styling
const importanceConfig = {
  mandatory:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: 'Mandatory',   desc: 'Core knowledge required for target path.' },
  recommended: { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400',  label: 'Recommended', desc: 'Useful knowledge that strengthens the path.' },
  optional:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Optional',    desc: 'Can potentially be pruned based on profile.' },
};

function RoadmapNode({ node, isSelected, onClick, onMarkComplete, editMode, onRemove }) {
  const status = statusConfig[node.status] || statusConfig.not_started;
  const importance = importanceConfig[node.importance] || importanceConfig.recommended;
  const StatusIcon = status.icon;
  const isLocked = node.status === 'locked' || node.is_blocked;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.title} - ${status.label}`}
      onClick={() => !editMode && !isLocked && onClick(node)}
      className={`relative group rounded-2xl border-2 p-4 transition-all duration-300 w-full min-w-[200px] max-w-[240px]
        ${isSelected ? 'border-indigo-400 shadow-lg shadow-indigo-100 scale-[1.02]' : status.border}
        ${isLocked && !editMode ? 'opacity-60 cursor-not-allowed bg-gray-50/70' : 'cursor-pointer hover:shadow-md hover:scale-[1.01] bg-white'}
        ${node.status === 'in_progress' && !editMode ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}
    >
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 shadow-sm transition-colors z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${importance.dot}`} title={`${importance.label}: ${importance.desc}`} />

      <div className="flex items-start gap-2 mb-2">
        <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status.color} ${node.status === 'in_progress' ? 'animate-spin' : ''}`} />
        <div>
          <h3 className="font-semibold text-[#1A1D21] text-sm leading-tight">{node.title}</h3>
          <span className="text-[11px] text-gray-400">{node.category}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${importance.bg} ${importance.text} ${importance.border}`}>
          {importance.label}
        </span>
        {node.is_blocked && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">
            <Lock className="w-2.5 h-2.5" /> Blocked
          </span>
        )}
      </div>

      <div className={`text-[11px] font-medium ${status.color} mt-1`}>{status.label}</div>

      <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{node.estimatedWeeks || 1}w · {node.estimatedHours || 10}h</span>
      </div>

      {!editMode && node.status === 'in_progress' && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkComplete(node.id); }}
          className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors shadow-sm"
          title="Mark complete"
        >
          <Check className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function ConnectorLine() {
  return (
    <div className="flex flex-col items-center my-1 flex-shrink-0">
      <div className="w-0.5 h-6 bg-gradient-to-b from-gray-200 to-gray-300" />
      <ChevronRight className="w-3 h-3 text-gray-300 rotate-90" />
    </div>
  );
}

const FILTERS = ['All', 'Mandatory', 'Recommended', 'Optional', 'Completed', 'In Progress', 'Not Started', 'Blocked'];

export default function Roadmap() {
  const navigate = useNavigate();
  const { learner, roadmap, roadmapNodes, markNodeComplete, markNodeStatus, removeNode } = useLearner();
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  // Part 7 Recommendation State
  const [topRecommendation, setTopRecommendation] = useState(null);
  const [gapData, setGapData] = useState(null);

  const displayNodes = roadmapNodes;

  // Load Part 7 personalized recommendation & gap data
  useEffect(() => {
    async function loadPersonalization() {
      try {
        const [recRes, gapRes] = await Promise.allSettled([
          recommendationApi.getNextBestActions(learner.id || 'demo-learner', learner.targetRole, 1),
          gapApi.getGaps(learner.id || 'demo-learner', learner.targetRole)
        ]);

        if (recRes.status === 'fulfilled' && Array.isArray(recRes.value) && recRes.value.length > 0) {
          setTopRecommendation(recRes.value[0]);
        }
        if (gapRes.status === 'fulfilled' && gapRes.value) {
          setGapData(gapRes.value);
        }
      } catch (err) {
        console.warn('Roadmap personalization notice:', err);
      }
    }
    loadPersonalization();
  }, [learner, displayNodes]);

  const filteredNodes = useMemo(() => {
    return displayNodes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.description && n.description.toLowerCase().includes(searchQuery.toLowerCase()));
      let matchesFilter = true;
      if (activeFilter === 'Mandatory')   matchesFilter = n.importance === 'mandatory';
      if (activeFilter === 'Recommended') matchesFilter = n.importance === 'recommended';
      if (activeFilter === 'Optional')    matchesFilter = n.importance === 'optional';
      if (activeFilter === 'Completed')   matchesFilter = n.status === 'completed';
      if (activeFilter === 'In Progress') matchesFilter = n.status === 'in_progress';
      if (activeFilter === 'Not Started') matchesFilter = n.status === 'not_started';
      if (activeFilter === 'Blocked')     matchesFilter = n.is_blocked || n.status === 'locked';
      return matchesSearch && matchesFilter;
    });
  }, [displayNodes, activeFilter, searchQuery]);

  const months = [1, 2, 3, 4];
  const completedCount = displayNodes.filter((n) => n.status === 'completed').length;
  const totalCount = displayNodes.length;

  async function handleRemoveConfirm() {
    if (confirmRemove) {
      await removeNode(confirmRemove);
      setConfirmRemove(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header />

      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Map className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">{learner.targetRole || 'AI Engineer'}</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100">
                Personalized for {learner.name || 'Alex Morgan'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Personalized Learning Roadmap</h1>
            <p className="text-gray-500 mt-1">Algorithmic learning sequence tailored to your verified skills, priority gaps, and weekly timeline.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="h-9 px-3 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" /> {showLegend ? 'Hide Legend' : 'Legend'}
            </button>
            <button
              onClick={() => navigate('/roadmap/ai-engineer')}
              className="h-9 px-4 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" /> Graph View
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`h-9 px-4 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${editMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {editMode ? 'Done Editing' : <><Edit3 className="w-4 h-4" /> Edit Roadmap</>}
            </button>
          </div>
        </div>

        {/* Semantic Legend Banner */}
        {showLegend && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Roadmap Importance Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-amber-800">MANDATORY</span>
                </div>
                <p className="text-xs text-amber-900/80">Core prerequisite knowledge strictly required for the target career path.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-sm font-bold text-slate-700">RECOMMENDED</span>
                </div>
                <p className="text-xs text-slate-600">Useful and complementary knowledge that significantly strengthens execution.</p>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-emerald-800">OPTIONAL</span>
                </div>
                <p className="text-xs text-emerald-900/80">Specialized or alternative topic that can be pruned based on learner focus.</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Best Action Recommendation Banner */}
        {topRecommendation && (
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Recommended Next Step</span>
                  <span className="text-xs text-gray-400 font-medium">· Priority Score: {topRecommendation.priority}/100</span>
                </div>
                <h3 className="font-bold text-[#1A1D21] text-base">{topRecommendation.title}</h3>
                <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">{topRecommendation.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => markNodeStatus(topRecommendation.skill_id, 'in_progress')}
                className="h-9 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <PlayCircle className="w-4 h-4" /> Start Learning
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Progress', value: `${roadmap.overallProgress || learner.overallProgress || 0}%`, icon: Target, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Timeline', value: `${learner.targetMonths || 4} months`, icon: Calendar, color: 'bg-amber-50 text-amber-700' },
            { label: 'Study Time', value: `${learner.availableHoursPerWeek || learner.hoursPerWeek || 10} hrs/wk`, icon: Clock, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Completed', value: `${completedCount}/${totalCount}`, icon: CheckCircle2, color: 'bg-purple-50 text-purple-700' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-xl ${color.split(' ')[0]} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color.split(' ')[1]}`} />
              </div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-[#1A1D21]">{value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roadmap skills, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`h-8 px-3 rounded-full text-xs font-semibold transition-all duration-200 border
                  ${activeFilter === f
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Nodes by Month Grouping */}
        <div className="space-y-10">
          {months.map((month) => {
            const monthNodes = filteredNodes.filter((n) => n.month === month);
            if (monthNodes.length === 0) return null;
            return (
              <section key={month}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                    <Calendar className="w-3.5 h-3.5" /> Month {month}
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-0 items-start">
                  {monthNodes.map((node, idx) => (
                    <div key={node.id} className="flex flex-col items-center sm:flex-row sm:items-start">
                      <RoadmapNode
                        node={node}
                        isSelected={selectedNode?.id === node.id}
                        onClick={setSelectedNode}
                        onMarkComplete={markNodeComplete}
                        editMode={editMode}
                        onRemove={setConfirmRemove}
                      />
                      {idx < monthNodes.length - 1 && (
                        <>
                          <div className="sm:hidden"><ConnectorLine /></div>
                          <div className="hidden sm:flex items-center mx-2 mt-10 flex-shrink-0">
                            <div className="w-6 h-0.5 bg-gray-200" />
                            <ChevronRight className="w-3 h-3 text-gray-300" />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {month < 4 && (
                  <div className="flex flex-col items-start ml-[110px] mt-2">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-gray-200 to-gray-100" />
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <ArrowRight className="w-3 h-3" /> continues to Month {month + 1}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Topic?</h3>
            <p className="text-gray-500 text-sm mb-6">This will remove this topic from your personalized roadmap in MongoDB.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(null)} className="flex-1 h-11 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleRemoveConfirm} className="flex-1 h-11 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedNode(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  selectedNode.importance === 'mandatory' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  selectedNode.importance === 'recommended' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {selectedNode.importance}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1.5">{selectedNode.title}</h2>
                <span className="text-xs text-gray-400">{selectedNode.category} · {selectedNode.estimatedHours || 15} hours</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{selectedNode.description || selectedNode.reason || 'Learn the core concepts and practical workflows required for this topic.'}</p>
            
            {selectedNode.is_blocked && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold mb-1">
                  <ShieldAlert className="w-4 h-4" /> Prerequisites Missing
                </div>
                <p className="text-xs text-rose-600">
                  {selectedNode.blocking_skills?.length > 0
                    ? `Must complete ${selectedNode.blocking_skills.join(', ')} before this topic can be unlocked.`
                    : 'Prerequisite dependencies must be fulfilled first.'}
                </p>
              </div>
            )}

            {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Prerequisites</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.prerequisites.map(p => (
                    <span key={p} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {selectedNode.status === 'in_progress' ? (
                <button onClick={() => { markNodeComplete(selectedNode.id); setSelectedNode(null); }} className="flex-1 h-11 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm">
                  <Check className="w-4 h-4" /> Mark Complete
                </button>
              ) : selectedNode.status === 'not_started' && !selectedNode.is_blocked ? (
                <button onClick={() => { markNodeStatus(selectedNode.id, 'in_progress'); setSelectedNode(null); }} className="flex-1 h-11 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm">
                  <PlayCircle className="w-4 h-4" /> Start Learning
                </button>
              ) : selectedNode.status === 'completed' ? (
                <button onClick={() => { markNodeStatus(selectedNode.id, 'in_progress'); setSelectedNode(null); }} className="flex-1 h-11 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> Revisit Topic
                </button>
              ) : (
                <button onClick={() => { navigate('/explore/' + (selectedNode.skillId || selectedNode.id)) }} className="flex-1 h-11 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 flex items-center justify-center gap-2">
                  View Skill Graph
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
