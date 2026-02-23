import OpenAI from 'openai';
import { parseResumeUltimate } from './dynamicResumeParser.js';

// Simple replacement for cleanExperienceHeaders
function cleanExperienceHeaders(experience) {
  if (!Array.isArray(experience)) return [];

  return experience.map(job => ({
    role: job.role || job.title || '',
    company: job.company || '',
    location: job.location || '',
    dates: job.dates || job.duration || '',
    bullets: Array.isArray(job.bullets) ? job.bullets : (Array.isArray(job.description) ? job.description : []),
    tech: Array.isArray(job.tech) ? job.tech : []
  }));
}


function mergeParsedPayloads(primaryPayload, ...candidates) {
  let resolvedPrimary = primaryPayload;
  if (!resolvedPrimary) {
    resolvedPrimary = candidates.find((payload) => payload);
  }
  if (!resolvedPrimary) return null;

  const getPayloadContent = (payload) => {
    if (!payload || typeof payload !== 'object') return null;
    if (payload.fullContent && typeof payload.fullContent === 'object') return payload.fullContent;
    if (payload.layout && typeof payload.layout === 'object') return payload.layout;
    return payload;
  };

  const primaryData = getPayloadContent(resolvedPrimary);
  if (!primaryData) return resolvedPrimary;

  candidates.forEach((candidate) => {
    if (!candidate || candidate === resolvedPrimary) return;
    const candidateData = getPayloadContent(candidate);
    if (!candidateData) return;

    // Direct field merges
    const summaryKeys = ['summary', 'professionalSummary', 'executiveSummary', 'profile', 'objective', 'about'];
    const otherSummary = summaryKeys.map((key) => candidateData[key]).find((v) => typeof v === 'string' && v.trim());
    if (otherSummary && (!primaryData.summary || otherSummary.length > primaryData.summary.length + 20)) {
      primaryData.summary = otherSummary;
    }

    if (!primaryData.experienceRawText && candidateData.experienceRawText) {
      primaryData.experienceRawText = candidateData.experienceRawText;
    }
    if (!primaryData.educationRawText && candidateData.educationRawText) {
      primaryData.educationRawText = candidateData.educationRawText;
    }
    if (!primaryData.projectsRawText && candidateData.projectsRawText) {
      primaryData.projectsRawText = candidateData.projectsRawText;
    }

    // List merges (simple concat for now to ensure no data loss)
    const listKeys = ['experience', 'education', 'projects', 'certifications'];
    listKeys.forEach(key => {
      if (Array.isArray(candidateData[key]) && candidateData[key].length > (Array.isArray(primaryData[key]) ? primaryData[key].length : 0)) {
        primaryData[key] = candidateData[key];
      }
    });
  });

  return resolvedPrimary;
}

let cachedClient = null;
let cachedConfig = null;

const getClientConfig = () => {
  const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
  const baseURL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').trim();
  const model = (process.env.DEEPSEEK_MODEL || 'deepseek-chat').trim();
  return { apiKey, baseURL, model };
};

const getDeepseekClient = () => {
  const config = getClientConfig();
  if (!config.apiKey) {
    return { client: null, config, error: new Error('DEEPSEEK_API_KEY is required') };
  }

  const needsRefresh = !cachedClient
    || !cachedConfig
    || cachedConfig.apiKey !== config.apiKey
    || cachedConfig.baseURL !== config.baseURL;

  if (needsRefresh) {
    cachedClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
    cachedConfig = { apiKey: config.apiKey, baseURL: config.baseURL };
  }

  return { client: cachedClient, config, error: null };
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeList = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeString(item)).filter(Boolean);
};

const dedupeList = (items) => {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    const key = normalizeString(item).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
};

const mergeStringLists = (primary, fallback) => {
  return dedupeList([...(primary || []), ...(fallback || [])]);
};

const stopWords = new Set([
  'and', 'the', 'with', 'for', 'from', 'this', 'that', 'your', 'you', 'our',
  'are', 'will', 'have', 'has', 'not', 'all', 'any', 'but', 'can', 'able',
  'job', 'role', 'work', 'team', 'experience', 'skills', 'skill', 'years',
  'year', 'candidate', 'responsibilities', 'requirements', 'preferred'
]);

const extractKeywords = (text) => {
  if (!text) return [];
  const tokens = text
    .replace(/[^a-zA-Z0-9+.#/ ]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const keywords = [];
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (lower.length < 3 || stopWords.has(lower)) continue;
    if (!keywords.includes(token)) {
      keywords.push(token);
    }
  }
  return keywords.slice(0, 60);
};

const buzzwordPatterns = [
  /highly skilled/gi,
  /results[-\s]driven/gi,
  /passionate/gi,
  /dynamic/gi,
  /self[-\s]motivated/gi,
  /detail[-\s]oriented/gi,
  /team player/gi,
  /hardworking/gi,
  /proven track record/gi
];

const weakVerbReplacements = [
  { pattern: /^worked on\s+/i, replacement: 'Built ' },
  { pattern: /^helped\s+(to\s+)?/i, replacement: 'Supported ' },
  { pattern: /^responsible for\s+/i, replacement: 'Owned ' },
  { pattern: /^involved in\s+/i, replacement: 'Delivered ' },
  { pattern: /^assisted\s+in\s+/i, replacement: 'Supported ' },
  { pattern: /^supported\s+/i, replacement: 'Supported ' },
  { pattern: /^tasked with\s+/i, replacement: 'Owned ' }
];

const impactVerbPattern = /(increased|reduced|improved|optimized|accelerated|boosted|cut|grew|drove|delivered|saved|launched|shipped|scaled|automated|streamlined|enhanced|decreased)/i;
const metricPattern = /\b\d+%|\b\d+\b/;

const sanitizeSummary = (summary) => {
  if (!summary) return '';
  let cleaned = normalizeString(summary)
    .replace(/^summary:\s*/i, '')
    .replace(/\s+/g, ' ');

  // Remove buzzwords
  buzzwordPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '').replace(/\s+/g, ' ').trim();
  });

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  // Limit to first 4 sentences instead of 3 for more context
  const limitedSentences = sentences.slice(0, 4);
  let result = limitedSentences.join(' ');

  // INCREASED limit from 320 to 500 characters to avoid aggressive truncation
  // Only truncate if REALLY long (500+ chars)
  if (result.length > 500) {
    result = result.slice(0, 500).trim();
    if (!result.endsWith('.')) {
      result = `${result}...`;
    }
  }

  return result;
};

