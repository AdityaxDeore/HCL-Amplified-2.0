import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, Home } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function InterviewResults() {
  const navigate = useNavigate();
  const { learner } = useLearner();

  // Mock results data
  const results = {
    score: 84,
    technical: 88,
    communication: 78,
    problemSolving: 82,
    strengths: [
      'Strong understanding of supervised learning algorithms.',
      'Clear explanation of the bias-variance tradeoff.',
      'Good code structure in the implementation question.'
    ],
    weaknesses: [
      'Struggled slightly with hyperparameter tuning concepts.',
      'Could provide more concrete real-world examples.'
    ],
    nextSteps: [
      { id: 'model-evaluation', title: 'Model Evaluation & Validation', type: 'Topic' },
      { id: 'advanced-ml', title: 'Advanced Hyperparameter Tuning', type: 'Project' }
    ]
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="max-w-4xl mx-auto mt-8">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#1A1D21] tracking-tight mb-4">Interview Complete</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Great job! Here is your AI-generated feedback and performance analysis for the {learner.targetRole} role.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-indigo-100/20 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              
              <div className="flex-shrink-0 relative">
                <div className="w-48 h-48 rounded-full border-[12px] border-gray-50 flex flex-col items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#4F46E5" strokeWidth="12" strokeDasharray={`${results.score * 2.76} 276`} strokeLinecap="round" />
                  </svg>
                  <span className="text-5xl font-black text-[#1A1D21] z-10">{results.score}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider z-10 mt-1">Overall</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-gray-700">Technical Accuracy</span>
                    <span className="text-emerald-600">{results.technical}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{width: `${results.technical}%`}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-gray-700">Problem Solving</span>
                    <span className="text-indigo-600">{results.problemSolving}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: `${results.problemSolving}%`}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-gray-700">Communication</span>
                    <span className="text-amber-600">{results.communication}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{width: `${results.communication}%`}} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
              <h2 className="text-emerald-800 font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Key Strengths
              </h2>
              <ul className="space-y-3">
                {results.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-emerald-900 text-sm font-medium">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100">
              <h2 className="text-rose-800 font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {results.weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-rose-900 text-sm font-medium">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1D21] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Recommended Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.nextSteps.map(step => (
                <div key={step.id} className="p-4 border border-gray-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">{step.type}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <div className="flex items-center text-xs font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">
                    Add to Roadmap <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <button onClick={() => navigate('/roadmap')} className="h-12 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Target className="w-5 h-5" /> View Updated Roadmap
            </button>
            <button onClick={() => navigate('/dashboard')} className="h-12 px-8 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Home className="w-5 h-5" /> Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
