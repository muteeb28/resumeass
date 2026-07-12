export type HeroClusterCardRow = {
  letter: string;
  title: string;
  meta: string;
};

export type HeroClusterCardData = {
  /** Numbered narrative badge, e.g. "1. Grow" — ties the 3 cards into one story. */
  step: string;
  title: string;
  /** Existing nav destination this card previews — no new routes. */
  href: string;
  footer: string;
  rows: HeroClusterCardRow[];
};

export const HERO_CLUSTER_CARDS: HeroClusterCardData[] = [
  {
    step: "1. Grow",
    title: "Mentorship & referrals",
    href: "/referrals",
    footer: "500+ referrals made",
    rows: [
      { letter: "CV", title: "Resume Reviews", meta: "Expert feedback" },
      { letter: "MI", title: "Mock Interviews", meta: "Practice rounds" },
      { letter: "PR", title: "Professional Referrals", meta: "Warm intros" },
      { letter: "CM", title: "Career Mentorship", meta: "1:1 sessions" },
    ],
  },
  {
    step: "2. Apply",
    title: "Latest jobs",
    href: "/find-jobs",
    footer: "150+ new roles this week",
    rows: [
      { letter: "SE", title: "Software Engineer", meta: "Remote · Full-time" },
      { letter: "FE", title: "Frontend Developer", meta: "Remote · Full-time" },
      { letter: "BE", title: "Backend Developer", meta: "Hybrid · Full-time" },
      { letter: "AI", title: "AI Engineer", meta: "Remote · Full-time" },
    ],
  },
  {
    step: "3. Learn",
    title: "Courses",
    href: "https://jobflix.in/courses",
    footer: "4,000+ learners enrolled",
    rows: [
      { letter: "R", title: "React", meta: "10 modules" },
      { letter: "SD", title: "System Design", meta: "12 modules" },
      { letter: "DS", title: "DSA", meta: "20 modules" },
      { letter: "AI", title: "AI Interview Prep", meta: "8 modules" },
    ],
  },
];
