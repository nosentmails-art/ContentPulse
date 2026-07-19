/**
 * Data Connector Page
 * @author sanat.k.mahapatra
 * 
 * Multi-channel data upload interface with tabs
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelUploadTab } from "@/components/ChannelUploadTab";
import { toast } from "sonner";

type Channel = "LINKEDIN" | "YOUTUBE" | "BLOG" | "EMAIL_NEWSLETTER" | "REDDIT" | "GOOGLE_PPC";

interface ChannelStatus {
  status: "empty" | "loaded";
  rowCount: number;
  lastImport: string | null;
}

const CHANNELS: Channel[] = [
  "LINKEDIN",
  "YOUTUBE",
  "BLOG",
  "EMAIL_NEWSLETTER",
  "REDDIT",
  "GOOGLE_PPC",
];

const CHANNEL_LABELS: Record<Channel, string> = {
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  BLOG: "Blog",
  EMAIL_NEWSLETTER: "Email",
  REDDIT: "Reddit",
  GOOGLE_PPC: "Google PPC",
};

export default function ConnectPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [channelStatus, setChannelStatus] = useState<Record<Channel, ChannelStatus>>({
    LINKEDIN: { status: "empty", rowCount: 0, lastImport: null },
    YOUTUBE: { status: "empty", rowCount: 0, lastImport: null },
    BLOG: { status: "empty", rowCount: 0, lastImport: null },
    EMAIL_NEWSLETTER: { status: "empty", rowCount: 0, lastImport: null },
    REDDIT: { status: "empty", rowCount: 0, lastImport: null },
    GOOGLE_PPC: { status: "empty", rowCount: 0, lastImport: null },
  });

  // Fetch connect status on mount
  useEffect(() => {
    fetch(`/api/${tenantSlug}/connect/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.channels) {
          setChannelStatus(data.channels);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch connect status:", err);
      });
  }, [tenantSlug]);

  const handleFileUpload = async (channel: Channel, file: File) => {
    const id = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("channel", channel);

      const res = await fetch(`/api/${tenantSlug}/upload`, {
        method: "POST",
        body: formData,
      });

      toast.dismiss(id);
      if (!res.ok) {
        toast.error("Upload failed");
        return;
      }

      const data = await res.json();
      setChannelStatus((prev) => ({
        ...prev,
        [channel]: {
          status: "loaded",
          rowCount: data.rowCount || 0,
          lastImport: "Just now",
        },
      }));
      toast.success(`${file.name} uploaded successfully`);
    } catch (err) {
      toast.dismiss(id);
      toast.error("Upload failed");
      console.error("Upload error:", err);
    }
  };
  const handleTemplateDownload = (channel: Channel) => {
    const id = toast.loading(`Downloading ${CHANNEL_LABELS[channel]} template...`);
    setTimeout(() => {
      toast.dismiss(id);
      toast.success(`${CHANNEL_LABELS[channel]} template downloaded`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center gap-4">
          <Link href={`/${tenantSlug}`} className="hover:text-indigo-400 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Import Your Content Data</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        <div className="max-w-4xl">
          <p className="text-slate-400 mb-8">
            Connect your content channels to start analyzing performance across platforms.
            Upload data for each channel to begin.
          </p>

          {/* Tabs */}
          <Tabs defaultValue="LINKEDIN" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-900 border border-slate-800">
              {CHANNELS.map((channel) => (
                <TabsTrigger
                  key={channel}
                  value={channel}
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
                >
                  {CHANNEL_LABELS[channel]}
                </TabsTrigger>
              ))}
            </TabsList>

            {CHANNELS.map((channel) => (
              <TabsContent key={channel} value={channel} className="space-y-4">
                <ChannelUploadTab
                  channel={channel}
                  status={channelStatus[channel]?.status || "empty"}
                  rowCount={channelStatus[channel]?.rowCount || 0}
                  lastImport={channelStatus[channel]?.lastImport || null}
                  onFileUpload={(file) => handleFileUpload(channel, file)}
                  onTemplateDownload={() => handleTemplateDownload(channel)}
                />
              </TabsContent>
            ))}
          </Tabs>




          {/* Connection Methods */}
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {/* Manual Upload Box */}
            <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-indigo-500 transition">
              <h3 className="font-semibold text-white mb-2">📤 Manual Upload</h3>
              <p className="text-slate-300 mb-4 text-sm">
                Upload CSV or Excel files from your platforms using the tabs above. Best for testing and one-time imports.
              </p>
              <Link href={`/${tenantSlug}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">
                Go to Command Center →
              </Link>
            </div>

            {/* API Connection Box - Coming Soon */}
            <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 opacity-60 relative">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-semibold text-white mb-2">🔗 Connect via API</h3>
              <p className="text-slate-300 mb-4 text-sm">
                Direct integrations with LinkedIn, YouTube, Reddit, and more. Automatic daily syncs coming soon.
              </p>
              <button
                disabled
                className="text-slate-500 font-medium text-sm cursor-not-allowed"
              >
                Configure API Connections
              </button>
            </div>
          </div>

          {/* Next Step */}
          <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-slate-300 mb-4">
              Ready to analyze your content? Go to your dashboard to start.
            </p>
            <Link href={`/${tenantSlug}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
              Go to Command Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
