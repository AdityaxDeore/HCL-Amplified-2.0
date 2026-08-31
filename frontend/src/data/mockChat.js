// CENTRALIZED MOCK CHAT — LearnPath
export const mockSuggestedPrompts = [
  { id: 'sp1', text: 'What should I learn next?', category: 'roadmap' },
  { id: 'sp2', text: 'Why is Machine Learning in my roadmap?', category: 'roadmap' },
  { id: 'sp3', text: 'Give me a project for my current level.', category: 'project' },
  { id: 'sp4', text: 'Am I on track for my 4-month deadline?', category: 'progress' },
  { id: 'sp5', text: 'Explain overfitting in simple terms.', category: 'concept' },
  { id: 'sp6', text: 'What are the best resources for statistics?', category: 'resources' },
];

export const mockConversations = [
  {
    id: 'demo-conversation',
    title: 'Roadmap help',
    preview: 'Based on your current progress...',
    date: 'Today',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'What should I learn next?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'm2',
        role: 'assistant',
        content: `Based on your current roadmap, **Machine Learning** is your next major milestone. You have already completed:

- ✅ Python (90% proficiency)
- ✅ NumPy (85% proficiency)

And you are currently progressing through **Statistics** (60% complete). Once you finish Statistics, Machine Learning unlocks directly.

I recommend starting with the **Machine Learning Full Course 2024** on YouTube — it is highly rated and matches your intermediate level perfectly.`,
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        citations: [{ id: 'c1', title: 'Machine Learning Full Course 2024', resourceId: 'res-ml-full-course' }],
      },
    ],
  },
  {
    id: 'conv-ml-concepts',
    title: 'Machine Learning concepts',
    preview: 'Supervised learning is...',
    date: 'Today',
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'Explain the difference between supervised and unsupervised learning.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'm4',
        role: 'assistant',
        content: `Great question! Here is how they differ:

**Supervised Learning**
- Uses **labeled data** — every training example has an input and a correct output
- The model learns a mapping from inputs to outputs
- Examples: spam detection, image classification, price prediction

**Unsupervised Learning**
- Uses **unlabeled data** — only inputs, no correct answers
- The model discovers hidden patterns or structures
- Examples: customer segmentation, anomaly detection, topic modeling

**When to use which:**
- Use supervised when you have labeled examples and a clear prediction target
- Use unsupervised when you want to discover unknown structure in data`,
        timestamp: new Date(Date.now() - 7100000).toISOString(),
        citations: [],
      },
    ],
  },
  {
    id: 'conv-projects',
    title: 'Project ideas',
    preview: 'For your current level...',
    date: 'Yesterday',
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'Give me a project for my current level.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'm6',
        role: 'assistant',
        content: `Based on your current skills (Python: Intermediate, NumPy: Beginner, Statistics: In Progress), here are 3 great projects:

**1. Customer Churn Prediction** 🎯 *Recommended*
- Dataset: Telecom customer data (publicly available)
- Skills used: Python, Pandas, Scikit-learn basics
- What you will build: A model that predicts which customers will cancel their subscription
- Why: Perfect bridge between statistics and machine learning

**2. Exploratory Data Analysis Dashboard**
- Skills used: Python, NumPy, Pandas, Matplotlib
- What you will build: An interactive analysis of a public dataset
- Why: Reinforces your current statistics foundation

**3. House Price Prediction**
- Skills used: Python, NumPy, Statistics, basic regression
- What you will build: A linear regression model for housing prices
- Why: Classic beginner ML project with clear success criteria`,
        timestamp: new Date(Date.now() - 86300000).toISOString(),
        citations: [],
      },
    ],
  },
  {
    id: 'conv-python',
    title: 'Python questions',
    preview: 'List comprehensions are...',
    date: 'Yesterday',
    messages: [
      {
        id: 'm7',
        role: 'user',
        content: 'What are Python list comprehensions?',
        timestamp: new Date(Date.now() - 90000000).toISOString(),
      },
      {
        id: 'm8',
        role: 'assistant',
        content: `List comprehensions are a concise way to create lists in Python.

**Syntax:**
\`[expression for item in iterable if condition]\`

**Example:**
Instead of:
\`\`\`python
squares = []
for x in range(10):
    squares.append(x**2)
\`\`\`

You can write:
\`\`\`python
squares = [x**2 for x in range(10)]
\`\`\`

They are more readable, faster, and more Pythonic. Great for data transformation in ML preprocessing pipelines.`,
        timestamp: new Date(Date.now() - 89900000).toISOString(),
        citations: [],
      },
    ],
  },
];

export const mockAssistantResponses = {
  'What should I learn next?': `Based on your current roadmap, **Machine Learning** is your next major milestone. You have already completed Python and NumPy, and you're progressing through Statistics (60% done).

I recommend finishing your current Statistics resources first, then moving to the **Machine Learning Full Course 2024**.`,

  'Why is Machine Learning in my roadmap?': `Machine Learning is a **mandatory** skill for your AI Engineer goal. Here's why it's in your roadmap:

- It is the foundational framework that all advanced AI (Deep Learning, Generative AI) builds upon
- Every AI Engineer role requires strong ML knowledge
- It directly enables the skills listed in most AI Engineer job descriptions: model training, evaluation, and deployment

**Your prerequisites are almost ready:** Python (✅), NumPy (✅), Statistics (60% — finish this first).`,

  'Give me a project for my current level.': `Based on your current skills (Python: Intermediate, NumPy: Beginner), here's a perfect project:

**Customer Churn Prediction** 🎯

- **Dataset:** Telecom customer dataset (available on Kaggle)
- **Skills used:** Python, Pandas, Scikit-learn basics
- **What you'll build:** A model predicting which customers will cancel
- **Why perfect for you:** Bridges statistics and ML, uses your existing Python skills, and gives you a portfolio project`,

  'Am I on track for my 4-month deadline?': `**Yes, you are roughly on track** — but there's some compression needed in months 3–4.

Current status:
- Month 1 (Foundations): ✅ Completed
- Month 2 (Machine Learning): 🔶 Starting soon (on schedule)
- Month 3 (Deep Learning): ○ Not started yet
- Month 4 (Generative AI + Projects): ○ Not started yet

**Recommendation:** Increase study time from 10 to 12 hours/week in months 3–4 to stay on track. You have a 7-day streak — great momentum!`,
};

// Export alias for conversations used in components
export const mockChatConversations = mockConversations;

// Simple mock responses for chat assistant
export const mockResponses = [
  { content: "Sure, here's a quick summary...", citations: [] },
  { content: "Based on your roadmap, I suggest focusing on...", citations: [] },
  { content: "Let me explain that concept in detail...", citations: [] },
];