const dedupeBullets = (bullets) => {
  const seen = new Set();
  return bullets.filter((bullet) => {
    const key = normalizeString(bullet).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const rewriteWeakVerb = (bullet) => {
  let updated = normalizeString(bullet);
  if (!updated) return '';
  weakVerbReplacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(updated)) {
      updated = updated.replace(pattern, replacement);
    }
  });
  return updated;
};

const scoreTextForJob = (text, jobKeywords) => {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;
  jobKeywords.forEach((keyword) => {
    const key = keyword.toLowerCase();
    if (key && lower.includes(key)) score += 1;
  });
  if (metricPattern.test(text)) score += 2;
  if (impactVerbPattern.test(text)) score += 1;
  return score;
};

const rankBullets = (bullets, jobKeywords) => {
  return bullets
    .map((bullet, index) => ({
      bullet,
      index,
      score: scoreTextForJob(bullet, jobKeywords)
    }))
    .sort((a, b) => {
      if (b.score === a.score) return a.index - b.index;
      return b.score - a.score;
    })
    .map((entry) => entry.bullet);
};

const enforceEditorialGuidelines = (resume, jobDescription, roleTitle) => {
  console.log('[enforceEditorialGuidelines] INPUT resume keys:', Object.keys(resume));
  console.log('[enforceEditorialGuidelines] INPUT basics.links:', resume.basics?.links);
  console.log('[enforceEditorialGuidelines] INPUT education:', resume.education?.length);
  console.log('[enforceEditorialGuidelines] INPUT projects:', resume.projects?.length);

  const jobKeywords = extractKeywords(jobDescription);
  const updated = { ...resume };

  // Preserve all basics fields, only update summary
  updated.basics = {
    ...resume.basics,
    summary: sanitizeSummary(resume.basics?.summary || '')
  };

  console.log('[enforceEditorialGuidelines] AFTER basics update - basics.links:', updated.basics?.links);

  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const scoredRoles = experience.map((exp, index) => {
    const text = [exp.role, exp.company, ...(exp.bullets || [])].join(' ');
    return { index, score: scoreTextForJob(text, jobKeywords) };
  });
  const primaryRoleIndex = scoredRoles.sort((a, b) => b.score - a.score)[0]?.index ?? 0;

  updated.experience = experience.map((exp, index) => {
    const bullets = dedupeBullets(
      (exp.bullets || [])
        .map((bullet) => rewriteWeakVerb(bullet))
        .filter(Boolean)
    );
    const ranked = rankBullets(bullets, jobKeywords);
    return {
      ...exp,
      bullets: ranked
    };
  });

  // Preserve all other fields (projects, education, certifications, skills, etc.)
  console.log('[enforceEditorialGuidelines] RETURN keys:', Object.keys(updated));
  console.log('[enforceEditorialGuidelines] RETURN basics.links:', updated.basics?.links);
  console.log('[enforceEditorialGuidelines] RETURN education:', updated.education?.length);
  console.log('[enforceEditorialGuidelines] RETURN projects:', updated.projects?.length);
  console.log('[enforceEditorialGuidelines] RETURN summary length:', updated.basics?.summary?.length);

  return updated;
};

const resumeJsonToText = (resume) => {
  if (!resume) return '';
  const parts = [];
  parts.push(resume.basics?.name || '');
  parts.push(resume.basics?.title || '');
  parts.push(resume.basics?.summary || '');
  parts.push((resume.basics?.links || []).join(' '));
  resume.skills?.forEach((group) => {
    parts.push(group.name || '');
    parts.push((group.items || []).join(' '));
  });
  resume.experience?.forEach((exp) => {
    parts.push(exp.company || '');
    parts.push(exp.role || '');
    parts.push(exp.dates || '');
    parts.push(exp.location || '');
    parts.push((exp.bullets || []).join(' '));
    parts.push((exp.tech || []).join(' '));
  });
  resume.projects?.forEach((project) => {
    parts.push(project.name || '');
    parts.push(project.description || '');
    parts.push((project.bullets || []).join(' '));
    parts.push((project.tech || []).join(' '));
  });
  resume.education?.forEach((edu) => {
    parts.push(edu.institution || edu.school || '');
    parts.push(edu.degree || '');
    parts.push(edu.graduation || edu.dates || '');
    parts.push(edu.location || '');
    parts.push(edu.gpa || (edu.details || []).join(' ') || '');
  });
  resume.certifications?.forEach((cert) => {
    parts.push(cert.name || '');
    parts.push(cert.issuer || '');
    parts.push(cert.date || '');
  });
  return parts.join(' ').trim();
};

