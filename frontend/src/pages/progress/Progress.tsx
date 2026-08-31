import { useNavigate } from 'react-router-dom';
import { Target, Clock, BookOpen, Flame, PlayCircle, CheckCircle2, Zap } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function Progress() {
  const navigate = useNavigate();
  const { progress } = useLearner();
  const maxHours = Math.max(...progress.weeklyActivity.map(d => d.hours), 1); // Avoid div by 0

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Progress</h1>
            <p className="text-gray-500 mt-1">Track your learning journey and skill development.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Overall Progress', value: `${progress.overall}%`, icon: Target, bg: 'bg-indigo-50', text: 'text-indigo-700' },
            { label: 'Learning Hours', value: `${progress.learningHours}h`, icon: Clock, bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'Topics Completed', value: progress.topicsCompleted, icon: BookOpen, bg: 'bg-purple-50', text: 'text-purple-700' },
            { label: 'Current Streak', value: `${progress.streak} days`, icon: Flame, bg: 'bg-orange-50', text: 'text-orange-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1A1D21]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            {/* Next Action */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1D21] mb-4">Your Next Best Action</h2>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-3">
                      <Zap className="w-3.5 h-3.5" /> Recommended
                    </span>
                    <h3 className="text-2xl font-bold mb-2">{progress.nextAction.title}</h3>
                    <p className="text-indigo-100 text-sm max-w-md mb-4">{progress.nextAction.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-indigo-200">
                      <span>Est: {progress.nextAction.estimatedMinutes} mins</span>
                      <span>Skill: {progress.nextAction.skillId.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/learning/${progress.nextAction.resourceId}`)} className="h-12 px-6 bg-white text-indigo-700 font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 flex-shrink-0">
                    <PlayCircle className="w-5 h-5" /> Start Learning
                  </button>
                </div>
              </div>
            </section>

            {/* Skill Progress */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1A1D21]">Skill Progress</h2>
                <button onClick={() => navigate('/roadmap')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View Roadmap</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="space-y-6">
                  {progress.skillProgress.map((skill) => (
                    <div key={skill.skillId}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${skill.status === 'locked' ? 'text-gray-400' : 'text-[#1A1D21]'}`}>{skill.name}</span>
                          {skill.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <span className={`text-xs font-bold ${skill.status === 'completed' ? 'text-emerald-600' : skill.status === 'in_progress' ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {skill.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${skill.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${skill.progress}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Weekly Activity */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1D21] mb-4">Weekly Activity</h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-64 flex flex-col justify-end">
                <div className="flex items-end justify-between h-40 gap-2 mb-4">
                  {progress.weeklyActivity.map((day) => {
                    const height = (day.hours / maxHours) * 100;
                    const isToday = day.day === 'Fri';
                    return (
                      <div key={day.day} className="flex flex-col items-center flex-1 gap-2 group">
                        <div className="w-full relative h-full flex items-end justify-center">
                          <div className="absolute -top-8 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {day.hours}h
                          </div>
                          <div 
                            className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${isToday ? 'bg-indigo-600' : day.hours > 0 ? 'bg-indigo-200' : 'bg-gray-100'}`}
                            style={{ height: `${height}%`, minHeight: day.hours > 0 ? '4px' : '2px' }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${isToday ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>{day.day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-4 border-t border-gray-100">
                  <span>Target: 10h/wk</span>
                  <span className="text-indigo-600 font-bold">13h logged</span>
                </div>
              </div>
            </section>

            {/* Milestones */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1D21] mb-4">Milestones</h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
                {progress.milestones.map((ms) => (
                  <div key={ms.id} className="flex items-start gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="mt-0.5">
                      {ms.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : ms.status === 'in_progress' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${ms.status === 'not_started' ? 'text-gray-500' : 'text-[#1A1D21]'}`}>{ms.title}</h3>
                      {ms.completedDate && <p className="text-[11px] text-gray-400 font-medium mt-0.5">Completed {ms.completedDate}</p>}
                      {ms.status === 'in_progress' && <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Current Focus</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
