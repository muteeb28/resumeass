import React from 'react';
import ResumeRenderer from './ResumeRenderer';
import type { RenderMode } from './resumeConfig';

interface FinalResumePreviewProps {
  data: any;
  mode?: RenderMode | 'auto';
}

const FinalResumePreview: React.FC<FinalResumePreviewProps> = ({ data, mode = 'auto' }) => {
  if (!data) return null;
  return <ResumeRenderer data={data} mode={mode} />;
};

export default FinalResumePreview;
