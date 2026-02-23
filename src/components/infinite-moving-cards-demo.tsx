"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function InfiniteMovingCardsDemo() {
  return (
    <section className="bg-white py-20 px-4 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Trusted by job seekers in India and Dubai
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-500 md:text-lg">
            ResumeAssist helps candidates craft ATS-ready resumes that land
            interviews and offers in India and Dubai. Here is what users say.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-[32rem]">
            <InfiniteMovingCards
              items={firstColumn}
              direction="up"
              speed="slow"
            />
          </div>
          <div className="h-[32rem]">
            <InfiniteMovingCards
              items={secondColumn}
              direction="down"
              speed="normal"
            />
          </div>
          <div className="h-[32rem]">
            <InfiniteMovingCards
              items={thirdColumn}
              direction="up"
              speed="slow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const firstColumn = [
  {
    quote:
      "ResumeAssist helped me rewrite my resume for ATS and I landed a product analyst role in Bengaluru in 3 weeks.",
    name: "Priya Sharma",
    title: "Product Analyst, Bengaluru",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "I used ResumeAssist to tailor my CV and got interviews in Hyderabad and Pune, then accepted a frontend role in Pune.",
    name: "Rahul Mehta",
    title: "Frontend Developer, Pune",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "The keyword match report was spot on. I secured a data engineer offer in Mumbai.",
    name: "Aisha Khan",
    title: "Data Engineer, Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "After switching to the ResumeAssist format, I cleared ATS filters and joined a fintech in Chennai.",
    name: "Vivek Iyer",
    title: "QA Lead, Chennai",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  },
];

const secondColumn = [
  {
    quote:
      "ResumeAssist helped me target Dubai roles and I got a marketing specialist job in Dubai within a month.",
    name: "Sara Nair",
    title: "Marketing Specialist, Dubai",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "I was relocating to the UAE and ResumeAssist made my CV Dubai-ready. I joined a logistics firm in Dubai.",
    name: "Omar Saeed",
    title: "Operations Coordinator, Dubai",
    avatar:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "The resume rewrite highlighted my sales numbers. I received offers in Dubai and Abu Dhabi and picked Dubai.",
    name: "Neha Kapoor",
    title: "Sales Executive, Dubai",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "I switched to ResumeAssist and landed an HR analyst role in Dubai after months of no replies.",
    name: "Fatima Ali",
    title: "HR Analyst, Dubai",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop",
  },
];

const thirdColumn = [
  {
    quote:
      "ResumeAssist turned my long CV into a sharp one. I got a software engineer role in Delhi.",
    name: "Arjun Rao",
    title: "Software Engineer, Delhi",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "The ATS score improvements were real. I landed interviews across India and accepted a role in Kochi.",
    name: "Meera Joseph",
    title: "Business Analyst, Kochi",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "The job-specific resume builder helped me move into a UX role in Bengaluru.",
    name: "Kabir Singh",
    title: "UX Designer, Bengaluru",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "After using ResumeAssist, I got shortlisted for eight roles and joined a support lead position in Dubai.",
    name: "Lina Patel",
    title: "Support Lead, Dubai",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400&auto=format&fit=crop",
  },
];
