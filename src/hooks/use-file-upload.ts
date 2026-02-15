import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface UploadedFile {
  name: string;
  size: number;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  attachmentId?: string;
}

const ACCEPTED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".csv",
  ".xlsx",
  ".xls",
];

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const fileObjs: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (ACCEPTED_TYPES.includes(ext)) {
        newFiles.push({
          name: file.name,
          size: file.size,
          file,
          status: "pending",
        });
        fileObjs.push(file);
      }
    }

    if (newFiles.length === 0) return;

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (const fileObj of newFiles) {
      try {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === fileObj.file ? { ...f, status: "uploading" } : f
          )
        );

        const attachment = await api.uploadFile(fileObj.file);

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === fileObj.file
              ? { ...f, status: "completed", attachmentId: attachment.id }
              : f
          )
        );
      } catch (error) {
        console.error(`Error uploading ${fileObj.name}:`, error);

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === fileObj.file ? { ...f, status: "error" } : f
          )
        );
      }
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  return {
    uploadedFiles,
    isDragging,
    handleFiles,
    removeFile,
    dragHandlers,
    ACCEPTED_TYPES,
  };
}
