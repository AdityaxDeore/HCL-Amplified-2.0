import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, BookOpen, FileText, Layout, Star, ExternalLink, Bookmark, CheckCircle2, Zap } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function ResourceDetail() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { resources, toggleResourceSaved } = useLearner();
  
  const resource = resources.find(r => r.id === resourceId) || resources[0];

  const Icon = resource.type === 'video' ? PlayCircle :
               resource.type === 'course' ? Layout :
               resource.type === 'article' ? FileText : BookOpen;

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        {/* Back */}
        <button onClick={() => navigate('/learning')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Learning Hub
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Visual/Icon Area */}
            <div className="w-full lg:w-72 h-48 lg:h-72 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100/50">
              <Icon className="w-20 h-20 text-indigo-300" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{resource.provider}</span>
                <span className="capitalize text-sm font-semibold text-gray-500">{resource.type}</span>
                <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-500" /> {resource.rating}
                </span>
                <span className={`text-sm font-semibold ${resource.difficulty === 'Beginner' ? 'text-emerald-600' : resource.difficulty === 'Advanced' ? 'text-rose-600' : 'text-amber-600'}`}>
                  {resource.difficulty}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1D21] mb-4 tracking-tight leading-tight">{resource.title}</h1>
              <p className="text-lg text-gray-500 mb-8 max-w-3xl">{resource.description}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <button className="h-12 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                  {resource.type === 'video' ? 'Watch Now' : 'Start Learning'} <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleResourceSaved(resource.id)}
                  className={`h-12 px-6 font-semibold rounded-xl border transition-colors flex items-center gap-2 ${resource.saved ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Bookmark className={`w-4 h-4 ${resource.saved ? 'fill-indigo-700' : ''}`} />
                  {resource.saved ? 'Saved' : 'Save for later'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1D21] mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resource.topics.map((topic, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
              <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Why we recommend this
              </h2>
              <p className="text-indigo-900 text-sm leading-relaxed">
                {resource.whyRecommended}
              </p>
              <div className="mt-4 pt-4 border-t border-indigo-200/50">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Maps to Roadmap Node</p>
                <button onClick={() => navigate('/roadmap')} className="text-sm font-bold text-indigo-700 hover:underline flex items-center gap-1">
                  {resource.relatedSkillId.replace('-', ' ')} <ArrowLeft className="w-3 h-3 rotate-135" style={{transform: 'rotate(135deg)'}} />
                </button>
              </div>
            </section>
            
            {resource.durationHours && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Time Commitment</h2>
                <p className="text-2xl font-bold text-[#1A1D21]">{resource.durationHours} hours</p>
                <p className="text-sm text-gray-500 mt-1">Self-paced learning</p>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
