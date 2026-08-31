import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save, Check } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function Goals() {
  const navigate = useNavigate();
  const { learner, updateLearnerProfile } = useLearner();
  
  const [goal, setGoal] = useState(learner.primaryGoal || learner.goal || 'Become an AI Engineer');
  const [role, setRole] = useState(learner.targetRole || 'AI Engineer');
  const [months, setMonths] = useState(learner.targetMonths || 4);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (learner) {
      setGoal(learner.primaryGoal || learner.goal || 'Become an AI Engineer');
      setRole(learner.targetRole || 'AI Engineer');
      setMonths(learner.targetMonths || 4);
    }
  }, [learner]);

  async function handleSave() {
    await updateLearnerProfile({ primaryGoal: goal, goal, targetRole: role, targetMonths: months });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Goals & Timeline</h1>
          <p className="text-gray-500 mt-1">Define what you want to achieve.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm max-w-2xl">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
            <Target className="w-6 h-6" />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1A1D21] mb-2">Primary Goal Statement</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none text-gray-700 resize-none"
                placeholder="What do you want to achieve?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1D21] mb-2">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none text-gray-700 appearance-none bg-white"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1D21] mb-2">Target Timeline (Months)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="w-12 text-center font-bold text-indigo-600 bg-indigo-50 py-1 rounded-lg">{months}</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={handleSave}
                className={`h-12 px-8 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {saved ? <><Check className="w-5 h-5" /> Saved</> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