export const buildResumeJsonFromParsed = (parsed) => {
  console.log('[DEBUG buildResumeJsonFromParsed] Input parsed object:', JSON.stringify(parsed, null, 2));

  const getNested = (obj, ...keys) => {
    if (!obj) return "";
    for (const key of keys) {
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = obj;
        for (const p of parts) {
          current = current?.[p];
        }
        if (current && typeof current === 'string') return current.trim();
      } else {
        if (obj[key] && typeof obj[key] === 'string') return obj[key].trim();
      }
    }
    return "";
  };

  const basics = {
    name: normalizeString(getNested(parsed, 'personalInfo.name', 'name', 'basics.name', 'contact.name')),
    title: normalizeString(getNested(parsed, 'title', 'basics.title', 'professionalTitle', 'role')),
    email: normalizeString(getNested(parsed, 'personalInfo.email', 'email', 'basics.email', 'contact.email')),
    phone: normalizeString(getNested(parsed, 'personalInfo.phone', 'phone', 'basics.phone', 'contact.phone')),
    location: normalizeString(getNested(parsed, 'personalInfo.location', 'location', 'basics.location', 'contact.location')),
    links: [
      normalizeString(getNested(parsed, 'personalInfo.linkedin', 'linkedin', 'basics.linkedin', 'contact.linkedin')),
      normalizeString(getNested(parsed, 'personalInfo.github', 'github', 'basics.github', 'contact.github')),
      normalizeString(getNested(parsed, 'personalInfo.twitter', 'twitter', 'basics.twitter', 'contact.twitter')),
      normalizeString(getNested(parsed, 'personalInfo.website', 'website', 'basics.website', 'contact.website')),
      ...(parsed?.contact?.links || parsed?.basics?.links || [])
    ].filter(Boolean),
    summary: normalizeString(getNested(parsed, 'summary', 'basics.summary', 'professionalSummary', 'profile'))
  };

  // Phone selection improvement: prefer +91 or longer numbers
  const allPhones = [
    normalizeString(getNested(parsed, 'personalInfo.phone', 'phone', 'basics.phone', 'contact.phone')),
    ...(parsed?.contact?.phones || [])
  ].filter(Boolean);

  if (allPhones.length > 0) {
    const bestPhone = allPhones.find(p => p.includes('+91')) || allPhones.sort((a, b) => b.length - a.length)[0];
    basics.phone = bestPhone;
  }

  console.log('[DEBUG buildResumeJsonFromParsed] Built basics:', JSON.stringify(basics, null, 2));

  const skills = [];
  const parsedSkills = parsed?.skills;

  console.log('[DEBUG] Raw skills from parser:', parsedSkills);

  if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
    // If it's already an array of structured skill objects [{name, items}], use it
    if (parsedSkills[0] && typeof parsedSkills[0] === 'object' && Array.isArray(parsedSkills[0].items)) {
      parsedSkills.forEach(group => {
        skills.push({
          name: normalizeString(group.name || 'Skills'),
          items: (group.items || []).map(normalizeString).filter(Boolean)
        });
      });
      console.log('[DEBUG] Processed structured skills array:', skills);
    } else {
      // deadSimpleParser returns skills as a simple array of strings
      skills.push({ name: 'Skills', items: parsedSkills.map(normalizeString).filter(Boolean) });
      console.log('[DEBUG] Processed flat skills array:', skills);
    }
  } else if (parsedSkills && typeof parsedSkills === 'object') {
    // Other parsers might return skills as an object
    Object.entries(parsedSkills).forEach(([key, value]) => {
      const items = Array.isArray(value)
        ? value.map(normalizeString).filter(Boolean)
        : String(value || '').split(',').map(normalizeString).filter(Boolean);
      if (items.length > 0) {
        skills.push({ name: key, items });
      }
    });
  } else {
    console.log('[DEBUG] No valid skills found, parsedSkills:', typeof parsedSkills, parsedSkills);
  }

  const experienceToClean = (parsed?.experience || []).map((exp) => ({
    company: normalizeString(exp.company || exp.employer || exp.organization),
    role: normalizeString(exp.role || exp.title || exp.position),
    dates: normalizeString(exp.dates || exp.duration || exp.date),
    location: normalizeString(exp.location),
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets.map(normalizeString).filter(Boolean)
      : (Array.isArray(exp.description)
        ? exp.description.map(normalizeString).filter(Boolean)
        : []), // FIXED: Don't split strings, let the parser handle bullet extraction
    tech: Array.isArray(exp.tech)
      ? exp.tech.map(normalizeString).filter(Boolean)
      : (Array.isArray(exp.technologies)
        ? exp.technologies.map(normalizeString).filter(Boolean)
        : [])
  })).filter((exp) => {
    // CRITICAL FIX: Filter out personal info that might have been parsed as experience
    const isPersonalInfo = /^(date of birth|birth date|nationality|marital status|age|gender|passport|visa|languages?|language proficiency|personal details|personal information)/i.test(exp.role || '') ||
      /^(date of birth|birth date|nationality|marital status|age|gender|passport|visa|languages?|language proficiency|personal details|personal information)/i.test(exp.company || '');

    if (isPersonalInfo) {
      console.log(`[FILTER OUT PERSONAL INFO] Removing: role="${exp.role}", company="${exp.company}"`);
      return false;
    }

    return exp.company || exp.role || exp.bullets.length > 0;
  });

  const experience = cleanExperienceHeaders(experienceToClean);

  const education = (parsed?.education || [])
    .map((edu) => {
      // Handle string entries (from deadSimpleParser)
      if (typeof edu === 'string') {
        return { school: normalizeString(edu), degree: '', dates: '', location: '', details: [] };
      }

      const school = normalizeString(edu.institution || edu.university || edu.school);
      const degree = normalizeString(edu.degree);
      const graduation = normalizeString(edu.year || edu.dates || edu.graduation);
      const location = normalizeString(edu.location);
      const score = normalizeString(edu.score || edu.gpa);

      // Validation: If school looks like a GPA/Numeric and we have no school, or it's clearly garbage
      const isGarbage = /^\d+(\.\d+)?%?$/.test(school) || school.toLowerCase() === 'gpa' || school.length < 2;

      return {
        school: isGarbage ? '' : school,
        degree,
        dates: graduation,
        location,
        details: edu.details || (score ? [`GPA: ${score}`] : [])
      };
    })
    .filter((edu) => edu.school || edu.degree);

  const projects = (parsed?.projects || []).map((project) => {
    if (typeof project === 'string') {
      return { name: normalizeString(project) };
    }
    return {
      name: normalizeString(project.name || project.title),
      description: normalizeString(project.description || project.summary),
      bullets: Array.isArray(project.bullets)
        ? project.bullets.map(normalizeString).filter(Boolean)
        : [],
      tech: Array.isArray(project.tech)
        ? project.tech.map(normalizeString).filter(Boolean)
        : Array.isArray(project.technologies)
          ? project.technologies.map(normalizeString).filter(Boolean)
          : [],
      link: normalizeString(project.link || project.url || '')
    };
  }).filter((project) => project.name || project.description);

  const certifications = (parsed?.certifications || []).map((cert) => {
    if (typeof cert === 'string') {
      return { name: normalizeString(cert) };
    }
    return {
      name: normalizeString(cert.name || cert.title || String(cert)),
      issuer: normalizeString(cert.issuer),
      date: normalizeString(cert.date)
    };
  }).filter((cert) => cert.name);

  // Build the standardized V1 object, but spread original keys to preserve dynamic sections
  const result = {
    ...parsed, // Preserve ALL original keys (volunteer, awards, etc.)
    basics,
    skills,
    experience,
    projects,
    education,
    certifications
  };
  const summaryRawText = normalizeString(parsed?.summaryRawText);
  if (!basics.summary && summaryRawText) {
    result.summaryRawText = summaryRawText;
  }
  const rawSkills = normalizeString(parsed?.skillsRawText);
  if (!skills.length && rawSkills) {
    result.skillsRawText = rawSkills;
  }
  const rawExperience = normalizeString(parsed?.experienceRawText);
  if (!experience.length && rawExperience) {
    result.experienceRawText = rawExperience;
  }
  const rawEducation = normalizeString(parsed?.educationRawText);
  if (!education.length && rawEducation) {
    result.educationRawText = rawEducation;
  }
  const rawProjects = normalizeString(parsed?.projectsRawText);
  if (!projects.length && rawProjects) {
    result.projectsRawText = rawProjects;
  }
  const rawCertifications = normalizeString(parsed?.certificationsRawText);
  if (!certifications.length && rawCertifications) {
    result.certificationsRawText = rawCertifications;
  }
  return result;
};

