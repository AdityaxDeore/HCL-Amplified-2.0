import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import { LearnerProvider } from './context/LearnerContext'

// Layouts
import Layout from './components/layout/Layout'

// Public Pages
import Onboarding from './pages/Onboarding'

// Application Pages
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/roadmap/Roadmap'
import RoadmapDetail from './pages/roadmap/RoadmapDetail'
import Assistant from './pages/assistant/Assistant'
import Conversation from './pages/assistant/Conversation'
import ExploreSkills from './pages/explore/ExploreSkills'
import SkillDetail from './pages/explore/SkillDetail'
import Learning from './pages/learning/Learning'
import ResourceDetail from './pages/learning/ResourceDetail'
import Progress from './pages/progress/Progress'
import Interview from './pages/interview/Interview'
import InterviewSetup from './pages/interview/InterviewSetup'
import InterviewSession from './pages/interview/InterviewSession'
import InterviewResults from './pages/interview/InterviewResults'
import Profile from './pages/profile/Profile'
import Goals from './pages/profile/Goals'
import ProfileSkills from './pages/profile/Skills'
import Preferences from './pages/profile/Preferences'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <LearnerProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="roadmap">
              <Route index element={<Roadmap />} />
              <Route path=":roadmapId" element={<RoadmapDetail />} />
            </Route>
            
            <Route path="assistant">
              <Route index element={<Assistant />} />
              <Route path=":conversationId" element={<Conversation />} />
            </Route>
            
            <Route path="explore">
              <Route index element={<ExploreSkills />} />
              <Route path=":skillId" element={<SkillDetail />} />
            </Route>
            
            <Route path="learning">
              <Route index element={<Learning />} />
              <Route path=":resourceId" element={<ResourceDetail />} />
            </Route>
            
            <Route path="progress" element={<Progress />} />
            
            <Route path="interview">
              <Route index element={<Interview />} />
              <Route path="setup" element={<InterviewSetup />} />
              <Route path="session/:sessionId" element={<InterviewSession />} />
              <Route path="results/:sessionId" element={<InterviewResults />} />
            </Route>
            
            <Route path="profile">
              <Route index element={<Profile />} />
              <Route path="goals" element={<Goals />} />
              <Route path="skills" element={<ProfileSkills />} />
              <Route path="preferences" element={<Preferences />} />
            </Route>
            
            <Route path="settings" element={<Settings />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LearnerProvider>
  )
}

export default App
