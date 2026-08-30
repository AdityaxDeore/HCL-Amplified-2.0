import { useLocation } from 'react-router-dom'
import { Search, Flame, Sparkles } from 'lucide-react'
import { useLearner } from '../../context/LearnerContext'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview & next best actions' },
  '/roadmap': { title: 'My Roadmap', subtitle: 'Personalized learning journey' },
  '/assistant': { title: 'AI Assistant', subtitle: '24/7 Smart Mentor & Tutor' },
  '/explore': { title: 'Explore Skills', subtitle: 'Skill dependencies & career paths' },
  '/learning': { title: 'Learning Hub', subtitle: 'Curated courses, videos & articles' },
  '/progress': { title: 'Progress', subtitle: 'Skill development & activity stats' },
  '/interview': { title: 'AI Interview Simulator', subtitle: 'Practice role-specific mock interviews' },
  '/profile': { title: 'Profile & Goals', subtitle: 'Manage skills, target roles & availability' },
  '/settings': { title: 'Settings', subtitle: 'Application preferences & accounts' },
}

export default function Header() {
  const location = useLocation()
  const { learner } = useLearner()

  // Match root path segment
  const rootPath = '/' + (location.pathname.split('/')[1] || 'dashboard')
  const pageInfo = pageTitles[rootPath] || { title: 'LearnPath', subtitle: 'AI Personalized Learning' }

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Dynamic Context Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h1>
            {rootPath === '/assistant' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3 h-3 text-indigo-600" /> AI
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Streak, and User Avatar */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-64 h-10 pl-9 pr-12 text-sm text-slate-900 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all"
            placeholder="Search topics, skills..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Streak Pill */}
        {learner?.streak !== undefined && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs font-bold text-amber-800 shadow-2xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{learner.streak}d streak</span>
          </div>
        )}

        {/* User Avatar with Profile Link */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white">
            {learner?.name ? learner.name.split(' ').map(n => n[0]).join('') : 'AM'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {learner?.name || 'Alex Morgan'}
            </span>
            <span className="text-[11px] font-medium text-slate-400 leading-tight">
              {learner?.targetRole || 'AI Engineer'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
