import React, { useState, useEffect } from "react";
import { Shield, Search, Filter, Clock, User, Layers } from "lucide-react";
import { adminService } from "../services/adminService";
import { Breadcrumb, Table, LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";
import { Card } from "../components/common/Card";
import { formatDateTime } from "../lib/utils";

export function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.listAuditLogs({
        action: actionFilter !== "All" ? actionFilter : undefined,
      });
      setLogs(data);
    } catch (err) {
      setError("Failed to load compliance audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const actions = [
    "All",
    "LOGIN",
    "LOGOUT",
    "ANALYSIS_CREATED",
    "ANALYSIS_UPDATED",
    "DOCUMENT_UPLOADED",
    "REPORT_GENERATED",
    "USER_CREATED",
    "USER_UPDATED",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Administration" },
            { label: "Audit & Compliance Logs" },
          ]}
        />
        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              Audit Trail & Compliance History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable government audit log capturing authentication events, tender uploads, analysis runs, and report generations.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 inline-flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600" />
            Audit Logging Active
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg overflow-x-auto">
        {actions.map((act) => (
          <button
            key={act}
            onClick={() => setActionFilter(act)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              actionFilter === act
                ? "bg-navy-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {act === "All" ? "All Actions" : act.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading compliance audit events..." />
      ) : error ? (
        <ErrorState title="Error Loading Audit Trail" message={error} onRetry={loadLogs} />
      ) : (
        <Card>
          <Table className="gov-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Official User</th>
                <th>Entity Target</th>
                <th>Audit Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No audit records matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="text-xs text-slate-500 whitespace-nowrap font-mono">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-navy-900 border border-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900 text-xs">
                        {log.user?.name || "System Automated"}
                      </div>
                      <div className="text-[11px] text-slate-500">{log.user?.email}</div>
                    </td>
                    <td className="text-xs text-slate-600">
                      {log.entity_type ? `${log.entity_type} #${log.entity_id || ""}` : "—"}
                    </td>
                    <td className="text-xs text-slate-700 max-w-md">
                      {log.details || "—"}
                    </td>
                    <td className="text-xs text-slate-500 font-mono">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
