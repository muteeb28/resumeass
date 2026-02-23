/**
 * BUILT FROM ABSOLUTE SCRATCH
 * No types, no imports, no dependencies
 * Pure React component
 */

export default function TemplateATS({ resume }: { resume: any }) {
  // Safety check
  if (!resume) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No resume data</div>;
  }

  // Extract name and contact
  const name = resume?.basics?.name || resume?.personalInfo?.name || '';
  const email = resume?.basics?.email || resume?.personalInfo?.email || '';
  const phone = resume?.basics?.phone || resume?.personalInfo?.phone || '';
  const location = resume?.basics?.location || resume?.personalInfo?.location || '';
  const links = resume?.basics?.links || [];

  // Check if V2 format
  const hasV2Sections = resume.version === 2 && resume.sections;

  // Collect all sections
  const allSections: any[] = [];

  if (hasV2Sections) {
    // V2 FORMAT
    const sectionKeys = Object.keys(resume.sections);
    sectionKeys.forEach(key => {
      const sec = resume.sections[key];
      if (sec.visible !== false) {
        allSections.push({
          id: key,
          title: sec.label || key,
          order: sec.order || 100,
          layout: sec.layout,
          items: sec.items || [],
          rawText: sec.rawText
        });
      }
    });
    allSections.sort((a, b) => a.order - b.order);
  } else {
    // V1 FORMAT - manually extract
    if (resume.summary || resume.basics?.summary) {
      allSections.push({
        id: 'summary',
        title: 'PROFESSIONAL SUMMARY',
        type: 'text',
        data: resume.summary || resume.basics.summary
      });
    }

    if (resume.skills?.length > 0) {
      allSections.push({
        id: 'skills',
        title: 'SKILLS',
        type: 'skills',
        data: resume.skills
      });
    }

    if (resume.experience?.length > 0) {
      allSections.push({
        id: 'experience',
        title: 'PROFESSIONAL EXPERIENCE',
        type: 'experience',
        data: resume.experience
      });
    }

    if (resume.education?.length > 0) {
      allSections.push({
        id: 'education',
        title: 'EDUCATION',
        type: 'education',
        data: resume.education
      });
    }

    if (resume.projects?.length > 0) {
      allSections.push({
        id: 'projects',
        title: 'PROJECTS',
        type: 'projects',
        data: resume.projects
      });
    }

    if (resume.certifications?.length > 0) {
      allSections.push({
        id: 'certifications',
        title: 'CERTIFICATIONS',
        type: 'certifications',
        data: resume.certifications
      });
    }
  }

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      padding: '48px',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#1f2937'
    }}>
      {/* HEADER */}
      <div style={{
        borderBottom: '3px solid #111827',
        paddingBottom: '16px',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '0 0 12px 0',
          color: '#111827',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {name}
        </h1>

        <div style={{
          fontSize: '13px',
          color: '#4b5563',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
          {links.map((link: string, i: number) => <span key={i}>{link}</span>)}
        </div>
      </div>

      {/* SECTIONS */}
      {allSections.map((section, sIdx) => {
        // V2 FORMAT RENDERING
        if (section.layout) {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px',
                color: '#111827'
              }}>
                {section.title}
              </h2>

              {/* TIMELINE LAYOUT (Experience, Volunteer, etc) */}
              {section.layout === 'timeline' && section.items.map((item: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>{item.title}</strong>
                    {item.dates && <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.dates}</span>}
                  </div>
                  {item.organization && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>{item.organization}</span>
                      {item.location && <span style={{ fontStyle: 'italic', color: '#6b7280' }}>{item.location}</span>}
                    </div>
                  )}
                  {item.bullets?.length > 0 && (
                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                      {item.bullets.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} style={{ marginBottom: '4px', color: '#374151' }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {item.description && !item.bullets && (
                    <p style={{ margin: '8px 0', color: '#374151' }}>{item.description}</p>
                  )}
                </div>
              ))}

              {/* EDUCATION LAYOUT */}
              {section.layout === 'education' && section.items.map((item: any, idx: number) => {
                const gradDate = item.endDate || item.startDate || item.dates || "";
                return (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        {item.degree && <strong style={{ display: 'block', fontSize: '14px' }}>{item.degree}</strong>}
                        {item.school && <div style={{ fontWeight: '600', color: '#374151' }}>{item.school}</div>}
                        {item.location && <div style={{ color: '#6b7280', fontSize: '12px' }}>{item.location}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {gradDate && <div style={{ color: '#6b7280' }}>{gradDate}</div>}
                        {item.gpa && <div style={{ fontSize: '12px', color: '#6b7280' }}>GPA: {item.gpa}</div>}
                      </div>
                    </div>
                    {item.details?.length > 0 && (
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {item.details.map((d: string, dIdx: number) => (
                          <li key={dIdx} style={{ marginBottom: '4px' }}>{d}</li>
                        ))}
                      </ul>
                    )}
                    {item.highlights?.length > 0 && (
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {item.highlights.map((h: string, hIdx: number) => (
                          <li key={hIdx} style={{ marginBottom: '4px', color: '#374151' }}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* PROJECTS LAYOUT */}
              {section.layout === 'projects' && section.items.map((item: any, idx: number) => {
                const projDates = item.startDate || item.endDate
                  ? [item.startDate, item.endDate].filter(Boolean).join(' – ')
                  : "";
                const allBullets = [...(item.bullets || []), ...(item.highlights || [])];
                return (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      {item.name && <strong style={{ fontSize: '14px' }}>{item.name}</strong>}
                      {projDates ? (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{projDates}</span>
                      ) : item.link ? (
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.link}</span>
                      ) : null}
                    </div>
                    {item.role && <div style={{ fontStyle: 'italic', color: '#374151', marginBottom: '4px' }}>{item.role}</div>}
                    {item.tech?.length > 0 && (
                      <div style={{ marginBottom: '4px', color: '#374151' }}>
                        <strong>Technologies:</strong> {Array.isArray(item.tech) ? item.tech.join(', ') : item.tech}
                      </div>
                    )}
                    {item.description && <p style={{ margin: '4px 0', color: '#374151' }}>{item.description}</p>}
                    {allBullets.length > 0 && (
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {allBullets.map((b: string, bIdx: number) => (
                          <li key={bIdx} style={{ marginBottom: '4px' }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* LIST LAYOUT (Skills, Awards) */}
              {section.layout === 'list' && (() => {
                const categorized: Record<string, string[]> = {};
                const plain: string[] = [];

                section.items.forEach((item: any) => {
                  const val = item.value || item;
                  if (item.category) {
                    if (!categorized[item.category]) categorized[item.category] = [];
                    categorized[item.category].push(val);
                  } else {
                    plain.push(val);
                  }
                });

                return (
                  <div>
                    {Object.entries(categorized).map(([cat, vals]) => (
                      <div key={cat} style={{ marginBottom: '8px', color: '#374151' }}>
                        <strong>{cat}:</strong> {vals.join(' • ')}
                      </div>
                    ))}
                    {plain.length > 0 && (
                      <div style={{ color: '#374151' }}>{plain.join(' • ')}</div>
                    )}
                  </div>
                );
              })()}

              {/* CERTIFICATIONS LAYOUT */}
              {section.layout === 'certifications' && section.items.map((item: any, idx: number) => {
                const certName = typeof item === 'string' ? item : (item.name || item.title);
                const issuer = typeof item === 'object' ? item.issuer : null;
                const date = typeof item === 'object' ? item.date : null;
                return (
                  <div key={idx} style={{ marginBottom: '6px', color: '#374151' }}>
                    <strong>{certName}</strong>
                    {issuer && <span> - {issuer}</span>}
                    {date && <span> ({date})</span>}
                  </div>
                );
              })}

              {/* TEXT LAYOUT */}
              {section.layout === 'text' && section.items.map((item: any, idx: number) => (
                <p key={idx} style={{ margin: '0 0 8px 0', color: '#374151', lineHeight: '1.6' }}>
                  {item.content || item}
                </p>
              ))}

              {/* RAW TEXT FALLBACK */}
              {section.rawText && !section.items?.length && (
                <div style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>{section.rawText}</div>
              )}
            </div>
          );
        }

        // V1 FORMAT RENDERING
        if (section.type === 'text') {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>{section.data}</p>
            </div>
          );
        }

        if (section.type === 'skills') {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              {section.data.map((skillGroup: any, idx: number) => {
                if (skillGroup.items?.length > 0) {
                  return (
                    <div key={idx} style={{ marginBottom: '8px', color: '#374151' }}>
                      <strong>{skillGroup.name}:</strong> {skillGroup.items.join(' • ')}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        }

        if (section.type === 'experience') {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              {section.data.map((exp: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{exp.role || exp.title}</strong>
                    {(exp.dates || exp.duration) && <span style={{ color: '#6b7280' }}>{exp.dates || exp.duration}</span>}
                  </div>
                  {exp.company && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>{exp.company}</span>
                      {exp.location && <span style={{ fontStyle: 'italic', color: '#6b7280' }}>{exp.location}</span>}
                    </div>
                  )}
                  {exp.bullets?.length > 0 && (
                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                      {exp.bullets.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} style={{ marginBottom: '4px', color: '#374151' }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          );
        }

        if (section.type === 'education') {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              {section.data.map((edu: any, idx: number) => {
                const gradDate = edu.endDate || edu.startDate || edu.dates || edu.year || "";
                return (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        {edu.degree && <strong style={{ display: 'block' }}>{edu.degree}</strong>}
                        {(edu.school || edu.university || edu.institution) && (
                          <div style={{ fontWeight: '600', color: '#374151' }}>
                            {edu.school || edu.university || edu.institution}
                          </div>
                        )}
                        {edu.location && <div style={{ fontSize: '12px', color: '#6b7280' }}>{edu.location}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {gradDate && <div style={{ color: '#6b7280' }}>{gradDate}</div>}
                        {edu.gpa && <div style={{ fontSize: '12px', color: '#6b7280' }}>GPA: {edu.gpa}</div>}
                      </div>
                    </div>
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {edu.highlights.map((h: string, hIdx: number) => (
                          <li key={hIdx} style={{ marginBottom: '4px', color: '#374151' }}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }

        if (section.type === 'projects') {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              {section.data.map((proj: any, idx: number) => {
                const projDates = proj.startDate || proj.endDate
                  ? [proj.startDate, proj.endDate].filter(Boolean).join(' – ')
                  : "";
                return (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      {proj.name && <strong style={{ fontSize: '14px' }}>{proj.name}</strong>}
                      {projDates && <span style={{ fontSize: '13px', color: '#6b7280' }}>{projDates}</span>}
                    </div>
                    {proj.role && <div style={{ fontStyle: 'italic', color: '#374151', marginBottom: '4px' }}>{proj.role}</div>}
                    {proj.technologies && (
                      <div style={{ marginBottom: '4px', color: '#374151' }}>
                        <strong>Technologies:</strong> {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      </div>
                    )}
                    {proj.description && <p style={{ margin: '4px 0', color: '#374151' }}>{proj.description}</p>}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {proj.highlights.map((h: string, hIdx: number) => (
                          <li key={hIdx} style={{ marginBottom: '4px', color: '#374151' }}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }

        if (section.type === 'certifications') {
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '2px solid #9ca3af',
                paddingBottom: '6px',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              {section.data.map((cert: any, idx: number) => {
                const certName = typeof cert === 'string' ? cert : (cert.name || cert.title);
                return (
                  <div key={idx} style={{ marginBottom: '6px', color: '#374151' }}>
                    <strong>{certName}</strong>
                    {typeof cert === 'object' && cert.issuer && <span> - {cert.issuer}</span>}
                    {typeof cert === 'object' && cert.date && <span> ({cert.date})</span>}
                  </div>
                );
              })}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
