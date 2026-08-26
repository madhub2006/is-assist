import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, AlertTriangle, ShieldCheck, ExternalLink, ChevronRight, Layers } from "lucide-react";
import { analysisService } from "../services/analysisService";
import { Breadcrumb, LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/common/Card";
import { Badge, StatusBadge } from "../components/common/Badge";
import { PrototypeBanner } from "../components/common/Indicators";

export function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await analysisService.getTopRecommendations(20);
      setRecommendations(data);
    } catch (err) {
      setError("Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecs();
  }, []);

  if (loading) return <LoadingState message="Aggregating standards recommendations across active procurements..." />;
  if (error) return <ErrorState title="Error Loading Recommendations" message={error} onRetry={loadRecs} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Recommendations Intelligence" },
          ]}
        />
        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              Indian Standards Recommendation Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top algorithmic mappings, normative linkages, and potential missing standard references across department tenders.
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded-lg border border-purple-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Recommendation Engine (Phase 1)
          </span>
        </div>
      </div>

      <PrototypeBanner message="Prototype recommendations generated based on domain classification heuristics. Always verify standard applicability with authoritative BIS documentation." />

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-lg border text-center text-xs text-slate-400">
            No recommendations generated yet. Create a new procurement analysis to start.
          </div>
        ) : (
          recommendations.map((rec) => {
            const std = rec.standard;
            return (
              <Card key={rec.id} className="p-5 flex flex-col justify-between border-t-4 border-t-blue-600 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {std?.is_number || "DEMO-IS-XXXX"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      {rec.relevance_score}% Relevance
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{std?.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.reason}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Category: <span className="font-semibold text-slate-700">{std?.category}</span>
                  </span>
                  {std && (
                    <Link
                      to={`/standards/${std.id}`}
                      className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> View Standard
                    </Link>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
