"use client";

import { useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Badge } from "@/components/ui/badge";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { ModeToggle } from "@/components/mode-toggle";
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
  Home,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Heart,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BLUR_FADE_DELAY = 0.04;

// ─── Helpers ────────────────────────────────────────────────────────
const getSocialIcon = (network: string) => {
  const n = network.toLowerCase();
  if (n.includes("linkedin")) return <Linkedin className="size-full" />;
  if (n.includes("github")) return <Github className="size-full" />;
  return <Globe className="size-full" />;
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

// ─── Logo circle ────────────────────────────────────────────────────
function LogoCircle({
  initial,
  src,
  alt,
}: {
  initial: string;
  src?: string;
  alt?: string;
}) {
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
          <span className="text-background text-sm font-medium">
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

// ─── Work accordion item ─────────────────────────────────────────────
function WorkItem({ job }: { job: ResumeWork }) {
  const [open, setOpen] = useState(false);
  const period = formatPeriod(job.startDate, job.endDate);
  const hasDetails = Boolean(job.highlights?.length);

  return (
    <div className="grid gap-2 w-full">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((p) => !p)}
        className={cn(
          "p-0 transition-colors rounded-none group text-left w-full",
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

      {open && hasDetails && (
        <div className="ml-11 text-xs sm:text-sm text-muted-foreground">
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


// ─── Project card ────────────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ResumeProject }) {
  const period = formatPeriod(proj.startDate, proj.endDate);
  const url = proj.liveUrl || proj.sourceUrl;

  // Collect tag-like strings: role split by comma, plus any single-word highlights
  const tags = [
    ...(proj.role ? proj.role.split(/[,/]/).map((s) => s.trim()).filter(Boolean) : []),
  ];

  // Remaining highlights shown as bullet points
  const bullets = proj.highlights ?? [];

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden hover:ring-2 cursor-pointer hover:ring-muted transition-all duration-200">
      {/* ── Image / preview area ── */}
      <div className="relative shrink-0">
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <span className="text-3xl font-bold text-muted-foreground/20 select-none">
            {proj.name?.[0]?.toUpperCase()}
          </span>
        </div>
        {/* Link badges — match reference: black pill badges */}
        <div className="absolute top-2 right-2 flex flex-wrap gap-2">
          {proj.liveUrl && (
            <a
              href={proj.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge className="flex items-center gap-1.5 text-xs bg-black text-white hover:bg-black/90 rounded-full px-2.5 py-0.5 border-transparent">
                <Globe className="h-3 w-3" aria-hidden />
                Website
              </Badge>
            </a>
          )}
          {proj.sourceUrl && (
            <a
              href={proj.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge className="flex items-center gap-1.5 text-xs bg-black text-white hover:bg-black/90 rounded-full px-2.5 py-0.5 border-transparent">
                <Github className="h-3 w-3" aria-hidden />
                Source
              </Badge>
            </a>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">{proj.name}</h3>
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
              className="text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Open ${proj.name}`}
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>

        {proj.description && (
          <div className="text-xs flex-1 prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
            {proj.description}
          </div>
        )}

        {bullets.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1 flex-1">
            {bullets.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground/40 mt-0.5 flex-none">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tag badges at bottom — matches reference layout */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[11px] font-medium border border-border h-6 w-fit px-2 rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Volunteer / Hackathon timeline ──────────────────────────────────
function VolunteerTimeline({ items }: { items: ResumeVolunteer[] }) {
  return (
    <div className="relative flex flex-col gap-0">
      {items.map((vol, idx) => {
        const period = formatPeriod(vol.startDate, vol.endDate);
        return (
          <div
            key={idx}
            className="w-full flex items-start justify-between gap-10 pb-8 last:pb-0"
          >
            {/* Left: logo + connector line */}
            <div className="flex flex-col items-center flex-none">
              <div className="size-10 bg-card z-10 shrink-0 overflow-hidden p-1 border rounded-full shadow ring-2 ring-border bg-background flex items-center justify-center text-sm font-bold text-muted-foreground select-none">
                {getInitial(vol.organization)}
              </div>
              {idx < items.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1 min-h-6" />
              )}
            </div>

            {/* Right: content */}
            <div className="flex flex-1 flex-col justify-start gap-1 min-w-0">
              {period && (
                <time className="text-xs text-muted-foreground tabular-nums">{period}</time>
              )}
              <h3 className="font-semibold leading-none text-sm">
                {vol.organization}
              </h3>
              {vol.position && (
                <p className="text-sm text-muted-foreground">{vol.position}</p>
              )}
              {vol.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{vol.summary}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Bottom Dock Navbar ──────────────────────────────────────────────
function PortfolioNavbar({ data }: { data: ResumeData }) {
  const { basics, work, education, skills, projects, volunteer } = data;

  const navItems = [
    { label: "Home", icon: Home, href: "#hero" },
    { label: "About", icon: User, href: "#about" },
    ...(work?.length > 0
      ? [{ label: "Work", icon: Briefcase, href: "#work" }]
      : []),
    ...(education?.length > 0
      ? [{ label: "Education", icon: GraduationCap, href: "#education" }]
      : []),
    ...(skills?.length > 0
      ? [{ label: "Skills", icon: Code, href: "#skills" }]
      : []),
    ...(projects?.length > 0
      ? [{ label: "Projects", icon: FolderOpen, href: "#projects" }]
      : []),
    ...(volunteer?.length > 0
      ? [{ label: "Volunteering", icon: Heart, href: "#volunteering" }]
      : []),
    { label: "Contact", icon: Mail, href: "#contact" },
  ];

  const socialProfiles = (basics.profiles ?? []).filter((p) =>
    isClickableWebUrl(p.url)
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <Dock className="z-50 pointer-events-auto relative h-14 p-2 w-fit mx-auto flex gap-2 border bg-card/90 backdrop-blur-3xl shadow-[0_0_10px_3px] shadow-primary/5">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} title={item.label} aria-label={item.label}>
            <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
              <item.icon className="size-full" />
            </DockIcon>
          </a>
        ))}

        {socialProfiles.length > 0 && (
          <>
            <div className="w-px h-2/3 my-auto bg-border shrink-0" />
            {socialProfiles.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={p.network}
                aria-label={p.network}
              >
                <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
                  {getSocialIcon(p.network)}
                </DockIcon>
              </a>
            ))}
          </>
        )}

        <div className="w-px h-2/3 my-auto bg-border shrink-0" />
        <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
          <ModeToggle className="size-full cursor-pointer" />
        </DockIcon>
      </Dock>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────
export interface PortfolioPreviewProps {
  data: ResumeData;
}

export default function PortfolioPreview({ data }: PortfolioPreviewProps) {
  const { basics, work, skills, projects, education, awards, volunteer } = data;
  const firstName = basics.name?.split(/\s+/)[0] ?? "there";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      {/* FlickeringGrid background at the top */}
      <div className="absolute inset-x-0 top-0 h-[200px] overflow-hidden z-0 pointer-events-none">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          maxOpacity={0.15}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>

      <PortfolioNavbar data={data} />

      <main className="relative z-10 min-h-dvh flex flex-col gap-14 max-w-2xl mx-auto px-6 py-12 sm:py-24 pb-24">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section id="hero">
          <div className="mx-auto w-full max-w-2xl space-y-8">
            <div className="gap-2 gap-y-6 flex flex-col md:flex-row justify-between">
              <div className="gap-2 flex flex-col order-2 md:order-1">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl"
                  yOffset={8}
                  text={`Hi, I'm ${firstName} 👋`}
                />
                {basics.headline && (
                  <BlurFadeText
                    className="text-muted-foreground max-w-[600px] md:text-lg lg:text-xl leading-relaxed"
                    delay={BLUR_FADE_DELAY * 2}
                    text={basics.headline}
                  />
                )}
                {basics.location && (
                  <BlurFade delay={BLUR_FADE_DELAY * 2}>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-none" />
                      {basics.location}
                    </p>
                  </BlurFade>
                )}
                <BlurFade delay={BLUR_FADE_DELAY * 3}>
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
                </BlurFade>
              </div>

              {/* Avatar */}
              <BlurFade delay={BLUR_FADE_DELAY} className="order-1 md:order-2 flex-none">
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
              </BlurFade>
            </div>
          </div>
        </section>

        {/* ── About ─────────────────────────────────────────────── */}
        {basics.summary && (
          <section id="about">
            <div className="flex min-h-0 flex-col gap-y-4">
              <BlurFade delay={BLUR_FADE_DELAY * 3}>
                <h2 className="text-xl font-bold">About</h2>
              </BlurFade>
              <BlurFade delay={BLUR_FADE_DELAY * 4}>
                <p className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
                  {basics.summary}
                </p>
              </BlurFade>
            </div>
          </section>
        )}

        {/* ── Work Experience ───────────────────────────────────── */}
        {work && work.length > 0 && (
          <section id="work">
            <div className="flex min-h-0 flex-col gap-y-6">
              <BlurFade delay={BLUR_FADE_DELAY * 5}>
                <h2 className="text-xl font-bold">Work Experience</h2>
              </BlurFade>
              <div className="w-full grid gap-6">
                {work.map((job: ResumeWork, idx: number) => (
                  <BlurFade key={idx} delay={BLUR_FADE_DELAY * 6 + idx * 0.05}>
                    <WorkItem job={job} />
                  </BlurFade>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Education ─────────────────────────────────────────── */}
        {education && education.length > 0 && (
          <section id="education">
            <div className="flex min-h-0 flex-col gap-y-6">
              <BlurFade delay={BLUR_FADE_DELAY * 7}>
                <h2 className="text-xl font-bold">Education</h2>
              </BlurFade>
              <div className="flex flex-col gap-6">
                {education.map((edu: ResumeEducation, idx: number) => {
                  const period = formatPeriod(edu.startDate, edu.endDate);
                  const degree = [edu.studyType, edu.area]
                    .filter(Boolean)
                    .join(" — ");
                  return (
                    <BlurFade
                      key={idx}
                      delay={BLUR_FADE_DELAY * 8 + idx * 0.05}
                    >
                      <div className="flex items-center gap-x-3 justify-between">
                        <div className="flex items-center gap-x-3 flex-1 min-w-0">
                          <LogoCircle
                            initial={getInitial(edu.institution)}
                            alt={edu.institution}
                          />
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            <div className="font-semibold leading-none">
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
                    </BlurFade>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Skills ────────────────────────────────────────────── */}
        {skills && skills.length > 0 && (
          <section id="skills">
            <div className="flex min-h-0 flex-col gap-y-4">
              <BlurFade delay={BLUR_FADE_DELAY * 9}>
                <h2 className="text-xl font-bold">Skills</h2>
              </BlurFade>
              <div className="flex flex-wrap gap-2">
                {skills
                  .flatMap((g) => g.keywords)
                  .filter(Boolean)
                  .map((skill, idx) => (
                    <BlurFade key={skill + idx} delay={BLUR_FADE_DELAY * 10 + idx * 0.05}>
                      <div className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center gap-2 shadow-sm">
                        <span className="text-foreground text-sm font-medium">{skill}</span>
                      </div>
                    </BlurFade>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Projects ──────────────────────────────────────────── */}
        {projects && projects.length > 0 && (
          <section id="projects">
            <div className="flex min-h-0 flex-col gap-y-8">
              <BlurFade delay={BLUR_FADE_DELAY * 11}>
                <SectionPillHeader
                  label="My Projects"
                  title="Check out my latest work"
                  description="Here are a few projects I've worked on recently."
                />
              </BlurFade>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto auto-rows-fr w-full">
                {projects.map((proj, idx) => (
                  <BlurFade key={idx} delay={BLUR_FADE_DELAY * 12 + idx * 0.05}>
                    <ProjectCard proj={proj} />
                  </BlurFade>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Volunteering / Hackathons timeline ────────────────── */}
        {volunteer && volunteer.length > 0 && (
          <section id="volunteering" className="overflow-hidden">
            <div className="flex min-h-0 flex-col gap-y-8 w-full">
              <BlurFade delay={BLUR_FADE_DELAY * 13}>
                <SectionPillHeader
                  label="Hackathons"
                  title="I like building things"
                  description={`During my time I attended ${volunteer.length}+ events and competitions.`}
                />
              </BlurFade>
              <BlurFade delay={BLUR_FADE_DELAY * 14}>
                <VolunteerTimeline items={volunteer} />
              </BlurFade>
            </div>
          </section>
        )}

        {/* ── Achievements / Awards ─────────────────────────────── */}
        {awards && awards.length > 0 && (
          <section id="achievements">
            <div className="flex min-h-0 flex-col gap-y-6">
              <BlurFade delay={BLUR_FADE_DELAY * 14}>
                <h2 className="text-xl font-bold">Achievements</h2>
              </BlurFade>
              <BlurFade delay={BLUR_FADE_DELAY * 15}>
                <div className="relative flex flex-col">
                  {awards.map((award, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-start gap-4 pb-6 last:pb-0"
                    >
                      <div className="flex flex-col items-center flex-none">
                        <div className="size-10 z-10 rounded-full border shadow ring-2 ring-border bg-background flex items-center justify-center shrink-0">
                          <Award className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {idx < awards.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1 min-h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-semibold text-sm leading-none">
                          {award.title}
                        </p>
                        {award.awarder && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {award.awarder}
                          </p>
                        )}
                        {award.date && (
                          <time className="text-xs tabular-nums text-muted-foreground">
                            {award.date}
                          </time>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </BlurFade>
            </div>
          </section>
        )}

        {/* ── Extra Sections ────────────────────────────────────── */}
        {data.extraSections &&
          data.extraSections.length > 0 &&
          data.extraSections.map((section, idx) => (
            <BlurFade key={`extra-${idx}`} delay={BLUR_FADE_DELAY * 15 + idx * 0.05}>
              <section id={`extra-${idx}`}>
                <div className="flex min-h-0 flex-col gap-y-4">
                  <h2 className="text-xl font-bold">{section.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item, i) => (
                      <div key={i} className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center gap-2 shadow-sm">
                        <span className="text-foreground text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </BlurFade>
          ))}

        {/* ── Contact ───────────────────────────────────────────── */}
        {(basics.email ||
          basics.phone ||
          (basics.profiles?.length ?? 0) > 0) && (
          <section id="contact">
            <BlurFade delay={BLUR_FADE_DELAY * 16}>
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
            </BlurFade>
          </section>
        )}

        {/* ── Footer ────────────────────────────────────────────── */}
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
    </div>
  );
}
