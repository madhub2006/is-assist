import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Search, Eye, Filter, PlusCircle } from "lucide-react";
import { analysisService } from "../services/analysisService";
import { Breadcrumb, Table, LoadingState, ErrorState, Pagination } from "../components/common/FeedbackAndNavigation";
import { Card } from "../components/common/Card";
import { StatusBadge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { PrototypeBanner } from "../components/common/Indicators";
import { formatDate } from "../lib/utils";

export function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadAnalyses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await analysisService.listAnalyses({
        query: searchQuery || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      });
      setAnalyses(data);
    } catch (err) {
      setError("Failed to load historical analyses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnalyses();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const statuses = ["All", "In Review", "Completed", "Draft", "Processing"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Analyses History" },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              Procurement Analyses History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive log of created procurement analyses, tender reviews, and readiness evaluations.
            </p>
          </div>

          <Link to="/new-analysis">
            <Button variant="primary" icon={PlusCircle}>
              + New Analysis
            </Button>
          </Link>
        </div>
      </div>

      <PrototypeBanner />

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by analysis title, product name, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Loading historical analyses..." />
      ) : error ? (
        <ErrorState title="Error Loading History" message={error} onRetry={loadAnalyses} />
      ) : (
        <Card>
          <Table className="gov-table">
            <thead>
              <tr>
                <th>Analysis ID</th>
                <th>Procurement Item / Title</th>
                <th>Department</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Readiness Score</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {analyses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No procurement analyses found.
                  </td>
                </tr>
              ) : (
                analyses.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-mono text-xs font-bold text-navy-900">
                      #ANL-{String(a.id).padStart(4, "0")}
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900 text-xs">{a.product_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">{a.title}</div>
                    </td>
                    <td className="text-xs text-slate-600">
                      {a.department?.name || "General"}
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(a.created_at)}
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-10 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (a.readiness_score || 0) >= 80
                                ? "bg-emerald-500"
                                : (a.readiness_score || 0) >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${a.readiness_score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {a.readiness_score || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <Link
                        to={`/analyses/${a.id}`}
                        className="px-3 py-1 text-xs font-semibold text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Workspace
                      </Link>
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
