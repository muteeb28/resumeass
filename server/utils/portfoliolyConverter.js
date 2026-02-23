/**
 * Convert parsed resume data to portfolioly's ResumeData format
 * This ensures the backend returns the exact format portfolioly uses
 */

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse date string like "Jan 2020 - May 2023" or "2020 - Present"
 */
function parseDateString(dateStr, isEnd = false) {
  if (!dateStr) return { month: null, year: null };

  const parts = dateStr.split(/[-–—]/);
  const relevantPart = isEnd ? parts[parts.length - 1]?.trim() : parts[0]?.trim();

  if (!relevantPart || relevantPart.toLowerCase() === 'present') {
    return { month: null, year: null };
  }

  // Month mapping
  const months = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
  };

  // Match "Jan 2020" or "January 2020"
  const monthYearMatch = relevantPart.match(/([a-zA-Z]+)\s+(\d{4})/);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = parseInt(monthYearMatch[2]);
    const month = months[monthName];
    if (month && year) {
      return { month, year };
    }
  }

  // Match year only "2020"
  const yearMatch = relevantPart.match(/\d{4}/);
  if (yearMatch) {
    return { month: null, year: parseInt(yearMatch[0]) };
  }

  return { month: null, year: null };
}

/**
 * Convert V1 resume format to portfolioly's ResumeData format
 */
export function convertToPortfoliolyFormat(resumeJson) {
  const now = new Date().toISOString();

  // Extract work experiences
  const workExperiences = Array.isArray(resumeJson.experience)
    ? resumeJson.experience.map((exp) => ({
        id: generateId(),
        company: exp.company || "",
        title: exp.role || exp.title || "",
        location: exp.location || null,
        start_date: parseDateString(exp.dates),
        end_date: parseDateString(exp.dates, true),
        is_current: exp.dates?.toLowerCase().includes('present') || false,
        highlights: exp.bullets || [],
      }))
    : [];

  // Extract education
  const education = Array.isArray(resumeJson.education)
    ? resumeJson.education.map((edu) => ({
        id: generateId(),
        institution: edu.school || edu.institution || "",
        degree: edu.degree || "",
        field: null,
        location: edu.location || null,
        start_date: parseDateString(edu.dates),
        end_date: parseDateString(edu.dates, true),
        gpa: edu.gpa || null,
        highlights: edu.details || [],
      }))
    : [];

  // Extract projects
  const projects = Array.isArray(resumeJson.projects)
    ? resumeJson.projects.map((proj) => ({
        id: generateId(),
        name: proj.name || "",
        description: proj.description || null,
        technologies: proj.tech || [],
        url: proj.link || null,
        highlights: proj.bullets || [],
      }))
    : [];

  // Extract skills
  const skills = {
    categories: Array.isArray(resumeJson.skills)
      ? resumeJson.skills.map((skillCat) => ({
          name: skillCat.name || "",
          items: skillCat.items || [],
        }))
      : [],
  };

  // Extract certifications
  const certifications = Array.isArray(resumeJson.certifications)
    ? resumeJson.certifications.map((cert) => ({
        id: generateId(),
        name: cert.name || "",
        issuer: cert.issuer || null,
        date: cert.date || null,
      }))
    : [];

  // Extract achievements (from community or other dynamic sections)
  const achievements = Array.isArray(resumeJson.achievements)
    ? resumeJson.achievements
    : Array.isArray(resumeJson.community)
    ? resumeJson.community.map(c => `${c.role || ''} at ${c.organization || ''} - ${c.description || ''}`.trim())
    : [];

  console.log('[Portfolioly Converter] Converted data:');
  console.log('  - Work experiences:', workExperiences.length);
  console.log('  - Education:', education.length);
  console.log('  - Projects:', projects.length);
  console.log('  - Skills categories:', skills.categories.length);
  console.log('  - Certifications:', certifications.length);
  console.log('  - Achievements:', achievements.length);
  console.log('  - Profile links:', resumeJson.basics?.links?.length || 0);
  console.log('  - Summary length:', resumeJson.basics?.summary?.length || 0);

  return {
    id: generateId(),
    name: "My Resume",
    template_id: "jake",
    section_order: ["summary", "experience", "education", "projects", "skills", "certifications", "achievements"],

    personal_info: {
      full_name: resumeJson.basics?.name || "",
      email: resumeJson.basics?.email || null,
      phone: resumeJson.basics?.phone || null,
      location: resumeJson.basics?.location || null,
      profiles: resumeJson.basics?.links ? {
        linkedin: resumeJson.basics.links.find(l => l?.toLowerCase().includes('linkedin')) || null,
        github: resumeJson.basics.links.find(l => l?.toLowerCase().includes('github')) || null,
        leetcode: resumeJson.basics.links.find(l => l?.toLowerCase().includes('leetcode')) || null,
        codeforces: resumeJson.basics.links.find(l => l?.toLowerCase().includes('codeforces')) || null,
        codechef: resumeJson.basics.links.find(l => l?.toLowerCase().includes('codechef')) || null,
        website: resumeJson.basics.links.find(l => !['linkedin', 'github', 'leetcode', 'codeforces', 'codechef'].some(key => l?.toLowerCase().includes(key))) || null,
      } : undefined,
    },

    summary: resumeJson.basics?.summary || null,
    work_experiences: workExperiences,
    education: education,
    projects: projects,
    skills: skills,
    certifications: certifications,
    achievements: achievements,

    created_at: now,
    updated_at: now,
  };
}
