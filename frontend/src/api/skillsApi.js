import apiClient from './client';

export const skillsApi = {
  async getSkills(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get(`/api/skills${qs}`);
    return res.data || [];
  },

  async searchSkills(q, params = {}) {
    const query = new URLSearchParams({ q });
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    const res = await apiClient.get(`/api/skills/search?${query.toString()}`);
    return res.data || [];
  },

  async getSkillById(skillId) {
    const res = await apiClient.get(`/api/skills/${skillId}`);
    return res.data || res;
  },

  async getSkillGraph() {
    const res = await apiClient.get('/api/skills/graph');
    return res.data || res;
  },

  async getPrerequisites(skillId) {
    const res = await apiClient.get(`/api/skills/${skillId}/prerequisites`);
    return res.data || [];
  },

  async getDependents(skillId) {
    const res = await apiClient.get(`/api/skills/${skillId}/dependents`);
    return res.data || [];
  },

  async getRelated(skillId) {
    const res = await apiClient.get(`/api/skills/${skillId}/related`);
    return res.data || [];
  },

  async getUpstream(skillId) {
    const res = await apiClient.get(`/api/skills/${skillId}/upstream`);
    return res.data || [];
  },

  async getDownstream(skillId) {
    const res = await apiClient.get(`/api/skills/${skillId}/downstream`);
    return res.data || [];
  },

  async getPath(source, target) {
    const query = new URLSearchParams({ source, target });
    const res = await apiClient.get(`/api/skills/path?${query.toString()}`);
    return res.data || res;
  },
};

export default skillsApi;
