import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Send, Loader2, Zap, Target, BookOpen, ExternalLink,
  Shield, CheckCircle2, Sparkles, AlertCircle, ArrowUpRight, Route
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';
import { assistantApi } from '../../api/assistantApi';

export default function Conversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { learner } = useLearner();
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeConvId, setActiveConvId] = useState(conversationId);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize and load conversation
  useEffect(() => {
    async function initConversation() {
      if (conversationId && conversationId !== 'new') {
        try {
          const conv = await assistantApi.getConversationById(conversationId);
          if (conv && conv.messages) {
            setMessages(conv.messages);
            setActiveConvId(conv.id);
          }
        } catch (err) {
          console.warn('Could not load existing conversation:', err);
        }
      } else if (conversationId === 'new') {
        setMessages([]);
        setActiveConvId('new');
        if (location.state?.initialPrompt) {
          handleSend(location.state.initialPrompt);
        }
      }
    }
    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  async function handleSend(text) {
    const cleanText = (text || inputValue).trim();
    if (!cleanText || isTyping) return;
    
    setErrorMessage(null);
    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: cleanText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await assistantApi.sendMessage(
        cleanText,
        activeConvId,
        learner.id || 'demo-learner'
      );

      if (response && response.message) {
        const assistantMsg = response.message;
        setMessages(prev => [...prev, assistantMsg]);
        if (response.conversationId && activeConvId === 'new') {
          setActiveConvId(response.conversationId);
          window.history.replaceState(null, '', `/assistant/${response.conversationId}`);
        }
      }
    } catch (err) {
      console.error('Failed to get assistant response:', err);
      setErrorMessage('The AI assistant is temporarily unavailable. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleActionClick(action) {
    if (!action) return;
    const type = action.type;
    const targetId = action.targetId;

    if (type === 'open_roadmap') {
      navigate('/roadmap');
    } else if (type === 'open_roadmap_node') {
      navigate(targetId ? `/roadmap?node=${targetId}` : '/roadmap');
    } else if (type === 'open_skill') {
      navigate(targetId ? `/explore/${targetId}` : '/explore');
    } else if (type === 'open_learning') {
      navigate(targetId ? `/learning/${targetId}` : '/learning');
    } else if (type === 'open_progress') {
      navigate('/progress');
    } else if (type === 'open_profile') {
      navigate('/profile');
    } else {
      navigate('/roadmap');
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white m-4 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/assistant')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1D21] text-sm leading-tight">LearnPath Gemini Assistant</h2>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Grounded & Online
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([]);
                setActiveConvId('new');
                navigate('/assistant/new');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              New Chat
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {messages.length === 0 && !isTyping ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">How can I help with your learning journey?</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Ask about your target role, prerequisite roadmap ordering, timeline feasibility, skill gaps, or ask for YouTube video recommendations.
                </p>

                {/* Suggested Starters */}
                <div className="w-full space-y-2">
                  {[
                    "What should I learn next?",
                    "Why is Statistics before Machine Learning?",
                    "Can I become an AI Engineer in 4 months?",
                    "What are my biggest skill gaps?",
                    "Give me the best YouTube resources for Statistics"
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="w-full p-2.5 bg-gray-50 hover:bg-indigo-50/70 border border-gray-200/70 hover:border-indigo-200 rounded-xl text-xs font-semibold text-gray-700 hover:text-indigo-700 text-left transition-all flex items-center justify-between"
                    >
                      <span>{prompt}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-4 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                        : 'bg-[#F4F5F7] text-[#1A1D21] rounded-tl-sm border border-gray-200/50'
                    }`}
                  >
                    {/* Message Content */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal">
                      {msg.content}
                    </div>

                    {/* Citations Block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                          <Shield className="w-3.5 h-3.5 text-indigo-600" /> Grounded Source Citations
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.citations.map((cit, idx) => (
                            <a
                              key={idx}
                              href={cit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-white rounded-xl border border-gray-200/80 hover:border-indigo-300 hover:shadow-xs flex items-center justify-between gap-3 text-xs transition-all group"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-gray-900 truncate block group-hover:text-indigo-700">
                                  {cit.title}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {cit.source || cit.provider} {cit.channel_name ? `· ${cit.channel_name}` : ''}
                                </span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Actions Block */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-2 pt-2">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Route className="w-3.5 h-3.5" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow-up Questions Chips */}
                  {msg.role === 'assistant' && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 max-w-[85%]">
                      {msg.followUpQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="px-3 py-1 bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-700 rounded-full text-[11px] font-semibold transition-all shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Thinking / Typing Indicator */}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-[#F4F5F7] rounded-3xl rounded-tl-sm px-5 py-4 border border-gray-200/50 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium text-gray-500">
                    Reasoning over your roadmap & retrieving grounded resources...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:bg-white border border-transparent focus-within:border-indigo-200 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your roadmap, concepts, skill gaps, or learning resources..."
                disabled={isTyping}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1A1D21] placeholder:text-gray-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              LearnPath AI Assistant is grounded in your active roadmap and canonical verified sources.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
