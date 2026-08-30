import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
