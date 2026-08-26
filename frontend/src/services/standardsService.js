import apiClient from "./apiClient";

export const standardsService = {
  async listStandards(params = {}) {
    const response = await apiClient.get("/standards", { params });
    return response.data;
  },

  async getStandardById(id) {
    const response = await apiClient.get(`/standards/${id}`);
    return response.data;
  },

  async createStandard(data) {
    const response = await apiClient.post("/standards", data);
    return response.data;
  },

  async updateStandard(id, data) {
    const response = await apiClient.put(`/standards/${id}`, data);
    return response.data;
  },
};
