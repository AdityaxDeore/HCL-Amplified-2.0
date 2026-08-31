import apiClient from './client';

export const gapApi = {
  async getGaps(learnerId = 'demo-learner', targetRole = null) {
    const query = new URLSearchParams({ learner_id: learnerId });
    if (targetRole) query.append('target_role', targetRole);
    const res = await apiClient.get(`/api/gaps?${query.toString()}`);
    return res.data || res;
  },

  async analyzeCustomGaps(data) {
    const res = await apiClient.post('/api/gaps/analyze', data);
    return res.data || res;
  },

  async getGapById(skillId, learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/gaps/${skillId}?learner_id=${learnerId}`);
    return res.data || res;
  },
};

export default gapApi;
