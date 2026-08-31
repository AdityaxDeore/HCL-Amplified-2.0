import apiClient from './client';

export const assistantApi = {
  async sendMessage(message, conversationId = null, learnerId = 'demo-learner') {
    const res = await apiClient.post('/api/assistant/chat', {
      learnerId,
      conversationId: conversationId === 'new' ? null : conversationId,
      message
    });
    return res.data || res;
  },

  async getConversations(learnerId = 'demo-learner') {
    const res = await apiClient.get(`/api/assistant/conversations?learner_id=${learnerId}`);
    return res.data || [];
  },

  async getConversationById(conversationId) {
    const res = await apiClient.get(`/api/assistant/conversations/${conversationId}`);
    return res.data || res;
  },

  async deleteConversation(conversationId) {
    const res = await apiClient.delete(`/api/assistant/conversations/${conversationId}`);
    return res.data || res;
  }
};

export default assistantApi;
