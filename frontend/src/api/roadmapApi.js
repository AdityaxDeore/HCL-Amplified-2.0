import apiClient from './client';

export const roadmapApi = {
  async getRoadmap() {
    const res = await apiClient.get('/api/roadmap');
    return res.data || res;
  },

  async getPersonalizedRoadmap(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/roadmap/personalized?learner_id=${learnerId}`);
    return res.data || res;
  },

  async getAllRoadmaps() {
    const res = await apiClient.get('/api/roadmaps/list');
    return res.data || [];
  },

  async getRoadmapById(roadmapId) {
    const res = await apiClient.get(`/api/roadmaps/${roadmapId}`);
    return res.data || res;
  },

  async getRoadmapGraph(roadmapId = 'ai-engineer') {
    const res = await apiClient.get(`/api/roadmaps/${roadmapId}/graph`);
    return res.data || res;
  },

  async getMilestones(roadmapId = 'ai-engineer') {
    const res = await apiClient.get(`/api/roadmaps/${roadmapId}/milestones`);
    return res.data || [];
  },

  async getNextNodes(roadmapId = 'ai-engineer', limit = 3) {
    const res = await apiClient.get(`/api/roadmaps/${roadmapId}/next?limit=${limit}`);
    return res.data || [];
  },

  async updateRoadmap(roadmapId, updates) {
    const res = await apiClient.put(`/api/roadmaps/${roadmapId}`, updates);
    return res.data || res;
  },

  async updateNode(roadmapId, nodeId, patch) {
    const res = await apiClient.patch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, patch);
    return res.data || res;
  },

  async deleteNode(roadmapId, nodeId) {
    const res = await apiClient.delete(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`);
    return res.data || res;
  },
};

export default roadmapApi;
