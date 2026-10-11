"use client";

import { CloudUpload } from "lucide-react";
import React from "react";

interface MediaUploadOverlayProps {
  isDraggingOver: boolean;
}

export function MediaUploadOverlay({ isDraggingOver }: MediaUploadOverlayProps) {
  if (!isDraggingOver) return null;

  return (
    <div className="absolute inset-0 z-40 bg-indigo-950/80 backdrop-blur-sm border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-2xl mb-4 animate-bounce">
        <CloudUpload className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">
        Drop media to upload
      </h3>
      <p className="text-xs text-indigo-200">
        Supports high-resolution images (JPEG, PNG, WEBP) & videos (MP4, WEBM)
      </p>
    </div>
  );
}
