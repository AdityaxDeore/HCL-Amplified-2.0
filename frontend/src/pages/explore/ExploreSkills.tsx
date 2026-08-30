import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Star, Zap, AlertCircle } from 'lucide-react';
import { skillCategories } from '../../data/mockSkills';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

function SkillCard({ skill, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Explore ${skill.name}`}
      onClick={() => onClick(skill.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(skill.id)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-[#1A1D21] group-hover:text-indigo-700 transition-colors">{skill.name}</h3>
          <span className="text-xs text-gray-400">{skill.category}</span>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${skill.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : skill.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {skill.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{skill.description}</p>

      {skill.prerequisites.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Prerequisites</p>
          <div className="flex flex-wrap gap-1.5">
            {skill.prerequisites.map((pre) => (
              <span key={pre} className="text-[11px] font-medium px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600">
                {pre}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Career Paths</p>
        <div className="flex flex-wrap gap-1.5">
          {skill.careerPaths.slice(0, 3).map((path) => (
            <span key={path} className="text-[11px] font-medium px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700">
              {path}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        {skill.inRoadmap ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> In Your Roadmap
          </span>
        ) : <div />}
        <button className="ml-auto flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 group-hover:gap-2 transition-all">
          Explore <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ExploreSkills() {
  const navigate = useNavigate();
  const { skills } = useLearner();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, activeCategory]);

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Explore Skills</h1>
          <p className="text-gray-500 mt-1">Discover skills, prerequisites, career paths, and learning opportunities.</p>
        </div>

        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {skillCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-9 px-4 rounded-full text-sm font-semibold transition-all duration-200 border
                ${activeCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="font-semibold text-[#1A1D21]">{filteredSkills.length}</span> skills
        </p>

        {filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No skills match your search.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-3 text-sm text-indigo-600 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onClick={(id) => navigate(`/explore/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
