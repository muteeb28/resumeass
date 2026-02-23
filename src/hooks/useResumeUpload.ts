import { useState, useCallback } from 'react';
import { extractResumeData, type ExtractedResumeData } from '@/services/resumeOptimizerApi';

export interface ResumeUploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  result: ExtractedResumeData | null;
  error: string | null;
}

export interface UseResumeUploadReturn {
  state: ResumeUploadState;
  uploadResume: (file: File) => Promise<void>;
  clearUpload: () => void;
  resetAll: () => void;
}

const initialState: ResumeUploadState = {
  file: null,
  uploading: false,
  progress: 0,
  result: null,
  error: null,
};

export function useResumeUpload(): UseResumeUploadReturn {
  const [state, setState] = useState<ResumeUploadState>(initialState);

  const uploadResume = useCallback(async (file: File) => {
    setState({
      file,
      uploading: true,
      progress: 0,
      result: null,
      error: null,
    });

    try {
      const result = await extractResumeData(file, (progress) => {
        setState((prev) => ({ ...prev, progress }));
      });

      setState((prev) => ({
        ...prev,
        uploading: false,
        progress: 100,
        result,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
      throw error;
    }
  }, []);

  const clearUpload = useCallback(() => {
    setState(initialState);
  }, []);

  const resetAll = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    uploadResume,
    clearUpload,
    resetAll,
  };
}
