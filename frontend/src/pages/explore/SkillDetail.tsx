import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Briefcase, BookOpen, Plus, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function SkillDetail() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { skills, resources, addSkillToRoadmap } = useLearner();
  
  const skill = skills.find(s => s.id === skillId) || skills[0];
  const skillResources = resources.filter(r => r.skillId === skill.id || r.relatedSkillId === skill.id);

  function handleAdd() {
    addSkillToRoadmap(skill.id);
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Back */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Explore
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {skill.category}
              </span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${skill.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : skill.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {skill.difficulty}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-[#1A1D21] tracking-tight">{skill.name}</h1>
            <p className="text-lg text-gray-500 mt-2 max-w-3xl">{skill.description}</p>
          </div>
          <div className="flex-shrink-0">
            {skill.inRoadmap ? (
              <button className="h-11 px-6 bg-emerald-50 text-emerald-700 font-semibold rounded-xl border border-emerald-200 flex items-center gap-2 cursor-default">
                <CheckCircle2 className="w-5 h-5" /> In Roadmap
              </button>
            ) : (
              <button onClick={handleAdd} className="h-11 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="w-5 h-5" /> Add to Roadmap
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Visual Preview */}
            <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-[#1A1D21] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Skill Path Preview
              </h2>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-600 overflow-x-auto pb-2 custom-scrollbar">
                {skill.prerequisites.slice(0, 1).map(p => (
                  <div key={p} className="flex items-center gap-4 flex-shrink-0">
                    <span className="px-4 py-2 bg-white rounded-lg border border-gray-200">{p}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
                <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm flex-shrink-0">{skill.name}</span>
                {skill.relatedSkills.length > 0 && (
                  <>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="px-4 py-2 bg-white rounded-lg border border-gray-200 flex-shrink-0">{skill.relatedSkills[0]}</span>
                  </>
                )}
              </div>
            </section>

            {/* Learning Resources */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1D21] mb-4">Recommended Resources</h2>
              {skillResources.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">No direct resources mapped yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {skillResources.map((res) => (
                    <div key={res.id} className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-100 p-5 rounded-2xl hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1A1D21] mb-1 truncate">{res.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{res.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{res.provider}</span>
                          <span className="capitalize">{res.type}</span>
                          <span>★ {res.rating}</span>
                          <span>{res.durationHours ? `${res.durationHours}h` : 'Self-paced'}</span>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/learning/${res.id}`)} className="sm:self-center h-10 px-4 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors whitespace-nowrap">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> Prerequisites
              </h2>
              {skill.prerequisites.length === 0 ? (
                <p className="text-sm text-gray-500">None required.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skill.prerequisites.map((p) => (
                    <span key={p} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Career Paths
              </h2>
              <div className="space-y-2">
                {skill.careerPaths.map((cp) => (
                  <div key={cp} className="flex items-center gap-2 text-sm text-indigo-700 font-medium bg-indigo-50 px-3 py-2 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {cp}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Projects you can build
              </h2>
              <ul className="space-y-3">
                {skill.projects.map((proj) => (
                  <li key={proj.id} className="text-sm">
                    <span className="font-semibold text-[#1A1D21] block mb-0.5">{proj.title}</span>
                    <span className="text-xs text-gray-500">{proj.difficulty} level</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
