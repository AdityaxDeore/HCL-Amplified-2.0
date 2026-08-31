import apiClient from './client';

export const interviewApi = {
  async startInterview(params = {}) {
    const payload = {
      learnerId: params.learnerId || 'demo-learner',
      targetRole: params.targetRole || 'AI Engineer',
      interviewType: params.interviewType || 'mixed',
      difficulty: params.difficulty || 'adaptive',
      questionCount: params.questionCount || 6,
      focusSkills: params.focusSkills || []
    };
    const res = await apiClient.post('/api/interviews', payload);
    return res.data || res;
  },

  async getSession(sessionId) {
    const res = await apiClient.get(`/api/interviews/${sessionId}`);
    return res.data || res;
  },

  async getCurrentQuestion(sessionId) {
    const res = await apiClient.get(`/api/interviews/${sessionId}/current`);
    return res.data || res;
  },

  async submitAnswer(sessionId, answer) {
    const res = await apiClient.post(`/api/interviews/${sessionId}/answer`, { answer });
    return res.data || res;
  },

  async submitFollowUp(sessionId, answer) {
    const res = await apiClient.post(`/api/interviews/${sessionId}/follow-up`, { answer });
    return res.data || res;
  },

  async nextQuestion(sessionId) {
    const res = await apiClient.post(`/api/interviews/${sessionId}/next`);
    return res.data || res;
  },

  async completeInterview(sessionId) {
    const res = await apiClient.post(`/api/interviews/${sessionId}/complete`);
    return res.data || res;
  },

  async getHistory(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/interviews/history/${learnerId}`);
    return res.data || [];
  }
};

export default interviewApi;