const pickValue = (primary, fallback) => {
  const value = normalizeString(primary);
  if (value) return primary;
  return fallback || '';
};

const mergeBasics = (primary, fallback) => {
  const base = fallback || {};
  const head = primary || {};
  return {
    name: pickValue(head.name, base.name),
    title: pickValue(head.title, base.title),
    email: pickValue(head.email, base.email),
    phone: pickValue(head.phone, base.phone),
    location: pickValue(head.location, base.location),
    links: dedupeList([...(head.links || []), ...(base.links || [])]),
    summary: pickValue(head.summary, base.summary)
  };
};

const buildKey = (...parts) => {
  const key = parts
    .map((part) => normalizeString(part).toLowerCase())
    .filter(Boolean)
    .join('|');
  return key;
};

const isGarbageInstitution = (name) => {
  const s = normalizeString(name);
  if (!s) return true;
  if (s.length < 3) return true;
  if (/^\d+(\.\d+)?$/.test(s)) return true; // Just a number or GPA
  if (/^(gpa|score|cgpa)$/i.test(s)) return true;
  return false;
};

const mergeSkills = (primary, fallback) => {
  const result = [];
  const map = new Map();
  (primary || []).forEach((group) => {
    const name = normalizeString(group?.name || 'Skills') || 'Skills';
    const items = normalizeList(group?.items);
    const key = name.toLowerCase();
    const entry = { name, items };
    map.set(key, entry);
    result.push(entry);
  });

  (fallback || []).forEach((group) => {
    const name = normalizeString(group?.name || 'Skills') || 'Skills';
    const items = normalizeList(group?.items);
    const key = name.toLowerCase();
    if (!map.has(key)) {
      const entry = { name, items };
      map.set(key, entry);
      result.push(entry);
      return;
    }
    const existing = map.get(key);
    existing.items = mergeStringLists(existing.items, items);
  });

  return result;
};

const normalizeExperienceEntry = (entry) => ({
  company: normalizeString(entry?.company),
  role: normalizeString(entry?.role || entry?.title),
  dates: normalizeString(entry?.dates || entry?.duration),
  location: normalizeString(entry?.location),
  bullets: normalizeList(entry?.bullets || entry?.description),
  tech: normalizeList(entry?.tech || entry?.technologies)
});

const mergeExperience = (primary, fallback) => {
  if (!Array.isArray(primary) || primary.length === 0) return fallback || [];
  const result = primary.map(normalizeExperienceEntry);
  const keyMap = new Map();
  result.forEach((entry, index) => {
    const key = buildKey(entry.company, entry.role, entry.dates);
    if (key) keyMap.set(key, index);
  });

  (fallback || []).forEach((entry) => {
    const normalized = normalizeExperienceEntry(entry);
    const key = buildKey(normalized.company, normalized.role, normalized.dates);
    if (!key || !keyMap.has(key)) {
      result.push(normalized);
      if (key) keyMap.set(key, result.length - 1);
      return;
    }
    const existing = result[keyMap.get(key)];
    if (!existing.location && normalized.location) existing.location = normalized.location;
    if (!existing.company && normalized.company) existing.company = normalized.company;
    if (!existing.role && normalized.role) existing.role = normalized.role;
    if (!existing.dates && normalized.dates) existing.dates = normalized.dates;
    existing.bullets = mergeStringLists(existing.bullets, normalized.bullets);
    existing.tech = mergeStringLists(existing.tech, normalized.tech);
  });

  return result;
};

const normalizeEducationEntry = (entry) => ({
  institution: normalizeString(entry?.school || entry?.institution || entry?.university),
  degree: normalizeString(entry?.degree),
  graduation: normalizeString(entry?.dates || entry?.year || entry?.graduation),
  location: normalizeString(entry?.location),
  gpa: normalizeString(entry?.gpa || (Array.isArray(entry?.details) ? entry.details.find(d => d.includes('GPA')) : ''))
});

const mergeEducation = (primary, fallback) => {
  const primaryList = Array.isArray(primary) ? primary : [];
  const fallbackList = Array.isArray(fallback) ? fallback : [];

  // If primary has garbage school names, prefer fallback
  const isPrimaryGarbage = primaryList.length === 0 || primaryList.every(e => isGarbageInstitution(e.school || e.institution));
  if (isPrimaryGarbage && fallbackList.length > 0) {
    return fallbackList.map(normalizeEducationEntry);
  }

  if (primaryList.length === 0) return fallbackList.map(normalizeEducationEntry);
  const result = primaryList.map(normalizeEducationEntry);
  const keyMap = new Map();
  result.forEach((entry, index) => {
    const key = buildKey(entry.institution, entry.degree, entry.graduation);
    if (key) keyMap.set(key, index);
  });

  (fallback || []).forEach((entry) => {
    const normalized = normalizeEducationEntry(entry);
    const key = buildKey(normalized.institution, normalized.degree, normalized.graduation);
    if (!key || !keyMap.has(key)) {
      result.push(normalized);
      if (key) keyMap.set(key, result.length - 1);
      return;
    }
    const existing = result[keyMap.get(key)];
    if (!existing.location && normalized.location) existing.location = normalized.location;
    if (!existing.institution && normalized.institution) existing.institution = normalized.institution;
    if (!existing.degree && normalized.degree) existing.degree = normalized.degree;
    if (!existing.graduation && normalized.graduation) existing.graduation = normalized.graduation;
    if (!existing.gpa && normalized.gpa) existing.gpa = normalized.gpa;
  });

  return result;
};

const normalizeProjectEntry = (entry) => ({
  name: normalizeString(entry?.name || entry?.title),
  description: normalizeString(entry?.description || entry?.summary),
  bullets: normalizeList(entry?.bullets),
  tech: normalizeList(entry?.tech || entry?.technologies),
  link: normalizeString(entry?.link)
});

