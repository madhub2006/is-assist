import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FileSearch,
  BookOpen,
  Sparkles,
  FileText,
  History,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "New Analysis", path: "/new-analysis", icon: PlusCircle },
    { label: "Tender Analysis", path: "/new-analysis?tab=tender", icon: FileSearch },
    { label: "Standards Directory", path: "/standards", icon: BookOpen },
    { label: "Recommendations", path: "/recommendations", icon: Sparkles },
    { label: "Findings & Risks", path: "/findings", icon: ShieldCheck },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "History", path: "/history", icon: History },
  ];

  const adminItems = [
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Audit & Compliance", path: "/admin/audit-logs", icon: Shield },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-navy-900 text-slate-200 border-r border-navy-950 flex flex-col justify-between transition-all duration-300 z-30 sticky top-0 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Section: Logo & Brand */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-navy-800/80">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-base text-white tracking-wide">
                  IS-Assist
                </span>
                <span className="block text-[10px] text-blue-300 font-medium tracking-tight">
                  Procurement Intel
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md mx-auto">
              <Layers className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-navy-800 transition-colors",
              collapsed && "hidden"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="py-4 px-2 space-y-1">
          <div className={cn("px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2", collapsed && "sr-only")}>
            Core Workflow
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative group",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:bg-navy-800 hover:text-white"
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-navy-950 text-white text-xs rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Admin Navigation Section */}
          {isAdmin && (
            <>
              <div className={cn("pt-4 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2", collapsed && "sr-only")}>
                Administration
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative group",
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "text-slate-300 hover:bg-navy-800 hover:text-white"
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-navy-950 text-white text-xs rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </>
          )}

          <div className="pt-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative group",
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                )
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-navy-950 text-white text-xs rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto z-50 whitespace-nowrap">
                  Settings
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-3 border-t border-navy-800/80 bg-navy-950/40">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-600">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name}</p>
                <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-navy-800 text-blue-300 font-medium mt-0.5">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-navy-800"
              title="Expand"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
