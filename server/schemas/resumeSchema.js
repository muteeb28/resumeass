import { z } from 'zod';

const basicsSchema = z.object({
  name: z.string().default(''),
  title: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  summary: z.string().default(''),
  links: z.array(z.string()).default([]),
}).strict();

const experienceSchema = z.object({
  company: z.string().default(''),
  role: z.string().default(''),
  location: z.string().default(''),
  dates: z.string().default(''),
  bullets: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
}).strict();

const educationSchema = z.object({
  school: z.string().default(''),
  degree: z.string().default(''),
  location: z.string().default(''),
  dates: z.string().default(''),
  details: z.array(z.string()).default([]),
}).strict();

const projectSchema = z.object({
  name: z.string().default(''),
  description: z.string().default(''),
  bullets: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  link: z.string().default(''),
  role: z.string().default(''),
  dates: z.string().default(''),
  location: z.string().default(''),
}).strict();

const skillCategorySchema = z.object({
  name: z.string().default(''),
  items: z.array(z.string()).default([]),
}).strict();

const certificationSchema = z.object({
  name: z.string().default(''),
  issuer: z.string().default(''),
  date: z.string().default(''),
}).strict();

const volunteerSchema = z.object({
  organization: z.string().default(''),
  role: z.string().default(''),
  location: z.string().default(''),
  dates: z.string().default(''),
  bullets: z.array(z.string()).default([]),
}).strict();

const extraSectionSchema = z.object({
  title: z.string().default(''),
  items: z.array(z.string()).default([]),
}).strict();

const resumeJsonSchema = z.object({
  basics: basicsSchema.default({}),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  volunteer: z.array(volunteerSchema).default([]),
  achievements: z.array(z.string()).default([]),
  coursework: z.array(z.string()).default([]),
  extraSections: z.array(extraSectionSchema).default([]),
}).strict();

/**
 * Validate and coerce data into a clean ResumeJSON shape.
 * @param {object} data - Raw resume data
 * @returns {{ success: boolean, data?: object, error?: import('zod').ZodError }}
 */
export function validateResumeJson(data) {
  const result = resumeJsonSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, data: resumeJsonSchema.parse({}), error: result.error };
}

export { resumeJsonSchema };
