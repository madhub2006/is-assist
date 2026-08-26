import apiClient from "./apiClient";

export const documentService = {
  async uploadDocument(analysisId, file, onUploadProgress) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`/analyses/${analysisId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },

  async getDocumentsByAnalysis(analysisId) {
    const response = await apiClient.get(`/analyses/${analysisId}/documents`);
    return response.data;
  },

  async getDocumentDetails(documentId) {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  getDownloadUrl(documentId) {
    return `/api/documents/${documentId}/download`;
  },

  async deleteDocument(documentId) {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },
};
