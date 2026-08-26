import React, { useState } from "react";
import { User, Lock, Globe, Bell, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { useToast } from "../hooks/useToast";
import { Breadcrumb, Tabs } from "../components/common/FeedbackAndNavigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/FormElements";

export function Settings() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    reviewAssigned: true,
    standardAmended: true,
    reportGenerated: false,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mismatch", "New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Too Short", "New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password Updated", "Your password has been changed securely.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Failed", err.response?.data?.detail?.message || "Invalid current password.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Official Profile", icon: User },
    { id: "security", label: "Security & Credentials", icon: Lock },
    { id: "preferences", label: "System Preferences", icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Settings" },
          ]}
        />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight mt-1">
          Account Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage officer profile, password credentials, and portal preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-lg text-xs">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{user?.name}</h4>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Input label="Officer Name" value={user?.name || ""} disabled />
                <Input label="Official Email" value={user?.email || ""} disabled />
                <Input label="Department" value={user?.department || "General Procurement"} disabled />
                <Input label="System Role" value={user?.role || "Procurement Officer"} disabled />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Password changes take effect immediately and are recorded in the audit trail.</span>
              </div>

              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" loading={loading} className="mt-2">
                Update Password
              </Button>
            </form>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6 max-w-lg text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1.5">Portal Language</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      language === "en" ? "border-navy-900 bg-slate-50 font-bold" : "border-slate-200"
                    }`}
                  >
                    English (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("hi")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      language === "hi" ? "border-navy-900 bg-slate-50 font-bold" : "border-slate-200"
                    }`}
                  >
                    हिंदी (Hindi — Phase 3)
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="font-semibold text-slate-800 block">Notification Alerts</label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.reviewAssigned}
                    onChange={(e) => setNotifications({ ...notifications, reviewAssigned: e.target.checked })}
                    className="rounded border-slate-300 text-navy-900 focus:ring-navy-900"
                  />
                  <span>Notify when an analysis is assigned for committee review</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.standardAmended}
                    onChange={(e) => setNotifications({ ...notifications, standardAmended: e.target.checked })}
                    className="rounded border-slate-300 text-navy-900 focus:ring-navy-900"
                  />
                  <span>Notify when an Indian Standard referenced in my tenders is amended</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
