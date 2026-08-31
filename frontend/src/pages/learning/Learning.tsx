import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, PlayCircle, BookOpen, FileText, Layout, Star,
  ChevronRight, Bookmark, ExternalLink, ThumbsUp, ThumbsDown, Check,
  Clock, Shield, Sparkles, Video, Globe, GraduationCap
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { resourcesApi } from '../../api/resourcesApi';

const SOURCE_ICONS = {
  youtube: Video,
  official_docs: Globe,
  coursera: GraduationCap,
  udemy: GraduationCap,
  web: Globe
};

function ResourceCard({ resource, onFeedback }) {
  const navigate = useNavigate();
  const [feedbackSent, setFeedbackSent] = useState(null);

  const SourceIcon = SOURCE_ICONS[resource.source] || Globe;
  const isVideo = resource.type === 'video' || resource.source === 'youtube';

  const citation = resource.citation || {
    source: resource.provider || 'Web',
    url: resource.url || '#'
  };

  async function handleFeedbackClick(e, type) {
    e.stopPropagation();
    setFeedbackSent(type);
    try {
      await resourcesApi.submitFeedback(resource.id, {
        learner_id: 'demo-learner',
        resource_id: resource.id,
        skill_id: resource.skillId || resource.relatedSkillId,
        feedback: type
      });
    } catch (err) {
      console.warn('Feedback submit notice:', err);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${resource.title}`}
      onClick={() => navigate(`/learning/${resource.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/learning/${resource.id}`)}
      className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {/* Thumbnail / Header Preview */}
      <div className="h-36 bg-gray-900 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
        {resource.thumbnail_url || resource.thumbnail ? (
          <img
            src={resource.thumbnail_url || resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-purple-900 opacity-80" />
        )}
        
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          {isVideo ? (
            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <PlayCircle className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Source Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
          <SourceIcon className="w-3 h-3 text-indigo-300" />
          {resource.provider || resource.source}
        </div>

        {/* Duration badge */}
        {resource.duration && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
            {resource.duration}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            resource.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            resource.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {resource.difficulty}
          </span>
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-500" /> {resource.rating || 4.8}
          </div>
        </div>

        <h3 className="font-bold text-[#1A1D21] mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {resource.title}
        </h3>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {resource.description || resource.whyRecommended || 'Curated high-impact learning resource for your target path.'}
        </p>

        {resource.whyRecommended && (
          <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 mb-4">
            <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
              <span className="font-bold text-indigo-700">Why recommended:</span> {resource.whyRecommended}
            </p>
          </div>
        )}

        {/* Citation & Feedback Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <a
            href={resource.url || citation.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            Open Source <ExternalLink className="w-3 h-3" />
          </a>

          {/* Feedback buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleFeedbackClick(e, 'HELPFUL')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${feedbackSent === 'HELPFUL' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'hover:bg-gray-100 text-gray-400'}`}
              title="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleFeedbackClick(e, 'NOT_HELPFUL')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${feedbackSent === 'NOT_HELPFUL' ? 'bg-rose-100 text-rose-700 font-bold' : 'hover:bg-gray-100 text-gray-400'}`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = ['All', 'Videos', 'Courses', 'Documentation'];

export default function Learning() {
  const navigate = useNavigate();
  const { resources } = useLearner();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResources, setLiveResources] = useState([]);
  const [searching, setSearching] = useState(false);

  // Live multi-source search
  useEffect(() => {
    async function searchLive() {
      if (!searchQuery && activeFilter === 'All') {
        setLiveResources([]);
        return;
      }
      setSearching(true);
      try {
        const res = await resourcesApi.searchResources(searchQuery || 'AI Machine Learning', {
          type: activeFilter === 'Videos' ? 'video' : activeFilter === 'Courses' ? 'course' : activeFilter === 'Documentation' ? 'documentation' : undefined
        });
        if (res?.resources && res.resources.length > 0) {
          setLiveResources(res.resources);
        }
      } catch (err) {
        console.warn('Live resource search notice:', err);
      } finally {
        setSearching(false);
      }
    }
    const timer = setTimeout(searchLive, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const displayList = liveResources.length > 0 ? liveResources : resources;

  const filteredResources = useMemo(() => {
    return displayList.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.provider && r.provider.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesFilter = true;
      if (activeFilter === 'Videos') matchesFilter = r.type === 'video' || r.source === 'youtube';
      if (activeFilter === 'Courses') matchesFilter = r.type === 'course' || r.source === 'coursera' || r.source === 'udemy';
      if (activeFilter === 'Documentation') matchesFilter = r.type === 'documentation' || r.source === 'official_docs';

      return matchesSearch && matchesFilter;
    });
  }, [displayList, searchQuery, activeFilter]);

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Learning Hub & Resource Discovery</h1>
          <p className="text-gray-500 mt-1">Multi-source video tutorials, official documentation, and verified courses grounded in canonical citations.</p>
        </div>

        {/* Search Bar & Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search YouTube videos, official docs, courses (e.g. 'Statistics', 'PyTorch', 'MLOps')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`h-10 px-4 rounded-xl text-xs font-bold transition-all border ${
                  activeFilter === f
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </div>
    </div>
  );
}
