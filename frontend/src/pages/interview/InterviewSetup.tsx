import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Target, Code, Layout, Users, Shuffle,
  ChevronDown, Check, Clock, PlayCircle, Sparkles, Loader2
} from 'lucide-react';
import { mockInterviewTypes, mockFocusAreas } from '../../data/mockInterview';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { interviewApi } from '../../api/interviewApi';
import { gapApi } from '../../api/gapApi';

const iconMap = {
  code: Code,
  users: Users,
  shuffle: Shuffle,
  layout: Layout,
};

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { learner } = useLearner();
  
  const initialType = searchParams.get('type') || 'mixed';
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedDifficulty, setSelectedDifficulty] = useState('adaptive');
  const [selectedCount, setSelectedCount] = useState(6);
  const [selectedFocus, setSelectedFocus] = useState(['Machine Learning']);
  const [availableSkills, setAvailableSkills] = useState(mockFocusAreas);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGaps() {
      try {
        const gapRes = await gapApi.getGaps();
        if (gapRes?.actionable_gaps && gapRes.actionable_gaps.length > 0) {
          const mapped = gapRes.actionable_gaps.map(g => ({
            id: g.skill_id,
            label: g.skill_name
          }));
          setAvailableSkills(mapped);
          setSelectedFocus(mapped.slice(0, 2).map(m => m.label));
        }
      } catch (err) {
        console.warn('Could not load actionable skill gaps:', err);
      }
    }
    loadGaps();
  }, []);

  const typeObj = mockInterviewTypes.find(t => t.id === selectedType) || mockInterviewTypes[0];
  const Icon = iconMap[typeObj.icon] || Layout;

  function toggleFocus(label) {
    setSelectedFocus(prev => 
      prev.includes(label) 
        ? prev.filter(x => x !== label)
        : [...prev, label]
    );
  }

  async function handleStart() {
    setIsStarting(true);
    setError(null);
    try {
      const session = await interviewApi.startInterview({
        learnerId: learner.id || 'demo-learner',
        targetRole: learner.targetRole || 'AI Engineer',
        interviewType: selectedType,
        difficulty: selectedDifficulty,
        questionCount: selectedCount,
        focusSkills: selectedFocus
      });

      if (session?.id) {
        navigate(`/interview/session/${session.id}`);
      } else {
        setError('Failed to initialize interview session.');
        setIsStarting(false);
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('An error occurred while generating interview questions. Please try again.');
      setIsStarting(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <Header />
      <div className="px-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">

        <button onClick={() => navigate('/interview')} className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-6 mt-4 transition-colors group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Interviews
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Mock Interview Setup</h1>
          <p className="text-gray-500 mt-1 text-sm">Personalize questions to your target role, weak areas, and difficulty preference.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Target Role */}
            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Target Role
              </h2>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 font-bold text-sm">
                {learner.targetRole || 'AI Engineer'}
              </div>
            </section>

            {/* Type & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-600" /> Interview Format
                </h2>
                <div className="space-y-2.5">
                  {[
                    { id: 'mixed', title: 'Mixed Interview', desc: 'Technical & conceptual blend' },
                    { id: 'technical', title: 'Technical Deep-Dive', desc: 'Algorithms & implementation' },
                    { id: 'conceptual', title: 'Conceptual Depth', desc: 'System fundamentals & principles' },
                    { id: 'project', title: 'Project & System Design', desc: 'Architecture & tradeoffs' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${selectedType === t.id ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                    >
                      <div>
                        <span className={`text-xs font-bold block ${selectedType === t.id ? 'text-indigo-900' : 'text-gray-800'}`}>{t.title}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{t.desc}</span>
                      </div>
                      {selectedType === t.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-orange-600" /> Difficulty & Length
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Difficulty Curve</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                      {[
                        { id: 'adaptive', label: 'Adaptive' },
                        { id: 'beginner', label: 'Easy' },
                        { id: 'intermediate', label: 'Medium' },
                        { id: 'advanced', label: 'Hard' }
                      ].map(d => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDifficulty(d.id)}
                          className={`flex-1 py-1.5 rounded-lg transition-all ${selectedDifficulty === d.id ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
                      <span>Question Count:</span>
                      <strong className="text-indigo-700">{selectedCount} Questions</strong>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={selectedCount}
                      onChange={(e) => setSelectedCount(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                      <span>3 (Quick Check)</span>
                      <span>6 (Recommended)</span>
                      <span>10 (Full Session)</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Focus Skills */}
            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-purple-600" /> Focus Topics (Prioritizes Weak Areas)
                </h2>
                <span className="text-[10px] text-gray-400 font-medium">{selectedFocus.length} selected</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSkills.map(area => {
                  const isSelected = selectedFocus.includes(area.label);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleFocus(area.label)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                    >
                      {area.label}
                    </button>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Session Summary Card */}
          <div className="space-y-6">
            <section className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-3xl border border-indigo-100 p-6 sticky top-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-indigo-900 mb-1">Session Summary</h2>
              <p className="text-xs text-indigo-700 mb-6">AI will dynamically calibrate follow-up questions to your responses.</p>
              
              <ul className="space-y-3 mb-6 border-y border-indigo-100 py-4 text-xs">
                <li className="flex items-center justify-between text-indigo-900">
                  <span className="text-gray-500">Role:</span>
                  <strong>{learner.targetRole || 'AI Engineer'}</strong>
                </li>
                <li className="flex items-center justify-between text-indigo-900">
                  <span className="text-gray-500">Format:</span>
                  <strong className="capitalize">{selectedType}</strong>
                </li>
                <li className="flex items-center justify-between text-indigo-900">
                  <span className="text-gray-500">Length:</span>
                  <strong>{selectedCount} Questions ({selectedDifficulty})</strong>
                </li>
                <li className="flex items-center justify-between text-indigo-900">
                  <span className="text-gray-500">Est. Duration:</span>
                  <strong>~{selectedCount * 3} mins</strong>
                </li>
              </ul>

              <button 
                onClick={handleStart}
                disabled={isStarting}
                className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Start Mock Interview</span>
                  </>
                )}
              </button>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
