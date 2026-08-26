import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import { AppLayout, ProtectedAdminRoute } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";

// Pages
import { Login } from "./pages/Login";
import { ForgotPassword, ResetPassword } from "./pages/PasswordReset";
import { Dashboard } from "./pages/Dashboard";
import { NewAnalysis } from "./pages/NewAnalysis";
import { AnalysisDetail } from "./pages/AnalysisDetail";
import { StandardsDirectory } from "./pages/StandardsDirectory";
import { StandardDetail } from "./pages/StandardDetail";
import { Recommendations } from "./pages/Recommendations";
import { Findings } from "./pages/Findings";
import { Reports } from "./pages/Reports";
import { History } from "./pages/History";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminAuditLogs } from "./pages/AdminAuditLogs";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected Application Routes */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-analysis" element={<NewAnalysis />} />
                <Route path="/analyses/:id" element={<AnalysisDetail />} />
                <Route path="/standards" element={<StandardsDirectory />} />
                <Route path="/standards/:id" element={<StandardDetail />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/findings" element={<Findings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/:id" element={<Reports />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedAdminRoute>
                      <AdminUsers />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedAdminRoute>
                      <AdminAuditLogs />
                    </ProtectedAdminRoute>
                  }
                />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
