import { Bell, Search } from "lucide-react"

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex flex-1 items-center space-x-4">
        <h1 className="text-lg font-semibold text-foreground">Welcome back, Learner</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources..."
            className="h-9 w-64 rounded-md border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        
        <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm cursor-pointer shadow-sm">
          AL
        </div>
      </div>
    </header>
  )
}
