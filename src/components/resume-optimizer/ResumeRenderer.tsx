import React from 'react';
import { applyContentLimits, deriveRenderState, getFallbackResumeData, getPageCountHint, normalizeResumeData } from './resumeUtils';
import type { RenderMode } from './resumeConfig';
import type { ResumeStyle } from './resumeUtils';
import ModernExecutive from './templates/SeniorModern';
import MinimalistAts from './templates/ConciseClassic';
import DynamicATS from './templates/DynamicATS';

const TEMPLATE_MAP: Record<ResumeStyle, React.ComponentType<any>> = {
  'senior-modern': ModernExecutive,
  'modern-executive': ModernExecutive,
  'concise-classic': MinimalistAts,
  'minimalist-ats': MinimalistAts,
  'dynamic-ats': DynamicATS,
  'default': DynamicATS
};

interface ResumeRendererProps {
  data: any;
  mode?: RenderMode | 'auto';
  className?: string;
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data, mode = 'auto', className }) => {
  const normalized = normalizeResumeData(data || getFallbackResumeData());
  const pageCountHint = getPageCountHint(data);
  const renderState = deriveRenderState(normalized, mode, pageCountHint);
  const content = applyContentLimits(normalized, renderState.mode);
  const TemplateComponent = TEMPLATE_MAP[normalized.style] || DynamicATS;

  return (
    <div className={className}>
      <TemplateComponent
        content={content}
        renderState={renderState}
      />
    </div>
  );
};

export default ResumeRenderer;
