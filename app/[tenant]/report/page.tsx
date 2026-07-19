/**
 * Unified Report Page
 * @author sanat.k.mahapatra
 * 
 * Aggregated view of all agent outputs with export and sharing capabilities
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { ReportSection } from "@/components/ReportSection";
import { SentimentScoreCard } from "@/components/SentimentScoreCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import SentimentDashboard from "@/components/SentimentDashboard";
import { toast } from "sonner";

const MOCK_REPORT_DATA = {
  generated_at: "2024-12-18T10:30:00Z",
  AUDIENCE_INTELLIGENCE: {
    status: "COMPLETED",
    data: {
      segments: [
        { name: "Tech Enthusiasts", count: 12450, engagement_rate: 8.5 },
        { name: "Decision Makers", count: 8920, engagement_rate: 6.2 },
        { name: "Students", count: 5430, engagement_rate: 11.3 },
      ],
      top_insight: "Tech Enthusiasts show highest engagement on LinkedIn and YouTube",
    },
  },
  CHANNEL_CONTENT_INTELLIGENCE: {
    status: "COMPLETED",
    data: {
      matrix: {
        "How-to": { LinkedIn: 8.2, YouTube: 9.1, Blog: 7.5 },
        Tutorial: { LinkedIn: 6.5, YouTube: 9.8, Blog: 8.2 },
        Opinion: { LinkedIn: 7.9, YouTube: 5.2, Blog: 6.8 },
        "Case Study": { LinkedIn: 9.1, YouTube: 7.3, Blog: 8.9 },
      },
    },
  },
  SENTIMENT_ANALYSIS: {
    status: "COMPLETED",
    data: {
      score: 72,
      label: "Overall Sentiment Score",
      positiveThemes: ["Helpful", "Informative", "Well-structured", "Practical"],
      negativeThemes: ["Too technical", "Slow delivery", "Lacks examples"],
    },
  },
  GAP_ANALYSIS: {
    status: "COMPLETED",
    data: {
      gaps: [
        {
          topic: "AI Ethics",
          coverage: 15,
          opportunity_score: 8.5,
          recommendation: "High-demand topic with low coverage",
        },
        {
          topic: "Web Performance",
          coverage: 22,
          opportunity_score: 7.2,
          recommendation: "Growing interest, expand content",
        },
      ],
    },
  },
  COMPETITOR_ANALYSIS: {
    status: "COMPLETED",
    data: {
      competitors: [
        { name: "TechBlog Daily", your_topics: 45, their_topics: 68, overlap: 28 },
        { name: "Dev Insights Pro", your_topics: 45, their_topics: 52, overlap: 32 },
      ],
    },
  },
  OPPORTUNITY_IDENTIFICATION: {
    status: "COMPLETED",
    data: {
      opportunities: [
        {
          topic: "LLM Fine-tuning",
          format: "Tutorial",
          channel: "YouTube",
          urgency: "HOT" as const,
          reason: "High search volume, low competition",
          suggestedTitle: "Complete Guide to Fine-tuning Large Language Models",
        },
        {
          topic: "React Performance",
          format: "How-to",
          channel: "Blog",
          urgency: "WARM" as const,
          reason: "Growing interest among your audience",
          suggestedTitle: "Optimizing React Applications: Performance Best Practices",
        },
        {
          topic: "DevOps Fundamentals",
          format: "Course",
          channel: "YouTube",
          urgency: "EVERGREEN" as const,
          reason: "Constant demand, evergreen content",
          suggestedTitle: "DevOps from Scratch: Complete Fundamentals for Beginners",
        },
      ],
    },
  },
};

export default function ReportPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/${tenantSlug}/report`);
        if (response.ok) {
          const data = await response.json();
          // Transform API response into ReportSection format if it has agents
          if (data.agents && Array.isArray(data.agents)) {
            const transformed: any = {
              generated_at: data.generatedAt || new Date().toISOString(),
              synthesis: data.synthesis,
            };
            for (const agent of data.agents) {
              transformed[agent.type] = {
                status: agent.status,
                data: agent.result || {},
              };
            }
            setReportData(transformed);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch live report data, using mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [tenantSlug]);

  const handleExportPDF = () => {
    const id = toast.loading("Generating PDF...");
    setTimeout(() => {
      toast.dismiss(id);
      window.print();
      toast.success("PDF ready to download");
    }, 1000);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/${tenantSlug}/report/share-${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
  };


  return (
    <div className="print-report min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 print:bg-white">
      {/* Top Bar */}
      <div className="no-print border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${tenantSlug}`} className="hover:text-indigo-400 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Your Content Plan</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print Report
            </button>
            <button
              onClick={handleShareLink}
              className="btn-secondary flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="container-page py-12 print:py-0">
        <div className="mb-8">
          <p className="text-slate-400">
            Plan created on{" "}
            {reportData?.generated_at ? new Date(reportData?.generated_at).toLocaleDateString() : "—"}
          </p>
        </div>


        {/* Synthesis */}
        {reportData?.synthesis && (
          <div className="card bg-indigo-900/20 border-indigo-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Your Next 3 Moves</h2>
            <p className="text-slate-300 mb-4">{reportData.synthesis.acquisitionStrategy}</p>
            {reportData.synthesis.nextActions?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Next Actions</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {reportData.synthesis.nextActions.map((action: string, i: number) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            {reportData.synthesis.keyMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(reportData.synthesis.keyMetrics).map(([k, v]: [string, any]) => (
                  <div key={k} className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-white font-semibold">{String(v)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {/* Opportunities (from merged Gap & Opportunity agent) */}
          {reportData?.GAP_ANALYSIS?.status === "COMPLETED" &&
            reportData?.GAP_ANALYSIS?.data?.opportunities?.length > 0 && (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recommended Content Opportunities</h2>
                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">AI-generated analysis</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportData?.GAP_ANALYSIS?.data?.opportunities?.map(
                  (opp: any, i: number) => (
                    <OpportunityCard key={i} {...opp} />
                  )
                )}
              </div>
            </div>
          )}

          {/* Sentiment Analysis */}
          {reportData?.SENTIMENT_ANALYSIS?.status === "COMPLETED" ? (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Sentiment Analysis</h2>
                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">AI-generated analysis</span>
              </div>
              <SentimentScoreCard
                score={reportData?.SENTIMENT_ANALYSIS?.data?.brandOverallSentiment?.overallSentimentScore ?? reportData?.SENTIMENT_ANALYSIS?.data?.overallScore}
                label={reportData?.SENTIMENT_ANALYSIS?.data?.brandOverallSentiment?.overallSentimentLabel ?? reportData?.SENTIMENT_ANALYSIS?.data?.overallLabel}
                positiveThemes={reportData?.SENTIMENT_ANALYSIS?.data?.brandOverallSentiment?.crossChannelThemes?.commonPositiveThemes || reportData?.SENTIMENT_ANALYSIS?.data?.positiveThemes || []}
                negativeThemes={reportData?.SENTIMENT_ANALYSIS?.data?.brandOverallSentiment?.crossChannelThemes?.commonNegativeThemes || reportData?.SENTIMENT_ANALYSIS?.data?.negativeThemes || []}
              />
              <div className="mt-6">
                <SentimentDashboard data={reportData?.SENTIMENT_ANALYSIS?.data} />
              </div>
            </div>
          ) : (
            <ReportSection
              agentType="SENTIMENT_ANALYSIS"
              title="Sentiment Analysis"
              data={reportData?.SENTIMENT_ANALYSIS?.data}
              status={reportData?.SENTIMENT_ANALYSIS?.status || "PENDING"}
              source="AI-generated analysis"
            />
          )}

          {/* Audience Intelligence */}
          <ReportSection
            agentType="AUDIENCE_INTELLIGENCE"
            title="Audience Insights"
            data={reportData?.AUDIENCE_INTELLIGENCE?.data}
            status={reportData?.AUDIENCE_INTELLIGENCE?.status || "PENDING"}
            source="AI-generated analysis"
          />

          {/* Channel Intelligence */}
          <ReportSection
            agentType="CHANNEL_CONTENT_INTELLIGENCE"
            title="Channel & Content Performance Matrix"
            data={reportData?.CHANNEL_CONTENT_INTELLIGENCE?.data}
            status={reportData?.CHANNEL_CONTENT_INTELLIGENCE?.status || "PENDING"}
            source="AI-generated analysis"
          />

          {/* Gap & Opportunity Analysis */}
          <ReportSection
            agentType="GAP_ANALYSIS"
            title="Gaps & Opportunity Analysis"
            data={reportData?.GAP_ANALYSIS?.data}
            status={reportData?.GAP_ANALYSIS?.status || "PENDING"}
            source="AI-generated analysis"
          />

          {/* Competitor Analysis */}
          <ReportSection
            agentType="COMPETITOR_ANALYSIS"
            title="What Your Competitors Are Publishing"
            data={reportData?.COMPETITOR_ANALYSIS?.data}
            status={reportData?.COMPETITOR_ANALYSIS?.status || "PENDING"}
            source="AI-generated analysis"
          />

          {/* Content Analytics */}
          <ReportSection
            agentType="CONTENT_ANALYTICS"
            title="Content Performance Overview"
            data={reportData?.CONTENT_ANALYTICS?.data}
            status={reportData?.CONTENT_ANALYTICS?.status || "PENDING"}
            source="Rule-based from seeded data"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <p className="text-slate-300 mb-4">
            Ready to act on these insights?
          </p>
          <Link href={`/${tenantSlug}/connect`} className="text-indigo-400 hover:text-indigo-300 font-medium">
            Import more data → Connect Data Sources
          </Link>
        </div>
      </div>
    </div>
  );
}
