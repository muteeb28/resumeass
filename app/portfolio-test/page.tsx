"use client"

import PortfolioPreview from "@/components/portfolio-preview"
import type { ResumeData } from "@/types/portfolioly-resume"

const SAMPLE: ResumeData = {
  basics: {
    name: "Jinesh Soni",
    email: "jinesh2025@gmail.com",
    phone: "+91-7878415078",
    headline: "Engineering Manager · Flutter · Android · Gen AI",
    summary:
      "Expert software developer and team leader with 3+ years Flutter, 7+ years Android Native, 2+ years fullstack, and 1+ year Gen AI experience. I build scalable mobile products that reach hundreds of thousands of users.",
    location: "Gurugram, India",
    profiles: [
      { network: "LinkedIn", username: "jineshsoni", url: "https://linkedin.com/in/jineshsoni" },
      { network: "GitHub",   username: "jineshsoni", url: "https://github.com/jineshsoni"       },
      { network: "Website",  username: "jineshsoni", url: "https://jineshsoni.com"              },
    ],
  },
  work: [
    {
      company: "Bijak | Krishiacharya Technologies",
      position: "Team Lead → Engineering Manager",
      startDate: "July 2020",
      endDate: "Present",
      highlights: [
        "Created and maintaining core products like Bijak app in Flutter and Just Fresh (600K+ downloads).",
        "Coordinated multi-disciplinary teams of engineers, designers, and product managers.",
        "Developed ML model in TensorFlow and used Gen AI tools to reduce human intervention in internal processes.",
        "Automated app deployment (CI/CD) and testing pipelines.",
      ],
    },
    {
      company: "Thinkwik",
      position: "Team Lead · Android, Flutter Developer",
      startDate: "Dec 2018",
      endDate: "July 2020",
      highlights: [
        "Led mobile development team building high-quality Android and Flutter applications.",
        "Implemented Kotlin-only approach with MVVM architecture pattern.",
      ],
    },
    {
      company: "CodeCrunch TechLabs",
      position: "Software Engineer",
      startDate: "April 2016",
      endDate: "Dec 2018",
      highlights: [
        "Developed Studentdesk.in and Cointopper.com.",
        "Used state-of-the-art technologies to handle 10,000+ DAUs.",
      ],
    },
  ],
  education: [
    {
      institution: "Gujarat Technological University",
      area: "Computer Science",
      studyType: "Bachelor of Engineering",
      score: "7.69",
      url: "https://www.gtu.ac.in",
      startDate: "2010",
      endDate: "2014",
    },
  ],
  skills: [
    {
      name: "Expert",
      keywords: ["Android", "Flutter", "Firebase", "Dart", "Kotlin", "iOS", "SQLite", "BLoC", "GetX", "MVVM"],
    },
    {
      name: "Senior",
      keywords: ["CI/CD", "Gen AI", "LangChain", "Python", "Agile", "Scrum", "Jira", "WebSockets"],
    },
    {
      name: "High Knowledge",
      keywords: ["AWS", "GraphQL", "Node.js", "Docker", "RAGs", "AI Agents", "Fine-tuning"],
    },
    {
      name: "Tinkering",
      keywords: ["IoT", "Arduino", "3D Printing", "Blockchain", "Go"],
    },
  ],
  projects: [
    {
      name: "Bijak Mandi",
      description:
        "India's most trusted agriculture trading platform. Flutter app (Android + iOS) with 600K+ downloads.",
      entity: "Bijak | Krishiacharya Technologies",
      type: "Professional",
      liveUrl: "https://bijak.in",
      highlights: [
        "600K+ downloads on Play Store",
        "Real-time commodity price tracking",
        "Multi-language support",
      ],
      keywords: ["Flutter", "Firebase", "Dart", "Android", "iOS"],
      startDate: "July 2020",
      endDate: "Present",
      role: "Lead Engineer",
    },
    {
      name: "Just Fresh",
      description:
        "Farm fresh fruits and vegetables delivered straight to your doorstep.",
      entity: "Bijak | Krishiacharya Technologies",
      type: "Professional",
      liveUrl: "https://justfresh.in",
      highlights: [
        "50K+ downloads across Android, iOS, and Web",
        "Segment.io analytics integration",
      ],
      startDate: "July 2022",
      endDate: "Present",
      role: "Lead Engineer",
    },
    {
      name: "CoinTopper",
      description:
        "Real-time cryptocurrency tracking platform with live price feeds and portfolio management.",
      entity: "CodeCrunch TechLabs",
      type: "Professional",
      sourceUrl: "https://github.com/jineshsoni",
      highlights: [
        "10,000+ DAUs at peak",
        "Socket-based live data",
        "Built with Kotlin MVVM",
      ],
      keywords: ["Kotlin", "Android", "MVVM", "WebSockets"],
      startDate: "Sep 2017",
      endDate: "Dec 2018",
      role: "Android Developer",
    },
    {
      name: "Local LLM Runner",
      description:
        "Offline AI assistant for enterprise environments. Runs LLaMA models locally without cloud dependency.",
      entity: "Personal Project",
      type: "Personal",
      highlights: [
        "Supports LLaMA 3 and Mistral",
        "Custom RAG pipeline",
        "REST API interface",
      ],
      keywords: ["Python", "LLaMA", "RAG", "REST API", "Node.js"],
      startDate: "2024",
      endDate: "Present",
      role: "Solo Developer",
    },
  ],
  awards: [
    {
      title: "Best Mobile App — AgriTech India 2022",
      date: "2022",
      awarder: "AgriTech India Summit",
      summary: "Bijak Mandi recognised as best-in-class agricultural trading platform.",
    },
  ],
  volunteer: [],
}

export default function PortfolioTestPage() {
  return <PortfolioPreview data={SAMPLE} />
}
