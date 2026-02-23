import React from 'react';
import ResumeRenderer from './ResumeRenderer';
import { getFallbackResumeData } from './resumeUtils';

interface TemplatePreviewProps {
  template?: {
    content?: any;
    style?: string;
    name?: string;
  };
  className?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, className = '' }) => {
  const content = template?.content || getFallbackResumeData();
  const data = {
    ...content,
    style: template?.style || content.style,
    templateName: template?.name || content.templateName
  };

  return (
    <div className={`template-preview rounded-xl overflow-hidden shadow-sm border border-gray-200 ${className}`.trim()}>
      <ResumeRenderer data={data} mode="preview" />
    </div>
  );
};

export default TemplatePreview;
