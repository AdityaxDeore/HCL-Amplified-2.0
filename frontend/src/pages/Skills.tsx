import { useState } from 'react'
import Header from '../components/layout/Header'
import { TrendingUp, Star, Zap } from 'lucide-react'

interface Skill {
  name: string
  level: number
  maxLevel: number
  category: string
  badge: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  trending?: boolean
}

const skills: Skill[] = [
  // Frontend
  { name: 'HTML & CSS', level: 90, maxLevel: 100, category: 'Frontend', badge: 'expert' },
  { name: 'JavaScript', level: 78, maxLevel: 100, category: 'Frontend', badge: 'advanced' },
  { name: 'React', level: 65, maxLevel: 100, category: 'Frontend', badge: 'intermediate', trending: true },
  { name: 'TypeScript', level: 45, maxLevel: 100, category: 'Frontend', badge: 'intermediate' },
  { name: 'Tailwind CSS', level: 80, maxLevel: 100, category: 'Frontend', badge: 'advanced' },

  // Backend
  { name: 'Python', level: 72, maxLevel: 100, category: 'Backend', badge: 'advanced' },
  { name: 'FastAPI', level: 50, maxLevel: 100, category: 'Backend', badge: 'intermediate', trending: true },
  { name: 'Node.js', level: 40, maxLevel: 100, category: 'Backend', badge: 'intermediate' },
  { name: 'MongoDB', level: 55, maxLevel: 100, category: 'Backend', badge: 'intermediate' },
  { name: 'SQL', level: 60, maxLevel: 100, category: 'Backend', badge: 'intermediate' },

  // AI / ML
  { name: 'Machine Learning', level: 38, maxLevel: 100, category: 'AI / ML', badge: 'beginner', trending: true },
  { name: 'NumPy & Pandas', level: 62, maxLevel: 100, category: 'AI / ML', badge: 'intermediate' },
  { name: 'Deep Learning', level: 20, maxLevel: 100, category: 'AI / ML', badge: 'beginner' },
  { name: 'Prompt Engineering', level: 55, maxLevel: 100, category: 'AI / ML', badge: 'intermediate', trending: true },

  // Tools
  { name: 'Git & GitHub', level: 85, maxLevel: 100, category: 'Tools', badge: 'advanced' },
  { name: 'Docker', level: 30, maxLevel: 100, category: 'Tools', badge: 'beginner' },
  { name: 'VS Code', level: 95, maxLevel: 100, category: 'Tools', badge: 'expert' },
]

const categories = ['All', 'Frontend', 'Backend', 'AI / ML', 'Tools']

const badgeConfig: Record<Skill['badge'], { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-gray-100 text-gray-500' },
  intermediate: { label: 'Intermediate', color: 'bg-[#FCEABB] text-yellow-700' },
  advanced: { label: 'Advanced', color: 'bg-[#D3EAE8] text-teal-700' },
  expert: { label: 'Expert', color: 'bg-[#DFD4EB] text-purple-700' },
}

const levelBarColor: Record<Skill['badge'], string> = {
  beginner: 'bg-gray-300',
  intermediate: 'bg-yellow-400',
  advanced: 'bg-emerald-400',
  expert: 'bg-gradient-to-r from-indigo-500 to-purple-500',
}

function SkillCard({ skill }: { skill: Skill }) {
  const badge = badgeConfig[skill.badge]
  const barColor = levelBarColor[skill.badge]

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-[15px] text-[#1A1D21]">{skill.name}</h4>
            {skill.trending && (
              <div className="flex items-center gap-0.5 text-[10px] font-semibold text-orange-500">
                <TrendingUp className="w-3 h-3" />
                Hot
              </div>
            )}
          </div>
          <span className={`mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <span className="text-2xl font-bold text-[#1A1D21]">{skill.level}%</span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  )
}

function StatChip({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className={`${color} rounded-[20px] p-4 flex items-center gap-3`}>
      <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-5 h-5 text-[#1A1D21]" />
      </div>
      <div>
        <p className="text-xs text-[#1A1D21]/60 font-medium">{label}</p>
        <p className="text-lg font-bold text-[#1A1D21] leading-tight">{value}</p>
      </div>
    </div>
  )
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All' ? skills : skills.filter((s) => s.category === activeCategory)

  const expertCount = skills.filter((s) => s.badge === 'expert').length
  const advancedCount = skills.filter((s) => s.badge === 'advanced').length
  const avgLevel = Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)

  return (
    <div className="flex flex-col h-full">
      <Header />

      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-semibold text-[#1A1D21]">Explore Skills</h2>
            <p className="text-sm text-gray-400 mt-1">{skills.length} skills tracked across your learning journey</p>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatChip icon={Star} label="Expert Skills" value={`${expertCount} skills`} color="bg-[#DFD4EB]" />
          <StatChip icon={Zap} label="Advanced Skills" value={`${advancedCount} skills`} color="bg-[#D3EAE8]" />
          <StatChip icon={TrendingUp} label="Avg Proficiency" value={`${avgLevel}%`} color="bg-[#FCEABB]" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#1A1D21] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-[#1A1D21]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  )
}
