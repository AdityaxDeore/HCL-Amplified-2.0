import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Target, Zap, Layout, Code, Users, Shuffle,
  ChevronRight, PlayCircle, Award, Sparkles, Clock, Calendar
} from 'lucide-react';
import { mockInterviewTypes } from '../../data/mockInterview';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { readinessApi } from '../../api/readinessApi';
import { interviewApi } from '../../api/interviewApi';

const iconMap = {
  code: Code,
  users: Users,
  shuffle: Shuffle,
  layout: Layout,
};

function InterviewTypeCard({ type, onClick, recommended = false }) {
  const Icon = iconMap[type.icon] || Layout;
  
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Start ${type.title}`}
      onClick={() => onClick(type.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(type.id)}
      className={`relative bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden ${recommended ? 'border-indigo-300 shadow-sm shadow-indigo-100' : 'border-gray-100'}`}
    >
      {recommended && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-2xl">
          Recommended
        </div>
      )}
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${recommended ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-lg font-bold text-[#1A1D21] mb-2 group-hover:text-indigo-700 transition-colors">{type.title}</h3>
      <p className="text-sm text-gray-500 mb-6 line-clamp-2">{type.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {type.estimatedMinutes}m</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className={type.difficulty === 'Beginner' ? 'text-emerald-600' : type.difficulty === 'Advanced' ? 'text-rose-600' : 'text-amber-600'}>{type.difficulty}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
        </div>
      </div>
    </div>
  );
}

export default function Interview() {
  const navigate = useNavigate();
  const { learner } = useLearner();

  const [readinessData, setReadinessData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [readRes, histRes] = await Promise.allSettled([
          readinessApi.getReadiness(learner.id || 'demo-learner'),
          interviewApi.getHistory(learner.id || 'demo-learner')
        ]);
        if (readRes.status === 'fulfilled' && readRes.value) {
          setReadinessData(readRes.value);
        }
        if (histRes.status === 'fulfilled' && Array.isArray(histRes.value)) {
          setHistory(histRes.value);
        }
      } catch (err) {
        console.warn('Interview landing page data notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [learner.id]);

  const readinessScore = readinessData?.score ? Math.round(readinessData.score) : 68;
  const isInterviewReady = readinessData?.interviewReady || false;
  const latestSession = history[0];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <Header />
      <div className="px-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">

        {/* Page Header */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Mic className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">AI Interview Simulator</h1>
          </div>
          <p className="text-gray-500 mt-1.5 text-sm">
            Practice explaining what you know — not just completing courses — with personalized, role-grounded technical questions.
          </p>
        </div>

        {/* Pre-Interview Readiness Banner */}
        <div className="bg-gradient-to-br from-[#1A1D21] to-[#2D3139] rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
          <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left flex-1 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 uppercase tracking-wider border border-white/10">
                <Target className="w-3.5 h-3.5" /> Target Role: {learner.targetRole || 'AI Engineer'}
              </span>
              <h2 className="text-3xl font-bold">Estimated Learning Readiness</h2>
              <p className="text-gray-300 text-sm max-w-md">
                {isInterviewReady 
                  ? 'Your learning foundations are strong! A mock interview will evaluate your ability to articulate concepts and solve problems live.'
                  : 'Your learning readiness is developing. Practice in simulation mode to discover hidden conceptual gaps before real interviews.'}
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="8"
                    strokeDasharray={`${readinessScore * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold">{readinessScore}%</span>
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Readiness</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/interview/setup')}
                className="h-12 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <PlayCircle className="w-4 h-4" /> Start Mock Interview
              </button>
            </div>
          </div>
        </div>

        {/* Latest Interview Performance Summary (if any) */}
        {latestSession?.finalReport && (
          <div className="mb-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Latest Performance</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                  {latestSession.finalReport.status}
                </span>
              </div>
              <h3 className="font-bold text-lg text-[#1A1D21]">
                Demonstrated Score: {Math.round(latestSession.finalReport.overallScore)}%
              </h3>
              <p className="text-xs text-gray-500">
                Technical: {latestSession.finalReport.technicalScore}% · Conceptual: {latestSession.finalReport.conceptualScore}% · Communication: {latestSession.finalReport.communicationScore}%
              </p>
            </div>

            <button
              onClick={() => navigate(`/interview/results/${latestSession.id}`)}
              className="px-5 py-2.5 bg-gray-50 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs border border-gray-200 transition-colors flex items-center gap-2"
            >
              <span>View Full Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Interview Types */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1A1D21] mb-4">Choose Interview Format</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mockInterviewTypes.map((type, idx) => (
              <InterviewTypeCard
                key={type.id}
                type={type}
                onClick={() => navigate(`/interview/setup?type=${type.id}`)}
                recommended={idx === 0}
              />
            ))}
          </div>
        </div>

        {/* Past Interview History Table */}
        {history.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1A1D21] text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> Past Interview History
              </h3>
              <span className="text-xs text-gray-400 font-semibold">{history.length} completed</span>
            </div>

            <div className="divide-y divide-gray-100">
              {history.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => navigate(`/interview/results/${sess.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-gray-50 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800 block">
                      {sess.targetRole} ({sess.interviewType.toUpperCase()})
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {sess.completedAt ? new Date(sess.completedAt).toLocaleDateString() : 'Recent'} · {sess.questionCount} Questions
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-indigo-700">
                      {sess.finalReport ? `${Math.round(sess.finalReport.overallScore)}%` : 'Completed'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
