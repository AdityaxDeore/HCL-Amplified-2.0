import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'

// A wrapper for pages that shouldn't have the sidebar (Login, Onboarding)
function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Standalone Pages (No Sidebar/Header) */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        {/* Dashboard and App Pages (With Sidebar/Header) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ai-mentor" element={<div className="p-4">AI Mentor Page Placeholder</div>} />
          <Route path="roadmap" element={<div className="p-4">Roadmap Page Placeholder</div>} />
          <Route path="skills" element={<div className="p-4">Skills Page Placeholder</div>} />
          <Route path="courses" element={<div className="p-4">Courses Page Placeholder</div>} />
          <Route path="projects" element={<div className="p-4">Projects Page Placeholder</div>} />
          <Route path="assessments" element={<div className="p-4">Assessments Page Placeholder</div>} />
          <Route path="career" element={<div className="p-4">Career Page Placeholder</div>} />
          <Route path="analytics" element={<div className="p-4">Analytics Page Placeholder</div>} />
          <Route path="profile" element={<div className="p-4">Profile Page Placeholder</div>} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
