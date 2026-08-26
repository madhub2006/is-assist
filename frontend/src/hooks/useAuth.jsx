import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role ? profile.role.name : "Procurement Officer",
            department: profile.department ? profile.department.name : null,
          });
        } catch (e) {
          // Token invalid
          setUser(null);
          localStorage.removeItem("is_assist_token");
          localStorage.removeItem("is_assist_user");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const loggedUser = {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
    };
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === "Admin";
  const isOfficer = user?.role === "Procurement Officer";
  const isReviewer = user?.role === "Reviewer";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isOfficer,
        isReviewer,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
