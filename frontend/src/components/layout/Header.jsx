import React, { useState } from "react";
import { Search, Bell, Shield, ChevronDown, User, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function Header({ title, breadcrumbs }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const notifications = [
    { id: 1, title: "Surge Protection Incomplete", desc: "100W Smart LED Street Light needs verification", time: "10m ago" },
    { id: 2, title: "Tender Review Assigned", desc: "New transformer analysis assigned to reviewer", time: "1h ago" },
    { id: 3, title: "Standard Reaffirmed", desc: "IS 10322 reaffirmed by technical committee", time: "2d ago" },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        {breadcrumbs}
        <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight -mt-1">
          {title || "Procurement Intelligence"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment / Prototype Label */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          Government / Enterprise Phase 1
        </span>

        {/* Global Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IS numbers, analyses..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                navigate(`/standards?query=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 font-semibold text-slate-800 flex justify-between items-center">
                <span>System Notices</span>
                <span className="text-[10px] text-blue-600 font-normal">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    <p className="text-slate-500 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{user?.department || user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" /> User Profile & Security
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
