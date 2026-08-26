import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  GitBranch,
  ShieldCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { standardsService } from "../services/standardsService";
import { Breadcrumb, LoadingState, ErrorState, Table } from "../components/common/FeedbackAndNavigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/common/Card";
import { StatusBadge, Badge } from "../components/common/Badge";
import { PrototypeBanner } from "../components/common/Indicators";
import { formatDate } from "../lib/utils";

export function StandardDetail() {
  const { id } = useParams();
  const [standard, setStandard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStandard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await standardsService.getStandardById(id);
      setStandard(data);
    } catch (err) {
      setError("Failed to load standard details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandard();
  }, [id]);

  if (loading) return <LoadingState message="Fetching standard metadata & relationships..." />;
  if (error || !standard) return <ErrorState title="Standard Not Found" message={error} onRetry={loadStandard} />;

  const versions = standard.versions || [];
  const amendments = standard.amendments || [];
  const outgoing = standard.outgoing_relationships || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Standards Directory", href: "/standards" },
            { label: standard.is_number },
          ]}
        />

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-sm font-bold text-navy-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                {standard.is_number}
              </span>
              <StatusBadge status={standard.status} />
              <Badge variant="primary">{standard.category}</Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              {standard.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sector: <span className="font-semibold text-slate-700">{standard.sector || "General"}</span> • 
              Source: <span className="font-semibold text-slate-700">{standard.source}</span> • 
              Verification: <span className="font-semibold text-slate-700">{standard.verification_status}</span>
            </p>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Schema Architecture
            </span>
          </div>
        </div>
      </div>

      <PrototypeBanner message="Standard details and relationship graphs are configured for Phase 1 demonstration. Phase 2 will enable full-text neural semantic search across clauses." />

      {/* Scope Section */}
      <Card>
        <CardHeader>
          <CardTitle>Scope & Application</CardTitle>
          <CardDescription>Technical boundaries and operational context of standard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {standard.scope || "No formal scope text recorded."}
          </p>
        </CardContent>
      </Card>

      {/* Versions & Amendments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
            <CardDescription>Publication editions and revisions</CardDescription>
          </CardHeader>
          <div className="p-0">
            <Table className="gov-table">
              <thead>
                <tr>
                  <th>Edition / Version</th>
                  <th>Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {versions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-400 text-xs">
                      No edition history listed.
                    </td>
                  </tr>
                ) : (
                  versions.map((v) => (
                    <tr key={v.id}>
                      <td className="font-semibold text-xs text-slate-900">{v.version}</td>
                      <td className="text-xs text-slate-600">{v.publication_year}</td>
                      <td><StatusBadge status={v.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Amendments */}
        <Card>
          <CardHeader>
            <CardTitle>Gazetted Amendments</CardTitle>
            <CardDescription>Formal modifications and errata issued by BIS</CardDescription>
          </CardHeader>
          <div className="p-0">
            <Table className="gov-table">
              <thead>
                <tr>
                  <th>Amendment #</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {amendments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-400 text-xs">
                      No active amendments recorded.
                    </td>
                  </tr>
                ) : (
                  amendments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-semibold text-xs text-navy-900">{a.amendment_number}</td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">{formatDate(a.amendment_date)}</td>
                      <td className="text-xs text-slate-700">{a.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Normative & Related Standards */}
      <Card>
        <CardHeader>
          <CardTitle>Standard Relationships & Normative References</CardTitle>
          <CardDescription>Interconnected standards required for testing, safety, or sub-assemblies</CardDescription>
        </CardHeader>
        <CardContent>
          {outgoing.length === 0 ? (
            <p className="text-xs text-slate-500">No linked normative relationships in demo dataset.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outgoing.map((rel) => (
                <div key={rel.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {rel.relationship_type.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">
                      Target Standard ID: {rel.target_standard_id}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{rel.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <Link to={`/standards/${rel.target_standard_id}`} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                      Explore Standard <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 2 Architecture Extension Points (Clearly Labeled Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-85">
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm">Semantic Relevance & Vector Embeddings</CardTitle>
            </div>
            <CardDescription>Scheduled for Phase 2 implementation</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <p>
              In Phase 2, this section will render high-dimensional pgvector cosine distance metrics, clause-by-clause neural similarity scores, and automated cross-referencing with tender clauses.
            </p>
            <div className="p-3 bg-white rounded border border-blue-100 text-[11px] font-mono text-slate-500">
              Vector Model: SentenceTransformers (all-MiniLM-L6-v2) • Status: Extension Point Ready
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-purple-200 bg-purple-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              <CardTitle className="text-sm">Interactive Standard Relationship Map</CardTitle>
            </div>
            <CardDescription>Scheduled for Phase 2 implementation</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <p>
              In Phase 2, this view will provide an interactive D3/Canvas graph illustrating normative dependencies, safety protocols, and testing references between multi-part standards.
            </p>
            <div className="p-3 bg-white rounded border border-purple-100 text-[11px] font-mono text-slate-500">
              Graph Engine: StandardRelationship Graph Index • Status: Extension Point Ready
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
