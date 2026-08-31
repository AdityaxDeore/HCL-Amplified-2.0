import apiClient from './client';

export const healthApi = {
  async getHealth() {
    return await apiClient.get('/api/health');
  },
};

export default healthApi;
