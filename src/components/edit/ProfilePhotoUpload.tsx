"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, User } from "lucide-react";

export interface ProfilePhotoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ProfilePhotoUpload({
  value,
  onChange,
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDelete = useCallback(() => {
    onChange(null);
    setPreview(null);
  }, [onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Avatar preview */}
        <div
          className="relative size-24 rounded-full overflow-hidden bg-secondary border-2 border-border flex-shrink-0 cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors"
                title="Delete photo"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <User className="h-10 w-10" />
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center border-2 border-primary border-dashed rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleClick}
              variant={preview ? "outline" : "default"}
              size="sm"
            >
              <Upload className="h-4 w-4" />
              {preview ? "Replace Photo" : "Upload Photo"}
            </Button>
            {preview && (
              <Button
                type="button"
                onClick={handleDelete}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Max size: 5MB. Formats: JPEG, PNG, WebP, GIF
          </p>
          <p className="text-xs text-muted-foreground">
            Drag and drop an image or click to browse
          </p>
        </div>
      </div>
    </div>
  );
}
