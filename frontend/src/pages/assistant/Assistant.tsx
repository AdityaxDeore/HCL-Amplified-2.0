import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search, ChevronRight, Zap, Target, BookOpen, Clock } from 'lucide-react';
import { mockSuggestedPrompts } from '../../data/mockChat';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { assistantApi } from '../../api/assistantApi';

export default function Assistant() {
  const navigate = useNavigate();
  const { learner } = useLearner();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const res = await assistantApi.getConversations(learner.id || 'demo-learner');
        if (Array.isArray(res) && res.length > 0) {
          setConversations(res);
        } else {
          // Default empty or mock preview
          setConversations([]);
        }
      } catch (err) {
        console.warn('Could not load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [learner.id]);

  const filteredConversations = conversations.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleNewChat() {
    navigate('/assistant/new');
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <div className="mb-10 text-center max-w-2xl mx-auto mt-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1D21] tracking-tight mb-4">Gemini AI Learning Assistant</h1>
          <p className="text-lg text-gray-500">Your personalized companion for your journey to becoming an {learner.targetRole || 'AI Engineer'}. Ask anything about your roadmap, concepts, skill gaps, or learning resources.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {mockSuggestedPrompts.map((prompt, idx) => {
              const Icon = idx === 0 ? Target : idx === 1 ? Zap : BookOpen;
              return (
                <button
                  key={prompt.id}
                  onClick={() => navigate('/assistant/new', { state: { initialPrompt: prompt.text } })}
                  className="bg-white border border-gray-100 p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 transition-all text-left flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1D21] mb-1 group-hover:text-indigo-700 transition-colors">{prompt.title}</h3>
                    <p className="text-sm text-gray-500">{prompt.text}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1D21]">Recent Conversations</h2>
            <button onClick={handleNewChat} className="h-10 px-4 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-medium text-gray-600 mb-2">No past conversations yet.</p>
                <p className="text-xs text-gray-400">Start a new conversation or click one of the suggested prompts above to begin.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/assistant/${conv.id}`)}
                    className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors flex-shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1A1D21] truncate mb-1">{conv.title || 'Conversation'}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.messages && conv.messages.length > 0
                          ? conv.messages[conv.messages.length - 1].content
                          : 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-400">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
