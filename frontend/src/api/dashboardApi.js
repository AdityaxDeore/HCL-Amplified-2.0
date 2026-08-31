import apiClient from './client';

export const dashboardApi = {
  async getDashboard() {
    const res = await apiClient.get('/api/dashboard');
    return res.data || res;
  },
};

export default dashboardApi;