const mergeProjects = (primary, fallback) => {
  if (!Array.isArray(primary) || primary.length === 0) return fallback || [];
  const result = primary.map(normalizeProjectEntry);
  const keyMap = new Map();
  result.forEach((entry, index) => {
    const key = buildKey(entry.name, entry.description);
    if (key) keyMap.set(key, index);
  });

  (fallback || []).forEach((entry) => {
    const normalized = normalizeProjectEntry(entry);
    const key = buildKey(normalized.name, normalized.description);
    if (!key || !keyMap.has(key)) {
      result.push(normalized);
      if (key) keyMap.set(key, result.length - 1);
      return;
    }
    const existing = result[keyMap.get(key)];
    if (!existing.description && normalized.description) existing.description = normalized.description;
    if (!existing.name && normalized.name) existing.name = normalized.name;
    if (!existing.link && normalized.link) existing.link = normalized.link;
    existing.bullets = mergeStringLists(existing.bullets, normalized.bullets);
    existing.tech = mergeStringLists(existing.tech, normalized.tech);
  });

  return result;
};

const normalizeCertificationEntry = (entry) => ({
  name: normalizeString(entry?.name || entry?.title || entry),
  issuer: normalizeString(entry?.issuer),
  date: normalizeString(entry?.date)
});

const mergeCertifications = (primary, fallback) => {
  if (!Array.isArray(primary) || primary.length === 0) return fallback || [];
  const result = primary.map(normalizeCertificationEntry);
  const keyMap = new Map();
  result.forEach((entry, index) => {
    const key = buildKey(entry.name, entry.issuer);
    if (key) keyMap.set(key, index);
  });

  (fallback || []).forEach((entry) => {
    const normalized = normalizeCertificationEntry(entry);
    const key = buildKey(normalized.name, normalized.issuer);
    if (!key || !keyMap.has(key)) {
      result.push(normalized);
      if (key) keyMap.set(key, result.length - 1);
      return;
    }
    const existing = result[keyMap.get(key)];
    if (!existing.date && normalized.date) existing.date = normalized.date;
    if (!existing.issuer && normalized.issuer) existing.issuer = normalized.issuer;
  });

  return result;
};

const mergeResumePayload = (primary, fallback) => {
  const safePrimary = primary || {};
  const safeFallback = fallback || {};
  const summaryRawText = normalizeString(
    safePrimary.summaryRawText || safeFallback.summaryRawText
  );
  const skillsRawText = normalizeString(
    safePrimary.skillsRawText || safeFallback.skillsRawText
  );
  const experienceRawText = normalizeString(
    safePrimary.experienceRawText || safeFallback.experienceRawText
  );
  const educationRawText = normalizeString(
    safePrimary.educationRawText || safeFallback.educationRawText
  );
  const projectsRawText = normalizeString(
    safePrimary.projectsRawText || safeFallback.projectsRawText
  );
  const certificationsRawText = normalizeString(
    safePrimary.certificationsRawText || safeFallback.certificationsRawText
  );
  return {
    basics: mergeBasics(safePrimary.basics, safeFallback.basics),
    skills: mergeSkills(safePrimary.skills, safeFallback.skills),
    experience: mergeExperience(safePrimary.experience, safeFallback.experience),
    projects: mergeProjects(safePrimary.projects, safeFallback.projects),
    education: mergeEducation(safePrimary.education, safeFallback.education),
    certifications: mergeCertifications(safePrimary.certifications, safeFallback.certifications),
    summaryRawText: summaryRawText || undefined,
    skillsRawText: skillsRawText || undefined,
    experienceRawText: experienceRawText || undefined,
    educationRawText: educationRawText || undefined,
    projectsRawText: projectsRawText || undefined,
    certificationsRawText: certificationsRawText || undefined
  };
};

const buildJobResumePrompt = (payload) => {
  const roleLine = payload.roleTitle ? `Target Role Title: ${payload.roleTitle}` : '';
  const companyLine = payload.companyName ? `Target Company: ${payload.companyName}` : '';

  return `
You are an expert resume writer. Create a job-specific resume from the input resume text.

CRITICAL PARSING RULES:
- The input resume contains section headers like "PROFESSIONAL SUMMARY", "SKILLS", "EXPERIENCE", "EDUCATION", "PROJECTS", "COMMUNITY & ACTIVITIES"
- These are SECTION HEADERS, NOT data values. NEVER put section headers into JSON fields.
- Extract the person's actual name from the first line (before any section headers).
- Extract contact information (email, phone, location, LinkedIn, GitHub) from the header area.
- The content AFTER "PROFESSIONAL SUMMARY" is the summary text.
- The content AFTER "SKILLS" is the skills list.
- The content AFTER "EXPERIENCE" contains job entries.
- The content AFTER "PROJECTS" contains projects.
- The content AFTER "COMMUNITY & ACTIVITIES" or "COMMUNITY" should go into the projects section.

STRICT RULES:
- Use ONLY facts present in the input resume text. Do not invent employers, dates, degrees, skills, or achievements.
- You may rephrase, reorder, and highlight relevant content to match the job description.
- If the job description mentions requirements not present, list them in report.keywordsMissing only.
- The input resume text is the single source of truth.
- Keep ALL experience, education, projects, and certifications from the input resume.
- You may reorder bullets for relevance, but do not drop entire roles or sections.
- Summary should be concise (roughly 3-5 sentences) and not a skills dump.
- Summary must be 2-3 lines, role-targeted, and free of buzzwords like "highly skilled" or "results-driven."
- Experience bullets must be impact-first, keep ALL bullets from the input resume and do not remove any points.
- NEVER merge bullet points, descriptions, or achievement sentences into the job "role", "company", or "title" fields.
- Each field MUST contain ONLY its corresponding entity (e.g., "Software Engineer" in role, "Google" in company).
- DO NOT put job titles, dates, or companies into the "bullets" array as bullet points.
- Education "school" field MUST be the name of the university or college. NEVER put GPAs, scores, or numbers in the school field.
- If you see a degree grade like 8.2 or 3.5, put it in the "details" array or "gpa" field, NOT the school field.
- "Expertise and Skills" must be treated as a SKILLS section, not as part of the last job experience.
- Keywords must appear naturally in strong sentences, not as lists.

INPUT RESUME TEXT:
${payload.resumeText}

JOB DESCRIPTION:
${payload.jobDescription}

${roleLine}
${companyLine}

Return ONLY valid JSON in the following format:
{
  "resume": {
    "basics": {
      "name": "",
      "title": "",
      "email": "",
      "phone": "",
      "location": "",
      "links": [],
      "summary": ""
    },
    "skills": [
      { "name": "", "items": [] }
    ],
    "experience": [
      { "company": "", "role": "", "dates": "", "location": "", "bullets": [], "tech": [] }
    ],
    "projects": [
      { "name": "", "description": "", "bullets": [], "tech": [], "link": "" }
    ],
    "education": [
      { "school": "", "degree": "", "dates": "", "location": "", "details": [] }
    ],
    "certifications": [
      { "name": "", "issuer": "", "date": "" }
    ]
  },
  "report": {
    "matchEstimate": 0,
    "keywordsAdded": [],
    "keywordsMissing": [],
    "changes": [
      { "section": "", "before": "", "after": "", "reason": "" }
    ]
  }
}
`.trim();
};

