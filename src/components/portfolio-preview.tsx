"use client";

import { useState, useRef, type ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Inter } from "next/font/google";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Markdown from "react-markdown";
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
  ChevronDown,
  Award,
  ArrowUpRight,
  Home,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Heart,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/motion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// ── Animation ────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;
const BLUR_FADE_DELAY = 0.04;

function BlurFadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "-5%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Project / avatar gradients ────────────────────────────────────────
const PROJECT_GRADIENTS = [
  "linear-gradient(135deg, oklch(20% 0.08 265), oklch(30% 0.14 290))",
  "linear-gradient(135deg, oklch(18% 0.06 165), oklch(28% 0.10 200))",
  "linear-gradient(135deg, oklch(22% 0.07 15),  oklch(32% 0.11 45))",
  "linear-gradient(135deg, oklch(20% 0.06 220), oklch(28% 0.09 250))",
  "linear-gradient(135deg, oklch(24% 0.08 60),  oklch(28% 0.10 30))",
  "linear-gradient(135deg, oklch(18% 0.03 240), oklch(26% 0.09 270))",
  "linear-gradient(135deg, oklch(19% 0.05 145), oklch(26% 0.08 230))",
  "linear-gradient(135deg, oklch(21% 0.08 295), oklch(28% 0.10 330))",
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, oklch(52% 0.18 265), oklch(65% 0.22 290))",
  "linear-gradient(135deg, oklch(48% 0.15 165), oklch(62% 0.18 200))",
  "linear-gradient(135deg, oklch(54% 0.17 15),  oklch(66% 0.20 45))",
  "linear-gradient(135deg, oklch(50% 0.14 220), oklch(63% 0.18 250))",
  "linear-gradient(135deg, oklch(55% 0.18 60),  oklch(64% 0.20 30))",
  "linear-gradient(135deg, oklch(48% 0.10 240), oklch(61% 0.16 270))",
  "linear-gradient(135deg, oklch(49% 0.13 145), oklch(62% 0.17 230))",
  "linear-gradient(135deg, oklch(52% 0.17 295), oklch(63% 0.19 330))",
];

function nameHash(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function getProjectGradient(name: string): string {
  return PROJECT_GRADIENTS[nameHash(name) % PROJECT_GRADIENTS.length];
}

function getAvatarGradient(name: string): string {
  return AVATAR_GRADIENTS[nameHash(name) % AVATAR_GRADIENTS.length];
}

// ── Helpers ──────────────────────────────────────────────────────────
const formatPeriod = (start?: string, end?: string) => {
  const s = start?.trim();
  const e = end?.trim();
  if (!s && !e) return "";
  if (!e || e.toLowerCase() === "present") return `${s ?? ""} – Present`;
  if (!s) return e;
  return `${s} – ${e}`;
};

const getInitials = (name?: string) =>
  name
    ?.split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") ?? "?";

const getInitial = (name?: string) => name?.trim()[0]?.toUpperCase() ?? "?";

const isClickableUrl = (url?: string) =>
  Boolean(url && /^https?:\/\//i.test(url));

const getSocialIcon = (network: string, size = "size-full") => {
  const n = network.toLowerCase();
  if (n.includes("linkedin")) return <Linkedin className={size} />;
  if (n.includes("github")) return <Github className={size} />;
  return <Globe className={size} />;
};

const getSocialLabel = (network: string, url?: string): string => {
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

// ── Logo circle (rounded-full + ring, per reference) ─────────────────
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
        className="size-8 md:size-10 rounded-full border border-border/40 shadow-sm object-contain flex-none bg-background p-0.5 ring-2 ring-border/30"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="size-8 md:size-10 rounded-full border border-border/40 bg-muted/40 flex-none flex items-center justify-center text-xs font-semibold text-muted-foreground/70 select-none ring-2 ring-border/30">
      {initial}
    </div>
  );
}

// ── Skill chip (reference style) ─────────────────────────────────────
function SkillChip({ label }: { label: string }) {
  return (
    <div className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center text-sm font-medium text-foreground">
      {label}
    </div>
  );
}

// ── Education entry wrapper — <a> if URL, <div> otherwise ─────────────
function EduWrapper({
  url,
  children,
}: {
  url?: string;
  children: ReactNode;
}) {
  if (url && isClickableUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3.5"
      >
        {children}
      </a>
    );
  }
  return <div className="group flex gap-3.5">{children}</div>;
}

