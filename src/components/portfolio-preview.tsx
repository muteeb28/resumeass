"use client";

import { useState } from "react";
import type {
  ResumeData,
  ResumeWork,
  ResumeEducation,
  ResumeProject,
  ResumeVolunteer,
} from "@/types/portfolioly-resume";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────
const getSocialIcon = (network: string) => {
  const n = network.toLowerCase();
  if (n.includes("linkedin")) return <Linkedin className="h-3.5 w-3.5" />;
  if (n.includes("github")) return <Github className="h-3.5 w-3.5" />;
  return <Globe className="h-3.5 w-3.5" />;
};

const getSocialLabel = (network: string, url?: string) => {
  const n = network.toLowerCase();
  if (n.includes("linkedin")) return "LinkedIn";
  if (n.includes("github")) return "GitHub";
  if (url) {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      /* */
    }
  }
  return network;
};

const isClickableWebUrl = (url?: string) =>
  Boolean(url && /^https?:\/\//i.test(url));

const formatPeriod = (start?: string, end?: string) => {
  const s = start?.trim();
  const e = end?.trim();
  if (!s && !e) return "";
  if (!e || e.toLowerCase() === "present") return `${s ?? ""} - Present`;
  if (!s) return e;
  return `${s} - ${e}`;
};

const getInitial = (name?: string) => name?.trim()[0]?.toUpperCase() ?? "?";

// ─── Section pill-line header (like MagicUI Projects / Hackathons) ──
function SectionPillHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center w-full">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="border bg-primary z-10 rounded-xl px-4 py-1 mx-2">
          <span className="text-primary-foreground text-sm font-medium">
            {label}
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>
      <div className="flex flex-col gap-y-2 items-center text-center">
        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg text-balance">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Logo circle ────────────────────────────────────────────────────
function LogoCircle({ initial, src, alt }: { initial: string; src?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt ?? initial}
        className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border overflow-hidden object-contain flex-none bg-background"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border bg-muted flex-none flex items-center justify-center text-xs font-bold text-muted-foreground select-none">
      {initial}
    </div>
  );
}

