import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, Target, BookOpen, ChevronRight, Zap, Star,
  Compass, AlertTriangle, CheckCircle2, Clock, Calendar, ArrowRight,
  Sparkles, Layers, Mic
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useLearner } from '../context/LearnerContext';
import { realityApi } from '../api/realityApi';
import { gapApi } from '../api/gapApi';
import { recommendationApi } from '../api/recommendationApi';
import { readinessApi } from '../api/readinessApi';
import { interviewApi } from '../api/interviewApi';

function ProgressRing({ progress = 0, label }) {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#E0E7FF" strokeWidth="8" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#4F46E5" strokeWidth="8" strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#1A1D21]">{progress}%</span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

const realityStatusConfig = {
  COMFORTABLE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Comfortable Pace' },
  REALISTIC:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Realistic' },
  TIGHT:       { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Tight Timeline' },
  AT_RISK:     { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'At Risk' },
  UNREALISTIC: { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'Unrealistic' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { learner, roadmapNodes = [], resources = [], progress = {} } = useLearner();
  
  const [realityData, setRealityData] = useState(null);
  const [gapSummary, setGapSummary] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [latestInterview, setLatestInterview] = useState(null);

  useEffect(() => {
    async function loadIntelligence() {
      try {
        const [realityRes, gapRes, recRes, readRes, intRes] = await Promise.allSettled([
          realityApi.getRealityCheck(),
          gapApi.getGaps(),
          recommendationApi.getNextBestActions(undefined, undefined, 1),
          readinessApi.getReadiness(learner?.id || 'demo-learner'),
          interviewApi.getHistory(learner?.id || 'demo-learner')
        ]);

        if (realityRes.status === 'fulfilled' && realityRes.value) {
          setRealityData(realityRes.value);
        }
        if (gapRes.status === 'fulfilled' && gapRes.value?.summary) {
          setGapSummary(gapRes.value.summary);
        }
        if (recRes.status === 'fulfilled' && Array.isArray(recRes.value) && recRes.value.length > 0) {
          setNextAction(recRes.value[0]);
        }
        if (readRes.status === 'fulfilled' && readRes.value) {
          setReadinessData(readRes.value);
        }
        if (intRes.status === 'fulfilled' && Array.isArray(intRes.value) && intRes.value.length > 0) {
          setLatestInterview(intRes.value[0]);
        }
      } catch (err) {
        console.warn('Dashboard intelligence loading notice:', err);
      }
    }
    loadIntelligence();
  }, [learner]);

  const currentSkill = roadmapNodes?.find(n => n.status === 'in_progress') || roadmapNodes?.[0] || {
    title: 'Machine Learning Foundations',
    description: 'Continue your personalized learning journey towards AI Engineering.',
    skillId: 'machine-learning'
  };
  const nextResource = resources?.find(r => r.relatedSkillId === currentSkill?.skillId) || resources?.[0] || null;

  const realityStatus = realityData ? (realityStatusConfig[realityData.status] || realityStatusConfig.REALISTIC) : realityStatusConfig.REALISTIC;

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Welcome Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Welcome back, {learner?.name ? learner.name.split(' ')[0] : 'Alex'} 👋</h1>
            <p className="text-gray-500 mt-1">Personalized intelligence and progress tracking towards your {learner?.targetRole || 'AI Engineer'} goal.</p>
          </div>
          {realityData && (
            <div className={`px-4 py-2 rounded-2xl border ${realityStatus.bg} ${realityStatus.border} flex items-center gap-2 self-start`}>
              <span className={`text-xs font-bold ${realityStatus.text} uppercase tracking-wider`}>
                Timeline: {realityStatus.label}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Actionable Next Step Recommendation Banner */}
            {nextAction ? (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                      <Sparkles className="w-3.5 h-3.5" /> Next Best Learning Action
                    </span>
                    <span className="text-xs text-indigo-200 font-semibold">{nextAction.estimated_hours}h estimated</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{nextAction.title}</h2>
                  <p className="text-indigo-100 max-w-xl mb-6 text-sm leading-relaxed">{nextAction.reason}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate('/roadmap')} className="h-12 px-6 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                      View Personalized Roadmap <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate('/explore/' + nextAction.skill_id)} className="h-12 px-6 bg-indigo-500/30 text-white border border-indigo-400/50 font-bold rounded-xl hover:bg-indigo-500/50 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
                      Explore Skill Graph
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-4 border border-white/10">
                    <Target className="w-3.5 h-3.5" /> Current Focus
                  </span>
                  <h2 className="text-3xl font-bold mb-2">{currentSkill.title}</h2>
                  <p className="text-indigo-100 max-w-md mb-8">{currentSkill.description || 'Continue your learning journey.'}</p>
                  <button onClick={() => navigate('/roadmap')} className="h-12 px-6 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    View Roadmap <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Reality Checker & Workload Feasibility Card */}
            {realityData && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1A1D21]">Reality Checker Timeline Audit</h2>
                      <p className="text-xs text-gray-400">Deterministic workload vs available study bandwidth</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${realityStatus.bg} ${realityStatus.text} ${realityStatus.border}`}>
                    {realityStatus.label} ({Math.round(realityData.workload_ratio * 100)}% load)
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-5 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {realityData.explanation}
                </p>

                {/* Visual Time Comparison Bar */}
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Available Time ({realityData.hours_per_week}h/wk × {Math.round(realityData.weeks_remaining)}w)</span>
                      <span className="font-bold text-indigo-600">{realityData.available_hours} hours</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Estimated Required Workload</span>
                      <span className="font-bold text-amber-600">{realityData.required_hours} hours</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${realityData.workload_ratio > 1.0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (realityData.required_hours / Math.max(1, realityData.available_hours)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendation adjustment pill */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="font-semibold text-gray-500">
                    Recommended Study Pace: <span className="text-[#1A1D21] font-bold">~{Math.ceil(realityData.minimum_weekly_hours)} hrs/week</span>
                  </span>
                  <button onClick={() => navigate('/roadmap')} className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Tune Roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Recommended Learning Resources */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1A1D21]">Recommended for you</h2>
                <button onClick={() => navigate('/learning')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.slice(0, 2).map((res) => (
                  <div key={res.id} onClick={() => navigate(`/learning/${res.id}`)} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{res.provider}</span>
                      <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-500" /> {res.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1A1D21] mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">{res.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                      <span className="capitalize">{res.type}</span>
                      {res.durationHours && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{res.durationHours}h</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Estimated Job Readiness Summary */}
            <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-3xl border border-indigo-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Estimated Job Readiness
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                  {readinessData?.status?.replace('_', ' ') || 'Near Ready'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-extrabold text-[#1A1D21] tracking-tight">
                  {readinessData?.score ? Math.round(readinessData.score) : 68}%
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {readinessData?.criticalGaps?.length || 2} critical skill gaps to target role
                </div>
              </div>

              <button
                onClick={() => navigate('/readiness')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Full Readiness Breakdown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Mock Interview Summary */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-indigo-600" /> Mock Interview
                </span>
                {latestInterview?.finalReport ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase">
                    {latestInterview.finalReport.status}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase">
                    Ready
                  </span>
                )}
              </div>

              {latestInterview?.finalReport ? (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-[#1A1D21]">
                      {Math.round(latestInterview.finalReport.overallScore)}%
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      Technical: {latestInterview.finalReport.technicalScore}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {latestInterview.finalReport.weaknesses?.[0] ? `Top focus: ${latestInterview.finalReport.weaknesses[0]}` : 'Demonstrated good overall competence.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Test your live technical explanations against AI-generated role questions.
                </p>
              )}

              <button
                onClick={() => navigate('/interview/setup')}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{latestInterview ? 'Retake Mock Interview' : 'Start Mock Interview'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Stats / Activity */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1A1D21] mb-6">Learning Activity</h2>
              <div className="flex justify-center mb-6">
                <ProgressRing progress={progress?.overall ?? progress?.overallProgress ?? 32} label="Overall" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">Current Streak</span>
                  </div>
                  <span className="font-bold text-[#1A1D21]">{progress?.streak ?? 7} days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">Topics Done</span>
                  </div>
                  <span className="font-bold text-[#1A1D21]">{progress?.topicsCompleted ?? 18}</span>
                </div>
              </div>
            </div>

            {/* Skill Gap Summary Card */}
            {gapSummary && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" /> Skill Gap Audit
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Verified Known</span>
                    <span className="text-xl font-bold text-emerald-900">{gapSummary.known_skills_count}</span>
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Remaining Gaps</span>
                    <span className="text-xl font-bold text-amber-900">{gapSummary.full_gaps_count + gapSummary.partial_gaps_count}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {gapSummary.blocked_gaps_count} skills currently waiting for foundational prerequisites.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => navigate('/explore')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Explore All Gaps <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Next Milestone */}
            <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-6">
              <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Next Milestone
              </h2>
              <div className="space-y-1">
                <h3 className="font-bold text-indigo-900">{progress?.nextAction?.title || 'Machine Learning Foundations'}</h3>
                <p className="text-sm text-indigo-700">{progress?.nextAction?.description || 'Continue with Supervised Learning'}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <button onClick={() => navigate('/progress')} className="text-sm font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
                  View Full Progress <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
