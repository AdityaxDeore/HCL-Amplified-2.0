import Header from '../components/layout/Header'
import { CheckCircle2, Circle, Lock, ArrowUpRight, Flame, Trophy, Clock } from 'lucide-react'

interface Milestone {
  id: number
  title: string
  desc: string
  status: 'completed' | 'active' | 'locked'
  duration: string
  topics: string[]
}

interface Phase {
  id: number
  title: string
  subtitle: string
  color: string
  bgColor: string
  milestones: Milestone[]
}

const phases: Phase[] = [
  {
    id: 1,
    title: 'Phase 1',
    subtitle: 'Foundations',
    color: 'text-teal-700',
    bgColor: 'bg-[#D3EAE8]',
    milestones: [
      { id: 1, title: 'Python Basics', desc: 'Variables, loops, functions and OOP fundamentals', status: 'completed', duration: '2 weeks', topics: ['Variables', 'Loops', 'Functions', 'OOP'] },
      { id: 2, title: 'Data Structures', desc: 'Lists, dicts, sets, stacks, queues & trees', status: 'completed', duration: '2 weeks', topics: ['Arrays', 'Dicts', 'Trees', 'Graphs'] },
      { id: 3, title: 'Mathematics for AI', desc: 'Linear algebra, calculus, probability & statistics', status: 'active', duration: '3 weeks', topics: ['Linear Algebra', 'Probability', 'Statistics'] },
    ],
  },
  {
    id: 2,
    title: 'Phase 2',
    subtitle: 'Core ML',
    color: 'text-yellow-700',
    bgColor: 'bg-[#FCEABB]',
    milestones: [
      { id: 4, title: 'Machine Learning Basics', desc: 'Supervised, unsupervised, and reinforcement learning', status: 'locked', duration: '4 weeks', topics: ['Regression', 'Classification', 'Clustering'] },
      { id: 5, title: 'Deep Learning', desc: 'Neural networks, CNNs, RNNs and transformers', status: 'locked', duration: '4 weeks', topics: ['Neural Nets', 'CNNs', 'RNNs', 'Transformers'] },
      { id: 6, title: 'Model Deployment', desc: 'FastAPI, Docker, and cloud deployment basics', status: 'locked', duration: '2 weeks', topics: ['FastAPI', 'Docker', 'AWS'] },
    ],
  },
  {
    id: 3,
    title: 'Phase 3',
    subtitle: 'AI Engineering',
    color: 'text-purple-700',
    bgColor: 'bg-[#DFD4EB]',
    milestones: [
      { id: 7, title: 'LLMs & Prompt Engineering', desc: 'GPT, Gemini, Claude APIs and prompt design patterns', status: 'locked', duration: '3 weeks', topics: ['GPT', 'Gemini', 'Prompting'] },
      { id: 8, title: 'RAG & Vector DBs', desc: 'Retrieval-augmented generation and embeddings', status: 'locked', duration: '3 weeks', topics: ['RAG', 'Pinecone', 'ChromaDB'] },
      { id: 9, title: 'Capstone Project', desc: 'Build a full AI-powered application end to end', status: 'locked', duration: '4 weeks', topics: ['System Design', 'Deployment', 'Portfolio'] },
    ],
  },
]

const statusIcon = (status: Milestone['status']) => {
  if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
  if (status === 'active') return <Circle className="w-5 h-5 text-indigo-500 fill-indigo-100" />
  return <Lock className="w-5 h-5 text-gray-300" />
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const isLocked = milestone.status === 'locked'
  return (
    <div
      className={`bg-white rounded-[20px] border p-5 transition-all ${
        isLocked ? 'border-gray-100 opacity-60' : 'border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">{statusIcon(milestone.status)}</div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-[15px] ${isLocked ? 'text-gray-400' : 'text-[#1A1D21]'}`}>
              {milestone.title}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{milestone.desc}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {milestone.topics.map((t) => (
                <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {milestone.duration}
          </div>
          {!isLocked && (
            <button className="w-7 h-7 rounded-full bg-[#1A1D21] flex items-center justify-center hover:scale-110 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      {milestone.status === 'active' && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress</span>
            <span>38%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '38%' }} />
          </div>
        </div>
      )}
    </div>
  )
}

function PhaseColumn({ phase }: { phase: Phase }) {
  const completedCount = phase.milestones.filter((m) => m.status === 'completed').length
  const total = phase.milestones.length
  const pct = Math.round((completedCount / total) * 100)

  return (
    <div className="flex flex-col gap-4">
      {/* Phase Header */}
      <div className={`${phase.bgColor} rounded-[20px] p-5`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold uppercase tracking-widest ${phase.color}`}>{phase.title}</span>
          <span className="text-xs font-semibold text-gray-500">{completedCount}/{total} done</span>
        </div>
        <h3 className="font-bold text-lg text-[#1A1D21]">{phase.subtitle}</h3>
        <div className="mt-3 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#1A1D21] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Milestones */}
      {phase.milestones.map((m) => (
        <MilestoneCard key={m.id} milestone={m} />
      ))}
    </div>
  )
}

export default function Roadmap() {
  const totalCompleted = phases.flatMap((p) => p.milestones).filter((m) => m.status === 'completed').length
  const totalMilestones = phases.flatMap((p) => p.milestones).length
  const overallPct = Math.round((totalCompleted / totalMilestones) * 100)

  return (
    <div className="flex flex-col h-full">
      <Header />

      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-semibold text-[#1A1D21]">My Learning Roadmap</h2>
            <p className="text-sm text-gray-400 mt-1">AI Engineer Path · {overallPct}% complete</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FCEABB] px-4 py-2 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-[#1A1D21]">14 day streak</span>
            </div>
            <div className="flex items-center gap-2 bg-[#DFD4EB] px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-[#1A1D21]">{totalCompleted} milestones</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-[20px] border border-gray-100 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#1A1D21]">Overall Progress</span>
            <span className="text-2xl font-bold text-[#1A1D21]">{overallPct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Started 6 weeks ago</span>
            <span className="text-xs text-gray-400">{totalCompleted}/{totalMilestones} milestones</span>
          </div>
        </div>

        {/* Phase Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {phases.map((phase) => (
            <PhaseColumn key={phase.id} phase={phase} />
          ))}
        </div>
      </div>
    </div>
  )
}
