import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck2,
  BookOpen,
  AlertTriangle,
  FileText,
  Clock,
  Download,
  Share2,
  Printer,
  ChevronLeft,
} from "lucide-react";
import { analysisService } from "../services/analysisService";
import { reportService } from "../services/reportService";
import { useToast } from "../hooks/useToast";
import { Breadcrumb, Tabs, LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";
import { StatusBadge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import {
  AnalysisOverviewTab,
  AnalysisRequirementsTab,
  AnalysisStandardsTab,
  AnalysisFindingsTab,
  AnalysisDocumentsTab,
  AnalysisActivityTab,
  AIAssistantTab,
} from "../components/analysis/AnalysisWorkspaceTabs";
import { formatDate } from "../lib/utils";

export function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState(null);

  const loadAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await analysisService.getAnalysisById(id);
      setAnalysis(data);
    } catch (err) {
      setError("Failed to load analysis details. The record might not exist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const handleAddRequirement = async (reqData) => {
    try {
      await analysisService.addRequirement(id, reqData);
      toast.success("Requirement Added", `Added '${reqData.name}' to specification.`);
      loadAnalysis();
    } catch (err) {
      toast.error("Failed to Add", "Could not add requirement parameter.");
    }
  };

  const handleDeleteRequirement = async (reqId) => {
    try {
      await analysisService.deleteRequirement(reqId);
      toast.info("Requirement Removed", "Parameter removed from evaluation.");
      loadAnalysis();
    } catch (err) {
      toast.error("Failed to Remove", "Could not delete requirement.");
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await reportService.generateReport(id);
      toast.success("Report Generated", "Procurement Advisory Report compiled successfully.");
      navigate(`/reports/${res.id}`);
    } catch (err) {
      toast.error("Generation Failed", "Could not compile advisory report.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSemanticAnalysis = async () => {
    setProcessing(true);
    try {
      const result = analysis.documents?.length
        ? await analysisService.processDocument(id)
        : await analysisService.recommendStandards(id);
      toast.success("Analysis Updated", result.message || "Semantic analysis completed.");
      await loadAnalysis();
    } catch (err) {
      toast.error("Analysis Failed", err.response?.data?.message || "Could not complete semantic analysis.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAskAssistant = async (question) => {
    setProcessing(true);
    try {
      setAssistantAnswer(await analysisService.askAssistant(question, id));
    } catch (err) {
      toast.error("Assistant Unavailable", "The indexed sources could not be queried.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingState message="Loading procurement workspace & standard mappings..." />;
  if (error || !analysis) return <ErrorState title="Analysis Unavailable" message={error} onRetry={loadAnalysis} />;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requirements", label: "Requirements", icon: FileCheck2, badge: analysis.requirements?.length },
    { id: "standards", label: "Standards (IS)", icon: BookOpen, badge: analysis.recommendations?.length },
    { id: "findings", label: "Findings & Risks", icon: AlertTriangle, badge: analysis.findings?.length },
    { id: "documents", label: "Documents", icon: FileText, badge: analysis.documents?.length },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "assistant", label: "AI Assistant", icon: BookOpen },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Meta Bar */}
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Analyses", href: "/history" },
            { label: `#ANL-${String(analysis.id).padStart(4, "0")}` },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                #ANL-{String(analysis.id).padStart(4, "0")}
              </span>
              <StatusBadge status={analysis.status} />
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Created {formatDate(analysis.created_at)}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              {analysis.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Product: <span className="font-semibold text-slate-700">{analysis.product_name}</span> • 
              Department: <span className="font-semibold text-slate-700">{analysis.department?.name || "General Procurement"}</span> • 
              Type: <span className="font-semibold text-slate-700">{analysis.procurement_type}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              icon={BookOpen}
              loading={processing}
              onClick={handleSemanticAnalysis}
            >
              {analysis.documents?.length ? "Process Tender" : "Run Semantic Search"}
            </Button>
            <Button
              variant="primary"
              icon={FileText}
              loading={generatingReport}
              onClick={handleGenerateReport}
            >
              Generate Advisory Report
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 pt-3 bg-slate-50/80 border-b border-slate-200 overflow-x-auto">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-6">
          {activeTab === "overview" && <AnalysisOverviewTab analysis={analysis} />}
          {activeTab === "requirements" && (
            <AnalysisRequirementsTab
              requirements={analysis.requirements || []}
              onAddRequirement={handleAddRequirement}
              onDeleteRequirement={handleDeleteRequirement}
            />
          )}
          {activeTab === "standards" && (
            <AnalysisStandardsTab recommendations={analysis.recommendations || []} />
          )}
          {activeTab === "findings" && (
            <AnalysisFindingsTab findings={analysis.findings || []} />
          )}
          {activeTab === "documents" && (
            <AnalysisDocumentsTab documents={analysis.documents || []} />
          )}
          {activeTab === "activity" && <AnalysisActivityTab analysis={analysis} />}
          {activeTab === "assistant" && <AIAssistantTab analysis={analysis} onAsk={handleAskAssistant} answer={assistantAnswer} loading={processing} />}
        </div>
      </div>
    </div>
  );
}
