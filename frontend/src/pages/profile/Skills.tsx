import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function Skills() {
  const navigate = useNavigate();
  const { learner, updateLearnerProfile } = useLearner();
  const [skills, setSkills] = useState(learner.currentSkills || []);
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');

  async function handleAdd() {
    if (!newSkill.trim()) return;
    const updated = [...skills, { skillId: newSkill.toLowerCase().replace(/\s+/g, '-'), name: newSkill.trim(), level: newLevel }];
    setSkills(updated);
    setNewSkill('');
    await updateLearnerProfile({ currentSkills: updated });
  }

  async function handleRemove(id) {
    const updated = skills.filter(s => s.skillId !== id);
    setSkills(updated);
    await updateLearnerProfile({ currentSkills: updated });
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
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Current Skills</h1>
          <p className="text-gray-500 mt-1">Manage the skills you already know.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm max-w-2xl">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <Code className="w-6 h-6" />
          </div>

          <div className="space-y-4 mb-8">
            {skills.map(skill => (
              <div key={skill.skillId} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-[#1A1D21]">{skill.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">{skill.level}</span>
                  <button onClick={() => handleRemove(skill.skillId)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-[#1A1D21] mb-3">Add Skill</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. React"
                className="flex-1 h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none text-gray-700 bg-white"
              />
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="w-40 h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none text-gray-700 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                onClick={handleAdd}
                disabled={!newSkill.trim()}
                className="h-12 px-6 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Plus className="w-5 h-5" /> Add
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
