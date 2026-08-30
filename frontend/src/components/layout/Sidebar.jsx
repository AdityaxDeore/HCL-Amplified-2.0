import { NavLink } from "react-router-dom"
import { LayoutDashboard, Compass, Map, Layers, BookOpen, FolderDot, CheckSquare, Target, BarChart2, UserCircle, LogOut } from "lucide-react"

export default function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Mentor', href: '/ai-mentor', icon: Compass },
    { name: 'My Roadmap', href: '/roadmap', icon: Map },
    { name: 'Skills', href: '/skills', icon: Layers },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Projects', href: '/projects', icon: FolderDot },
    { name: 'Assessments', href: '/assessments', icon: CheckSquare },
    { name: 'Career', href: '/career', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-4 py-6 text-card-foreground">
      <div className="flex items-center space-x-2 px-2 pb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">AI</div>
        <span className="text-lg font-bold tracking-tight">LearnPath AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => `
              group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
              ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
            `}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t">
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
            ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
          `}
        >
          <UserCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          Profile
        </NavLink>
        <button
          className="group mt-1 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}
