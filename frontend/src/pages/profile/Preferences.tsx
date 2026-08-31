import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, Save, Check } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function Preferences() {
  const navigate = useNavigate();
  const { learner, updateLearnerProfile } = useLearner();
  
  const [hours, setHours] = useState(learner.availableHoursPerWeek || learner.hoursPerWeek || 10);
  const [interests, setInterests] = useState(learner.interests || []);
  const [saved, setSaved] = useState(false);

  const availableInterests = [
    'Computer Vision', 'NLP', 'Robotics', 'Generative AI', 'Data Analysis', 
    'Web Development', 'Cloud Computing', 'Game Dev', 'Artificial Intelligence', 'Machine Learning'
  ];

  useEffect(() => {
    if (learner) {
      setHours(learner.availableHoursPerWeek || learner.hoursPerWeek || 10);
      setInterests(learner.interests || []);
    }
  }, [learner]);

  function toggleInterest(i) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  async function handleSave() {
    await updateLearnerProfile({ availableHoursPerWeek: hours, hoursPerWeek: hours, interests });
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
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Availability & Interests</h1>
          <p className="text-gray-500 mt-1">Personalize how and what you learn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          
          {/* Availability */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-bold text-[#1A1D21] mb-6">Study Time</h2>
            <div>
              <label className="block text-sm font-bold text-[#1A1D21] mb-2">Available Hours per Week</label>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <span className="w-12 text-center font-bold text-amber-600 bg-amber-50 py-1 rounded-lg">{hours}h</span>
              </div>
              <p className="text-sm text-gray-500">Based on your {learner.targetMonths || 4}-month timeline, we recommend at least 10 hours/week.</p>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-bold text-[#1A1D21] mb-6">Topics of Interest</h2>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isSelected ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="mt-8 flex items-center justify-end max-w-4xl">
          <button
            onClick={handleSave}
            className={`h-12 px-8 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {saved ? <><Check className="w-5 h-5" /> Saved</> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </div>

      </div>
    </div>
  );
}
