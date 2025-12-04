
"use client";

import React, { useState, useRef, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { FileUp, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface FileUploaderProps {
  onUpload: (url: string, name: string) => void;
  children?: ReactNode;
  className?: string;
  acceptedFileTypes?: string[];
  uploadPath?: string;
}

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve((reader.result as string).split(',')[1]); // Return only base64 part
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function FileUploader({ 
    onUpload, 
    children, 
    className, 
    acceptedFileTypes = ['application/pdf', '.doc', '.docx', '.txt'],
    uploadPath = 'documents'
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("File size must be less than 5MB.");
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
        const functions = getFunctions();
        const uploadFile = httpsCallable(functions, 'uploadFile');

        const fileData = await fileToDataUri(file);
        
        const result = await uploadFile({
            fileData,
            fileName: file.name,
            fileType: file.type,
            path: uploadPath
        });

        const { downloadURL } = result.data as { downloadURL: string };
        onUpload(downloadURL, file.name);

    } catch (err: any) {
        console.error("Failed to upload file:", err);
        setError(err.message || "Could not upload the file. Please try again.");
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
                React.cloneElement(children as React.ReactElement, {
                    "aria-label": "Upload file",
                    disabled: isLoading,
                })
            ) : (
                <div
                    className="w-full p-6 border-2 border-dashed rounded-md text-center hover:border-primary transition-colors"
                >
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p className="text-sm">Processing document...</p>
                            </>
                        ) : (
                            <>
                                <FileUp className="h-8 w-8" />
                                <p className="text-sm">Drag & drop or <span className="text-primary font-semibold">browse</span></p>
                                <p className="text-xs">Supports PDF, DOC, TXT. Max 5MB.</p>
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
        accept={acceptedFileTypes.join(',')}
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
