import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  UploadCloud,
  FileCheck2,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { dashboardService } from "../services/dashboardService";
import { MetricCard, PrototypeBanner } from "../components/common/Indicators";
import { Button } from "../components/common/Button";
import { ActivityChart, StatusChart, ReadinessChart } from "../components/dashboard/Charts";
import { AttentionPanel, RecentAnalysesTable } from "../components/dashboard/DashboardTables";
import { LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError("Failed to connect to IS-Assist backend. Please ensure the server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading procurement intelligence & registry metrics..." />;
  }

  if (error) {
    return <ErrorState title="Backend Communication Error" message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
              Procurement Intelligence
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Phase 1 Foundation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight mt-1">
            Procurement Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Analyze procurement requirements, detect missing specifications, and map applicable Indian Standards (IS) with algorithmic precision.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            icon={UploadCloud}
            onClick={() => navigate("/new-analysis?tab=tender")}
          >
            Upload Tender
          </Button>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate("/new-analysis")}
          >
            + New Analysis
          </Button>
        </div>
      </div>

      <PrototypeBanner />

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Analyses"
          value={stats?.total_analyses || 0}
          subtitle="Procurement assessments"
          icon={FileCheck2}
          color="blue"
        />
        <MetricCard
          title="Pending Reviews"
          value={stats?.pending_reviews || 0}
          subtitle="Awaiting committee review"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Standards Reviewed"
          value={stats?.standards_reviewed || 0}
          subtitle="Demo IS registry entries"
          icon={BookOpen}
          color="emerald"
        />
        <MetricCard
          title="Reports Generated"
          value={stats?.reports_generated || 0}
          subtitle="Advisory briefs compiled"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart data={stats?.activity_chart || []} />
        </div>
        <div className="lg:col-span-1">
          <StatusChart data={stats?.status_distribution || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReadinessChart data={stats?.readiness_scores || []} />
        </div>
        <div className="lg:col-span-1">
          <AttentionPanel items={stats?.attention_items || []} />
        </div>
      </div>

      {/* Recent Analyses Table */}
      <RecentAnalysesTable analyses={stats?.recent_analyses || []} />
    </div>
  );
}
