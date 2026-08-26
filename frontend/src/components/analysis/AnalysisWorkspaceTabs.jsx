import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  BookOpen,
  FileText,
  Eye,
  Download,
  Plus,
  Trash2,
  Clock,
  Shield,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../common/Card";
import { ScoreCard, PrototypeBanner } from "../common/Indicators";
import { Badge, StatusBadge } from "../common/Badge";
import { Button } from "../common/Button";
import { Table } from "../common/FeedbackAndNavigation";
import { Modal } from "../common/Modal";
import { SEVERITY_CONFIG } from "../../lib/constants";
import { formatDate, formatDateTime, formatFileSize } from "../../lib/utils";
import { documentService } from "../../services/documentService";

export function AnalysisOverviewTab({ analysis }) {
  const requirements = analysis.requirements || [];
  const recommendations = analysis.recommendations || [];
  const findings = analysis.findings || [];
  const documents = analysis.documents || [];

  const providedCount = requirements.filter((r) => r.status === "Provided").length;
  const missingCount = requirements.filter((r) => r.status === "Missing").length;
  const reviewCount = requirements.filter((r) => r.status === "Needs Review").length;

  return (
    <div className="space-y-6">
      <PrototypeBanner message="Prototype specification assessment generated for demonstration. Always verify compliance with authoritative BIS publications." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard score={analysis.readiness_score || 0} className="md:col-span-1" />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Requirement Summary</CardTitle>
            <CardDescription>{analysis.product_name} • {analysis.category}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-700 leading-relaxed">
              {analysis.natural_language_input || analysis.summary || "No detailed description provided."}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                <span className="block font-bold text-emerald-800 text-base">{providedCount}</span>
                <span className="text-[11px] text-emerald-600">Parameters Met</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <span className="block font-bold text-amber-800 text-base">{reviewCount}</span>
                <span className="text-[11px] text-amber-600">Needs Review</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-center">
                <span className="block font-bold text-rose-800 text-base">{missingCount}</span>
                <span className="text-[11px] text-rose-600">Gaps Identified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standards Coverage Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Applicable Indian Standards Coverage</CardTitle>
            <CardDescription>Standards identified by the prototype analysis engine</CardDescription>
          </div>
          <Badge variant="primary">{recommendations.length} Recommended Standards</Badge>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-xs text-slate-500">No standards mapped yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-navy-900">
                        {rec.standard?.is_number || "DEMO-IS-XXXX"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {rec.relevance_score}% Match
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 mb-1">{rec.standard?.title}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{rec.reason}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{rec.verification_status}</span>
                    {rec.standard && (
                      <Link to={`/standards/${rec.standard.id}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
                        View Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AIAssistantTab({ analysis, onAsk, answer, loading }) {
  const [question, setQuestion] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (question.trim()) onAsk(question.trim());
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Ask About This Analysis</h3>
        <p className="text-xs text-slate-500">Answers use indexed standards and always require human verification.</p>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Why was this standard recommended? / इस standard की जरूरत क्यों है?" className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg" />
        <Button type="submit" loading={loading} icon={BookOpen}>Ask</Button>
      </form>
      {answer && (
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader><CardTitle>Source-grounded response</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700 leading-relaxed">{answer.answer}</p>
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500">Sources</p>
              {answer.sources?.length ? answer.sources.map((source) => <p key={source.is_number} className="text-[11px] text-slate-600">{source.is_number} · {source.title} · {source.verification_status}</p>) : <p className="text-[11px] text-slate-500">No sufficiently relevant indexed source was found.</p>}
            </div>
            <p className="mt-3 text-[10px] text-amber-700">{answer.disclaimer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AnalysisRequirementsTab({ requirements = [], onAddRequirement, onUpdateStatus, onDeleteRequirement }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReq, setNewReq] = useState({ category: "Performance", name: "", value: "", status: "Provided" });

  const categories = ["Performance", "Safety", "Electrical", "Testing", "Certification", "Environmental", "Material"];

  const handleCreate = () => {
    if (!newReq.name.trim()) return;
    onAddRequirement(newReq);
    setNewReq({ category: "Performance", name: "", value: "", status: "Provided" });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Extracted & Defined Requirements</h3>
          <p className="text-xs text-slate-500">Parameters evaluated against standard testing and safety criteria</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Requirement
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table className="gov-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Requirement Parameter</th>
              <th>Specified Value</th>
              <th>Compliance Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requirements.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                  No requirement parameters recorded.
                </td>
              </tr>
            ) : (
              requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70">
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.category}
                    </span>
                  </td>
                  <td className="font-medium text-slate-900 text-xs">{req.name}</td>
                  <td className="text-xs text-slate-600 font-mono">{req.value || "—"}</td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onDeleteRequirement(req.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete parameter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Technical Requirement Parameter"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
            <select
              value={newReq.category}
              onChange={(e) => setNewReq({ ...newReq, category: e.target.value })}
              className="w-full text-xs p-2 border rounded-lg"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Parameter Name</label>
            <input
              type="text"
              placeholder="e.g. Surge Protection Level"
              value={newReq.name}
              onChange={(e) => setNewReq({ ...newReq, name: e.target.value })}
              className="w-full text-xs p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Value</label>
            <input
              type="text"
              placeholder="e.g. 10 kV Minimum"
              value={newReq.value}
              onChange={(e) => setNewReq({ ...newReq, value: e.target.value })}
              className="w-full text-xs p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Add Parameter</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AnalysisStandardsTab({ recommendations = [] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recommended Indian Standards (IS)</h3>
          <p className="text-xs text-slate-500">Algorithmic mapping of relevant Indian Standards based on requirement classification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((rec) => {
          const std = rec.standard;
          return (
            <Card key={rec.id} className="p-5 border-l-4 border-l-blue-600">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-navy-900 text-sm">
                      {std?.is_number || "DEMO-IS-XXXX"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                      {std?.category || "General"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      {rec.relevance_score}% Match
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{std?.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rec.reason}</p>
                </div>

                <div className="shrink-0 flex sm:flex-col items-end gap-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    Status: <span className="font-semibold text-slate-700">{rec.verification_status}</span>
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
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function AnalysisFindingsTab({ findings = [], onUpdateStatus }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Technical Findings & Risk Flags</h3>
        <p className="text-xs text-slate-500">Gaps, missing clauses, and items requiring technical verification</p>
      </div>

      <div className="space-y-3">
        {findings.map((f) => {
          const config = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.INFO;

          return (
            <div key={f.id} className={`p-4 rounded-lg border flex items-start gap-3.5 ${config.bg}`}>
              {f.severity === "CRITICAL" && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {f.severity === "WARNING" && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              {f.severity === "INFO" && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
              {f.severity === "NEEDS_VERIFICATION" && <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />}

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${config.badge}`}>
                      {config.label}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">Status: {f.status}</span>
                </div>

                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{f.description}</p>

                {f.recommendation && (
                  <div className="mt-2.5 p-2.5 rounded bg-white/80 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800">Action Recommended: </span>
                    <span className="text-slate-600">{f.recommendation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalysisDocumentsTab({ documents = [], onDeleteDocument }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Uploaded Tender Documents</h3>
        <p className="text-xs text-slate-500">PDF documents processed with PyMuPDF text extractor</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {documents.length === 0 ? (
          <div className="p-8 text-center bg-white border rounded-lg text-xs text-slate-400">
            No tender documents uploaded for this analysis.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-lg border bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{doc.original_filename}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatFileSize(doc.file_size)} • {doc.page_count || 1} Pages • Extracted via PyMuPDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" icon={Eye} onClick={() => setSelectedDoc(doc)}>
                  View Extracted Text
                </Button>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs inline-flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Extracted Text Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={`PyMuPDF Extracted Content: ${selectedDoc?.original_filename}`}
        description="Extracted raw text structure ready for Phase 2 semantic chunking & embedding."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap">
            {selectedDoc?.extracted_text || "No text could be extracted from this PDF document."}
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setSelectedDoc(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AnalysisActivityTab({ analysis }) {
  const events = [
    {
      title: "Analysis Initialized",
      time: formatDate(analysis.created_at),
      desc: `Analysis '${analysis.title}' created by ${analysis.user?.name || "Procurement Officer"}.`,
    },
    {
      title: "Prototype Standards Evaluation Executed",
      time: formatDate(analysis.created_at),
      desc: `Phase 1 evaluation mapped standards and generated initial readiness score of ${analysis.readiness_score}%.`,
    },
    {
      title: "Verification Hold Point",
      time: "Pending Committee Review",
      desc: "Awaiting technical review by authorized reviewer.",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Activity & Audit Timeline</h3>
        <p className="text-xs text-slate-500">Government compliance and change tracking history</p>
      </div>

      <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-4">
        {events.map((e, idx) => (
          <div key={idx} className="flex items-start gap-3 relative pb-4 last:pb-0">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{e.title}</span>
                <span className="text-[10px] text-slate-400">{e.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