const safeJsonParse = (content) => {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No JSON found in AI response');
  }
  return JSON.parse(match[0]);
};

const buildFallbackReport = (resume, jobDescription, originalText) => {
  const jobKeywords = extractKeywords(jobDescription);
  const originalKeywords = extractKeywords(originalText);
  const resumeKeywords = extractKeywords(resumeJsonToText(resume));

  const keywordMatches = jobKeywords.filter((keyword) =>
    resumeKeywords.some((item) => item.toLowerCase() === keyword.toLowerCase())
  );

  const matchEstimate = jobKeywords.length
    ? Math.round((keywordMatches.length / jobKeywords.length) * 100)
    : 60;

  const keywordsAdded = resumeKeywords.filter(
    (keyword) =>
      jobKeywords.some((item) => item.toLowerCase() === keyword.toLowerCase()) &&
      !originalKeywords.some((item) => item.toLowerCase() === keyword.toLowerCase())
  );

  const keywordsMissing = jobKeywords.filter(
    (keyword) =>
      !resumeKeywords.some((item) => item.toLowerCase() === keyword.toLowerCase())
  );

  return {
    matchEstimate: Math.max(40, Math.min(matchEstimate, 98)),
    keywordsAdded: keywordsAdded.slice(0, 20),
    keywordsMissing: keywordsMissing.slice(0, 20),
    changes: [
      {
        section: 'Summary',
        before: 'Original summary preserved from resume.',
        after: 'Summary reordered to emphasize job-relevant strengths.',
        reason: 'Aligned summary with target role keywords.'
      },
      {
        section: 'Experience',
        before: 'Bullets listed in original order.',
        after: 'Most relevant bullets moved to the top.',
        reason: 'Highlights job-matching achievements first.'
      }
    ]
  };
};

