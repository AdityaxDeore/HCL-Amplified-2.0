const fs = require('fs');
const path = require('path');

const template = (name, title, desc) => `import { useParams } from 'react-router-dom';

export default function ${name}() {
  const params = useParams();
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-[#1A1D21] mb-4">${title}</h1>
      <p className="text-lg text-gray-500 mb-6">${desc}</p>
      {Object.keys(params).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 font-mono shadow-sm">
          URL Parameters: {JSON.stringify(params, null, 2)}
        </div>
      )}
    </div>
  );
}
`;

const pages = [
  { p: 'src/pages/roadmap/Roadmap.tsx', n: 'Roadmap', t: 'My Roadmap', d: 'Your personalized learning journey will appear here.' },
  { p: 'src/pages/roadmap/RoadmapDetail.tsx', n: 'RoadmapDetail', t: 'Roadmap Detail', d: 'Details for a specific roadmap.' },
  { p: 'src/pages/assistant/Assistant.tsx', n: 'Assistant', t: 'AI Learning Assistant', d: 'Ask questions about your learning journey and get personalized guidance.' },
  { p: 'src/pages/assistant/Conversation.tsx', n: 'Conversation', t: 'AI Conversation', d: 'Active conversation session.' },
  { p: 'src/pages/explore/ExploreSkills.tsx', n: 'ExploreSkills', t: 'Explore Skills', d: 'Discover skills, prerequisites, projects, and career paths.' },
  { p: 'src/pages/explore/SkillDetail.tsx', n: 'SkillDetail', t: 'Skill Detail', d: 'Detailed information about a specific skill.' },
  { p: 'src/pages/learning/Learning.tsx', n: 'Learning', t: 'Learning', d: 'Your recommended learning resources will appear here.' },
  { p: 'src/pages/learning/ResourceDetail.tsx', n: 'ResourceDetail', t: 'Resource Detail', d: 'Viewing a specific learning resource.' },
  { p: 'src/pages/progress/Progress.tsx', n: 'Progress', t: 'Progress', d: 'Track your skills, milestones, learning activity, and readiness.' },
  { p: 'src/pages/interview/Interview.tsx', n: 'Interview', t: 'AI Interview', d: "Practice role-specific interviews when you're ready." },
  { p: 'src/pages/interview/InterviewSetup.tsx', n: 'InterviewSetup', t: 'Interview Setup', d: 'Configure your upcoming interview session.' },
  { p: 'src/pages/interview/InterviewSession.tsx', n: 'InterviewSession', t: 'Interview Session', d: 'Live interview session.' },
  { p: 'src/pages/interview/InterviewResults.tsx', n: 'InterviewResults', t: 'Interview Results', d: 'Feedback and evaluation from your interview.' },
  { p: 'src/pages/profile/Profile.tsx', n: 'Profile', t: 'Profile & Goals', d: 'Manage your learner profile, skills, goals, and preferences.' },
  { p: 'src/pages/profile/Goals.tsx', n: 'Goals', t: 'Goals Management', d: 'Manage your learning and career goals.' },
  { p: 'src/pages/profile/Skills.tsx', n: 'Skills', t: 'Skills Management', d: 'Manage your current skills.' },
  { p: 'src/pages/profile/Preferences.tsx', n: 'Preferences', t: 'Preferences', d: 'Manage your learning preferences.' },
  { p: 'src/pages/Settings.tsx', n: 'Settings', t: 'Settings', d: 'Manage application settings and preferences.' }
];

pages.forEach(page => {
  fs.mkdirSync(path.dirname(page.p), { recursive: true });
  fs.writeFileSync(page.p, template(page.n, page.t, page.d));
});

// Not Found Page
const notFoundTemplate = `import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="text-[64px] font-bold text-[#1A1D21] mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page not found</h2>
      <p className="text-gray-500 mb-8 max-w-md">We couldn't find the page you were looking for. It might have been moved or doesn't exist.</p>
      <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/NotFound.tsx', notFoundTemplate);

console.log('Pages created successfully.');
