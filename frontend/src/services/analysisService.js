import apiClient from "./apiClient";

export const analysisService = {
  async listAnalyses(params = {}) {
    const response = await apiClient.get("/analyses", { params });
    return response.data;
  },

  async getAnalysisById(id) {
    const response = await apiClient.get(`/analyses/${id}`);
    return response.data;
  },

  async createAnalysis(data) {
    const response = await apiClient.post("/analyses", data);
    return response.data;
  },

  async updateAnalysis(id, data) {
    const response = await apiClient.put(`/analyses/${id}`, data);
    return response.data;
  },

  async deleteAnalysis(id) {
    const response = await apiClient.delete(`/analyses/${id}`);
    return response.data;
  },

  // Requirements
  async addRequirement(analysisId, data) {
    const response = await apiClient.post(`/analyses/${analysisId}/requirements`, data);
    return response.data;
  },

  async updateRequirement(requirementId, data) {
    const response = await apiClient.put(`/requirements/${requirementId}`, data);
    return response.data;
  },

  async deleteRequirement(requirementId) {
    const response = await apiClient.delete(`/requirements/${requirementId}`);
    return response.data;
  },

  // Recommendations & Findings
  async getRecommendations(analysisId) {
    const response = await apiClient.get(`/analyses/${analysisId}/recommendations`);
    return response.data;
  },

  async getTopRecommendations(limit = 10) {
    const response = await apiClient.get("/recommendations/top", { params: { limit } });
    return response.data;
  },

  async recommendStandards(analysisId, top_k = 5) {
    const response = await apiClient.post(`/analyses/${analysisId}/recommend`, { top_k });
    return response.data;
  },

  async processDocument(analysisId) {
    const response = await apiClient.post(`/analyses/${analysisId}/process-document`);
    return response.data;
  },

  async getReadinessScore(analysisId) {
    const response = await apiClient.get(`/analyses/${analysisId}/readiness-score`);
    return response.data;
  },

  async askAssistant(question, analysisId) {
    const response = await apiClient.post("/chat", { question, analysis_id: analysisId });
    return response.data;
  },

  async getFindings(analysisId) {
    const response = await apiClient.get(`/analyses/${analysisId}/findings`);
    return response.data;
  },

  async listAllFindings(params = {}) {
    const response = await apiClient.get("/findings", { params });
    return response.data;
  },

  async updateFindingStatus(findingId, status) {
    const response = await apiClient.put(`/findings/${findingId}/status`, null, {
      params: { status_value: status },
    });
    return response.data;
  },
};