export const generateJobSpecificResume = async ({
  resumeText,
  jobDescription,
  roleTitle,
  companyName
}) => {
  // Strip internal structural markers that might confuse AI or parsers
  const cleanedResumeText = (resumeText || '')
    .replace(/--- PAGE BREAK ---/g, '')
    .replace(/=== PAGE BREAK ===/g, '');

  const trimmedResume = normalizeString(cleanedResumeText);
  const trimmedJob = normalizeString(jobDescription);
  const effectiveJobDescription = trimmedJob || 'No job description provided. Focus on clarity and concise, ATS-safe formatting without adding new facts.';

  if (!trimmedResume) {
    throw new Error('Resume text is required');
  }

  console.log('[DEBUG] generateJobSpecificResume - trimmedJob:', trimmedJob);
  console.log('[DEBUG] generateJobSpecificResume - jobDescription:', jobDescription);

  // Use ultimateResumeParser for clean, reliable parsing
  let parsed = null;

  try {
    parsed = parseResumeUltimate(trimmedResume);
    console.log('[DEBUG] ultimateParser result - name:', parsed?.personalInfo?.name);
    console.log('[DEBUG] ultimateParser result - summary:', parsed?.summary?.substring(0, 50));
  } catch (parseError) {
    console.error('[DEBUG] ultimateParser failed:', parseError.message);

    // Fallback to ultimate parser with different text processing
    try {
      parsed = parseResumeUltimate(trimmedResume);
    } catch (parseError2) {
      console.error('[DEBUG] All parsers failed:', parseError2.message);
      throw new Error('Unable to parse resume content');
    }
  }

  // Check if this is ultimateParser output (has personalInfo instead of basics)
  const isDeadSimpleFormat = parsed && parsed.personalInfo && !parsed.basics;

  let baselineResume;
  if (isDeadSimpleFormat) {
    // Convert deadSimpleParser format directly to resume JSON
    console.log('[DEBUG] Converting deadSimpleParser format to resume JSON');
    console.log('[DEBUG] Parsed skills array:', parsed.skills);
    console.log('[DEBUG] Skills length:', parsed.skills?.length);
    // ONLY use social links from header/contact section - never project URLs
    const socialLinks = [
      parsed.personalInfo?.linkedin,
      parsed.personalInfo?.github,
      parsed.personalInfo?.twitter,
      parsed.personalInfo?.website,
      parsed.personalInfo?.portfolio
    ].filter(Boolean);

    // Normalize links - add https:// if missing, clean up
    const allLinks = socialLinks.map(link => {
      if (link && !link.startsWith('http')) {
        return 'https://' + link;
      }
      return link;
    }).filter(Boolean);

    baselineResume = {
      basics: {
        name: parsed.personalInfo?.name || '',
        title: '',
        email: parsed.personalInfo?.email || '',
        phone: parsed.personalInfo?.phone || '',
        location: parsed.personalInfo?.location || '',
        links: allLinks,
        summary: parsed.summary || ''
      },
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0
        ? [{ name: 'Skills', items: parsed.skills }]
        : [],
      experience: (parsed.experience || []).map(exp => {
        const bullets = Array.isArray(exp.description) ? exp.description : [];

        // Extract tech from bullets if not already present
        let tech = exp.tech || [];
        if (tech.length === 0 && bullets.length > 0) {
          const techKeywords = ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node', 'Angular', 'Vue', 'AWS', 'Azure', 'GCP', 'Firebase', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'GraphQL', 'REST', 'API', 'APIs', 'Salesforce', 'Demandware', 'ERP', 'CRM', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Git', 'CI/CD', 'WordPress', 'Shopify', 'Magento', 'Express', 'Django', 'Flask', 'Spring', 'Next.js', 'Nuxt'];
          const bulletsText = bullets.join(' ');
          tech = techKeywords.filter(t => new RegExp(`\\b${t}\\b`, 'i').test(bulletsText));
        }

        return {
          company: exp.company || '',
          role: exp.title || '',
          dates: exp.duration || '',
          location: exp.location || '',
          bullets,
          tech
        };
      }),
      projects: (parsed.projects || []).map(proj => ({
        name: proj.name || '',
        description: proj.description || '',
        bullets: proj.bullets || [],
        tech: proj.tech || [],
        link: proj.link || ''
      })),
      // Actually use parsed.education instead of []
      education: (parsed.education || []).map(edu => {
        // education from deadSimpleParser is array of strings
        if (typeof edu === 'string') {
          return { school: edu, degree: '', dates: '', location: '' };
        }
        return {
          school: edu.school || edu.institution || '',
          degree: edu.degree || '',
          dates: edu.dates || edu.year || '',
          location: edu.location || ''
        };
      }),
      certifications: (parsed.certifications || []).map(cert => {
        if (typeof cert === 'string') {
          return { name: cert, issuer: '', date: '' };
        }
        return { name: cert.name || '', issuer: cert.issuer || '', date: cert.date || '' };
      }),
      community: (parsed.community || []).map(comm => ({
        role: comm.role || '',
        organization: comm.organization || '',
        description: comm.description || ''
      }))
    };

    // Community is now properly mapped to its own section

    console.log('[DEBUG] BaselineResume skills:', JSON.stringify(baselineResume.skills, null, 2));
    console.log('[DEBUG] BaselineResume experience count:', baselineResume.experience?.length);
    console.log('[DEBUG] BaselineResume projects count:', baselineResume.projects?.length);
    console.log('[DEBUG] BaselineResume community:', JSON.stringify(baselineResume.community, null, 2));
  } else {
    baselineResume = parsed
      ? buildResumeJsonFromParsed(parsed)
      : {
        basics: { name: "" },
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: []
      };
  }

  // If there's NO job description, skip AI entirely and use the parsed data directly
  // This prevents AI from misinterpreting section headers as data
  const hasNoJobDescription = !trimmedJob || trimmedJob.length === 0 || trimmedJob === 'No job description provided. Focus on clarity and concise, ATS-safe formatting without adding new facts.';

  console.log('[DEBUG] hasNoJobDescription:', hasNoJobDescription);

  if (hasNoJobDescription) {
    console.log('[DEBUG] Bypassing AI - using parsed data directly');
    console.log('[DEBUG] baselineResume.basics.links BEFORE editorial:', baselineResume.basics?.links);
    console.log('[DEBUG] baselineResume.education BEFORE editorial:', baselineResume.education?.length);
    console.log('[DEBUG] baselineResume.projects BEFORE editorial:', baselineResume.projects?.length);

    const fallbackReport = buildFallbackReport(baselineResume, '', trimmedResume);
    const editorialResume = enforceEditorialGuidelines(
      baselineResume,
      '',
      normalizeString(roleTitle)
    );

    console.log('[DEBUG] ===== FINAL RETURN TO CLIENT =====');
    console.log('[DEBUG] editorialResume keys:', Object.keys(editorialResume));
    console.log('[DEBUG] editorialResume.basics.links:', editorialResume.basics?.links);
    console.log('[DEBUG] editorialResume.education:', editorialResume.education?.length, 'items');
    console.log('[DEBUG] editorialResume.projects:', editorialResume.projects?.length, 'items');
    console.log('[DEBUG] editorialResume.skills:', editorialResume.skills?.length, 'items');
    console.log('[DEBUG] editorialResume.basics.summary length:', editorialResume.basics?.summary?.length);
    console.log('[DEBUG] ===================================');

    return {
      resume: editorialResume,
      report: fallbackReport,
      meta: { source: 'parsed-direct', reason: 'No job description provided, using parsed data directly' }
    };
  }

  console.log('[DEBUG] Calling AI with job description');

  const { client, config, error } = getDeepseekClient();
  if (!client) {
    const fallbackReport = buildFallbackReport(baselineResume, trimmedJob || '', trimmedResume);
    if (baselineResume.experienceRawText) {
      fallbackReport.flags = Array.isArray(fallbackReport.flags)
        ? [...fallbackReport.flags, 'experience_unparsed']
        : ['experience_unparsed'];
    }
    const editorialResume = enforceEditorialGuidelines(
      baselineResume,
      trimmedJob || '',
      normalizeString(roleTitle)
    );
    return {
      resume: editorialResume,
      report: fallbackReport,
      meta: { source: 'fallback', reason: error.message }
    };
  }

  try {
    const prompt = buildJobResumePrompt({
      resumeText: trimmedResume,
      jobDescription: effectiveJobDescription,
      roleTitle: normalizeString(roleTitle),
      companyName: normalizeString(companyName)
    });

    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Create job-specific resumes without inventing facts. Output JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsedResponse = safeJsonParse(content);
    if (!parsedResponse.resume || !parsedResponse.report) {
      throw new Error('Invalid response shape');
    }

    const mergedResume = mergeResumePayload(parsedResponse.resume, baselineResume);
    const editorialResume = enforceEditorialGuidelines(
      mergedResume,
      trimmedJob || '',
      normalizeString(roleTitle)
    );

    const report = parsedResponse.report || {};
    if (mergedResume.experienceRawText) {
      report.flags = Array.isArray(report.flags)
        ? [...report.flags, 'experience_unparsed']
        : ['experience_unparsed'];
    }

    return {
      resume: editorialResume,
      report,
      meta: { source: 'ai', model: config.model }
    };
  } catch (err) {
    const fallbackReport = buildFallbackReport(baselineResume, trimmedJob || '', trimmedResume);
    if (baselineResume.experienceRawText) {
      fallbackReport.flags = Array.isArray(fallbackReport.flags)
        ? [...fallbackReport.flags, 'experience_unparsed']
        : ['experience_unparsed'];
    }
    const editorialResume = enforceEditorialGuidelines(
      baselineResume,
      trimmedJob || '',
      normalizeString(roleTitle)
    );
    return {
      resume: editorialResume,
      report: fallbackReport,
      meta: { source: 'fallback', reason: err.message }
    };
  }
};

// ============================================================================
// V2 FORMAT SUPPORT
// ============================================================================

