
"use client";

import React, { useState, useRef, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onUpload: (url: string) => void;
  children?: ReactNode;
  className?: string;
}

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function MediaUploader({ 
    onUpload, 
    children, 
    className 
}: MediaUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Invalid file type. Please upload an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for Data URIs
      setError("File size must be less than 2MB to be embedded directly.");
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
        const dataUri = await fileToDataUri(file);
        onUpload(dataUri);
    } catch (err: any) {
        console.error("Failed to read file:", err);
        setError("Could not process the selected file.");
    } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && !isLoading) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleButtonClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleButtonClick}
        className={cn("cursor-pointer", isLoading && "cursor-not-allowed")}
      >
        {children ? (
          <div className="relative">
             {React.cloneElement(children as React.ReactElement, { "aria-label": "Upload image", disabled: isLoading, })}
             {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-md text-white">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            )}
          </div>
        ) : (
          <div
            className="w-full p-6 border-2 border-dashed rounded-md text-center hover:border-primary transition-colors"
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Processing...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8" />
                  <p className="text-sm">Drag & drop or <span className="text-primary font-semibold">browse</span></p>
                  <p className="text-xs">Supports JPEG, PNG. Max 2MB.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        disabled={isLoading}
      />
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
