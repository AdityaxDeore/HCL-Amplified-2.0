import apiClient from './client';

export const resourcesApi = {
  async getResources(params = {}) {
    const query = new URLSearchParams();
    if (params.skill_id) query.append('skill_id', params.skill_id);
    if (params.resource_type && params.resource_type !== 'All') query.append('resource_type', params.resource_type);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get(`/api/resources${qs}`);
    return res.data || [];
  },

  async searchResources(q, params = {}) {
    const query = new URLSearchParams({ q });
    if (params.skill_id) query.append('skill_id', params.skill_id);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    const res = await apiClient.get(`/api/resources/search?${query.toString()}`);
    return res.data || { resources: [], total_results: 0 };
  },

  async getResourcesForSkill(skillId, limit = 5) {
    const res = await apiClient.get(`/api/resources/skill/${skillId}?limit=${limit}`);
    return res.data || [];
  },

  async getNextActionResource(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/resources/next-action?learner_id=${learnerId}`);
    return res.data || res;
  },

  async getResourceById(resourceId) {
    const res = await apiClient.get(`/api/resources/${resourceId}`);
    return res.data || res;
  },

  async submitFeedback(resourceId, feedbackData) {
    const res = await apiClient.post(`/api/resources/${resourceId}/feedback`, feedbackData);
    return res.data || res;
  },

  async getRAGContext(skillId = 'statistics', query = null) {
    const qs = query ? `&query=${encodeURIComponent(query)}` : '';
    const res = await apiClient.get(`/api/resources/rag/context?skill_id=${skillId}${qs}`);
    return res.data || res;
  },
};

export default resourcesApi;
