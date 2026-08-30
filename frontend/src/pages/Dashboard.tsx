import { useNavigate } from 'react-router-dom';
import { PlayCircle, Target, BookOpen, ChevronRight, Zap, Star } from 'lucide-react';
import Header from '../components/layout/Header';
import { useLearner } from '../context/LearnerContext';

function ProgressRing({ progress, label }) {
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { learner, roadmapNodes, resources, progress } = useLearner();
  
  const currentSkill = roadmapNodes.find(n => n.status === 'in_progress') || roadmapNodes[0];
  const nextResource = resources.find(r => r.relatedSkillId === currentSkill.skillId) || resources[0];

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Welcome back, {learner.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">You're making great progress towards becoming an {learner.targetRole}.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Current Focus Banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4" />
              
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-4 border border-white/10">
                  <Target className="w-3.5 h-3.5" /> Current Focus
                </span>
                <h2 className="text-3xl font-bold mb-2">{currentSkill.title}</h2>
                <p className="text-indigo-100 max-w-md mb-8">{currentSkill.description || 'Continue your learning journey.'}</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate('/roadmap')} className="h-12 px-6 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    View Roadmap <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(`/learning/${nextResource.id}`)} className="h-12 px-6 bg-indigo-500/30 text-white border border-indigo-400/50 font-bold rounded-xl hover:bg-indigo-500/50 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
                    <PlayCircle className="w-5 h-5" /> Resume Learning
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Learning */}
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
            
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1A1D21] mb-6">Learning Activity</h2>
              <div className="flex justify-center mb-6">
                <ProgressRing progress={progress.overall} label="Overall" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">Current Streak</span>
                  </div>
                  <span className="font-bold text-[#1A1D21]">{progress.streak} days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">Topics Done</span>
                  </div>
                  <span className="font-bold text-[#1A1D21]">{progress.topicsCompleted}</span>
                </div>
              </div>
            </div>

            {/* Next Milestone */}
            <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-6">
              <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Next Milestone
              </h2>
              <div className="space-y-1">
                <h3 className="font-bold text-indigo-900">{progress.nextAction.title}</h3>
                <p className="text-sm text-indigo-700">{progress.nextAction.description}</p>
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
