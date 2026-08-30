import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex w-full h-screen">
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute top-[-15%] right-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-500/4 blur-[120px] rounded-full pointer-events-none" />

      {/* Main App Container */}
      <div className="w-full h-full flex overflow-hidden relative z-10 bg-transparent">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-transparent">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

