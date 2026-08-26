import apiClient from "./apiClient";

export const reportService = {
  async listReports(params = {}) {
    const response = await apiClient.get("/reports", { params });
    return response.data;
  },

  async getReportById(id) {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  async generateReport(analysisId) {
    const response = await apiClient.post(`/reports/generate/${analysisId}`);
    return response.data;
  },
};

export const adminService = {
  async listUsers(params = {}) {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  async createUser(data) {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  async getRoles() {
    const response = await apiClient.get("/users/roles");
    return response.data;
  },

  async getDepartments() {
    const response = await apiClient.get("/users/departments");
    return response.data;
  },

  async listAuditLogs(params = {}) {
    const response = await apiClient.get("/audit-logs", { params });
    return response.data;
  },
};

export const dashboardService = {
  async getStats() {
    const response = await apiClient.get("/dashboard/stats");
    return response.data;
  },
};
