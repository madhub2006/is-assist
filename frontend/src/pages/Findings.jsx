import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertCircle, AlertTriangle, Info, Shield, Filter, CheckCircle2 } from "lucide-react";
import { analysisService } from "../services/analysisService";
import { Breadcrumb, LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";
import { Card } from "../components/common/Card";
import { PrototypeBanner } from "../components/common/Indicators";
import { SEVERITY_CONFIG } from "../lib/constants";
import { useToast } from "../hooks/useToast";

export function Findings() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const toast = useToast();

  const loadFindings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await analysisService.listAllFindings({
        severity: selectedSeverity !== "All" ? selectedSeverity : undefined,
      });
      setFindings(data);
    } catch (err) {
      setError("Failed to load findings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [selectedSeverity]);

  const handleStatusUpdate = async (findingId, newStatus) => {
    try {
      await analysisService.updateFindingStatus(findingId, newStatus);
      toast.success("Status Updated", `Finding marked as ${newStatus}.`);
      loadFindings();
    } catch (err) {
      toast.error("Update Failed", "Could not update finding status.");
    }
  };

  const severities = ["All", "CRITICAL", "WARNING", "INFO", "NEEDS_VERIFICATION"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Findings & Risk Radar" },
          ]}
        />
        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              Technical Findings & Risk Radar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified specification gaps, missing testing criteria, and standards verification items across all tenders.
            </p>
          </div>
        </div>
      </div>

      <PrototypeBanner />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg overflow-x-auto">
        {severities.map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              selectedSeverity === sev
                ? "bg-navy-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {sev === "All" ? "All Severities" : SEVERITY_CONFIG[sev]?.label || sev}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading risk items..." />
      ) : error ? (
        <ErrorState title="Error Loading Findings" message={error} onRetry={loadFindings} />
      ) : (
        <div className="space-y-4">
          {findings.length === 0 ? (
            <div className="p-12 bg-white rounded-lg border text-center text-xs text-slate-400">
              No technical findings identified for this filter.
            </div>
          ) : (
            findings.map((f) => {
              const config = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.INFO;

              return (
                <div
                  key={f.id}
                  className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white shadow-sm ${
                    f.severity === "CRITICAL" ? "border-l-4 border-l-red-600" : f.severity === "WARNING" ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-blue-500"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {f.severity === "CRITICAL" && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                    {f.severity === "WARNING" && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                    {f.severity === "INFO" && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                    {f.severity === "NEEDS_VERIFICATION" && <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${config.badge}`}>
                          {config.label}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{f.description}</p>

                      {f.recommendation && (
                        <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <span className="font-semibold text-slate-800">Action Recommended: </span>
                          <span className="text-slate-600">{f.recommendation}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Analysis ID: <span className="font-semibold text-navy-900">#ANL-{String(f.analysis_id).padStart(4, "0")}</span></span>
                        <span>•</span>
                        <span>Current Status: <span className="font-semibold text-slate-700">{f.status}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {f.status !== "Resolved" ? (
                      <button
                        onClick={() => handleStatusUpdate(f.id, "Resolved")}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mark Resolved
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                        Resolved
                      </span>
                    )}

                    <Link
                      to={`/analyses/${f.analysis_id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Analysis
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
