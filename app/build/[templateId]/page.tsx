"use client"

import { useParams } from 'next/navigation'
import { ResumeBuilder } from '@/components/resume-builder'

const templates = [
  { id: 'deedy', name: 'Deedy Resume', price: 0, isFree: true },
  { id: 'modern', name: 'Modern Professional', price: 0, isFree: true },
  { id: 'academic', name: 'Academic CV', price: 12, isFree: false },
  { id: 'creative', name: 'Creative Designer', price: 15, isFree: false },
  { id: 'minimal', name: 'Minimal Clean', price: 8, isFree: false },
  { id: 'corporate', name: 'Corporate Elite', price: 18, isFree: false },
  { id: 'tech', name: 'Tech Specialist', price: 10, isFree: false },
  { id: 'banking', name: 'Banking & Finance', price: 14, isFree: false },
  { id: 'engineering', name: 'Engineering Pro', price: 16, isFree: false },
  { id: 'medical', name: 'Medical Professional', price: 20, isFree: false },
  { id: 'consulting', name: 'McKinsey Style', price: 25, isFree: false },
  { id: 'startup', name: 'Startup Founder', price: 12, isFree: false },
  { id: 'legal', name: 'Legal Professional', price: 18, isFree: false },
  { id: 'sales', name: 'Sales Executive', price: 14, isFree: false },
  { id: 'marketing', name: 'Marketing Specialist', price: 16, isFree: false },
  { id: 'designer', name: 'UI/UX Designer', price: 22, isFree: false },
  { id: 'data', name: 'Data Scientist', price: 18, isFree: false },
  { id: 'manager', name: 'Project Manager', price: 15, isFree: false },
  { id: 'freelancer', name: 'Freelancer Portfolio', price: 13, isFree: false },
  { id: 'graduate', name: 'Fresh Graduate', price: 9, isFree: false },
  { id: 'executive', name: 'C-Suite Executive', price: 30, isFree: false },
]

export default function BuildPage() {
  const params = useParams()
  const templateId = params.templateId as string
  const selectedTemplate = templates.find(t => t.id === templateId)

  if (!selectedTemplate) {
    return <div>Template not found</div>
  }

  return <ResumeBuilder selectedTemplate={selectedTemplate} />
}
