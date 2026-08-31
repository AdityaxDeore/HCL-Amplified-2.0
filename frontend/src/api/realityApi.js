import apiClient from './client';

export const realityApi = {
  async getRealityCheck(learnerId = 'demo-learner', params = {}) {
    const query = new URLSearchParams({ learner_id: learnerId });
    if (params.target_role) query.append('target_role', params.target_role);
    if (params.target_months) query.append('target_months', String(params.target_months));
    if (params.hours_per_week) query.append('hours_per_week', String(params.hours_per_week));
    const res = await apiClient.get(`/api/reality-check?${query.toString()}`);
    return res.data || res;
  },

  async evaluateCustomReality(data) {
    const res = await apiClient.post('/api/reality-check', data);
    return res.data || res;
  },
};

export default realityApi;
