import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, Calendar, Clock, CheckCircle2, Circle, Lock,
  Loader2, ChevronRight, Map, AlertCircle, RefreshCcw, Network
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { roadmapApi } from '../../api/roadmapApi';
import { useLearner } from '../../context/LearnerContext';

const statusIcon = { completed: CheckCircle2, in_progress: Loader2, not_started: Circle, locked: Lock };
const statusColor = { completed: 'text-emerald-600', in_progress: 'text-indigo-600', not_started: 'text-gray-400', locked: 'text-gray-300' };
const statusBg = { completed: 'bg-emerald-50 border-emerald-200', in_progress: 'bg-indigo-50 border-indigo-200', not_started: 'bg-gray-50 border-gray-200', locked: 'bg-gray-50 border-gray-100' };

export default function RoadmapDetail() {
  const { roadmapId = 'ai-engineer' } = useParams();
  const navigate = useNavigate();
  const { markNodeComplete } = useLearner();

  const [roadmap, setRoadmap] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const [roadmapRes, graphRes] = await Promise.allSettled([
          roadmapApi.getRoadmapById(roadmapId),
          roadmapApi.getRoadmapGraph(roadmapId),
        ]);

        if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
          setRoadmap(roadmapRes.value);
        }
        if (graphRes.status === 'fulfilled' && graphRes.value) {
          setGraphData(graphRes.value);
        }
      } catch (err) {
        console.error('Failed to load roadmap detail:', err);
        setError(err.message || 'Unable to load roadmap details');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [roadmapId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-gray-500">Loading roadmap graph...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Unable to Load Roadmap</h2>
            <p className="text-sm text-gray-500 mb-6">{error || 'Roadmap not found.'}</p>
            <button
              onClick={() => navigate('/roadmap')}
              className="h-10 px-6 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Back to Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nodes = roadmap.nodes || [];
  const completedNodes = nodes.filter((n) => n.status === 'completed').length;
  const totalNodes = nodes.length;
  const milestones = graphData?.milestones || roadmap.milestones || [];
  const edges = graphData?.edges || roadmap.edges || [];

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Back */}
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group"
          aria-label="Back to roadmap"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Roadmap
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {roadmapId}
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {edges.length} graph edges
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">{roadmap.title}</h1>
            <p className="text-gray-500 mt-1">{roadmap.description || `Canonical structured roadmap for ${roadmap.title}`}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Progress', value: `${roadmap.overallProgress || 0}%`, color: 'bg-indigo-50', textColor: 'text-indigo-700', icon: Target },
            { label: 'Timeline', value: roadmap.timeline || '4 months', color: 'bg-amber-50', textColor: 'text-amber-700', icon: Calendar },
            { label: 'Study Time', value: `${roadmap.hoursPerWeek || 10} hrs/wk`, color: 'bg-emerald-50', textColor: 'text-emerald-700', icon: Clock },
            { label: 'Phase', value: roadmap.currentPhase || 'Foundations', color: 'bg-purple-50', textColor: 'text-purple-700', icon: Loader2 },
          ].map(({ label, value, color, textColor, icon: Icon }) => (
            <div key={label} className={`${color} rounded-2xl p-4 border border-white`}>
              <Icon className={`w-4 h-4 ${textColor} mb-2`} />
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="font-bold text-[#1A1D21] text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#1A1D21]">Overall Roadmap Progress</span>
            <span className="text-sm font-bold text-indigo-600">{completedNodes}/{totalNodes} nodes completed</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${roadmap.overallProgress || 0}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1A1D21] mb-4">Milestones & Learning Gates</h2>
          <div className="space-y-3">
            {milestones.map((milestone, idx) => {
              const nodeIds = milestone.nodeIds || [];
              const milestoneNodes = nodes.filter((n) => nodeIds.includes(n.id));
              const completedInMilestone = milestoneNodes.filter((n) => n.status === 'completed').length;
              const isCompleted = milestone.status === 'completed' || (milestoneNodes.length > 0 && completedInMilestone === milestoneNodes.length);
              const isActive = milestone.status === 'in_progress';

              return (
                <div key={milestone.id} className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${isActive ? 'border-indigo-200 bg-indigo-50' : isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${isActive ? 'bg-indigo-600 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1A1D21]">{milestone.title}</span>
                      <span className="text-xs text-gray-400">Month {milestone.month || idx + 1}</span>
                      {isActive && <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Current</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      {milestoneNodes.slice(0, 4).map((n, i) => (
                        <span key={n.id} className="flex items-center gap-0.5">
                          {i > 0 && <ChevronRight className="w-3 h-3" />}
                          <span className={n.status === 'completed' ? 'text-emerald-600 font-medium' : n.status === 'in_progress' ? 'text-indigo-600 font-medium' : ''}>{n.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-400">{completedInMilestone}/{milestoneNodes.length}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Nodes Sequence */}
        <div>
          <h2 className="text-lg font-bold text-[#1A1D21] mb-4">Topological Learning Order ({totalNodes} topics)</h2>
          <div className="space-y-2">
            {nodes.map((node, index) => {
              const StatusIcon = statusIcon[node.status] || Circle;
              const color = statusColor[node.status] || 'text-gray-400';
              const bg = statusBg[node.status] || 'bg-gray-50 border-gray-200';
              return (
                <div key={node.id} className={`flex items-center gap-4 p-4 rounded-xl border ${bg} hover:shadow-sm transition-all`}>
                  <span className="text-xs font-bold text-gray-400 w-6">{index + 1}.</span>
                  <StatusIcon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-[#1A1D21]">{node.title}</span>
                    <span className="text-xs text-gray-400 ml-2">{node.category}</span>
                    {node.prerequisites && node.prerequisites.length > 0 && (
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Prereqs: {node.prerequisites.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {node.estimatedHours || 15}h
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    node.importance === 'mandatory' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    node.importance === 'recommended' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {node.importance}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
