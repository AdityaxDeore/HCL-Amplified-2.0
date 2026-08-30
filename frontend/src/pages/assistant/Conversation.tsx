import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Zap, Target, BookOpen, ExternalLink } from 'lucide-react';
import { mockChatConversations, mockResponses } from '../../data/mockChat';
import Header from '../../components/layout/Header';
import { useLearner } from '../../context/LearnerContext';

export default function Conversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { learner, roadmapNodes } = useLearner();
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize
  useEffect(() => {
    if (conversationId === 'new') {
      if (location.state?.initialPrompt) {
        handleSend(location.state.initialPrompt);
      }
    } else {
      const conv = mockChatConversations.find(c => c.id === conversationId);
      if (conv) setMessages(conv.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  function handleSend(text) {
    if (!text.trim()) return;
    
    const newMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      // Pick a random mock response
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse.content,
        citations: randomResponse.citations
      }]);
      setIsTyping(false);
    }, 1500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1D21] text-sm leading-tight">AI Assistant</h2>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {messages.length === 0 && !isTyping ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <Zap className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">How can I help you today?</h3>
                <p className="text-sm text-gray-500">I can help you understand concepts, recommend projects, or guide you through your roadmap.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {msg.role === 'user' ? learner.name[0] : <Zap className="w-4 h-4" />}
                  </div>
                  <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl text-[15px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.citations.map((c, i) => (
                          <button key={i} onClick={() => navigate(c.url)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm">
                            <BookOpen className="w-3 h-3" /> {c.title} <ExternalLink className="w-3 h-3 opacity-50" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex gap-4 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span className="text-sm font-semibold text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 border border-gray-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400 transition-all">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your learning path..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none p-3 text-sm text-gray-800 custom-scrollbar"
                rows={1}
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-3">
              AI can make mistakes. Verify important information.
            </p>
          </div>

        </div>

        {/* Right Sidebar - Roadmap Context (Hidden on small screens) */}
        <div className="hidden lg:flex w-80 flex-col bg-white border-l border-gray-100 my-4 mr-4 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" /> Session Context
            </h3>
          </div>
          <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
            
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Role</p>
              <div className="font-semibold text-gray-800">{learner.targetRole}</div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Focus</p>
              {roadmapNodes.filter(n => n.status === 'in_progress').map(node => (
                <button
                  key={node.id}
                  onClick={() => navigate('/roadmap')}
                  className="w-full text-left p-3 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-colors mb-2 group"
                >
                  <div className="font-bold text-indigo-900 text-sm mb-1 group-hover:text-indigo-700">{node.title}</div>
                  <div className="text-xs text-indigo-600 font-medium">{node.category}</div>
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upcoming</p>
              {roadmapNodes.filter(n => n.status === 'not_started').slice(0, 3).map(node => (
                <div key={node.id} className="p-2 mb-1 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {node.title}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
