import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, Lock, Loader2, ChevronRight,
  Filter, Search, Edit3, X, Check, ArrowRight, AlertCircle,
  Map, Calendar, Target, Trash2, RefreshCcw
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

const statusConfig = {
  completed:   { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Completed' },
  in_progress: { icon: Loader2,      color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  label: 'In Progress' },
  not_started: { icon: Circle,       color: 'text-gray-400',    bg: 'bg-gray-50',    border: 'border-gray-200',    label: 'Not Started' },
  locked:      { icon: Lock,         color: 'text-gray-300',    bg: 'bg-gray-50',    border: 'border-gray-100',    label: 'Locked' },
  skipped:     { icon: X,            color: 'text-orange-400',  bg: 'bg-orange-50',  border: 'border-orange-200',  label: 'Skipped' },
};

const importanceConfig = {
  mandatory:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: 'Mandatory' },
  recommended: { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400',  label: 'Recommended' },
  optional:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Optional' },
};

function RoadmapNode({ node, isSelected, onClick, onMarkComplete, editMode, onRemove }) {
  const status = statusConfig[node.status] || statusConfig.not_started;
  const importance = importanceConfig[node.importance] || importanceConfig.recommended;
  const StatusIcon = status.icon;
  const isLocked = node.status === 'locked';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.title} - ${status.label}`}
      onClick={() => !editMode && !isLocked && onClick(node)}
      className={`relative group rounded-2xl border-2 p-4 transition-all duration-300 w-full min-w-[200px] max-w-[240px]
        ${isSelected ? 'border-indigo-400 shadow-lg shadow-indigo-100 scale-[1.02]' : status.border}
        ${isLocked && !editMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-[1.01]'}
        ${node.status === 'in_progress' && !editMode ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}
        bg-white`}
    >
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 shadow-sm transition-colors z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${importance.dot}`} title={importance.label} />

      <div className="flex items-start gap-2 mb-2">
        <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status.color} ${node.status === 'in_progress' ? 'animate-spin' : ''}`} />
        <div>
          <h3 className="font-semibold text-[#1A1D21] text-sm leading-tight">{node.title}</h3>
          <span className="text-[11px] text-gray-400">{node.category}</span>
        </div>
      </div>

      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${importance.bg} ${importance.text} ${importance.border} mb-2`}>
        {importance.label}
      </span>

      <div className={`text-[11px] font-medium ${status.color} mt-1`}>{status.label}</div>

      <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{node.estimatedWeeks}w · {node.estimatedHours}h</span>
      </div>

      {!editMode && node.status === 'in_progress' && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkComplete(node.id); }}
          className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors"
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

const FILTERS = ['All', 'Mandatory', 'Recommended', 'Optional', 'Completed', 'In Progress'];

export default function Roadmap() {
  const navigate = useNavigate();
  const { learner, roadmapNodes, markNodeComplete, markNodeStatus, showToast } = useLearner();
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [localHiddenNodes, setLocalHiddenNodes] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const displayNodes = roadmapNodes.filter(n => !localHiddenNodes.includes(n.id));

  const filteredNodes = useMemo(() => {
    return displayNodes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesFilter = true;
      if (activeFilter === 'Mandatory')   matchesFilter = n.importance === 'mandatory';
      if (activeFilter === 'Recommended') matchesFilter = n.importance === 'recommended';
      if (activeFilter === 'Optional')    matchesFilter = n.importance === 'optional';
      if (activeFilter === 'Completed')   matchesFilter = n.status === 'completed';
      if (activeFilter === 'In Progress') matchesFilter = n.status === 'in_progress';
      return matchesSearch && matchesFilter;
    });
  }, [displayNodes, activeFilter, searchQuery]);

  const months = [1, 2, 3, 4];
  const completedCount = displayNodes.filter((n) => n.status === 'completed').length;
  const totalCount = displayNodes.length;

  function handleRemoveConfirm() {
    setLocalHiddenNodes(prev => [...prev, confirmRemove]);
    showToast('Topic removed from roadmap', 'success');
    setConfirmRemove(null);
  }

  return (
    <div className="flex flex-col h-full">
      <Header />

      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Map className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">{learner.targetRole}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">My Roadmap</h1>
            <p className="text-gray-500 mt-1">Your personalized learning journey</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/roadmap/ai-engineer')}
              className="h-9 px-4 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" /> Detail View
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`h-9 px-4 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${editMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {editMode ? 'Done Editing' : <><Edit3 className="w-4 h-4" /> Edit Roadmap</>}
            </button>
          </div>
        </div>

        {editMode && localHiddenNodes.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="text-sm text-amber-800 font-medium">{localHiddenNodes.length} nodes hidden from view.</span>
            <button onClick={() => setLocalHiddenNodes([])} className="flex items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-900">
              <RefreshCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Progress', value: `${learner.overallProgress}%`, icon: Target, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Timeline', value: `${learner.targetMonths} months`, icon: Calendar, color: 'bg-amber-50 text-amber-700' },
            { label: 'Study Time', value: `${learner.availableHoursPerWeek} hrs/wk`, icon: Clock, color: 'bg-emerald-50 text-emerald-700' },
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

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roadmap..."
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

      {confirmRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Topic?</h3>
            <p className="text-gray-500 text-sm mb-6">This will hide this topic from your current roadmap. You can reset this later.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(null)} className="flex-1 h-11 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleRemoveConfirm} className="flex-1 h-11 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedNode(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedNode.title}</h2>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-6">{selectedNode.description || 'Learn the foundational concepts required for this topic.'}</p>
            
            <div className="flex gap-2">
              {selectedNode.status === 'in_progress' ? (
                <button onClick={() => { markNodeComplete(selectedNode.id); setSelectedNode(null); }} className="flex-1 h-11 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Mark Complete
                </button>
              ) : selectedNode.status === 'not_started' ? (
                <button onClick={() => { markNodeStatus(selectedNode.id, 'in_progress'); setSelectedNode(null); }} className="flex-1 h-11 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
                  Start Learning
                </button>
              ) : (
                <button onClick={() => { navigate('/explore/' + selectedNode.skillId) }} className="flex-1 h-11 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 flex items-center justify-center gap-2">
                  View Skill
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
