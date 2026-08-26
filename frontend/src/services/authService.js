import apiClient from "./apiClient";

export const authService = {
  async login(email, password) {
    const response = await apiClient.post("/auth/login", { email, password });
    const data = response.data;
    if (data.access_token) {
      localStorage.setItem("is_assist_token", data.access_token);
      localStorage.setItem("is_assist_user", JSON.stringify({
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
      }));
    }
    return data;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem("is_assist_token");
      localStorage.removeItem("is_assist_user");
    }
  },

  async getMe() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  getCurrentStoredUser() {
    const u = localStorage.getItem("is_assist_user");
    return u ? JSON.parse(u) : null;
  },

  getToken() {
    return localStorage.getItem("is_assist_token");
  },
};
