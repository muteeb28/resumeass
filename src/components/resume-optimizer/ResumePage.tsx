import React from 'react';

interface ResumePageProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ResumePage: React.FC<ResumePageProps> = ({ className = '', children, style }) => (
  <div className={`resume-page pdf-friendly ${className}`.trim()} style={style}>
    {children}
  </div>
);

export default ResumePage;
