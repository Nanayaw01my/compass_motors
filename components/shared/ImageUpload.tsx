"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  current?: string;
  label?: string;
  folder?: string;
}

export function ImageUpload({ onUpload, current, label = "Upload image", folder = "general" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(current || "");

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
      }
    } finally {
      setUploading(false);
    }
  }, [folder, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  if (preview) {
    return (
      <div className="mt-1 relative inline-block">
        <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
        <button
          onClick={() => { setPreview(""); onUpload(""); }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-red-50"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="text-sm">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-gray-400">Drag & drop or click to browse · Max 5MB</span>
        </div>
      )}
    </div>
  );
}
