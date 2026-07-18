/**
 * Unified Report Page
 * @author sanat.k.mahapatra
 * 
 * Aggregated view of all agent outputs with export and sharing capabilities
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { ReportSection } from "@/components/ReportSection";
import { SentimentScoreCard } from "@/components/SentimentScoreCard";
import { OpportunityCard } from "@/components/OpportunityCard";
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

  const handleExportPDF = () => {
    toast.loading("Generating PDF...");
    setTimeout(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${tenantSlug}`} className="hover:text-indigo-400 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Content Intelligence Report</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
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
      <div className="container-page py-12">
        <div className="mb-8">
          <p className="text-slate-400">
            Report generated on{" "}
            {new Date(MOCK_REPORT_DATA.generated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Sentiment Analysis */}
          {MOCK_REPORT_DATA.SENTIMENT_ANALYSIS.status === "COMPLETED" && (
            <SentimentScoreCard
              {...MOCK_REPORT_DATA.SENTIMENT_ANALYSIS.data}
            />
          )}

          {/* Opportunities */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              🎯 Recommended Content Opportunities
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_REPORT_DATA.OPPORTUNITY_IDENTIFICATION.data.opportunities.map(
                (opp, i) => (
                  <OpportunityCard key={i} {...opp} />
                )
              )}
            </div>
          </div>

          {/* Audience Intelligence */}
          <ReportSection
            agentType="AUDIENCE_INTELLIGENCE"
            title="Audience Intelligence"
            data={MOCK_REPORT_DATA.AUDIENCE_INTELLIGENCE.data}
            status={MOCK_REPORT_DATA.AUDIENCE_INTELLIGENCE.status}
          />

          {/* Channel Intelligence */}
          <ReportSection
            agentType="CHANNEL_CONTENT_INTELLIGENCE"
            title="Channel & Content Performance Matrix"
            data={MOCK_REPORT_DATA.CHANNEL_CONTENT_INTELLIGENCE.data}
            status={MOCK_REPORT_DATA.CHANNEL_CONTENT_INTELLIGENCE.status}
          />

          {/* Gap Analysis */}
          <ReportSection
            agentType="GAP_ANALYSIS"
            title="Content Gap Analysis"
            data={MOCK_REPORT_DATA.GAP_ANALYSIS.data}
            status={MOCK_REPORT_DATA.GAP_ANALYSIS.status}
          />

          {/* Competitor Analysis */}
          <ReportSection
            agentType="COMPETITOR_ANALYSIS"
            title="Competitor Analysis"
            data={MOCK_REPORT_DATA.COMPETITOR_ANALYSIS.data}
            status={MOCK_REPORT_DATA.COMPETITOR_ANALYSIS.status}
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
