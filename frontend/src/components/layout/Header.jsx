import { Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex pt-10 pb-4 items-center justify-between px-8 bg-transparent">
      {/* Left: Welcome Message */}
      <div className="flex items-center gap-2">
        <h1 className="text-[32px] font-semibold text-[#1A1D21] tracking-tight">
          Welcome back
        </h1>
        <span className="text-[32px]">👋</span>
      </div>

      {/* Right: Search and Avatar */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-64 h-12 pl-10 pr-4 py-2 text-sm text-gray-900 bg-[#F5F6F8] rounded-full border-none focus:ring-2 focus:ring-[#1A1D21] focus:outline-none placeholder:text-gray-400"
            placeholder="Search something"
          />
        </div>

        {/* Avatar */}
        <button className="flex h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm hover:opacity-80 transition-opacity">
          <img
            src="https://i.pravatar.cc/150?u=aditya"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </header>
  )
}
