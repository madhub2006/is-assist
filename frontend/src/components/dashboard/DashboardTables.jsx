import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, AlertCircle, Info, ChevronRight, Eye, FileDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../common/Card";
import { StatusBadge } from "../common/Badge";
import { Table } from "../common/FeedbackAndNavigation";
import { formatDate } from "../../lib/utils";

export function AttentionPanel({ items = [] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Attention Required
        </CardTitle>
        <CardDescription>Items pending verification or requiring action</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {items.map((item) => {
          const isCritical = item.type === "critical";
          const isWarning = item.type === "warning";

          return (
            <Link
              key={item.id}
              to={item.action_link}
              className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 hover:shadow-sm transition-all block ${
                isCritical
                  ? "bg-red-50/50 border-red-200 hover:border-red-300"
                  : isWarning
                  ? "bg-amber-50/50 border-amber-200 hover:border-amber-300"
                  : "bg-blue-50/50 border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isCritical && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                {!isCritical && !isWarning && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isCritical ? "bg-red-200 text-red-800" : isWarning ? "bg-amber-200 text-amber-800" : "bg-blue-200 text-blue-800"
                    }`}>
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{item.description}</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function RecentAnalysesTable({ analyses = [] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Procurement Analyses</CardTitle>
          <CardDescription>Latest specification assessments and tender evaluations</CardDescription>
        </div>
        <Link to="/history" className="text-xs font-semibold text-blue-600 hover:underline">
          View All Analyses →
        </Link>
      </CardHeader>
      <div className="p-0">
        <Table className="gov-table">
          <thead>
            <tr>
              <th>Analysis ID</th>
              <th>Product / Requirement</th>
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
                <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                  No procurement analyses created yet.
                </td>
              </tr>
            ) : (
              analyses.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="font-mono text-xs font-bold text-navy-900">
                    #ANL-{String(a.id).padStart(4, "0")}
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">{a.product_name}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{a.title}</div>
                  </td>
                  <td className="text-xs text-slate-600">
                    {a.department?.name || "General Procurement"}
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
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/analyses/${a.id}`}
                        className="px-2.5 py-1 text-xs font-medium text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}
