import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { Input, Textarea, Select } from "../common/FormElements";
import { Button } from "../common/Button";
import { documentService } from "../../services/documentService";
import { useToast } from "../../hooks/useToast";

export function NaturalLanguageRequirementForm({ formData, setFormData, onSaveDraft, onStartAnalysis, isSubmitting }) {
  const categoryOptions = [
    { label: "Electrical & Electronics", value: "Electrical & Electronics" },
    { label: "Heavy Engineering & Transformers", value: "Heavy Engineering" },
    { label: "Civil Engineering & Piping", value: "Civil Engineering & Piping" },
    { label: "Personal Protective Equipment", value: "Personal Protective Equipment" },
    { label: "Metallurgy & Steel", value: "Metallurgy & Steel" },
    { label: "Healthcare & Medical Equipment", value: "Healthcare & Medical Equipment" },
    { label: "General Goods & Supplies", value: "General" },
  ];

  const procurementTypeOptions = [
    { label: "Goods (Equipment / Materials)", value: "Goods" },
    { label: "Works (Turnkey / Civil / EPC)", value: "Works" },
    { label: "Services (Consulting / Maintenance)", value: "Services" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Natural Language Requirement Input
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Describe the product, equipment, or service you intend to procure in plain English. The Phase 1 prototype evaluation engine will parse standard parameters and suggest matching Indian Standards.
        </p>
        <Textarea
          rows={5}
          placeholder="Example: We need to procure 1200 units of 100W LED street lights with IP66 protection, 10kV surge protection, and automated dimming functionality for highway lighting expansion..."
          value={formData.natural_language_input || ""}
          onChange={(e) => setFormData({ ...formData, natural_language_input: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Analysis / Tender Title *"
          placeholder="e.g. Smart LED Street Lighting for Highway Phase 2"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          label="Product / Item Name *"
          placeholder="e.g. LED Street Light 100W"
          value={formData.product_name || ""}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Product Category"
          options={categoryOptions}
          value={formData.category || "Electrical & Electronics"}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
        <Select
          label="Procurement Type"
          options={procurementTypeOptions}
          value={formData.procurement_type || "Goods"}
          onChange={(e) => setFormData({ ...formData, procurement_type: e.target.value })}
        />
        <Input
          label="Estimated Quantity"
          placeholder="e.g. 1200 Units"
          value={formData.quantity || ""}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        />
      </div>

      <Textarea
        label="Application / Intended Operating Environment"
        placeholder="Specify environmental conditions (outdoor, coastal, high-temperature, hazardous area) and primary operational role..."
        rows={3}
        value={formData.application_use || ""}
        onChange={(e) => setFormData({ ...formData, application_use: e.target.value })}
      />

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          variant="secondary"
          onClick={onSaveDraft}
          loading={isSubmitting}
        >
          Save Draft
        </Button>
        <Button
          variant="primary"
          onClick={onStartAnalysis}
          loading={isSubmitting}
        >
          Start Prototype Analysis →
        </Button>
      </div>
    </div>
  );
}

export function TechnicalSpecForm({ specData, setSpecData, onSaveDraft, onStartAnalysis, isSubmitting }) {
  const sections = [
    { key: "general", label: "General & Dimensions", placeholder: "Dimensions, enclosure material, weight, operating voltage range..." },
    { key: "performance", label: "Performance Requirements", placeholder: "Efficacy (lm/W), efficiency rating, power factor, lumen output..." },
    { key: "safety", label: "Safety & Ingress Protection", placeholder: "IP rating (e.g. IP66), insulation class, grounding, thermal endurance..." },
    { key: "testing", label: "Testing & Acceptance Criteria", placeholder: "Surge withstand (kV), high voltage test, life cycle test, NABL accredited lab test report..." },
    { key: "certification", label: "Certification & Regulatory", placeholder: "BIS CRS registration, BEE Star Labeling, ISO 9001 quality assurance..." },
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">
        Enter granular technical clauses and parameters. These will be mapped to Indian Standard testing and safety specifications.
      </p>

      {sections.map((sec) => (
        <div key={sec.key} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
            {sec.label}
          </label>
          <Textarea
            rows={3}
            placeholder={sec.placeholder}
            value={specData[sec.key] || ""}
            onChange={(e) => setSpecData({ ...specData, [sec.key]: e.target.value })}
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button variant="secondary" onClick={onSaveDraft} loading={isSubmitting}>
          Save Draft Specs
        </Button>
        <Button variant="primary" onClick={onStartAnalysis} loading={isSubmitting}>
          Evaluate Technical Specifications →
        </Button>
      </div>
    </div>
  );
}

export function TenderDocumentUploadTab({ selectedFile, setSelectedFile, uploadProgress, onStartAnalysis, isSubmitting }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedFile(file);
      } else {
        alert("Only PDF documents are supported for tender processing.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedFile(file);
      } else {
        alert("Only PDF documents are supported for tender processing.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Upload Tender Document (PDF)</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Drag and drop your RFP / NIT tender specification PDF here, or browse from your computer. Max size 25MB.
        </p>

        <label className="mt-4 inline-block">
          <input
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
          <span className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 shadow-sm cursor-pointer inline-flex items-center gap-2">
            Select PDF File
          </span>
        </label>
      </div>

      {selectedFile && (
        <div className="p-4 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFile(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">PyMuPDF Document Parser Integration: </span>
          Upon upload, the backend will securely extract text clauses and metadata for standards analysis.
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <Button
          variant="primary"
          disabled={!selectedFile}
          onClick={onStartAnalysis}
          loading={isSubmitting}
        >
          Upload & Start Analysis →
        </Button>
      </div>
    </div>
  );
}
