'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase-client'; // Adjust path if needed

interface FileUploaderProps {
  jobId: string;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export function FileUploader({ jobId, onUploadSuccess, onUploadError }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setUploading(true);
    onUploadError?.('');

    try {
      // 1. Get the session to pass the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('User is not authenticated.');
      }

      // 2. Prepare the form data for the Edge Function
      const formData = new FormData();
      formData.append('file', file);
      // Note: The Edge Function expects 'job_id', 'cover_letter', 'resume_url'
      // We are uploading the resume, so we'll call it 'resume_url'
      formData.append('job_id', jobId);
      formData.append('resume_url', file.name); // Or however you want to handle the file

      // 3. Call the Supabase Edge Function
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gig-application`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          // Pass the auth token in the Authorization header
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file.');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      onUploadSuccess?.();

    } catch (error: any) {
      console.error('Upload error:', error);
      onUploadError?.(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  );
}