// ─── Work accordion item ─────────────────────────────────────────────
function WorkItem({ job }: { job: ResumeWork }) {
  const [open, setOpen] = useState(false);
  const period = formatPeriod(job.startDate, job.endDate);
  const hasDetails = Boolean(job.highlights?.length);

  return (
    <div className="border-b-0 grid gap-2 w-full">
      {/* Trigger row */}
      <button
        type="button"
        onClick={() => hasDetails && setOpen((p) => !p)}
        className={cn(
          "hover:no-underline p-0 transition-colors rounded-none group text-left w-full",
          hasDetails ? "cursor-pointer" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-x-3 justify-between w-full">
          <div className="flex items-center gap-x-3 flex-1 min-w-0">
            <LogoCircle initial={getInitial(job.company)} alt={job.company} />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="font-semibold leading-none flex items-center gap-1">
                {job.company}
                {hasDetails && (
                  <span className="relative inline-flex items-center w-3.5 h-3.5 ml-1">
                    <ChevronRight
                      className={cn(
                        "absolute h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2 transition-all duration-300 ease-out",
                        "translate-x-0 opacity-0",
                        "group-hover:translate-x-1 group-hover:opacity-100",
                        open && "opacity-0 translate-x-0"
                      )}
                    />
                    <ChevronDown
                      className={cn(
                        "absolute h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2 transition-all duration-200",
                        "opacity-0 rotate-0",
                        open && "opacity-100 rotate-180"
                      )}
                    />
                  </span>
                )}
              </div>
              <div className="font-sans text-sm text-muted-foreground">
                {job.position}
              </div>
            </div>
          </div>
          {period && (
            <div className="text-xs tabular-nums text-muted-foreground text-right flex-none">
              {period}
            </div>
          )}
        </div>
      </button>

      {/* Expandable description */}
      {open && hasDetails && (
        <div className="ml-11 text-xs sm:text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          <ul className="space-y-1.5 leading-relaxed">
            {job.highlights!.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground/40 mt-0.5 flex-none">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Skill badge ─────────────────────────────────────────────────────
function SkillBadge({ skill }: { skill: string }) {
  return (
    <div className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center gap-2 shadow-sm">
      <span className="text-foreground text-sm font-medium">{skill}</span>
    </div>
  );
}

// ─── Skills grid (handles flat names AND description-style extractions) ──
function SkillsGrid({ skills }: { skills: { name: string; keywords: string[] }[] }) {
  // Detect if keywords are descriptions (long text) vs actual skill names.
  // When Mistral extracts "Skill: Description" format, it puts description in keywords.
  // In that case, we show group.name as the badge instead.
  const keywordsAreDescriptions = skills.some((g) =>
    g.keywords.some((k) => k.split(" ").length > 4 || k.length > 35)
  );

  if (keywordsAreDescriptions) {
    // Show group names as flat badges (matches MagicUI skills exactly)
    return (
      <div className="flex flex-wrap gap-2">
        {skills.filter((g) => g.name).map((group, i) => (
          <SkillBadge key={i} skill={group.name} />
        ))}
      </div>
    );
  }

  // Keywords are real skill names. If multiple categories, show with labels.
  if (skills.length > 1 && skills.every((g) => g.name && g.name.toLowerCase() !== "skills")) {
    return (
      <div className="space-y-3">
        {skills.map((group, gi) => (
          <div key={gi}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.keywords.filter(Boolean).map((skill, si) => (
                <SkillBadge key={si} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Flat single-category list
  const all = skills.flatMap((g) => g.keywords).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((skill, i) => (
        <SkillBadge key={i} skill={skill} />
      ))}
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ResumeProject }) {
  const period = formatPeriod(proj.startDate, proj.endDate);
  const url = proj.liveUrl || proj.sourceUrl;

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden hover:ring-2 hover:ring-muted transition-all duration-200 bg-background">
      {/* Image / placeholder area */}
      <div className="relative shrink-0 w-full h-40 bg-muted flex items-center justify-center">
        <span className="text-2xl font-bold text-muted-foreground/30 select-none">
          {proj.name?.[0]?.toUpperCase()}
        </span>
        {/* Overlay link buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          {proj.liveUrl && (
            <a
              href={proj.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] bg-foreground text-background px-2 py-1 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
          {proj.sourceUrl && (
            <a
              href={proj.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] bg-foreground text-background px-2 py-1 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              <Github className="h-3 w-3" />
              Source
            </a>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <h3 className="font-semibold leading-none text-sm">{proj.name}</h3>
            {period && (
              <time className="text-xs text-muted-foreground tabular-nums">
                {period}
              </time>
            )}
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors rounded-sm"
              aria-label={`Open ${proj.name}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {proj.description && (
          <p className="text-xs flex-1 leading-relaxed text-muted-foreground text-pretty">
            {proj.description}
          </p>
        )}

        {proj.highlights && proj.highlights.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1 flex-1">
            {proj.highlights.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground/40 mt-0.5 flex-none">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tech tags at bottom */}
        {proj.role && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            <span className="inline-flex items-center border border-border rounded-md h-6 px-2 text-[11px] font-medium text-muted-foreground">
              {proj.role}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Volunteer / Hackathon timeline ───────────────────────────────────
function VolunteerTimeline({ items }: { items: ResumeVolunteer[] }) {
  return (
    <div className="relative flex flex-col">
      {items.map((vol, idx) => {
        const period = formatPeriod(vol.startDate, vol.endDate);
        return (
          <div key={idx} className="relative flex items-start gap-4 pb-8 last:pb-0">
            {/* Vertical connector line */}
            <div className="flex flex-col items-center flex-none">
              <div className="size-10 z-10 rounded-full border shadow ring-2 ring-border bg-background flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0 select-none">
                {getInitial(vol.organization)}
              </div>
              {idx < items.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1 min-h-6" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-none text-sm">
                    {vol.organization}
                  </h3>
                  {vol.position && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {vol.position}
                    </p>
                  )}
                </div>
                {period && (
                  <time className="flex-none text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                    {period}
                  </time>
                )}
              </div>
              {vol.highlights && vol.highlights.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground leading-relaxed">
                  {vol.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground/40 mt-0.5 flex-none">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────
export interface PortfolioPreviewProps {
  data: ResumeData;
}

export default function PortfolioPreview({ data }: PortfolioPreviewProps) {
  const { basics, work, skills, projects, education, awards, volunteer } = data;
  const firstName = basics.name?.split(/\s+/)[0] ?? "there";

  return (
    <main className="min-h-dvh flex flex-col gap-14 bg-background text-foreground font-sans antialiased max-w-2xl mx-auto px-6 py-12 sm:py-24">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section id="hero">
        <div className="gap-2 gap-y-6 flex flex-col md:flex-row justify-between">
          <div className="gap-2 flex flex-col order-2 md:order-1">
            <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl">
              Hi, I&apos;m {firstName} 👋
            </h1>
            {basics.headline && (
              <p className="text-muted-foreground max-w-[600px] md:text-lg lg:text-xl leading-relaxed">
                {basics.headline}
              </p>
            )}
            {basics.location && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-none" />
                {basics.location}
              </p>
            )}
            {/* Contact pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {basics.email && (
                <a
                  href={`mailto:${basics.email}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              )}
              {basics.phone && (
                <a
                  href={`tel:${basics.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </a>
              )}
              {(basics.profiles ?? []).map((p, i) =>
                isClickableWebUrl(p.url) ? (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {getSocialIcon(p.network)}
                    {getSocialLabel(p.network, p.url)}
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="order-1 md:order-2 flex-none">
            {basics.photo ? (
              <img
                src={basics.photo}
                alt={basics.name}
                className="size-24 md:size-32 border rounded-full shadow-lg ring-4 ring-muted object-cover"
              />
            ) : (
              <div className="size-24 md:size-32 border rounded-full shadow-lg ring-4 ring-muted bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground select-none">
                {basics.name
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join("") ?? "?"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      {basics.summary && (
        <section id="about">
          <div className="flex min-h-0 flex-col gap-y-4">
            <h2 className="text-xl font-bold">About</h2>
            <p className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground">
              {basics.summary}
            </p>
          </div>
        </section>
      )}

      {/* ── Work Experience ───────────────────────────────────────── */}
      {work && work.length > 0 && (
        <section id="work">
          <div className="flex min-h-0 flex-col gap-y-6">
            <h2 className="text-xl font-bold">Work Experience</h2>
            <div className="w-full grid gap-6">
              {work.map((job: ResumeWork, idx: number) => (
                <WorkItem key={`work-${idx}`} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Education ─────────────────────────────────────────────── */}
      {education && education.length > 0 && (
        <section id="education">
          <div className="flex min-h-0 flex-col gap-y-6">
            <h2 className="text-xl font-bold">Education</h2>
            <div className="flex flex-col gap-6">
              {education.map((edu: ResumeEducation, idx: number) => {
                const period = formatPeriod(edu.startDate, edu.endDate);
                const degree = [edu.studyType, edu.area]
                  .filter(Boolean)
                  .join(" — ");
                return (
                  <div
                    key={`edu-${idx}`}
                    className="flex items-center gap-x-3 justify-between"
                  >
                    <div className="flex items-center gap-x-3 flex-1 min-w-0">
                      <LogoCircle
                        initial={getInitial(edu.institution)}
                        alt={edu.institution}
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="font-semibold leading-none flex items-center gap-2">
                          {edu.institution}
                        </div>
                        {degree && (
                          <div className="font-sans text-sm text-muted-foreground">
                            {degree}
                          </div>
                        )}
                        {(edu.score || edu.location) && (
                          <div className="text-xs text-muted-foreground">
                            {[
                              edu.score ? `GPA: ${edu.score}` : "",
                              edu.location ?? "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                    {period && (
                      <div className="text-xs tabular-nums text-muted-foreground text-right flex-none">
                        {period}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Skills ────────────────────────────────────────────────── */}
      {skills && skills.length > 0 && (
        <section id="skills">
          <div className="flex min-h-0 flex-col gap-y-4">
            <h2 className="text-xl font-bold">Skills</h2>
            <SkillsGrid skills={skills} />
          </div>
        </section>
      )}

      {/* ── Projects ──────────────────────────────────────────────── */}
      {projects && projects.length > 0 && (
        <section id="projects">
          <div className="flex min-h-0 flex-col gap-y-8">
            <SectionPillHeader
              label="My Projects"
              title="Check out my latest work"
              description="Here are a few projects I've worked on."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto auto-rows-fr w-full">
              {projects.map((proj, idx) => (
                <div key={`proj-${idx}`} className="h-full">
                  <ProjectCard proj={proj} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Volunteering / Hackathons timeline ────────────────────── */}
      {volunteer && volunteer.length > 0 && (
        <section id="volunteering">
          <div className="flex min-h-0 flex-col gap-y-8">
            <SectionPillHeader
              label="Volunteering"
              title="Giving back to the community"
            />
            <VolunteerTimeline items={volunteer} />
          </div>
        </section>
      )}

      {/* ── Achievements / Awards ─────────────────────────────────── */}
      {awards && awards.length > 0 && (
        <section id="achievements">
          <div className="flex min-h-0 flex-col gap-y-6">
            <h2 className="text-xl font-bold">Achievements</h2>
            <div className="relative flex flex-col">
              {awards.map((award, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center flex-none">
                    <div className="size-10 z-10 rounded-full border shadow ring-2 ring-border bg-background flex items-center justify-center shrink-0">
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {idx < awards.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1 min-h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-semibold text-sm leading-none">{award.title}</p>
                    {award.awarder && (
                      <p className="text-xs text-muted-foreground mt-0.5">{award.awarder}</p>
                    )}
                    {award.date && (
                      <time className="text-xs tabular-nums text-muted-foreground">{award.date}</time>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Extra Sections ────────────────────────────────────────── */}
      {data.extraSections &&
        data.extraSections.length > 0 &&
        data.extraSections.map((section, idx) => (
          <section key={`extra-${idx}`} id={`extra-${idx}`}>
            <div className="flex min-h-0 flex-col gap-y-4">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, i) => (
                  <SkillBadge key={i} skill={item} />
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ── Contact ───────────────────────────────────────────────── */}
      {(basics.email || basics.phone || (basics.profiles?.length ?? 0) > 0) && (
        <section id="contact">
          <div className="grid items-center justify-center gap-4 px-4 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Feel free to reach out.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {basics.email && (
                <a
                  href={`mailto:${basics.email}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background shadow-sm transition-colors hover:opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Say Hello
                </a>
              )}
              {(basics.profiles ?? [])
                .filter((p) => isClickableWebUrl(p.url))
                .map((p, i) => (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    {getSocialIcon(p.network)}
                    {getSocialLabel(p.network, p.url)}
                  </a>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="text-center text-[11px] text-muted-foreground pb-2">
        Built with{" "}
        <a
          href="/"
          className="font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          ResumeAssistAI
        </a>
      </footer>
    </main>
  );
}
