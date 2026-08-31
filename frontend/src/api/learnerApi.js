import apiClient from './client';

export const learnerApi = {
  async getLearner() {
    const res = await apiClient.get('/api/learner');
    return res.data || res;
  },

  async getProfile() {
    const res = await apiClient.get('/api/learner/profile');
    return res.data || res;
  },

  async updateProfile(updates) {
    const res = await apiClient.put('/api/learner/profile', updates);
    return res.data || res;
  },
};

export default learnerApi;
