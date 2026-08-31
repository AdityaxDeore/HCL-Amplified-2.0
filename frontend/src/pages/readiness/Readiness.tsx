import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Target, CheckCircle2, AlertTriangle, ArrowRight,
  Shield, TrendingUp, Sparkles, HelpCircle, Layers,
  Compass, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, Clock
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { readinessApi } from '../../api/readinessApi';

const statusConfig = {
  READY:       { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Job Ready' },
  NEAR_READY:  { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Near Ready' },
  BUILDING:    { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Building Foundations' },
  NOT_READY:   { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Not Ready Yet' },
};

export default function Readiness() {
  const navigate = useNavigate();
  const { learner } = useLearner();

  const [readiness, setReadiness] = useState(null);
  const [skillsReadiness, setSkillsReadiness] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [readinessRes, skillsRes, histRes] = await Promise.allSettled([
          readinessApi.getReadiness(learner.id || 'demo-learner'),
          readinessApi.getSkillReadiness(learner.id || 'demo-learner'),
          readinessApi.getReadinessHistory(learner.id || 'demo-learner')
        ]);

        if (readinessRes.status === 'fulfilled' && readinessRes.value) {
          setReadiness(readinessRes.value);
        } else {
          setError('Could not retrieve full readiness evaluation.');
        }

        if (skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value)) {
          setSkillsReadiness(skillsRes.value);
        }

        if (histRes.status === 'fulfilled' && Array.isArray(histRes.value)) {
          setHistory(histRes.value);
        }
      } catch (err) {
        console.error('Failed to load readiness:', err);
        setError('An error occurred while evaluating readiness.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [learner.id]);

  async function handleFeedback(type, value, targetId) {
    try {
      const res = await readinessApi.submitFeedback({
        learnerId: learner.id || 'demo-learner',
        type,
        value,
        targetId
      });
      setFeedbackToast(res.adaptationSummary || 'Thanks! Learning priorities adjusted.');
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      console.warn('Feedback submission notice:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#f8f9fa]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-500">Evaluating multi-dimensional job readiness...</p>
          </div>
        </div>
      </div>
    );
  }

  const score = readiness?.score ?? 68;
  const status = readiness?.status || 'NEAR_READY';
  const statusBadge = statusConfig[status] || statusConfig.NEAR_READY;
  const dims = readiness?.dimensions || {};
  const nextAction = readiness?.nextActions?.[0];
  const criticalGaps = readiness?.criticalGaps || [];
  const strengths = readiness?.strengths || [];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <Header />
      <div className="px-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="fixed bottom-8 right-8 z-50 bg-indigo-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-indigo-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="mb-8 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Award className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Job Readiness Intelligence</h1>
            </div>
            <p className="text-gray-500 mt-1.5 text-sm">
              Estimated readiness for your target role as <span className="font-semibold text-indigo-700">{learner.targetRole || 'AI Engineer'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400">
              Confidence: <strong className="text-gray-700 uppercase">{readiness?.confidence || 'Medium'}</strong> ({readiness?.dataCompleteness || 80}% completeness)
            </span>
          </div>
        </div>

        {/* Top Hero Section: Score Ring + Key Explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Score Card */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="relative w-36 h-36 my-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#EEF2FF" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="9"
                  strokeDasharray={`${score * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-[#1A1D21] tracking-tight">{Math.round(score)}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Estimated</span>
              </div>
            </div>

            <div className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${statusBadge.bg}`}>
              {statusBadge.label}
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed max-w-xs">
              Roadmap completion reflects logged topics; readiness estimates real-world competency across core requirements.
            </p>
          </div>

          {/* Explanation & Next Best Action Hero */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-[#1A1D21] text-base">Readiness Assessment</h3>
                </div>
                <span className="text-xs text-gray-400">Authoritative Analysis</span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed font-normal bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                {readiness?.explanation || "You are making steady progress on foundational requirements. Focus on closing critical open gaps to maximize your interview readiness."}
              </p>
            </div>

            {/* Next Best Action Card */}
            {nextAction && (
              <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                      Next Best Action
                    </span>
                    <span className="text-xs font-semibold text-indigo-900">+{nextAction.impact || 12}% readiness impact</span>
                  </div>
                  <h4 className="font-bold text-[#1A1D21] text-sm">{nextAction.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{nextAction.reason}</p>
                </div>

                <button
                  onClick={() => navigate('/roadmap')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* 7-Dimension Breakdown */}
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#1A1D21] text-base">7-Dimension Competency Breakdown</h3>
              <p className="text-xs text-gray-400 mt-0.5">Multi-factor weights dynamically normalize across available signals.</p>
            </div>
            <div className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Standardized Scale
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { key: 'skillCoverage', label: 'Skill Coverage', weight: '30%', val: dims.skillCoverage, desc: 'Verified skills vs role requirements' },
              { key: 'prerequisiteCompletion', label: 'Prerequisite Completion', weight: '20%', val: dims.prerequisiteCompletion, desc: 'Foundational dependency satisfaction' },
              { key: 'roadmapProgress', label: 'Roadmap Progress (Weighted)', weight: '15%', val: dims.roadmapProgress, desc: 'Priority-weighted node completion (Yellow > White > Green)' },
              { key: 'practicalExperience', label: 'Practical Experience', weight: '15%', val: dims.practicalExperience, desc: 'Logged project & hands-on application' },
              { key: 'assessmentPerformance', label: 'Assessment Performance', weight: '10%', val: dims.assessmentPerformance, desc: 'Verified quiz & technical task scores' },
              { key: 'learningConsistency', label: 'Learning Consistency', weight: '5%', val: dims.learningConsistency, desc: 'Streak, cadence, and regular study habits' },
              { key: 'goalAlignment', label: 'Goal Alignment', weight: '5%', val: dims.goalAlignment, desc: 'Competency alignment with target role' },
            ].map(dim => (
              <div key={dim.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800">{dim.label}</span>
                    <span className="text-[10px] text-gray-400 ml-1.5 font-normal">({dim.weight} weight)</span>
                  </div>
                  {dim.val !== null && dim.val !== undefined ? (
                    <span className="font-extrabold text-indigo-700">{Math.round(dim.val)}%</span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                      Not enough data
                    </span>
                  )}
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${dim.val !== null && dim.val !== undefined ? dim.val : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Critical Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Critical Priority Gaps */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-[#1A1D21] text-base">Priority Skill Gaps</h3>
              </div>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                {criticalGaps.length} Open Gaps
              </span>
            </div>

            <div className="space-y-3">
              {criticalGaps.map(gap => (
                <div
                  key={gap.skillId}
                  className="p-4 rounded-2xl border border-gray-100 bg-[#FBFBFC] hover:border-indigo-200 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#1A1D21] text-sm">{gap.name}</h4>
                      {gap.prerequisiteBlocked && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          Blocked by Prereqs
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{gap.reason}</p>
                    <div className="text-[11px] text-gray-400 font-medium pt-1">
                      Current: <strong className="text-gray-700">Lvl {gap.currentLevel}</strong> · Target: <strong className="text-gray-700">Lvl {gap.requiredLevel}</strong> (Gap: -{gap.gap})
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => navigate(`/roadmap?node=${gap.skillId}`)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {/* Adaptive Feedback */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <button
                        onClick={() => handleFeedback('difficulty', 'too_difficult', gap.skillId)}
                        title="Too difficult"
                        className="hover:text-rose-600 p-1 hover:bg-rose-50 rounded"
                      >
                        Hard
                      </button>
                      <span>·</span>
                      <button
                        onClick={() => handleFeedback('difficulty', 'too_easy', gap.skillId)}
                        title="Too easy / Already know"
                        className="hover:text-emerald-600 p-1 hover:bg-emerald-50 rounded"
                      >
                        Easy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Strengths */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-[#1A1D21] text-base">Verified Strengths</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {strengths.length} Mastered
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              These core tools and competencies exceed the 80% readiness benchmark for your target role.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {strengths.map((st, idx) => (
                <div key={idx} className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">{st}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Interview Readiness Gate Card (Preview for Part 11) */}
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-[#1A1D21] text-base">AI Mock Interview Eligibility</h3>
              {readiness?.interviewReady ? (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  Eligible
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
                  Practice Mode
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {readiness?.interviewReadinessExplanation || "Practice simulated role-specific technical questions to prepare for job interviews."}
            </p>
          </div>

          <button
            onClick={() => navigate('/interview')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Launch Interview Simulator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
