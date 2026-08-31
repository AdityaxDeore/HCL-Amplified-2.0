import apiClient from './client';

export const progressApi = {
  async getProgress() {
    const res = await apiClient.get('/api/progress');
    return res.data || res;
  },

  async patchProgress(patch) {
    const res = await apiClient.patch('/api/progress', patch);
    return res.data || res;
  },
};

export default progressApi;
