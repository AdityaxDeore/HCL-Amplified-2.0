import { useState, useRef, useEffect } from 'react'
import Header from '../components/layout/Header'
import { PromptInputBox } from '../components/ui/ai-prompt-box'
import { Bot, User, Sparkles, BookOpen, Map, Target, Lightbulb, RotateCcw } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const suggestedPrompts = [
  { icon: Map, text: 'Create a 3-month roadmap for learning React', color: 'bg-[#D3EAE8]' },
  { icon: BookOpen, text: 'Explain the difference between SQL and NoSQL', color: 'bg-[#FCEABB]' },
  { icon: Target, text: 'What skills do I need to become an AI Engineer?', color: 'bg-[#DFD4EB]' },
  { icon: Lightbulb, text: 'Suggest a project to practice machine learning', color: 'bg-[#FBDDE7]' },
]

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: "Hi! I'm your AI Learning Mentor 👋 I'm here to help you navigate your personalized learning journey. You can ask me to create study plans, explain concepts, recommend resources, or suggest projects. What would you like to learn today?",
    timestamp: '9:00 AM',
  },
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-500 to-purple-500'
            : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-md'
              : 'bg-white border border-gray-100 text-[#1A1D21] rounded-tl-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
          }`}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-gray-400 px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] rounded-tl-md px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

const mockReplies = [
  "Great question! Let me break that down for you step by step. Based on your current progress and learning style, I'd recommend starting with the fundamentals before diving into advanced topics.",
  "Here's a structured approach for you: First, master the core concepts. Then practice with small projects. Finally, build something real that solves a problem you care about.",
  "That's a smart choice! This skill is highly in demand right now. I'll create a personalized study plan that fits your schedule and learning pace.",
  "I've analyzed your learning history and I think you're ready for the next level. Here's what I'd suggest as your next challenge...",
]

export default function AiMentor() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [msgCounter, setMsgCounter] = useState(10)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { id: msgCounter, role: 'user', content: text, timestamp: now }
    setMessages((prev) => [...prev, userMsg])
    setMsgCounter((c) => c + 1)
    setIsTyping(true)

    setTimeout(() => {
      const reply = mockReplies[Math.floor(Math.random() * mockReplies.length)]
      const aiMsg: Message = { id: msgCounter + 1, role: 'assistant', content: reply, timestamp: now }
      setMessages((prev) => [...prev, aiMsg])
      setMsgCounter((c) => c + 2)
      setIsTyping(false)
    }, 1600)
  }

  const handleSuggestedPrompt = (text: string) => handleSend(text)

  const handleReset = () => {
    setMessages(initialMessages)
    setIsTyping(false)
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="flex flex-col h-full relative">
      <Header />

      <div className="flex flex-col flex-1 px-8 pb-6 min-h-0">
        {/* Title Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold text-[#1A1D21] leading-none">AI Mentor</h2>
              <p className="text-xs text-gray-400 mt-0.5">Powered by Gemini · Always learning with you</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1A1D21] bg-white border border-gray-200 px-3 py-2 rounded-full transition-all hover:shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New chat
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/50 rounded-[24px] border border-gray-100 p-6 min-h-0">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Prompts */}
        {showSuggestions && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {suggestedPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedPrompt(p.text)}
                className={`${p.color} text-left px-4 py-3 rounded-[16px] text-sm font-medium text-[#1A1D21] hover:opacity-80 transition-all hover:scale-[1.02] flex items-center gap-3`}
              >
                <p.icon className="w-4 h-4 flex-shrink-0 text-[#1A1D21]/70" />
                {p.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="mt-4">
          <PromptInputBox
            onSend={handleSend}
            placeholder="Ask your AI mentor anything..."
            isLoading={isTyping}
          />
        </div>
      </div>
    </div>
  )
}
