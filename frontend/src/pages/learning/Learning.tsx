import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, PlayCircle, BookOpen, FileText, Layout, Star, ChevronRight, Bookmark } from 'lucide-react';
import { resourceTypes } from '../../data/mockResources';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

function ResourceCard({ resource, onClick }) {
  const Icon = resource.type === 'video' ? PlayCircle :
               resource.type === 'course' ? Layout :
               resource.type === 'article' ? FileText : BookOpen;
               
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${resource.title}`}
      onClick={() => onClick(resource.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(resource.id)}
      className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100 group-hover:bg-indigo-50 transition-colors relative">
        {resource.saved && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
            <Bookmark className="w-4 h-4 text-indigo-600 fill-indigo-600" />
          </div>
        )}
        <Icon className="w-12 h-12 text-gray-300 group-hover:text-indigo-300 transition-colors" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{resource.provider}</span>
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-500" /> {resource.rating}
          </div>
        </div>
        <h3 className="font-bold text-[#1A1D21] mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">{resource.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500 mb-4 mt-auto">
          <span className="capitalize">{resource.type}</span>
          {resource.durationHours && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{resource.durationHours}h</span>
            </>
          )}
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className={resource.difficulty === 'Beginner' ? 'text-emerald-600' : resource.difficulty === 'Advanced' ? 'text-rose-600' : 'text-amber-600'}>{resource.difficulty}</span>
        </div>
        
        {resource.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span className="text-indigo-600">In Progress</span>
              <span className="text-gray-500">{resource.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${resource.progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">For: <span className="text-gray-600 capitalize">{resource.relatedSkillId.replace('-', ' ')}</span></span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}

export default function Learning() {
  const navigate = useNavigate();
  const { resources } = useLearner();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || r.type.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [resources, searchQuery, activeFilter]);

  const activeResource = resources.find((r) => r.progress !== undefined);

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Learning Hub</h1>
          <p className="text-gray-500 mt-1">Resources selected for your current learning path.</p>
        </div>

        {activeResource && (
          <div className="bg-gradient-to-br from-[#1A1D21] to-[#2D3139] rounded-[24px] p-6 sm:p-8 mb-10 text-white relative overflow-hidden shadow-xl shadow-gray-200">
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[10%] w-[200px] h-[200px] bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4 border border-white/10">
                  <PlayCircle className="w-3.5 h-3.5" /> Continue Learning
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{activeResource.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-300 font-medium mb-6">
                  <span>Topic: <span className="text-white">{activeResource.currentTopic}</span></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span>Next: <span className="text-white">{activeResource.nextTopic}</span></span>
                </div>
                
                <div className="max-w-md">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-indigo-200">Progress</span>
                    <span>{activeResource.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" style={{ width: `${activeResource.progress}%` }} />
                  </div>
                </div>
              </div>
              
              <button onClick={() => navigate(`/learning/${activeResource.id}`)} className="h-12 px-8 bg-white text-[#1A1D21] font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg whitespace-nowrap flex-shrink-0">
                Resume Now
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 mr-1" />
            {resourceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`h-9 px-4 rounded-full text-sm font-semibold transition-all duration-200 border
                  ${activeFilter === type
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1A1D21] mb-6">Recommended for you</h2>
          {filteredResources.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No resources found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResources.map((res) => (
                <ResourceCard key={res.id} resource={res} onClick={(id) => navigate(`/learning/${id}`)} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
