import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Clock, Zap, Map, ChevronRight, Edit3 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function Profile() {
  const navigate = useNavigate();
  const { learner } = useLearner();

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Learner Profile</h1>
          <p className="text-gray-500 mt-1">Manage your identity, goals, and learning preferences.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200 border-4 border-white">
              {learner.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A1D21] mb-1">{learner.name}</h2>
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                <span className="flex items-center gap-1"><Map className="w-4 h-4 text-indigo-500" /> {learner.targetRole}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /> {learner.targetMonths} Month Timeline</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <button onClick={() => navigate('/profile/goals')} className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <Target className="w-5 h-5" /> Goals & Timeline
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-2 line-clamp-2">{learner.primaryGoal}</p>
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Role: {learner.targetRole}</span>
              </div>
            </button>

            <button onClick={() => navigate('/profile/skills')} className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:indigo-300 transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Zap className="w-5 h-5" /> Current Skills
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="flex flex-wrap gap-2">
                {learner.currentSkills.slice(0, 4).map(skill => (
                  <span key={skill.skillId} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">
                    {skill.name}
                  </span>
                ))}
                {learner.currentSkills.length > 4 && (
                  <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-400">
                    +{learner.currentSkills.length - 4} more
                  </span>
                )}
              </div>
            </button>

            <button onClick={() => navigate('/profile/preferences')} className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                  <BookOpen className="w-5 h-5" /> Availability & Interests
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
              </div>
              <div className="text-sm text-gray-600 font-medium mb-3">
                <span className="text-purple-600 font-bold">{learner.availableHoursPerWeek}</span> hours per week
              </div>
              <div className="flex flex-wrap gap-1.5">
                {learner.interests.map(interest => (
                  <span key={interest} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-purple-100">
                    {interest}
                  </span>
                ))}
              </div>
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1D21]">Application Settings</h2>
                <button onClick={() => navigate('/settings')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  Manage <Edit3 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Theme Preferences</h3>
                    <p className="text-xs text-gray-500">System Default</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Notifications</h3>
                    <p className="text-xs text-gray-500">Email, Push Enabled</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Data & Privacy</h3>
                    <p className="text-xs text-gray-500">Manage your learning data</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
