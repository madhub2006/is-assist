import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Cpu, UploadCloud, AlertCircle } from "lucide-react";
import { Tabs, Breadcrumb } from "../components/common/FeedbackAndNavigation";
import { PrototypeBanner } from "../components/common/Indicators";
import {
  NaturalLanguageRequirementForm,
  TechnicalSpecForm,
  TenderDocumentUploadTab,
} from "../components/analysis/AnalysisForms";
import { analysisService } from "../services/analysisService";
import { documentService } from "../services/documentService";
import { useToast } from "../hooks/useToast";

export function NewAnalysis() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const initialTab = searchParams.get("tab") === "tender" ? "tender" : "natural";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    product_name: "",
    category: "Electrical & Electronics",
    procurement_type: "Goods",
    quantity: "",
    application_use: "",
    natural_language_input: "",
  });

  const [specData, setSpecData] = useState({
    general: "",
    performance: "",
    safety: "",
    testing: "",
    certification: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const tabs = [
    { id: "natural", label: "1. Product Requirement", icon: FileText },
    { id: "specs", label: "2. Technical Specification", icon: Cpu },
    { id: "tender", label: "3. Tender Document (PDF)", icon: UploadCloud },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams(tabId === "tender" ? { tab: "tender" } : {});
  };

  const handleSave = async (runMockAnalysis = true) => {
    if (!formData.product_name.trim() && !selectedFile) {
      setError("Please specify the product or item name to analyze.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim() || `Procurement Analysis: ${formData.product_name || selectedFile?.name || "Tender Document"}`,
        product_name: formData.product_name.trim() || (selectedFile ? selectedFile.name.replace(/\.pdf$/i, "") : "Equipment Procurement"),
        category: formData.category,
        procurement_type: formData.procurement_type,
        quantity: formData.quantity,
        application_use: formData.application_use,
        natural_language_input: formData.natural_language_input,
        technical_spec_json: specData,
        run_mock_analysis: runMockAnalysis,
      };

      const result = await analysisService.createAnalysis(payload);

      // If a PDF file is attached, upload it to the newly created analysis
      if (selectedFile) {
        toast.info("Uploading PDF", "Processing tender document through PyMuPDF...");
        await documentService.uploadDocument(result.id, selectedFile);
      }

      toast.success(
        runMockAnalysis ? "Analysis Completed" : "Draft Saved",
        `Created analysis #ANL-${String(result.id).padStart(4, "0")}`
      );

      navigate(`/analyses/${result.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail?.message || "Failed to create analysis.";
      setError(msg);
      toast.error("Analysis Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "New Procurement Analysis" },
          ]}
        />
        <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">
          Create New Procurement Analysis
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter product requirements, specifications, or upload tender documents to evaluate Indian Standards coverage.
        </p>
      </div>

      <PrototypeBanner />

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 pt-4 bg-slate-50/70 border-b border-slate-200">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        </div>

        <div className="p-6">
          {activeTab === "natural" && (
            <NaturalLanguageRequirementForm
              formData={formData}
              setFormData={setFormData}
              onSaveDraft={() => handleSave(false)}
              onStartAnalysis={() => handleSave(true)}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === "specs" && (
            <TechnicalSpecForm
              specData={specData}
              setSpecData={setSpecData}
              onSaveDraft={() => handleSave(false)}
              onStartAnalysis={() => handleSave(true)}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === "tender" && (
            <TenderDocumentUploadTab
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              onStartAnalysis={() => handleSave(true)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
