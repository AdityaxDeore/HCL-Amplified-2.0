import apiClient from './client';

export const recommendationApi = {
  async getRecommendations(learnerId = 'demo-learner', targetRole = null, limit = 5) {
    const query = new URLSearchParams({ learner_id: learnerId, limit: String(limit) });
    if (targetRole) query.append('target_role', targetRole);
    const res = await apiClient.get(`/api/recommendations?${query.toString()}`);
    return res.data || res;
  },

  async getNextBestActions(learnerId = 'demo-learner', targetRole = null, limit = 3) {
    const query = new URLSearchParams({ learner_id: learnerId, limit: String(limit) });
    if (targetRole) query.append('target_role', targetRole);
    const res = await apiClient.get(`/api/recommendations/next?${query.toString()}`);
    return res.data || [];
  },

  async refreshRecommendations(learnerId = 'demo-learner', targetRole = null) {
    const query = new URLSearchParams({ learner_id: learnerId });
    if (targetRole) query.append('target_role', targetRole);
    const res = await apiClient.post(`/api/recommendations/refresh?${query.toString()}`);
    return res.data || res;
  },
};

export default recommendationApi;
