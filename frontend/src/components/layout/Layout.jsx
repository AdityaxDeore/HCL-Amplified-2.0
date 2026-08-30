import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex w-full h-screen">
      {/* Pastel background blobs behind everything, though mostly covered by the white bg now. 
          We'll keep them positioned absolutely just in case they want a glass effect later, 
          but the main container is now full width/height. */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FCECF3] blur-[100px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#E0F4EE] blur-[100px] rounded-full pointer-events-none opacity-50" />

      {/* Main App Container */}
      <div className="w-full h-full flex overflow-hidden relative z-10 bg-transparent">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
