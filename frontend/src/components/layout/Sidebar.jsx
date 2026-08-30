import { NavLink } from 'react-router-dom'
import { Home, Map, Sparkles, Search, BookOpen, BarChart2, Mic, Target, Settings, Sparkle, ChevronRight } from 'lucide-react'

const mainNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard' },
  { label: 'My Roadmap', icon: Map, path: '/roadmap' },
  { label: 'AI Assistant', icon: Sparkles, path: '/ai-assistant' },
  { label: 'Explore Skills', icon: Search, path: '/explore' },
  { label: 'Learning', icon: BookOpen, path: '/learning' },
  { label: 'Progress', icon: BarChart2, path: '/progress' },
  { label: 'AI Interview', icon: Mic, path: '/interview' },
]

const bottomNavItems = [
  { label: 'Profile & Goals', icon: Target, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  return (
    <aside className="group w-24 hover:w-[280px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col items-start py-8 bg-white/80 backdrop-blur-xl border-r border-white/40 z-50 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="mb-10 px-6 flex items-center gap-4 w-full cursor-pointer relative">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <Sparkle className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500 overflow-hidden">
          <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight leading-none">
            LearnPath
          </span>
          <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-1">
            Personalized
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 w-full flex flex-col space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full overflow-hidden group/item ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] border border-indigo-100/50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full shadow-sm" />
                )}
                
                <item.icon className={`h-[22px] w-[22px] flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110 text-indigo-600 drop-shadow-sm' : 'group-hover/item:scale-110 group-hover/item:text-indigo-500'}`} />
                
                <span className="font-semibold text-[15px] whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-5px] group-hover:translate-x-0 transition-all duration-300">
                  {item.label}
                </span>

                {/* Right chevron on hover for non-active */}
                {!isActive && (
                  <ChevronRight className="w-4 h-4 absolute right-4 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all duration-300 text-gray-300" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="w-full px-8 py-6">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Bottom Navigation */}
      <nav className="w-full flex flex-col space-y-1.5 px-4">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full overflow-hidden group/item ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] border border-indigo-100/50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
             {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full shadow-sm" />
                )}
                <item.icon className={`h-[22px] w-[22px] flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110 text-indigo-600 drop-shadow-sm' : 'group-hover/item:scale-110 group-hover/item:text-gray-700'}`} />
                <span className="font-semibold text-[15px] whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-5px] group-hover:translate-x-0 transition-all duration-300">
                  {item.label}
                </span>
              </>
             )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
