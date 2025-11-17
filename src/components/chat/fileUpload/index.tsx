"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUp, X, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export function FileUpload({
  onFilesSelect,
  maxFiles = 5,
  acceptedTypes = "*/*",
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const selectAll = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("multiple", "true");
      fileInputRef.current.click();
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onFilesSelect([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 group"
        >
          <FileUp className="h-4 w-4 group-hover:text-white" />
          <span className="hidden sm:inline">Attach Files</span>
        </Button>

        {selectedFiles.length > 0 && (
          <>
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              {selectedFiles.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 px-2 text-xs"
            >
              Clear All
            </Button>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <Badge
              key={index}
              variant="outline"
              className="gap-2 pr-1 max-w-[200px]"
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate text-xs">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
