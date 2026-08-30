// CENTRALIZED MOCK INTERVIEW — LearnPath
export const mockInterviewQuestions = [
  {
    id: 'q1',
    question: 'Explain the difference between supervised and unsupervised learning.',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    expectedKeywords: ['labeled data', 'unlabeled data', 'classification', 'clustering'],
  },
  {
    id: 'q2',
    question: 'What is overfitting, and how do you prevent it?',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    expectedKeywords: ['regularization', 'dropout', 'cross-validation', 'training data'],
  },
  {
    id: 'q3',
    question: 'How would you evaluate a classification model?',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    expectedKeywords: ['accuracy', 'precision', 'recall', 'F1', 'AUC-ROC', 'confusion matrix'],
  },
  {
    id: 'q4',
    question: 'Explain precision vs recall, and when you would prioritize one over the other.',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    expectedKeywords: ['true positive', 'false positive', 'false negative', 'imbalanced'],
  },
  {
    id: 'q5',
    question: 'What is cross-validation and why is it important?',
    category: 'Machine Learning',
    difficulty: 'Beginner',
    expectedKeywords: ['k-fold', 'train-test split', 'generalization', 'bias-variance'],
  },
  {
    id: 'q6',
    question: 'How would you handle an imbalanced dataset?',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    expectedKeywords: ['SMOTE', 'oversampling', 'undersampling', 'class weights', 'resampling'],
  },
  {
    id: 'q7',
    question: 'Explain the bias-variance tradeoff.',
    category: 'Machine Learning',
    difficulty: 'Advanced',
    expectedKeywords: ['underfitting', 'overfitting', 'complexity', 'generalization'],
  },
  {
    id: 'q8',
    question: 'What are the main differences between random forests and gradient boosting?',
    category: 'Machine Learning',
    difficulty: 'Advanced',
    expectedKeywords: ['bagging', 'boosting', 'decision trees', 'ensemble', 'XGBoost'],
  },
  {
    id: 'q9',
    question: 'Describe a machine learning project you would build to demonstrate your skills.',
    category: 'Projects',
    difficulty: 'Intermediate',
    expectedKeywords: ['problem statement', 'data', 'model', 'evaluation', 'deployment'],
  },
  {
    id: 'q10',
    question: 'How would you deploy a machine learning model to production?',
    category: 'MLOps',
    difficulty: 'Advanced',
    expectedKeywords: ['API', 'Docker', 'monitoring', 'versioning', 'CI/CD'],
  },
];

export const mockInterviewTypes = [
  {
    id: 'technical',
    title: 'Technical Interview',
    description: 'Core ML concepts, algorithms, and problem-solving questions tailored to your roadmap.',
    estimatedMinutes: 30,
    difficulty: 'Intermediate',
    icon: 'code',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview',
    description: 'Situational questions about your learning journey, problem-solving approach, and collaboration.',
    estimatedMinutes: 20,
    difficulty: 'Beginner',
    icon: 'users',
  },
  {
    id: 'mixed',
    title: 'Mixed Interview',
    description: 'Combination of technical and behavioral questions for a realistic interview experience.',
    estimatedMinutes: 45,
    difficulty: 'Intermediate',
    icon: 'shuffle',
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Design AI/ML systems, pipelines, and architectures for real-world use cases.',
    estimatedMinutes: 40,
    difficulty: 'Advanced',
    icon: 'layout',
  },
];

// Mock focus areas for interview setup
export const mockFocusAreas = [
  { id: "machine-learning", label: "Machine Learning" },
  { id: "nlp", label: "Natural Language Processing" },
  { id: "computer-vision", label: "Computer Vision" },
  { id: "generative-ai", label: "Generative AI" },
  { id: "data-analytics", label: "Data Analytics" },
];

export const mockInterviewResult = {
  sessionId: 'demo-session',
  date: '2024-07-30',
  type: 'Technical',
  duration: 28,
  questionsAnswered: 10,
  overallScore: 81,
  scores: {
    technicalAccuracy: 84,
    communication: 88,
    problemSolving: 76,
    conceptualDepth: 79,
  },
  strengths: [
    'Strong understanding of Python fundamentals',
    'Clear explanation of machine learning basics',
    'Good grasp of model evaluation concepts',
  ],
  improvements: [
    'Deepen knowledge of model evaluation metrics',
    'Expand system design thinking for ML pipelines',
    'Practice explaining bias-variance tradeoff more clearly',
  ],
  recommendedSkills: ['machine-learning', 'mlops'],
  answers: [
    { questionId: 'q1', answer: 'Supervised learning uses labeled data to train models for classification or regression tasks. Unsupervised learning finds patterns in unlabeled data through clustering or dimensionality reduction.', score: 88 },
    { questionId: 'q2', answer: 'Overfitting occurs when a model learns training data too well, including noise. Prevention strategies include regularization (L1/L2), dropout, cross-validation, and gathering more training data.', score: 82 },
  ],
};
