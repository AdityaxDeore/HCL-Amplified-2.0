// CENTRALIZED MOCK PROGRESS — LearnPath
export const mockProgress = {
  overall: 32,
  readiness: 78,
  learningHours: 42,
  topicsCompleted: 18,
  streak: 7,

  skillProgress: [
    { skillId: 'python', name: 'Python', progress: 90, status: 'completed' },
    { skillId: 'sql', name: 'SQL', progress: 85, status: 'completed' },
    { skillId: 'git', name: 'Git', progress: 85, status: 'completed' },
    { skillId: 'numpy', name: 'NumPy', progress: 85, status: 'completed' },
    { skillId: 'statistics', name: 'Statistics', progress: 60, status: 'in_progress' },
    { skillId: 'machine-learning', name: 'Machine Learning', progress: 45, status: 'in_progress' },
    { skillId: 'deep-learning', name: 'Deep Learning', progress: 10, status: 'locked' },
    { skillId: 'generative-ai', name: 'Generative AI', progress: 0, status: 'locked' },
  ],

  weeklyActivity: [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 1 },
    { day: 'Wed', hours: 3 },
    { day: 'Thu', hours: 2 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 1 },
    { day: 'Sun', hours: 0 },
  ],

  milestones: [
    { id: 'ms-python', title: 'Python Fundamentals', status: 'completed', completedDate: '2024-06-15' },
    { id: 'ms-numpy', title: 'NumPy Mastery', status: 'completed', completedDate: '2024-06-28' },
    { id: 'ms-git', title: 'Git & GitHub', status: 'completed', completedDate: '2024-07-05' },
    { id: 'ms-stats', title: 'Statistics Foundations', status: 'in_progress', completedDate: null },
    { id: 'ms-ml', title: 'Machine Learning Core', status: 'not_started', completedDate: null },
    { id: 'ms-dl', title: 'Deep Learning', status: 'not_started', completedDate: null },
  ],

  nextAction: {
    title: 'Model Evaluation Basics',
    description: 'Learn how to properly evaluate ML model performance using cross-validation and common metrics.',
    estimatedMinutes: 45,
    whyImportant: 'Completing this unlocks the next Machine Learning milestone and prepares you for the Statistics assessment.',
    resourceId: 'res-ml-full-course',
    skillId: 'machine-learning',
  },
};
