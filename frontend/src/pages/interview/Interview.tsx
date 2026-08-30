import { useNavigate } from 'react-router-dom';
import { Mic, Target, Zap, Layout, Code, Users, Shuffle, ChevronRight, PlayCircle } from 'lucide-react';
import { mockInterviewTypes } from '../../data/mockInterview';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

const iconMap = {
  code: Code,
  users: Users,
  shuffle: Shuffle,
  layout: Layout,
};

function ClockIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

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
          <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> {type.estimatedMinutes}m</span>
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

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">AI Interview Simulator</h1>
          <p className="text-gray-500 mt-1">Practice for your target role with personalized mock interviews.</p>
        </div>

        <div className="bg-gradient-to-br from-[#1A1D21] to-[#2D3139] rounded-[32px] p-8 mb-10 text-white relative overflow-hidden shadow-xl shadow-gray-200">
          <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4 border border-white/10">
                <Target className="w-3.5 h-3.5" /> Target Role: {learner.targetRole}
              </span>
              <h2 className="text-4xl font-bold mb-2">Interview Readiness</h2>
              <p className="text-gray-300 max-w-md mx-auto md:mx-0">Based on your completed learning modules, mock interviews, and technical assessments.</p>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray={`${learner.readiness * 2.83} 283`} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold">{learner.readiness}%</span>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Ready</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { label: 'Technical Knowledge', value: 82 },
                { label: 'Communication', value: 76 },
                { label: 'Problem Solving', value: 74 },
                { label: 'Conceptual Depth', value: 79 },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-xl border border-white/10 p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{stat.value}%</span>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{width: `${stat.value}%`}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between bg-indigo-50 border border-indigo-100 rounded-2xl p-6 gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-amber-500">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900 mb-1">Recommended Next: Technical Interview</h3>
              <p className="text-sm text-indigo-700 font-medium">Focus: Machine Learning, Python, Model Evaluation. 30 mins.</p>
            </div>
          </div>
          <button onClick={() => navigate('/interview/setup')} className="w-full sm:w-auto h-12 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm flex-shrink-0">
            <PlayCircle className="w-5 h-5" /> Start Now
          </button>
        </div>

        <h2 className="text-xl font-bold text-[#1A1D21] mb-6">Interview Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockInterviewTypes.map((type, idx) => (
            <InterviewTypeCard key={type.id} type={type} onClick={() => navigate('/interview/setup')} recommended={idx === 0} />
          ))}
        </div>

      </div>
    </div>
  );
}
