import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Map,
  Sparkles,
  Search,
  BookOpen,
  BarChart2,
  Mic,
  Target,
  Settings,
  Sparkle,
  ChevronRight
} from 'lucide-react'

const mainNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard' },
  { label: 'My Roadmap', icon: Map, path: '/roadmap' },
  { label: 'AI Assistant', icon: Sparkles, path: '/assistant' },
  { label: 'Explore Skills', icon: Search, path: '/explore' },
  { label: 'Learning Hub', icon: BookOpen, path: '/learning' },
  { label: 'Progress', icon: BarChart2, path: '/progress' },
  { label: 'AI Interview', icon: Mic, path: '/interview' },
]

const bottomNavItems = [
  { label: 'Profile & Goals', icon: Target, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation();

  const isPathActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="group w-20 hover:w-64 transition-all duration-300 ease-out flex flex-col py-6 bg-white/95 backdrop-blur-md border-r border-slate-200/80 z-40 flex-shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <Link to="/dashboard" className="mb-8 px-4 flex items-center gap-3.5 w-full cursor-pointer overflow-hidden">
        <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-100 transition-transform duration-300 group-hover:scale-105">
          <Sparkle className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
          <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">
            Learn<span className="text-indigo-600">Path</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
            AI Copilot
          </span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 w-full flex flex-col space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {mainNavItems.map((item) => {
          const isActive = isPathActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 w-full overflow-hidden ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 font-semibold border border-indigo-100/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Active Indicator Accent Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full shadow-xs" />
              )}
              
              <item.icon className={`h-5 w-5 flex-shrink-0 ml-0.5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                {item.label}
              </span>

              {/* Right chevron indicator on hover */}
              {!isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity duration-200 text-slate-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="w-full px-5 py-3">
        <div className="w-full h-px bg-slate-100" />
      </div>

      {/* Bottom Navigation */}
      <nav className="w-full flex flex-col space-y-1 px-3">
        {bottomNavItems.map((item) => {
          const isActive = isPathActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 w-full overflow-hidden ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 font-semibold border border-indigo-100/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full shadow-xs" />
              )}
              <item.icon className={`h-5 w-5 flex-shrink-0 ml-0.5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  )
}
