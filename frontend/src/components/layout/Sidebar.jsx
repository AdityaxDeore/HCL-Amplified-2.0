import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Calendar, Settings } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, path: '/dashboard' },
  { icon: BookOpen, path: '/courses' },
  { icon: Calendar, path: '/calendar' },
  { icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-24 flex flex-col items-center py-8 bg-transparent">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-10 h-10 bg-[#1A1D21] rounded-full flex items-center justify-center text-white font-bold text-xl italic">
          e
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center space-y-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                isActive
                  ? 'bg-[#1A1D21] text-white shadow-md'
                  : 'text-[#1A1D21] hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
