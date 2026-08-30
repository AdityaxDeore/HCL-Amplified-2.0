import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Target,
  BookOpen,
  ChevronRight,
  Zap,
  Star,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  FileText,
  Layers
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useLearner } from '../context/LearnerContext';

function CircularReadinessGauge({ score, size = 110, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EEF2F6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#readinessGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">{score}%</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Readiness</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { learner, roadmapNodes, resources, progress } = useLearner();

  const currentSkill = roadmapNodes.find((n) => n.status === 'in_progress') || roadmapNodes[0];
  const nextResource = resources.find((r) => r.relatedSkillId === currentSkill.skillId) || resources[0];
  const completedNodesCount = roadmapNodes.filter((n) => n.status === 'completed').length;
  const inProgressCount = roadmapNodes.filter((n) => n.status === 'in_progress').length;

  const resourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-indigo-600" />;
      case 'article':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <Header />
      <div className="px-6 sm:px-8 pb-10 flex-1 overflow-y-auto custom-scrollbar">

        {/* Welcome Header */}
        <div className="pt-2 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {learner.name.split(' ')[0]} 👋
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Goal: Target Role</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {learner.targetRole}
              </span>
              <span className="text-slate-300">&bull;</span>
              <span>{learner.targetMonths} Month Roadmap</span>
              <span className="text-slate-300">&bull;</span>
              <span>{learner.availableHoursPerWeek} hrs/week planned</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/interview')}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Mock Interview
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className="px-4 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-100"
            >
              <Target className="w-3.5 h-3.5" />
              My Roadmap
            </button>
          </div>
        </div>

        {/* Top 4 Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Overall Progress */}
          <div
            onClick={() => navigate('/progress')}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100">
                Phase {Math.min(Math.ceil((completedNodesCount + 1) / 3), 4)}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{progress.overall}%</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Overall Path Completion</div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${progress.overall}%` }}
              />
            </div>
          </div>

          {/* Card 2: Learning Streak */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-amber-200 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-100">
                Active
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{progress.streak} Days</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Continuous Study Streak</div>
            <div className="mt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>🔥 Top 10% active learners</span>
            </div>
          </div>

          {/* Card 3: Learning Hours */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100">
                {learner.availableHoursPerWeek}h / wk goal
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{progress.learningHours} hrs</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Total Time Invested</div>
            <div className="mt-3 text-[11px] font-semibold text-slate-500">
              {progress.weeklyActivity?.[progress.weeklyActivity.length - 1]?.hours || 2}h logged this week
            </div>
          </div>

          {/* Card 4: Topics Mastered */}
          <div
            onClick={() => navigate('/roadmap')}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-full border border-purple-100">
                {inProgressCount} In Progress
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {progress.topicsCompleted} <span className="text-sm font-semibold text-slate-400">/ {roadmapNodes.length}</span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Roadmap Nodes Completed</div>
            <div className="mt-3 text-[11px] font-semibold text-indigo-600 group-hover:underline flex items-center gap-0.5">
              <span>View roadmap progress</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Main 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left / Main Column (7 Cols) */}
          <div className="xl:col-span-7 space-y-8">

            {/* AI Hero Focus Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 border border-indigo-700/50">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/20 to-indigo-400/0 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/3" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/20 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Current Focus &bull; {currentSkill.category}
                  </span>
                  <span className="text-xs font-medium text-indigo-200/90 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-300" /> ~{currentSkill.estimatedWeeks || 2} weeks estimated
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  {currentSkill.title}
                </h2>
                <p className="text-indigo-100/90 text-sm leading-relaxed max-w-xl mb-6">
                  {currentSkill.description || 'Master key principles, practical implementations, and real-world patterns required for this milestone.'}
                </p>

                {/* Next Best Action Callout Strip inside Hero */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-300/30">
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">Next Action Recommended</div>
                      <div className="text-sm font-bold text-white">{progress.nextAction?.title || 'Complete Practice Module'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-indigo-200/80 font-medium sm:text-right flex-shrink-0">
                    <span>{progress.nextAction?.estimatedMinutes || 45} mins</span>
                  </div>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/learning/${nextResource.id}`)}
                    className="h-11 px-6 bg-white text-indigo-950 font-bold text-sm rounded-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-950/20"
                  >
                    <PlayCircle className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                    Resume Learning
                  </button>
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    View Roadmap
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Learning Resources */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recommended Learning</h2>
                  <p className="text-xs text-slate-400 font-medium">Curated for your current skill gap</p>
                </div>
                <button
                  onClick={() => navigate('/learning')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  View All Hub <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.slice(0, 2).map((res) => (
                  <div
                    key={res.id}
                    onClick={() => navigate(`/learning/${res.id}`)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:border-indigo-300/80 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          {resourceIcon(res.type)}
                          <span>{res.provider}</span>
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {res.rating}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {res.description || res.whyRecommended || 'Structured curriculum tailored to your milestone.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-slate-600 font-semibold">{res.type}</span>
                        {res.durationHours && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{res.durationHours} hrs</span>
                          </>
                        )}
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className={res.difficulty === 'Beginner' ? 'text-emerald-600 font-semibold' : 'text-indigo-600 font-semibold'}>
                          {res.difficulty || 'Intermediate'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols) */}
          <div className="xl:col-span-5 space-y-6">

            {/* Career Readiness Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Role Readiness</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Target: {learner.targetRole}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/interview')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Simulate &rarr;
                </button>
              </div>

              <div className="flex items-center gap-6 py-2">
                <CircularReadinessGauge score={learner.readiness || 76} size={104} strokeWidth={9} />

                <div className="flex-1 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Technical Depth</span>
                      <span className="text-slate-900">82%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Problem Solving</span>
                      <span className="text-slate-900">74%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Applied Projects</span>
                      <span className="text-slate-900">70%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate('/interview/setup')}
                  className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Take Readiness Assessment
                </button>
              </div>
            </div>

            {/* Upcoming Roadmap Milestones */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Upcoming Milestones
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {completedNodesCount}/{roadmapNodes.length} Done
                </span>
              </div>

              <div className="space-y-3">
                {roadmapNodes.slice(0, 4).map((node, index) => {
                  const isDone = node.status === 'completed';
                  const isCurrent = node.status === 'in_progress';

                  return (
                    <div
                      key={node.id || index}
                      onClick={() => navigate('/roadmap')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? 'bg-indigo-50/70 border-indigo-200/80 shadow-2xs'
                          : isDone
                          ? 'bg-slate-50/60 border-slate-200/60 text-slate-500'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-950' : 'text-slate-800'}`}>
                            {node.title}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {node.category} &bull; {node.estimatedHours || 12}h
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        node.importance === 'mandatory'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {node.importance || 'Core'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto"
                >
                  Open Full Interactive Roadmap <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Assistant Quick Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Need help studying?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ask your AI tutor to explain any concept or generate practice quizzes.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/assistant')}
                className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-2xs flex-shrink-0"
              >
                Chat Now
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

