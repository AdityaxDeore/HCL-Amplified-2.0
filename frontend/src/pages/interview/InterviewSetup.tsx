import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Code, Layout, Users, Shuffle, ChevronDown, Check, Clock, PlayCircle } from 'lucide-react';
import { mockInterviewTypes, mockFocusAreas } from '../../data/mockInterview';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

const iconMap = {
  code: Code,
  users: Users,
  shuffle: Shuffle,
  layout: Layout,
};

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { learner } = useLearner();
  
  const [selectedType, setSelectedType] = useState('technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedCount, setSelectedCount] = useState(5);
  const [selectedFocus, setSelectedFocus] = useState(['machine-learning']);

  const type = mockInterviewTypes.find(t => t.id === selectedType) || mockInterviewTypes[0];
  const Icon = iconMap[type.icon] || Layout;

  function toggleFocus(id) {
    setSelectedFocus(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }

  function handleStart() {
    navigate('/interview/session/demo-session');
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <button onClick={() => navigate('/interview')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Interviews
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Interview Setup</h1>
          <p className="text-gray-500 mt-1">Configure your mock interview parameters.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Target Role */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1D21] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Target Role
              </h2>
              <div className="relative">
                <select className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold appearance-none outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400">
                  <option value={learner.targetRole}>{learner.targetRole}</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </section>

            {/* Type & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-[#1A1D21] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-600" /> Interview Type
                </h2>
                <div className="space-y-3">
                  {mockInterviewTypes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${selectedType === t.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                    >
                      <span className={`font-semibold ${selectedType === t.id ? 'text-indigo-900' : 'text-gray-700'}`}>{t.title}</span>
                      {selectedType === t.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-[#1A1D21] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-orange-600" /> Difficulty & Length
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Difficulty</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                        <button
                          key={d}
                          onClick={() => setSelectedDifficulty(d)}
                          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${selectedDifficulty === d ? 'bg-white text-[#1A1D21] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Number of Questions: {selectedCount}</label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={selectedCount}
                      onChange={(e) => setSelectedCount(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                      <span>3 (Short)</span>
                      <span>10 (Full)</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Focus Areas */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1D21] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-purple-600" /> Focus Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {mockFocusAreas.map(area => {
                  const isSelected = selectedFocus.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleFocus(area.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                    >
                      {area.label}
                    </button>
                  );
                })}
              </div>
              {selectedFocus.length === 0 && (
                <p className="text-xs text-rose-500 mt-2 font-medium">Please select at least one focus area.</p>
              )}
            </section>

          </div>

          <div className="space-y-6">
            <section className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 sticky top-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-indigo-900 mb-2">Session Summary</h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="font-semibold w-24 flex-shrink-0">Role:</span>
                  <span>{learner.targetRole}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="font-semibold w-24 flex-shrink-0">Type:</span>
                  <span>{type.title}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="font-semibold w-24 flex-shrink-0">Format:</span>
                  <span>{selectedCount} Questions ({selectedDifficulty})</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="font-semibold w-24 flex-shrink-0">Focus:</span>
                  <span>{selectedFocus.length} topics selected</span>
                </li>
              </ul>
              
              <div className="bg-white/60 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-indigo-900 font-bold mb-1">
                  <span>Estimated Time</span>
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedCount * 5} mins</div>
                </div>
              </div>

              <button 
                onClick={handleStart}
                disabled={selectedFocus.length === 0}
                className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayCircle className="w-5 h-5" /> Start Interview Session
              </button>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
