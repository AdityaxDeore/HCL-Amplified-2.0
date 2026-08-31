import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronRight, Star, Zap, AlertCircle,
  Route, ArrowRight, Loader2, Compass, CheckCircle2, Sparkles,
  Layers, ShieldAlert, BookOpen
} from 'lucide-react';
import { skillCategories } from '../../data/mockSkills';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { skillsApi } from '../../api/skillsApi';
import { gapApi } from '../../api/gapApi';

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
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
          skill.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          skill.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {skill.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{skill.description}</p>

      {skill.prerequisites && skill.prerequisites.length > 0 && (
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

      {skill.careerPaths && skill.careerPaths.length > 0 && (
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
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
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
  const { learner, skills } = useLearner();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Path Finder State
  const [showPathFinder, setShowPathFinder] = useState(false);
  const [pathSource, setPathSource] = useState('python');
  const [pathTarget, setPathTarget] = useState('generative-ai');
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Skill Gap State
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.aliases && s.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, activeCategory]);

  async function handleFindPath() {
    if (!pathSource || !pathTarget) return;
    setPathLoading(true);
    try {
      const res = await skillsApi.getPath(pathSource, pathTarget);
      setPathResult(res);
    } catch (err) {
      console.error('Failed to find skill path:', err);
      setPathResult({ reachable: false, path: [], steps: 0 });
    } finally {
      setPathLoading(false);
    }
  }

  async function handleLoadGaps() {
    if (gapData) return;
    setGapLoading(true);
    try {
      const res = await gapApi.getGaps(learner.id || 'demo-learner', learner.targetRole);
      setGapData(res);
    } catch (err) {
      console.error('Failed to load skill gaps:', err);
    } finally {
      setGapLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Top Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Explore Skills & Ontology</h1>
            <p className="text-gray-500 mt-1">Discover skill relationships, prerequisite chains, and personalized skill gap audits.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => {
                setShowGapAnalysis(!showGapAnalysis);
                if (!showGapAnalysis) handleLoadGaps();
              }}
              className={`h-10 px-4 border font-bold text-sm rounded-xl transition-colors flex items-center gap-2 ${
                showGapAnalysis ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              {showGapAnalysis ? 'Hide Gap Audit' : 'Skill Gap Audit'}
            </button>
            <button
              onClick={() => {
                setShowPathFinder(!showPathFinder);
                if (!showPathFinder && !pathResult) handleFindPath();
              }}
              className="h-10 px-4 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Route className="w-4 h-4 text-indigo-600" />
              {showPathFinder ? 'Close Path Finder' : 'Skill Path Finder'}
            </button>
          </div>
        </div>

        {/* Skill Gap Analysis Banner / Card */}
        {showGapAnalysis && (
          <div className="bg-white border border-indigo-100 rounded-3xl p-6 mb-8 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-[#1A1D21]">Personalized Skill Gap Audit ({learner.targetRole || 'AI Engineer'})</h2>
              </div>
              {gapLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
            </div>

            {gapData && gapData.summary && (
              <div className="space-y-6">
                {/* Summary Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Verified Known</span>
                    <span className="text-xl font-bold text-emerald-900">{gapData.summary.known_skills_count} skills</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Actionable Gaps</span>
                    <span className="text-xl font-bold text-amber-900">{gapData.actionable_gaps?.length || 0} skills</span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">Blocked Dependencies</span>
                    <span className="text-xl font-bold text-rose-900">{gapData.summary.blocked_gaps_count} skills</span>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Workload Estimate</span>
                    <span className="text-xl font-bold text-purple-900">{gapData.summary.total_estimated_gap_hours} hrs</span>
                  </div>
                </div>

                {/* Verified Known Skills Section */}
                {gapData.known_skills && gapData.known_skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Known Competencies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {gapData.known_skills.map(k => (
                        <div key={k.skill_id} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {k.name}
                          <span className="text-[10px] uppercase bg-emerald-200/60 px-1.5 py-0.2 rounded font-bold text-emerald-900">
                            {k.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Actionable & Blocked Gaps List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Actionable */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Actionable Next Skills</h4>
                    <div className="space-y-2">
                      {(gapData.actionable_gaps || []).slice(0, 4).map(g => (
                        <div key={g.skill_id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-start justify-between gap-2 shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{g.skill_name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                {g.gap_type}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{g.reason}</p>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">{g.estimated_hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blocked Gaps */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Blocked Prerequisites
                    </h4>
                    <div className="space-y-2">
                      {(gapData.blocked_gaps || []).slice(0, 4).map(g => (
                        <div key={g.skill_id} className="p-3 bg-white rounded-xl border border-rose-100 flex items-start justify-between gap-2 shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{g.skill_name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                BLOCKED
                              </span>
                            </div>
                            <p className="text-xs text-rose-600 mt-0.5">Blocked by: {g.blocking_skills?.join(', ') || 'prerequisites'}</p>
                          </div>
                          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{g.estimated_hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Skill Path Finder Card */}
        {showPathFinder && (
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100 rounded-3xl p-6 mb-8 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-[#1A1D21]">Skill Learning Path Finder</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6 max-w-2xl">
              Calculate the shortest topological prerequisite sequence between any two skills in the skill ontology.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Source Skill</label>
                <select
                  value={pathSource}
                  onChange={(e) => setPathSource(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="hidden sm:flex mt-6 items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="w-full sm:flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Skill</label>
                <select
                  value={pathTarget}
                  onChange={(e) => setPathTarget(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <button
                onClick={handleFindPath}
                disabled={pathLoading}
                className="w-full sm:w-auto mt-2 sm:mt-6 h-11 px-6 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {pathLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate Path'}
              </button>
            </div>

            {/* Path Result Display */}
            {pathResult && (
              <div className="pt-4 border-t border-indigo-100">
                {pathResult.reachable ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-gray-900">
                        Shortest Prerequisite Path ({pathResult.steps} step{pathResult.steps === 1 ? '' : 's'}):
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {pathResult.path.map((stepId, idx) => {
                        const stepSkill = skills.find(s => s.id === stepId) || { name: stepId };
                        return (
                          <div key={stepId} className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => navigate(`/explore/${stepId}`)}
                              className="px-4 py-2 bg-white rounded-xl border border-indigo-200 font-bold text-xs text-indigo-700 hover:bg-indigo-50 shadow-sm transition-colors"
                            >
                              {stepSkill.name}
                            </button>
                            {idx < pathResult.path.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-gray-500">
                    No direct prerequisite connection found from {pathSource} to {pathTarget}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills, aliases (e.g. 'ML', 'Python', 'LLMs')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
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
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 p-8">
            <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No skills match your search.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-3 text-sm text-indigo-600 font-semibold hover:underline">
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
