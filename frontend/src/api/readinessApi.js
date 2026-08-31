import apiClient from './client';

export const readinessApi = {
  async getReadiness(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/readiness/${learnerId}`);
    return res.data || res;
  },

  async getSkillReadiness(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/readiness/${learnerId}/skills`);
    return res.data || [];
  },

  async getNextAction(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/readiness/${learnerId}/next-action`);
    return res.data || res;
  },

  async getReadinessHistory(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/readiness/${learnerId}/history`);
    return res.data || [];
  },

  async submitFeedback({ learnerId = 'demo-learner', type = 'difficulty', value = 'too_difficult', targetId = null, metadata = {} }) {
    const res = await apiClient.post('/api/feedback', {
      learnerId,
      type,
      value,
      targetId,
      metadata
    });
    return res.data || res;
  }
};

export default readinessApi;
