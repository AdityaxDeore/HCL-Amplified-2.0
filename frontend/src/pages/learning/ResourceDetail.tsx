import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Clock, ExternalLink, Bookmark, CheckCircle2,
  BookOpen, PlayCircle, ThumbsUp, ThumbsDown, Shield, Sparkles,
  Loader2, Video, Globe, GraduationCap
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { resourcesApi } from '../../api/resourcesApi';

export default function ResourceDetail() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { resources, markResourceComplete } = useLearner();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(null);

  useEffect(() => {
    async function loadResource() {
      setLoading(true);
      try {
        const res = await resourcesApi.getResourceById(resourceId);
        if (res) {
          setResource(res);
        } else {
          const local = resources.find(r => r.id === resourceId) || resources[0];
          setResource(local);
        }
      } catch (err) {
        console.warn('Resource detail load notice:', err);
        const local = resources.find(r => r.id === resourceId) || resources[0];
        setResource(local);
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [resourceId, resources]);

  if (loading || !resource) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  const citation = resource.citation || {
    source: resource.provider || 'Web',
    url: resource.url || '#',
    channel_name: resource.channel_name || resource.provider,
    published_at: resource.published_at || '2023'
  };

  const isYouTube = resource.source === 'youtube' || (resource.url && resource.url.includes('youtube.com'));
  const videoId = resource.id?.includes('youtube:') ? resource.id.replace('youtube:', '') : null;

  async function handleFeedback(type) {
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
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Back */}
        <button
          onClick={() => navigate('/learning')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Learning Hub
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video Player or Header Hero */}
            {isYouTube && videoId && !videoId.includes('-') ? (
              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={resource.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-3xl p-8 text-white flex flex-col justify-end relative overflow-hidden shadow-md">
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider">
                  {resource.provider || resource.source}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 z-10">{resource.title}</h1>
                <p className="text-xs text-gray-300 z-10">{resource.channel_name || resource.provider}</p>
              </div>
            )}

            {/* Title & Description */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1D21]">{resource.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{resource.provider} · Published {resource.published_at || 'Recently'}</p>
                </div>
                <a
                  href={resource.url || citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm flex-shrink-0"
                >
                  Open Original <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {resource.description || 'Comprehensive learning material grounded in canonical industry best practices.'}
              </p>

              {/* Why Recommended Explainability Callout */}
              {resource.whyRecommended && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl mb-6">
                  <div className="flex items-center gap-2 mb-1 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Algorithmic Recommendation Reason
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    {resource.whyRecommended}
                  </p>
                </div>
              )}

              {/* Feedback Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500">Was this resource helpful?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback('HELPFUL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${feedbackSent === 'HELPFUL' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                  </button>
                  <button
                    onClick={() => handleFeedback('NOT_HELPFUL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${feedbackSent === 'NOT_HELPFUL' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Not helpful
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Citation & Metadata */}
          <div className="space-y-6">
            
            {/* Citation Box */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" /> Canonical Source Citation
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Source Platform</span>
                  <span className="font-bold text-gray-900">{citation.source}</span>
                </div>
                {citation.channel_name && (
                  <div>
                    <span className="text-gray-400 block font-medium">Channel / Creator</span>
                    <span className="font-bold text-gray-900">{citation.channel_name}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block font-medium">Permanent URL</span>
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-mono text-[11px] truncate block"
                  >
                    {citation.url}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Access License</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    {citation.license || 'Public / Open Access'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resource Metrics</h3>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Difficulty Level</span>
                <span className="font-bold text-gray-900">{resource.difficulty}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Estimated Duration</span>
                <span className="font-bold text-gray-900">{resource.duration || 'Self-paced'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Quality Rating</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {resource.rating || 4.8}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
