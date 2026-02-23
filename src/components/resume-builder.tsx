"use client";

import { useState } from "react";
import { Button } from "./button";
import { Navbar } from "./navbar";
import { type ResumeData, ResumeGeneratorService } from "../services/resumeGenerator";
import { ResumePreview } from "./resume-preview";

interface ResumeBuilderProps {
  selectedTemplate: {
    id: string;
    name: string;
    price: number;
    isFree: boolean;
  };
}

interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
}

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa?: string;
}

export const ResumeBuilder = ({ selectedTemplate }: ResumeBuilderProps) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    summary: ""
  });

  const [experiences, setExperiences] = useState<Experience[]>([{
    id: "1",
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: ""
  }]);

  const [education, setEducation] = useState<Education[]>([{
    id: "1",
    degree: "",
    school: "",
    location: "",
    graduationDate: "",
    gpa: ""
  }]);

  const [skills, setSkills] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      graduationDate: "",
      gpa: ""
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const generateResume = async () => {
    console.log('🚀 Generate Resume button clicked!');

    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    console.log('✅ Job description validation passed');
    console.log('⏳ Setting generating state...');
    setIsGenerating(true);

    try {
      // Prepare user data for AI generation
      const userData = {
        personalDetails,
        experiences,
        education,
        skills
      };

      console.log('User data:', userData);
      console.log('Job description:', jobDescription);
      console.log('Template ID:', selectedTemplate.id);

      // Initialize the resume generator service
      const resumeGenerator = new ResumeGeneratorService();

      // Generate the customized resume using AI
      const generatedResumeData = await resumeGenerator.generateResume(
        jobDescription,
        selectedTemplate.id,
        userData
      );

      console.log('Generated AI resume data:', generatedResumeData);
      setGeneratedResume(generatedResumeData);

    } catch (error) {
      console.error('Error generating resume:', error);
      alert('There was an error generating your resume. Please try again or contact support.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Show resume preview if generated
  if (generatedResume) {
    return (
      <ResumePreview
        resumeData={generatedResume}
        templateId={selectedTemplate.id}
        templateName={selectedTemplate.name}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Build Your Resume
            </h1>
            <p className="text-slate-400 text-lg">
              Using <span className="text-purple-400 font-semibold">{selectedTemplate.name}</span> template
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${step >= stepNum
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                    }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-8">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={personalDetails.fullName}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={personalDetails.email}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={personalDetails.location}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, location: e.target.value })}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={personalDetails.linkedin}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, linkedin: e.target.value })}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Website/Portfolio
                    </label>
                    <input
                      type="url"
                      value={personalDetails.website}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, website: e.target.value })}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="yourportfolio.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    value={personalDetails.summary}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, summary: e.target.value })}
                    rows={4}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Brief summary of your professional background and key achievements..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                  <Button onClick={addExperience} variant="outline" size="sm">
                    + Add Experience
                  </Button>
                </div>

                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="border border-slate-600 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Experience #{index + 1}</h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Job Title *</label>
                          <input
                            type="text"
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                            placeholder="Software Engineer"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Company *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                            placeholder="Google Inc."
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                            placeholder="San Francisco, CA"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Start Date</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">End Date</label>
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="mr-2"
                          />
                          <label className="text-slate-300 text-sm">Currently working here</label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Job Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          rows={4}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                          placeholder="• Led development of user authentication system&#10;• Improved application performance by 40%&#10;• Mentored 3 junior developers"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Education & Skills */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Education & Skills</h2>

                {/* Education */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Education</h3>
                    <Button onClick={addEducation} variant="outline" size="sm">
                      + Add Education
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={edu.id} className="border border-slate-600 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-white mb-3">Education #{index + 1}</h4>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">School</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                              placeholder="Stanford University"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Location</label>
                            <input
                              type="text"
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                              placeholder="Stanford, CA"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Graduation Date</label>
                            <input
                              type="month"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">GPA (Optional)</label>
                            <input
                              type="text"
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                              placeholder="3.8/4.0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Technical Skills (comma-separated)
                    </label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Job Description */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Job Description</h2>
                <p className="text-slate-400 mb-6">
                  Paste the job description for the role you're applying to. Our AI will customize your resume to match the requirements.
                </p>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Paste the complete job description here...&#10;&#10;Example:&#10;We are looking for a Senior Software Engineer to join our team...&#10;Requirements:&#10;- 5+ years of experience in software development&#10;- Proficiency in React, Node.js, and cloud technologies&#10;- Experience with agile development methodologies"
                  />
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-2">💡 Pro Tip:</h4>
                  <p className="text-blue-300 text-sm">
                    Include the complete job posting for best results. Our AI will identify key requirements,
                    preferred skills, and company values to tailor your resume accordingly.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-600">
              <div>
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    ← Previous
                  </Button>
                )}
              </div>

              <div>
                {step < 4 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 && (!personalDetails.fullName || !personalDetails.email)}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      console.log('🚀 Generate Resume button clicked!');
                      console.log('📝 Job description length:', jobDescription.length);
                      generateResume();
                    }}
                    disabled={!jobDescription.trim() || isGenerating}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Generating Resume...
                      </>
                    ) : (
                      '🚀 Generate My Resume'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