const DEFAULT_SECTION_ORDER = {
  summary: 0,
  experience: 10,
  education: 20,
  skills: 30,
  projects: 40,
  certifications: 50,
  community: 60,
  awards: 70,
};

const DEFAULT_SECTION_LAYOUT = {
  summary: 'text',
  experience: 'timeline',
  education: 'education',
  skills: 'list',
  projects: 'projects',
  certifications: 'certifications',
  community: 'timeline',
  awards: 'list',
};

const DEFAULT_SECTION_LABELS = {
  summary: 'Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  community: 'Community & Activities',
  awards: 'Awards & Honors',
};

/**
 * Convert v1 ResumeJSON to v2 ResumeJSONv2 format
 */
export function convertToV2Format(v1Resume) {
  const sections = {};

  const addSection = (id, items, rawText = null) => {
    const hasItems = items && items.length > 0;
    const hasRawText = rawText && rawText.trim().length > 0;
    if (!hasItems && !hasRawText) return;

    sections[id] = {
      id,
      label: DEFAULT_SECTION_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1),
      layout: DEFAULT_SECTION_LAYOUT[id] || 'text',
      order: DEFAULT_SECTION_ORDER[id] ?? 100,
      visible: true,
      rawText: hasRawText ? rawText : undefined,
      items,
    };
  };

  // Summary
  if (v1Resume.basics?.summary || v1Resume.summaryRawText) {
    const items = v1Resume.basics?.summary
      ? [{ type: 'text', content: v1Resume.basics.summary }]
      : [];
    addSection('summary', items, v1Resume.summaryRawText);
  }

  // Experience
  const expItems = (v1Resume.experience || []).map(exp => ({
    type: 'timeline',
    title: exp.role || exp.title || exp.position || '',
    organization: exp.company || exp.organization || exp.employer || '',
    location: exp.location || '',
    dates: exp.dates || exp.duration || '',
    bullets: exp.bullets || (exp.description ? [exp.description] : []),
  }));
  addSection('experience', expItems, v1Resume.experienceRawText);

  // Education
  const eduItems = (v1Resume.education || []).map(edu => ({
    type: 'education',
    school: edu.school || edu.institution || edu.university || '',
    degree: edu.degree || edu.title || '',
    dates: edu.dates || edu.year || '',
    location: edu.location || '',
    details: edu.details || edu.bullets || [],
  }));
  addSection('education', eduItems, v1Resume.educationRawText);

  // Skills
  const skillItems = (v1Resume.skills || []).flatMap(category =>
    (category.items || []).map(skill => ({
      type: 'list',
      value: skill,
      category: category.name,
    }))
  );
  addSection('skills', skillItems, v1Resume.skillsRawText);

  // Projects
  const projItems = (v1Resume.projects || []).map(proj => ({
    type: 'project',
    name: proj.name || '',
    description: proj.description,
    tech: proj.tech,
    bullets: proj.bullets,
    link: proj.link,
  }));
  addSection('projects', projItems, v1Resume.projectsRawText);

  // Certifications
  const certItems = (v1Resume.certifications || []).map(cert => ({
    type: 'certification',
    name: cert.name || '',
    issuer: cert.issuer,
    date: cert.date,
  }));
  addSection('certifications', certItems, v1Resume.certificationsRawText);

  // Community (from extended v1 format)
  if (Array.isArray(v1Resume.community) && v1Resume.community.length > 0) {
    const communityItems = v1Resume.community.map(item => ({
      type: 'timeline',
      title: item.role || '',
      organization: item.organization || '',
      description: item.description,
    }));
    addSection('community', communityItems);
  }

  // DYNAMIC SECTIONS: Add any other sections found in the v1 data
  const handledKeys = [
    'basics', 'skills', 'experience', 'projects', 'education',
    'certifications', 'community', 'summaryRawText', 'skillsRawText',
    'experienceRawText', 'educationRawText', 'projectsRawText',
    'certificationsRawText', 'meta', 'report', 'version'
  ];

  Object.entries(v1Resume).forEach(([key, value]) => {
    if (handledKeys.includes(key)) return;
    if (!value) return;

    // If it's an array of items, add as a section
    if (Array.isArray(value) && value.length > 0) {
      const items = value.map(item => {
        if (typeof item === 'string') return { type: 'text', content: item };
        if (typeof item === 'object') {
          // Try to infer a reasonable item structure for v2
          return {
            type: 'text',
            content: item.description || item.name || item.text || JSON.stringify(item),
            ...item
          };
        }
        return { type: 'text', content: String(item) };
      });

      addSection(key, items);
    }
    // If it's a string (like a raw text section), add as a text section
    else if (typeof value === 'string' && value.trim().length > 0) {
      addSection(key, [{ type: 'text', content: value }]);
    }
  });

  return {
    version: 2,
    basics: {
      name: v1Resume.basics?.name || '',
      title: v1Resume.basics?.title,
      email: v1Resume.basics?.email,
      phone: v1Resume.basics?.phone,
      location: v1Resume.basics?.location,
      links: v1Resume.basics?.links,
      summary: v1Resume.basics?.summary,
    },
    sections,
  };
}

/**
 * Generate a job-specific resume in v2 format
 */
export async function generateJobSpecificResumeV2({ resumeText, jobDescription, roleTitle, companyName }) {
  // Use existing v1 generator
  const v1Result = await generateJobSpecificResume({ resumeText, jobDescription, roleTitle, companyName });

  // Convert to v2 format
  const v2Resume = convertToV2Format(v1Result.resume);

  return {
    resume: v2Resume,
    report: v1Result.report,
    meta: { ...v1Result.meta, format: 'v2' },
  };
}

/**
 * Parse resume text directly to v2 format (no AI optimization)
 */
export function parseResumeToV2(resumeText) {
  try {
    const parsed = parseResumeUltimate(resumeText);
    const resumeJson = buildResumeJsonFromParsed(parsed);
    return {
      version: 2,
      basics: resumeJson.basics,
      sections: {
        skills: resumeJson.skills,
        experience: resumeJson.experience,
        education: resumeJson.education,
        projects: resumeJson.projects,
        certifications: resumeJson.certifications
      }
    };
  } catch (error) {
    console.error('[parseResumeToV2] Failed:', error.message);
    // Return minimal valid v2 structure
    return {
      version: 2,
      basics: { name: '' },
      sections: {},
    };
  }
}
