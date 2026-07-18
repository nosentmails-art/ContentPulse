/**
 * ChannelUploadTab Component
 * @author sanat.k.mahapatra
 * 
 * File upload interface for data connector with channel-specific handling
 */

"use client";

import { useState } from "react";
import { Upload, FileText, Linkedin, Youtube, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface ChannelUploadTabProps {
  channel: "LINKEDIN" | "YOUTUBE" | "BLOG" | "EMAIL_NEWSLETTER" | "REDDIT" | "GOOGLE_PPC";
  status: "empty" | "loaded";
  rowCount: number;
  lastImport: string | null;
  onFileUpload: (file: File) => void;
  onTemplateDownload: () => void;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  LINKEDIN: <Linkedin className="w-5 h-5" />,
  YOUTUBE: <Youtube className="w-5 h-5" />,
  BLOG: <FileText className="w-5 h-5" />,
  EMAIL_NEWSLETTER: <Mail className="w-5 h-5" />,
  REDDIT: <MessageSquare className="w-5 h-5" />,
  GOOGLE_PPC: <TrendingUp className="w-5 h-5" />,
};

const CHANNEL_NAMES: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  BLOG: "Blog",
  EMAIL_NEWSLETTER: "Email Newsletter",
  REDDIT: "Reddit",
  GOOGLE_PPC: "Google PPC",
};

export function ChannelUploadTab({
  channel,
  status,
  rowCount,
  lastImport,
  onFileUpload,
  onTemplateDownload,
}: ChannelUploadTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-indigo-500">{CHANNEL_ICONS[channel]}</div>
          <div>
            <h3 className="font-semibold text-white">{CHANNEL_NAMES[channel]}</h3>
            <StatusBadge status={status === "loaded" ? "COMPLETED" : "IDLE"} />
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-700 hover:border-slate-600"
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-lg font-medium text-white mb-2">Drag and drop your file</p>
        <p className="text-sm text-slate-400 mb-4">or click to browse</p>

        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${channel}`}
        />
        <label
          htmlFor={`file-upload-${channel}`}
          className="btn-primary inline-block cursor-pointer"
        >
          Select File
        </label>
      </div>

      {/* Template Download */}
      <div className="text-center">
        <button onClick={onTemplateDownload} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
          Download CSV Template
        </button>
      </div>

      {/* Status Info */}
      {status === "loaded" && (
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-300">
            <span className="font-medium">{rowCount}</span> rows imported
          </p>
          {lastImport && (
            <p className="text-xs text-slate-500 mt-1">Last import: {lastImport}</p>
          )}
        </div>
      )}
    </div>
  );
}
