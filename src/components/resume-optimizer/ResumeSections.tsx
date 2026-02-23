import React from 'react';

const titleVariants: Record<string, string> = {
  boxed: 'text-center bg-gray-100 py-1.5 uppercase tracking-wider',
  centered: 'text-center bg-gray-100 py-2 uppercase tracking-wider',
  lined: 'border-b border-gray-300 pb-1 uppercase tracking-wider',
  plain: 'uppercase tracking-wider'
};

export const SectionTitle = ({
  label,
  variant = 'plain',
  className = ''
}: {
  label: string;
  variant?: keyof typeof titleVariants;
  className?: string;
}) => (
  <h2 className={`font-bold text-gray-800 mb-3 ${titleVariants[variant]} ${className}`.trim()}>
    {label}
  </h2>
);

export const ContactLine = ({
  items,
  className = '',
  separator = '|'
}: {
  items: Array<string | null | undefined>;
  className?: string;
  separator?: string;
}) => {
  const safeItems = items.filter((item) => Boolean(item)) as string[];
  const normalizeContactValue = (value: string) => {
    const markdownMatch = value.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i);
    if (markdownMatch) {
      return markdownMatch[2].trim();
    }
    const parenUrlMatch = value.match(/\((https?:\/\/[^)]+)\)/i);
    if (parenUrlMatch) {
      return parenUrlMatch[1].trim();
    }
    return value
      .replace(/\[([^\]]+)\]/g, '$1')
      .replace(/\]\((https?:\/\/[^)]+)\)/gi, '$1')
      .replace(/[<>]/g, '')
      .trim();
  };
  const sanitizeUrl = (value: string) => (
    value.replace(/^[\[(<]+/, '').replace(/[\])>.,;]+$/, '')
  );
  const renderContactItem = (rawItem: string) => {
    const trimmed = rawItem.trim();
    if (!trimmed) return rawItem;

    const labeledMatch = trimmed.match(/^([A-Za-z][A-Za-z\s]+):\s*(.+)$/);
    const label = labeledMatch ? labeledMatch[1].trim() : '';
    const value = labeledMatch ? labeledMatch[2].trim() : trimmed;
    const normalizedValue = normalizeContactValue(value);

    const emailMatch = normalizedValue.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch) {
      const email = emailMatch[0];
      return (
        <span>
          {label && `${label}: `}
          <a href={`mailto:${email}`} className="underline underline-offset-2">
            {email}
          </a>
        </span>
      );
    }

    const phoneMatch = normalizedValue.match(/\+?\d[\d\s().-]{7,}\d/);
    if (phoneMatch && !normalizedValue.includes('http')) {
      const phone = phoneMatch[0];
      const tel = phone.replace(/[^\d+]/g, '');
      return (
        <span>
          {label && `${label}: `}
          <a href={`tel:${tel}`} className="underline underline-offset-2">
            {phone}
          </a>
        </span>
      );
    }

    const urlMatch = normalizedValue.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9.-]+\.[A-Z]{2,}[^\s]*)/i);
    if (urlMatch) {
      const display = sanitizeUrl(urlMatch[0]);
      const href = display.startsWith('http') ? display : `https://${display}`;
      return (
        <span>
          {label && `${label}: `}
          <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {display}
          </a>
        </span>
      );
    }

    const fallbackValue = normalizedValue || value;
    if (label) {
      return `${label}: ${fallbackValue}`;
    }
    return fallbackValue || rawItem;
  };
  return (
    <div className={className}>
      {safeItems.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          <span>{renderContactItem(item)}</span>
          {index < safeItems.length - 1 && <span className="mx-2">{separator}</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export const BulletList = ({
  items,
  className = '',
  bullet = '-'
}: {
  items: string[];
  className?: string;
  bullet?: string;
}) => {
  const cleanedItems = items.map((item) => item.trim()).filter(Boolean);
  if (cleanedItems.length === 0) return null;
  return (
    <ul className={className}>
      {cleanedItems.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start">
          <span className="mr-2 font-bold text-gray-600">{bullet}</span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export const SectionWrapper = ({
  className = '',
  children
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={className}>
    {children}
  </div>
);

export const TechnologyLine = ({
  technologies,
  className = '',
  variant = 'inline'
}: {
  technologies: string[] | string;
  className?: string;
  variant?: 'inline' | 'tags';
}) => {
  const list = Array.isArray(technologies) ? technologies : technologies.split(',').map((t) => t.trim()).filter(Boolean);
  if (list.length === 0) return null;
  if (variant === 'tags') {
    return (
      <div className={className}>
        {list.map((tech, index) => (
          <span key={`${tech}-${index}`} className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">
            {tech}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={className}>
      <span className="font-semibold">Technologies:</span> {list.join(', ')}
    </div>
  );
};