// ── Work item ────────────────────────────────────────────────────────
function WorkItem({ job }: { job: ResumeWork }) {
  const [open, setOpen] = useState(false);
  const period = formatPeriod(job.startDate, job.endDate);
  const hasDetails = Boolean(job.highlights?.length);

  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center flex-none pt-0.5">
        <LogoCircle initial={getInitial(job.company)} alt={job.company} />
        {hasDetails && open && (
          <div className="w-px flex-1 bg-border/30 mt-2" />
        )}
      </div>
      <div className="flex-1 min-w-0 pb-0.5">
        <button
          type="button"
          onClick={() => hasDetails && setOpen((p) => !p)}
          className={cn(
            "w-full text-left p-0 group",
            hasDetails ? "cursor-pointer" : "cursor-default"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sm leading-snug">
                {job.company}
              </span>
              <span className="text-sm text-muted-foreground">
                {job.position}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-none">
              {period && (
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {period}
                </span>
              )}
              {hasDetails && (
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground/35 transition-transform duration-200 flex-none",
                    open && "rotate-180"
                  )}
                />
              )}
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && hasDetails && (
            <motion.div
              key="bullets"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="overflow-hidden"
            >
              <motion.ul
                initial={{ y: -6 }}
                animate={{ y: 0 }}
                exit={{ y: -3 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="mt-3 space-y-2"
              >
                {job.highlights!.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span className="text-muted-foreground/25 mt-1 flex-none text-[9px]">▸</span>
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Project card ─────────────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ResumeProject }) {
  const period = formatPeriod(proj.startDate, proj.endDate);
  const gradient = getProjectGradient(proj.name ?? "");
  const bullets = proj.highlights ?? [];

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.18, ease: EASE } }}
      className="group flex flex-col h-full rounded-xl border border-border/50 overflow-hidden bg-card hover:border-border/80 transition-colors duration-200 cursor-default"
    >
      {/* Gradient thumbnail */}
      <div
        className="w-full h-28 shrink-0 relative overflow-hidden"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 flex items-end p-2.5 gap-1.5">
          {proj.liveUrl && (
            <a
              href={proj.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/90 border border-white/10 hover:bg-black/70 transition-colors"
            >
              <Globe className="h-2.5 w-2.5" />
              Live
            </a>
          )}
          {proj.sourceUrl && (
            <a
              href={proj.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/90 border border-white/10 hover:bg-black/70 transition-colors"
            >
              <Github className="h-2.5 w-2.5" />
              Code
            </a>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug">{proj.name}</h3>
          {period && (
            <time className="text-[10px] text-muted-foreground/45 tabular-nums font-mono flex-none mt-0.5 whitespace-nowrap">
              {period}
            </time>
          )}
        </div>

        {proj.role && (
          <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground/60 border border-border/40">
            {proj.role}
          </span>
        )}

        {proj.keywords && proj.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {proj.keywords.map((kw, i) => (
              <span
                key={kw + i}
                className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-7 w-fit px-3 text-xs font-medium flex items-center"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {proj.description && (
          <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-4">
            {proj.description}
          </p>
        )}

        {!proj.description && bullets.length > 0 && (
          <ul className="space-y-1 flex-1">
            {bullets.slice(0, 3).map((h, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span className="text-muted-foreground/25 mt-0.5 flex-none text-[9px]">▸</span>
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {proj.entity && (
          <p className="text-[10px] text-muted-foreground/40 mt-auto pt-1">
            {proj.entity}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Bottom dock navbar ────────────────────────────────────────────────
function PortfolioNavbar({ data }: { data: ResumeData }) {
  const { basics, work, education, skills, projects, volunteer } = data;

  const navItems = [
    { label: "Home", icon: Home, href: "#hero" },
    { label: "About", icon: User, href: "#about" },
    ...(work?.length > 0 ? [{ label: "Work", icon: Briefcase, href: "#work" }] : []),
    ...(education?.length > 0 ? [{ label: "Education", icon: GraduationCap, href: "#education" }] : []),
    ...(skills?.length > 0 ? [{ label: "Skills", icon: Code, href: "#skills" }] : []),
    ...(projects?.length > 0 ? [{ label: "Projects", icon: FolderOpen, href: "#projects" }] : []),
    ...(volunteer?.length > 0 ? [{ label: "Activities", icon: Heart, href: "#volunteering" }] : []),
    { label: "Contact", icon: Mail, href: "#contact" },
  ];

  const socialProfiles = (basics.profiles ?? []).filter((p) => isClickableUrl(p.url));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <Dock className="z-50 pointer-events-auto relative h-14 p-2 w-fit mx-auto flex gap-1.5 border border-border/50 bg-card/90 backdrop-blur-3xl shadow-lg shadow-black/10">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} title={item.label} aria-label={item.label}>
            <DockIcon className="rounded-xl cursor-pointer size-full bg-transparent p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <item.icon className="size-full" />
            </DockIcon>
          </a>
        ))}

        {socialProfiles.length > 0 && (
          <>
            <div className="w-px h-2/3 my-auto bg-border/40 shrink-0" />
            {socialProfiles.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={p.network}
                aria-label={p.network}
              >
                <DockIcon className="rounded-xl cursor-pointer size-full bg-transparent p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                  {getSocialIcon(p.network)}
                </DockIcon>
              </a>
            ))}
          </>
        )}

        <div className="w-px h-2/3 my-auto bg-border/40 shrink-0" />
        <DockIcon className="rounded-xl cursor-pointer size-full bg-transparent p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
          <ModeToggle className="size-full cursor-pointer" />
        </DockIcon>
      </Dock>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────
export interface PortfolioPreviewProps {
  data: ResumeData;
}

export default function PortfolioPreview({ data }: PortfolioPreviewProps) {
  const { basics, work, skills, projects, education, awards, volunteer } = data;
  const firstName = basics.name?.split(" ")[0] ?? basics.name;

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground antialiased relative",
        inter.variable,
        "font-[family-name:var(--font-inter)]"
      )}
    >
      {/* Subtle radial bloom */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 50% 0%, oklch(55% 0.12 260 / 0.07) 0%, transparent 100%)",
        }}
      />

      <PortfolioNavbar data={data} />

      <main className="relative z-10 min-h-dvh flex flex-col max-w-2xl mx-auto px-6 py-16 sm:py-24 pb-28 gap-14">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section id="hero">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">

            {/* Left: name + headline + chips */}
            <div className="flex flex-col gap-2 order-2 md:order-1">
              <BlurFadeIn delay={BLUR_FADE_DELAY}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none">
                  Hi, I&apos;m {firstName}
                </h1>
              </BlurFadeIn>

              {basics.headline && (
                <BlurFadeIn delay={BLUR_FADE_DELAY * 2}>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {basics.headline}
                  </p>
                </BlurFadeIn>
              )}

              {basics.location && (
                <BlurFadeIn delay={BLUR_FADE_DELAY * 3}>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground/55">
                    <MapPin className="h-3 w-3" />
                    {basics.location}
                  </p>
                </BlurFadeIn>
              )}

              {/* Contact chips */}
              <BlurFadeIn delay={BLUR_FADE_DELAY * 4} className="flex flex-wrap items-center gap-2 pt-1">
                {basics.email && (
                  <a
                    href={`mailto:${basics.email}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-full border border-border/40 hover:border-border/70 bg-transparent hover:bg-muted/30"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </a>
                )}
                {basics.phone && (
                  <a
                    href={`tel:${basics.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-full border border-border/40 hover:border-border/70 bg-transparent hover:bg-muted/30"
                  >
                    <Phone className="h-3 w-3" />
                    Phone
                  </a>
                )}
                {(basics.profiles ?? []).map((p, i) =>
                  isClickableUrl(p.url) ? (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-full border border-border/40 hover:border-border/70 bg-transparent hover:bg-muted/30"
                    >
                      {getSocialIcon(p.network, "h-3 w-3")}
                      {getSocialLabel(p.network, p.url)}
                    </a>
                  ) : null
                )}
              </BlurFadeIn>
            </div>

            {/* Right: avatar */}
            <BlurFadeIn delay={BLUR_FADE_DELAY} className="order-1 md:order-2 flex-none">
              <Avatar className="size-24 md:size-32 border rounded-full shadow-lg ring-4 ring-muted">
                <AvatarImage src={basics.photo} alt={basics.name} />
                <AvatarFallback
                  style={{ background: getAvatarGradient(basics.name ?? "?") }}
                  className="text-white"
                >
                  <span className="text-xl md:text-2xl font-bold select-none">
                    {getInitials(basics.name)}
                  </span>
                </AvatarFallback>
              </Avatar>
            </BlurFadeIn>
          </div>
        </section>

        {/* ── About ──────────────────────────────────────────────── */}
        {basics.summary && (
          <section id="about">
            <FadeIn className="flex min-h-0 flex-col gap-y-3">
              <h2 className="text-xl font-bold">About</h2>
              <div className="text-sm text-muted-foreground leading-relaxed max-w-prose [&_strong]:text-foreground [&_a]:underline [&_a]:text-foreground/80">
                <Markdown>{basics.summary}</Markdown>
              </div>
            </FadeIn>
          </section>
        )}

        {/* ── Work Experience ─────────────────────────────────────── */}
        {work && work.length > 0 && (
          <section id="work">
            <div className="flex min-h-0 flex-col gap-y-3">
              <FadeIn>
                <h2 className="text-xl font-bold">Work Experience</h2>
              </FadeIn>
              <motion.div
                variants={STAGGER_CONTAINER}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-5%" }}
                className="flex flex-col gap-5"
              >
                {work.map((job: ResumeWork, idx: number) => (
                  <motion.div key={idx} variants={STAGGER_ITEM}>
                    <WorkItem job={job} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ── Education ───────────────────────────────────────────── */}
        {education && education.length > 0 && (
          <section id="education">
            <div className="flex min-h-0 flex-col gap-y-3">
              <FadeIn>
                <h2 className="text-xl font-bold">Education</h2>
              </FadeIn>
              <div className="flex flex-col gap-4">
                {education.map((edu: ResumeEducation, idx: number) => {
                  const period = formatPeriod(edu.startDate, edu.endDate);
                  const degree = [edu.studyType, edu.area].filter(Boolean).join(" — ");
                  return (
                    <FadeIn key={idx} delay={idx * 0.07}>
                      <EduWrapper url={edu.url}>
                        <LogoCircle
                          initial={getInitial(edu.institution)}
                          alt={edu.institution}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-sm leading-snug">
                                  {edu.institution}
                                </span>
                                {isClickableUrl(edu.url) && (
                                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-none" />
                                )}
                              </div>
                              {degree && (
                                <span className="text-sm text-muted-foreground">
                                  {degree}
                                </span>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {edu.score && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40">
                                    GPA {edu.score}
                                  </span>
                                )}
                                {edu.location && (
                                  <span className="text-[11px] text-muted-foreground/50">
                                    {edu.location}
                                  </span>
                                )}
                              </div>
                              {edu.highlights?.map((h, i) => (
                                <span key={i} className="text-xs text-muted-foreground/60 leading-relaxed">
                                  {h}
                                </span>
                              ))}
                            </div>
                            {period && (
                              <span className="text-xs text-muted-foreground tabular-nums flex-none mt-0.5 whitespace-nowrap">
                                {period}
                              </span>
                            )}
                          </div>
                        </div>
                      </EduWrapper>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Skills ─────────────────────────────────────────────── */}
        {skills && skills.length > 0 && (
          <section id="skills">
            <div className="flex min-h-0 flex-col gap-y-3">
              <FadeIn>
                <h2 className="text-xl font-bold">Skills</h2>
              </FadeIn>
              <div className="flex flex-col gap-4">
                {skills.map((group, idx) => (
                  <FadeIn key={group.name + idx} delay={idx * 0.05}>
                    <div className="flex flex-col gap-2">
                      {group.name && (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
                          {group.name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {group.keywords.filter(Boolean).map((skill, i) => (
                          <SkillChip key={skill + i} label={skill} />
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Projects ────────────────────────────────────────────── */}
        {projects && projects.length > 0 && (
          <section id="projects">
            <div className="flex min-h-0 flex-col gap-y-3">
              <FadeIn>
                <h2 className="text-xl font-bold">Projects</h2>
              </FadeIn>
              <motion.div
                variants={STAGGER_CONTAINER}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-5%" }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr"
              >
                {projects.map((proj: ResumeProject, idx: number) => (
                  <motion.div key={idx} variants={STAGGER_ITEM} className="flex">
                    <ProjectCard proj={proj} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ── Volunteering / Activities ─────────────────────────── */}
        {volunteer && volunteer.length > 0 && (
          <section id="volunteering">
            <div className="flex min-h-0 flex-col gap-y-3">
              <FadeIn>
                <h2 className="text-xl font-bold">Activities</h2>
              </FadeIn>
              <FadeIn delay={0.06}>
                <div className="flex flex-col">
                  {volunteer.map((vol: ResumeVolunteer, idx: number) => {
                    const period = formatPeriod(vol.startDate, vol.endDate);
                    return (
                      <div key={idx} className="flex gap-3.5 pb-6 last:pb-0">
                        <div className="flex flex-col items-center flex-none">
                          <div className="size-9 rounded-full border border-border/40 bg-muted/40 flex items-center justify-center text-xs font-semibold text-muted-foreground/70 select-none flex-none ring-2 ring-border/20">
                            {getInitial(vol.organization)}
                          </div>
                          {idx < volunteer.length - 1 && (
                            <div className="w-px flex-1 bg-border/25 mt-2 min-h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          {period && (
                            <time className="text-xs text-muted-foreground/45 tabular-nums">
                              {period}
                            </time>
                          )}
                          <p className="font-semibold text-sm leading-snug mt-0.5">
                            {vol.organization}
                          </p>
                          {vol.position && (
                            <p className="text-sm text-muted-foreground">{vol.position}</p>
                          )}
                          {vol.summary && (
                            <p className="text-sm text-muted-foreground/65 leading-relaxed mt-1.5">
                              {vol.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* ── Awards ──────────────────────────────────────────────── */}
        {awards && awards.length > 0 && (
          <section id="achievements">
            <div className="flex min-h-0 flex-col gap-y-3">
              <FadeIn>
                <h2 className="text-xl font-bold">Recognition</h2>
              </FadeIn>
              <FadeIn delay={0.06}>
                <div className="flex flex-col">
                  {awards.map((award, idx) => (
                    <div key={idx} className="flex gap-3.5 pb-5 last:pb-0">
                      <div className="flex flex-col items-center flex-none">
                        <div className="size-9 rounded-full border border-border/40 bg-muted/40 flex items-center justify-center flex-none ring-2 ring-border/20">
                          <Award className="h-3.5 w-3.5 text-muted-foreground/50" />
                        </div>
                        {idx < awards.length - 1 && (
                          <div className="w-px flex-1 bg-border/25 mt-2 min-h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-semibold text-sm leading-snug">{award.title}</p>
                        {award.awarder && (
                          <p className="text-xs text-muted-foreground/55 mt-0.5">{award.awarder}</p>
                        )}
                        {award.date && (
                          <time className="text-xs tabular-nums text-muted-foreground/40">
                            {award.date}
                          </time>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* ── Extra sections ───────────────────────────────────────── */}
        {data.extraSections?.map((section, idx) => (
          <section key={`extra-${idx}`} id={`extra-${idx}`}>
            <FadeIn className="flex min-h-0 flex-col gap-y-3">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, i) => (
                  <SkillChip key={i} label={item} />
                ))}
              </div>
            </FadeIn>
          </section>
        ))}

        {/* ── Contact ─────────────────────────────────────────────── */}
        {(basics.email ||
          basics.phone ||
          (basics.profiles?.length ?? 0) > 0) && (
          <section id="contact">
            <FadeIn className="flex min-h-0 flex-col gap-y-3">
              <h2 className="text-xl font-bold">Contact</h2>
              <div className="flex flex-col gap-5">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Let&apos;s work together.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {basics.email && (
                    <a
                      href={`mailto:${basics.email}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-opacity hover:opacity-85"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {basics.email}
                    </a>
                  )}
                  {basics.phone && (
                    <a
                      href={`tel:${basics.phone}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {basics.phone}
                    </a>
                  )}
                  {(basics.profiles ?? [])
                    .filter((p) => isClickableUrl(p.url))
                    .map((p, i) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                      >
                        {getSocialIcon(p.network, "h-3.5 w-3.5")}
                        {getSocialLabel(p.network, p.url)}
                      </a>
                    ))}
                </div>
              </div>
            </FadeIn>
          </section>
        )}
      </main>
    </div>
  );
}
