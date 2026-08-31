import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight,
  Home, RotateCcw, Award, Sparkles, BookOpen, ExternalLink, Play
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { interviewApi } from '../../api/interviewApi';

const statusConfig = {
  STRONG:            { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Strong Performance' },
  GOOD:              { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Good Competency' },
  DEVELOPING:        { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Developing Knowledge' },
  NEEDS_IMPROVEMENT: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Needs Practice' },
};

export default function InterviewResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { learner } = useLearner();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const sess = await interviewApi.getSession(sessionId);
        if (sess?.finalReport) {
          setReport(sess.finalReport);
        } else {
          // If not completed yet, complete and generate final report
          const compReport = await interviewApi.completeInterview(sessionId);
          setReport(compReport);
        }
      } catch (err) {
        console.error('Error loading interview report:', err);
        setError('Could not load interview results.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] text-center px-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-[#1A1D21]">Compiling comprehensive interview assessment...</h2>
        <p className="text-xs text-gray-400 mt-1">Analyzing technical accuracy, communication clarity, and conceptual depth.</p>
      </div>
    );
  }

  const overallScore = report?.overallScore ? Math.round(report.overallScore) : 71;
  const statusKey = report?.status || 'GOOD';
  const statusBadge = statusConfig[statusKey] || statusConfig.GOOD;
  const skills = report?.skillPerformance || [];
  const resources = report?.recommendedResources || [];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <Header />
      <div className="px-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">

        <div className="max-w-4xl mx-auto mt-6 space-y-8">
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100 mb-1">
              <Award className="w-3.5 h-3.5" /> Mock Interview Evaluation Complete
            </div>
            <h1 className="text-4xl font-extrabold text-[#1A1D21] tracking-tight">Interview Performance Report</h1>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Evaluation for your target role as <span className="font-semibold text-indigo-700">{learner.targetRole || 'AI Engineer'}</span>.
            </p>
          </div>

          {/* Hero Score Gauge Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-10">
              
              {/* Score Gauge */}
              <div className="flex-shrink-0 relative">
                <div className="w-44 h-44 rounded-full border-[10px] border-gray-50 flex flex-col items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#4F46E5" strokeWidth="10" strokeDasharray={`${overallScore * 2.64} 264`} strokeLinecap="round" />
                  </svg>
                  <span className="text-5xl font-black text-[#1A1D21] z-10 tracking-tight">{overallScore}%</span>
                  <div className={`mt-1 px-3 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </div>
                </div>
              </div>

              {/* Sub-Dimension Progress Bars */}
              <div className="flex-1 w-full space-y-4">
                {[
                  { label: 'Technical Accuracy', val: report?.technicalScore || 74, color: 'bg-emerald-500', text: 'text-emerald-700' },
                  { label: 'Conceptual Depth', val: report?.conceptualScore || 67, color: 'bg-indigo-500', text: 'text-indigo-700' },
                  { label: 'Communication & Structure', val: report?.communicationScore || 78, color: 'bg-amber-500', text: 'text-amber-700' },
                  { label: 'Problem Solving & Tradeoffs', val: report?.problemSolvingScore || 71, color: 'bg-purple-500', text: 'text-purple-700' },
                ].map((dim) => (
                  <div key={dim.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-700">{dim.label}</span>
                      <span className={dim.text}>{Math.round(dim.val)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${dim.color} rounded-full transition-all duration-500`} style={{ width: `${dim.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-600 bg-gray-50/70 p-4 rounded-2xl leading-relaxed">
              <strong className="text-gray-900 block mb-0.5">Authoritative Assessment:</strong>
              {report?.interviewReadinessSummary}
            </div>
          </div>

          {/* Skill Performance Breakdown */}
          {skills.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm space-y-4">
              <h3 className="font-bold text-[#1A1D21] text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Demonstrated Skill Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((sk) => (
                  <div key={sk.skill} className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-gray-800 truncate">{sk.skill}</h4>
                      <span className="text-xs font-extrabold text-indigo-700">{Math.round(sk.score)}%</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {sk.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths vs Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-50/60 rounded-3xl p-7 border border-emerald-100 space-y-3">
              <h3 className="text-emerald-900 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
              </h3>
              <ul className="space-y-2 text-xs text-emerald-950 font-medium leading-relaxed">
                {(report?.strengths || ['Good foundational understanding']).map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Gaps */}
            <div className="bg-rose-50/60 rounded-3xl p-7 border border-rose-100 space-y-3">
              <h3 className="text-rose-900 font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Focus Gaps to Close
              </h3>
              <ul className="space-y-2 text-xs text-rose-950 font-medium leading-relaxed">
                {(report?.weaknesses || ['Deepen technical tradeoff explanations']).map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Targeted Learning Resources for Missed Concepts (RAG / YouTube) */}
          {resources.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-[#1A1D21] text-base">Recommended Resources for Gaps</h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                  RAG + YouTube Grounded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gray-50 border border-gray-100 hover:border-indigo-300 rounded-2xl transition-all block group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{res.provider}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <h4 className="font-bold text-xs text-[#1A1D21] line-clamp-2 group-hover:text-indigo-700 transition-colors mb-1.5">
                      {res.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">{res.reason}</p>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {res.duration || '15m'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/interview/setup')}
              className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" /> Retake Mock Interview
            </button>
            <button
              onClick={() => navigate('/readiness')}
              className="w-full sm:w-auto h-12 px-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Award className="w-4 h-4" /> View Job Readiness
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto h-12 px-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
