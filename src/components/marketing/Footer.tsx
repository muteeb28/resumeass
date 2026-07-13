import Link from "next/link";
import { Container } from "./primitives";

type FooterLink = { label: string; href?: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Resume Builder", href: "/create" },
      { label: "Job Discovery", href: "/find-jobs" },
      { label: "Referrals", href: "/referrals" },
      { label: "Interview Prep", href: "/interview-questions" },
      { label: "Career Tracker", href: "/job-tracker" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Courses", href: "https://jobflix.in/courses", external: true },
      { label: "Coding Practice" },
      { label: "Guides" },
      { label: "Blog", href: "/blog/feed" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "About" }, { label: "Careers" }, { label: "Press" }, { label: "Contact", href: "/contact-us" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms-of-service" },
      { label: "Security" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (!link.href) {
    return <span className="text-sm text-dark-faint">{link.label}</span>;
  }
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-dark-link transition-colors duration-150 hover:text-white"
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className="text-sm text-dark-link transition-colors duration-150 hover:text-white">
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-900 pt-[var(--jf-space-section-tight)] pb-[var(--jf-gap-footer)]">
      <Container width="wide">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="text-xl font-semibold tracking-[-0.02em] text-white">JobFlix.</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-dark-body">
              The AI Career Operating System. Resume to referral, one place.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.09em] text-dark-muted">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-dark-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} JobFlix, Inc. All rights reserved.</span>
          <span>Privacy · Terms · Security</span>
        </div>
      </Container>
    </footer>
  );
}
