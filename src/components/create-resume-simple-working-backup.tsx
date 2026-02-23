"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Navbar } from "./navbar";

export const CreateResumeSimpleWorking = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  const handleUseTemplate = (template: any, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (template.isFree) {
      router.push(`/build/${template.id}`);
    } else {
      alert(`✨ ${template.name} - Premium Template\n\nPrice: $${template.price}\n\nFor demo purposes, proceeding to resume builder. Payment integration coming soon!`);
      router.push(`/build/${template.id}`);
    }
  };

  const templates = [
    { id: 'modern-professional', name: 'Modern Professional', price: 0, isFree: true },
    { id: 'executive-minimal', name: 'Executive Minimal', price: 15, isFree: false },
    { id: 'creative-sidebar', name: 'Creative Sidebar', price: 12, isFree: false }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Resume Template
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Select from our professionally designed templates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative bg-slate-800/50 rounded-xl overflow-hidden cursor-pointer transition-all shadow-lg hover:shadow-2xl hover:scale-105 ${
                  selectedTemplate === template.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {template.isFree && (
                  <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    FREE
                  </div>
                )}
                
                {!template.isFree && (
                  <div className="absolute top-4 right-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${template.price}
                  </div>
                )}

                {/* Template Preview - Only one template should render per card */}
                {template.id === 'atlantic-blue' ? (
                  <div className="aspect-[3/4] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" style={{fontFamily: 'Inter, system-ui, sans-serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full flex">
                      {/* Elegant blue sidebar */}
                      <div className="w-1/3 bg-gradient-to-b from-blue-600 to-blue-700 text-white p-4">
                        <div className="text-center mb-6">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-white/30">
                            <span className="text-white text-sm font-medium">SM</span>
                          </div>
                          <h1 className="text-sm font-semibold mb-1">Sarah Mitchell</h1>
                          <p className="text-xs text-blue-100 font-medium">Marketing Director</p>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <h3 className="text-xs font-semibold mb-3 text-blue-100 uppercase tracking-wide">Contact</h3>
                            <div className="space-y-2 text-xs text-white/90">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white/30 rounded-sm flex items-center justify-center">
                                  <span className="text-xs">@</span>
                                </div>
                                <span className="truncate">sarah@company.com</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white/30 rounded-sm flex items-center justify-center">
                                  <span className="text-xs">☎</span>
                                </div>
                                <span>(555) 123-4567</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white/30 rounded-sm flex items-center justify-center">
                                  <span className="text-xs">📍</span>
                                </div>
                                <span>New York, NY</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xs font-semibold mb-3 text-blue-100 uppercase tracking-wide">Skills</h3>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-white">Digital Marketing</span>
                                  <span className="text-xs text-blue-200">90%</span>
                                </div>
                                <div className="w-full bg-blue-500/30 rounded-full h-1">
                                  <div className="bg-white h-1 rounded-full" style={{width: '90%'}}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-white">Analytics</span>
                                  <span className="text-xs text-blue-200">85%</span>
                                </div>
                                <div className="w-full bg-blue-500/30 rounded-full h-1">
                                  <div className="bg-white h-1 rounded-full" style={{width: '85%'}}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-white">Leadership</span>
                                  <span className="text-xs text-blue-200">95%</span>
                                </div>
                                <div className="w-full bg-blue-500/30 rounded-full h-1">
                                  <div className="bg-white h-1 rounded-full" style={{width: '95%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xs font-semibold mb-3 text-blue-100 uppercase tracking-wide">Languages</h3>
                            <div className="space-y-2 text-xs text-white/90">
                              <div className="flex justify-between">
                                <span>English</span>
                                <span className="text-blue-200">Native</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Spanish</span>
                                <span className="text-blue-200">Fluent</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main content area */}
                      <div className="flex-1 p-4">
                        <div className="mb-5">
                          <h2 className="text-lg font-light text-gray-900 mb-1">Sarah Mitchell</h2>
                          <h3 className="text-sm text-blue-600 font-semibold mb-3">Marketing Director</h3>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Strategic marketing professional with 8+ years driving brand growth and customer engagement 
                            through data-driven digital campaigns. Proven expertise in leading cross-functional teams 
                            and optimizing marketing ROI across multiple channels.
                          </p>
                        </div>

                        <div className="mb-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-0.5 bg-blue-600 rounded"></div>
                            <h2 className="text-sm font-bold text-gray-900">EXPERIENCE</h2>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xs font-bold text-gray-900">Marketing Director</h3>
                                <span className="text-xs text-gray-500 font-medium">2021 - Present</span>
                              </div>
                              <p className="text-xs text-blue-600 font-semibold mb-2">TechCorp Global</p>
                              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed">
                                <li>• Led $3M+ integrated campaigns increasing revenue by 150%</li>
                                <li>• Managed cross-functional team of 12 marketing professionals</li>
                                <li>• Implemented data-driven strategies improving ROI by 35%</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xs font-bold text-gray-900">Senior Marketing Manager</h3>
                                <span className="text-xs text-gray-500 font-medium">2019 - 2021</span>
                              </div>
                              <p className="text-xs text-blue-600 font-semibold mb-2">StartupXYZ</p>
                              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed">
                                <li>• Developed comprehensive digital marketing strategies</li>
                                <li>• Achieved 120%+ of lead generation targets consistently</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-0.5 bg-blue-600 rounded"></div>
                            <h2 className="text-sm font-bold text-gray-900">EDUCATION</h2>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">MBA in Marketing</h3>
                            <p className="text-xs text-blue-600 font-semibold">NYU Stern School of Business</p>
                            <p className="text-xs text-gray-500">Graduated 2019 • GPA: 3.8</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'executive' ? (
                  <div className="aspect-[3/4] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" style={{fontFamily: 'Inter, system-ui, sans-serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full">
                      {/* Minimalist header */}
                      <div className="px-6 py-6 bg-white border-b border-gray-100">
                        <div className="text-center">
                          <h1 className="text-2xl font-light text-gray-900 mb-1 tracking-wide">Elizabeth Chen</h1>
                          <div className="w-16 h-px bg-gray-300 mx-auto mb-3"></div>
                          <p className="text-sm text-gray-600 font-medium mb-4">Chief Executive Officer</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>elizabeth.chen@techglobal.com</p>
                            <p>+1 (555) 987-6543 • New York, NY</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 space-y-5">
                        {/* Executive Profile */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">EXECUTIVE PROFILE</h2>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Visionary C-suite executive with 20+ years orchestrating transformation across Fortune 500 enterprises. 
                            Distinguished track record of driving strategic innovation, digital transformation, and delivering 
                            exceptional shareholder value in technology and financial services sectors.
                          </p>
                        </div>

                        {/* Experience */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">LEADERSHIP EXPERIENCE</h2>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">Chief Executive Officer</h3>
                                  <p className="text-xs text-gray-600 italic">TechGlobal Corporation, New York</p>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">2020 - Present</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed pl-4">
                                <li>• Orchestrated comprehensive organizational transformation of $10B revenue enterprise</li>
                                <li>• Delivered exceptional 35% revenue growth and 28% EBITDA improvement</li>
                                <li>• Spearheaded $500M digital transformation initiative</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">Chief Operating Officer</h3>
                                  <p className="text-xs text-gray-600 italic">FinanceFirst Inc., New York</p>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">2017 - 2020</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed pl-4">
                                <li>• Optimized global operations across 50+ international offices</li>
                                <li>• Achieved $50M+ annual cost reduction through strategic improvements</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Education & Achievements Grid */}
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">EDUCATION</h2>
                            <div className="space-y-3">
                              <div>
                                <h3 className="text-xs font-bold text-gray-900">Master of Business Administration</h3>
                                <p className="text-xs text-gray-600">Harvard Business School</p>
                                <p className="text-xs text-gray-500">Magna Cum Laude, 1998</p>
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-gray-900">Bachelor of Science</h3>
                                <p className="text-xs text-gray-600">Stanford University</p>
                                <p className="text-xs text-gray-500">Computer Science, 1994</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">RECOGNITION</h2>
                            <div className="text-xs text-gray-700 space-y-2">
                              <p>• Forbes Most Powerful Women 2023</p>
                              <p>• Harvard Business Review Leadership Award</p>
                              <p>• Microsoft Corporation Board Member</p>
                              <p>• Y Combinator Limited Partner</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'simply-blue' ? (
                  <div className="aspect-[3/4] bg-white rounded-2xl shadow-xl overflow-hidden" style={{fontFamily: 'Inter, system-ui, sans-serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full">
                      {/* Clean header with subtle accent */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 text-center border-b border-blue-100">
                        <h1 className="text-2xl font-light text-gray-900 mb-2 tracking-wide">Michael Brown</h1>
                        <div className="w-20 h-px bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto mb-3"></div>
                        <p className="text-sm text-blue-600 font-semibold mb-4">Software Developer</p>
                        <div className="flex justify-center gap-6 text-xs text-gray-600">
                          <span>michael.brown@developer.com</span>
                          <span>(555) 234-5678</span>
                          <span>San Francisco, CA</span>
                        </div>
                      </div>

                      <div className="px-6 py-5 space-y-5">
                        {/* Experience */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-px bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <h2 className="text-sm font-bold text-gray-900">EXPERIENCE</h2>
                          </div>
                          <div className="space-y-4">
                            <div className="border-l-3 border-blue-200 pl-4 relative">
                              <div className="absolute -left-1.5 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">Senior Software Developer</h3>
                                  <p className="text-xs text-blue-600 font-semibold">TechCorp Solutions</p>
                                </div>
                                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">2022 - Present</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed">
                                <li>• Developed scalable web applications using React and Node.js</li>
                                <li>• Led team of 4 junior developers and mentored new hires</li>
                                <li>• Improved application performance by 40% through optimization</li>
                              </ul>
                            </div>
                            
                            <div className="border-l-3 border-blue-200 pl-4 relative">
                              <div className="absolute -left-1.5 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">Full Stack Developer</h3>
                                  <p className="text-xs text-blue-600 font-semibold">StartupXYZ</p>
                                </div>
                                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">2020 - 2022</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed">
                                <li>• Built responsive web interfaces with modern frameworks</li>
                                <li>• Implemented RESTful APIs and microservices architecture</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Skills & Education Grid */}
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-6 h-px bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                              <h2 className="text-sm font-bold text-gray-900">SKILLS</h2>
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">JavaScript</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">TypeScript</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">React</span>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">Node.js</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs rounded-full font-medium">Python</span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs rounded-full font-medium">AWS</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-6 h-px bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                              <h2 className="text-sm font-bold text-gray-900">EDUCATION</h2>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                              <h3 className="text-sm font-bold text-gray-900">Bachelor of Science</h3>
                              <p className="text-xs text-blue-600 font-semibold">Computer Science</p>
                              <p className="text-xs text-gray-600 mt-1">UC Berkeley • Class of 2020</p>
                            </div>
                            
                            <div className="mt-4">
                              <h3 className="text-xs font-semibold text-gray-800 mb-2">Certifications</h3>
                              <div className="space-y-1 text-xs text-gray-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>AWS Certified Developer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>Google Cloud Professional</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'hunter-green' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-0 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full flex text-black text-xs">
                      <div className="w-1/3 bg-green-700 text-white p-3">
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="text-green-700 text-lg font-bold">AJ</span>
                          </div>
                          <h1 className="text-sm font-bold text-center mb-1">Alex Johnson</h1>
                          <p className="text-xs text-center opacity-90">Business Analyst</p>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider">CONTACT INFO</h2>
                          <div className="space-y-1 text-xs opacity-90">
                            <div className="flex items-center gap-2">
                              <span>📧</span>
                              <span>alex@business.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📱</span>
                              <span>(555) 789-0123</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📍</span>
                              <span>Chicago, IL</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🔗</span>
                              <span>linkedin.com/in/alexj</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider">CORE SKILLS</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs">Business Analysis</span>
                                <span className="text-xs">95%</span>
                              </div>
                              <div className="w-full bg-green-600 rounded-full h-1">
                                <div className="bg-white h-1 rounded-full" style={{width: '95%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs">Data Analytics</span>
                                <span className="text-xs">90%</span>
                              </div>
                              <div className="w-full bg-green-600 rounded-full h-1">
                                <div className="bg-white h-1 rounded-full" style={{width: '90%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs">Process Improvement</span>
                                <span className="text-xs">85%</span>
                              </div>
                              <div className="w-full bg-green-600 rounded-full h-1">
                                <div className="bg-white h-1 rounded-full" style={{width: '85%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider">TOOLS</h2>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">SQL</span>
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Tableau</span>
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Excel</span>
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Python</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-3 bg-white">
                        <div className="mb-4">
                          <h2 className="text-lg font-bold text-gray-900 mb-2">Alex Johnson</h2>
                          <h3 className="text-sm text-green-700 font-semibold mb-3">Business Analyst</h3>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Detail-oriented business analyst with 6+ years of experience in process optimization, 
                            data analysis, and strategic planning. Proven track record of delivering actionable 
                            insights that drive business growth and operational efficiency.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-sm font-bold text-gray-900 mb-2 pb-1 border-b-2 border-green-700">PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-gray-900">Senior Business Analyst</h3>
                                <span className="text-xs text-gray-500">2022 - Present</span>
                              </div>
                              <p className="text-xs text-green-700 font-medium">Deloitte Consulting</p>
                              <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                                <li>• Led $2M cost optimization initiative reducing operational expenses by 25%</li>
                                <li>• Improved process efficiency by 35% through data-driven recommendations</li>
                                <li>• Managed cross-functional teams of up to 8 members</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-gray-900">Business Analyst</h3>
                                <span className="text-xs text-gray-500">2020 - 2022</span>
                              </div>
                              <p className="text-xs text-green-700 font-medium">TechStart Solutions</p>
                              <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                                <li>• Analyzed business requirements and created detailed specifications</li>
                                <li>• Developed KPI dashboards using Tableau and SQL</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-sm font-bold text-gray-900 mb-2 pb-1 border-b-2 border-green-700">EDUCATION</h2>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">Master of Business Administration</h3>
                            <p className="text-xs text-green-700">Northwestern University</p>
                            <p className="text-xs text-gray-500">2020</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'blue-steel' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.2'}}>
                    <div className="h-full flex">
                      <div className="w-2/5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-white" style={{padding: '14px 12px'}}>
                        <div className="text-center mb-4">
                          <div className="w-14 h-14 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">JS</span>
                          </div>
                          <h1 className="font-bold text-sm text-white leading-tight mb-1">JOHN STEEL</h1>
                          <div className="w-8 h-px bg-blue-500 mx-auto mb-2"></div>
                          <p className="text-blue-300 text-xs font-medium uppercase tracking-wide">Software Engineer</p>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-blue-300 text-xs font-bold mb-2 uppercase tracking-wide border-b border-slate-600 pb-1">CONTACT</h2>
                          <div className="space-y-1 text-xs text-slate-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">📧</span>
                              <span>john@steel.dev</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">📱</span>
                              <span>(555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">📍</span>
                              <span>Seattle, WA</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">💼</span>
                              <span>linkedin.com/in/johnsteel</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-blue-300 text-xs font-bold mb-2 uppercase tracking-wide border-b border-slate-600 pb-1">SKILLS</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-200">JavaScript/TypeScript</span>
                                <span className="text-blue-400">95%</span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full" style={{width: '95%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-200">React/Node.js</span>
                                <span className="text-blue-400">90%</span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full" style={{width: '90%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-200">Python/Django</span>
                                <span className="text-blue-400">85%</span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full" style={{width: '85%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-200">AWS/DevOps</span>
                                <span className="text-blue-400">80%</span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full" style={{width: '80%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-blue-300 text-xs font-bold mb-2 uppercase tracking-wide border-b border-slate-600 pb-1">LANGUAGES</h2>
                          <div className="text-xs text-slate-200 space-y-1">
                            <div className="flex justify-between">
                              <span>English</span>
                              <span className="text-blue-400">Native</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Spanish</span>
                              <span className="text-blue-400">Fluent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-white" style={{padding: '18px 16px'}}>
                        <div className="mb-4">
                          <h2 className="text-slate-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-500 pb-1">PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-slate-900 text-xs font-bold">Senior Software Engineer</h3>
                                  <p className="text-blue-600 text-xs font-medium">Microsoft Corporation</p>
                                </div>
                                <span className="text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded">2022 - Present</span>
                              </div>
                              <ul className="text-slate-700 text-xs space-y-0.5 ml-2">
                                <li>• Led development of Azure DevOps features serving 5M+ users</li>
                                <li>• Architected microservices reducing response time by 40%</li>
                                <li>• Mentored team of 6 junior engineers and interns</li>
                                <li>• Implemented CI/CD pipelines improving deployment frequency</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-slate-900 text-xs font-bold">Full Stack Developer</h3>
                                  <p className="text-blue-600 text-xs font-medium">Amazon Web Services</p>
                                </div>
                                <span className="text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded">2020 - 2022</span>
                              </div>
                              <ul className="text-slate-700 text-xs space-y-0.5 ml-2">
                                <li>• Developed cloud-native applications using AWS services</li>
                                <li>• Built React dashboards for infrastructure monitoring</li>
                                <li>• Optimized database queries reducing costs by 30%</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-slate-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-500 pb-1">EDUCATION</h2>
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-slate-900 text-xs font-bold">Master of Science in Computer Science</h3>
                                <p className="text-blue-600 text-xs font-medium">University of Washington</p>
                                <p className="text-slate-600 text-xs">Specialization: Distributed Systems</p>
                              </div>
                              <span className="text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded">2020</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-slate-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-500 pb-1">KEY PROJECTS</h2>
                          <div className="space-y-2">
                            <div>
                              <h3 className="text-slate-900 text-xs font-bold">Cloud Migration Platform</h3>
                              <p className="text-slate-700 text-xs">Built automated migration tool reducing manual effort by 80%</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">React</span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">Node.js</span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">AWS</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'rosewood' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Playfair Display, Georgia, serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full">
                      <div className="bg-gradient-to-r from-rose-800 to-rose-900 text-white" style={{padding: '16px', textAlign: 'center'}}>
                        <h1 className="text-lg font-bold text-rose-50 mb-1" style={{fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px'}}>SOPHIA ROSEWOOD</h1>
                        <div className="w-20 h-px bg-rose-300 mx-auto mb-2"></div>
                        <p className="text-rose-200 text-xs font-light uppercase tracking-wider">Marketing Executive</p>
                        <div className="flex justify-center space-x-4 mt-3 text-xs text-rose-200">
                          <span>sophia@rosewood.com</span>
                          <span>•</span>
                          <span>(555) 123-4567</span>
                          <span>•</span>
                          <span>New York, NY</span>
                        </div>
                      </div>
                      
                      <div style={{padding: '18px 16px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-rose-800 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '2px solid #be185d', paddingBottom: '4px'}}>PROFESSIONAL SUMMARY</h2>
                          <p className="text-gray-700 text-xs leading-relaxed italic">Distinguished marketing executive with 12+ years driving brand excellence and revenue growth for Fortune 500 companies. Expertise in digital transformation, strategic partnerships, and team leadership with proven track record of delivering exceptional ROI.</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-rose-800 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '2px solid #be185d', paddingBottom: '4px'}}>EXECUTIVE EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Vice President of Marketing</h3>
                                  <p className="text-rose-700 text-xs font-medium italic">Tiffany & Co. • Luxury Retail</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-rose-800 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded">2020 - Present</span>
                                </div>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3" style={{listStyleType: 'none'}}>
                                <li className="before:content-['✦'] before:text-rose-600 before:font-bold before:mr-2">Orchestrated $50M global marketing campaign increasing brand equity by 35%</li>
                                <li className="before:content-['✦'] before:text-rose-600 before:font-bold before:mr-2">Led digital transformation initiatives driving 60% increase in online engagement</li>
                                <li className="before:content-['✦'] before:text-rose-600 before:font-bold before:mr-2">Managed cross-functional team of 25+ marketing professionals across 8 regions</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Senior Marketing Director</h3>
                                  <p className="text-rose-700 text-xs font-medium italic">LVMH • Luxury Goods</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-rose-800 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded">2017 - 2020</span>
                                </div>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3" style={{listStyleType: 'none'}}>
                                <li className="before:content-['✦'] before:text-rose-600 before:font-bold before:mr-2">Developed integrated marketing strategies generating $120M revenue growth</li>
                                <li className="before:content-['✦'] before:text-rose-600 before:font-bold before:mr-2">Launched premium product lines in emerging markets with 150% ROI</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-rose-800 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '1px solid #be185d', paddingBottom: '2px'}}>EDUCATION</h2>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>MBA in Marketing Strategy</h3>
                              <p className="text-rose-700 text-xs font-medium italic">Harvard Business School</p>
                              <p className="text-gray-600 text-xs">Summa Cum Laude • 2017</p>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-rose-800 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '1px solid #be185d', paddingBottom: '2px'}}>CORE EXPERTISE</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <div className="flex justify-between">
                                <span>• Brand Strategy & Positioning</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Digital Marketing & Analytics</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Luxury Market Expertise</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Team Leadership & Development</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-rose-800 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '2px solid #be185d', paddingBottom: '4px'}}>NOTABLE ACHIEVEMENTS</h2>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-rose-50 p-2 rounded border border-rose-200">
                              <p className="text-rose-800 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>$200M+</p>
                              <p className="text-gray-600 text-xs">Revenue Generated</p>
                            </div>
                            <div className="bg-rose-50 p-2 rounded border border-rose-200">
                              <p className="text-rose-800 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>150%</p>
                              <p className="text-gray-600 text-xs">ROI Improvement</p>
                            </div>
                            <div className="bg-rose-50 p-2 rounded border border-rose-200">
                              <p className="text-rose-800 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>25+</p>
                              <p className="text-gray-600 text-xs">Team Members</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'mercury' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full">
                      <div className="bg-gray-900 text-white text-center" style={{padding: '20px 16px'}}>
                        <h1 className="text-xl font-light text-white mb-2" style={{letterSpacing: '2px'}}>ALEX MERCURY</h1>
                        <div className="w-16 h-px bg-gray-400 mx-auto mb-3"></div>
                        <p className="text-gray-300 text-sm font-light uppercase tracking-widest">Product Manager</p>
                        <div className="mt-4 text-xs text-gray-400">
                          <p>alex.mercury@productco.com</p>
                          <p>(555) 987-6543 • San Francisco, CA</p>
                          <p>linkedin.com/in/alexmercury</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 16px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-gray-900 text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '2px solid #374151', paddingBottom: '4px'}}>PROFESSIONAL SUMMARY</h2>
                          <p className="text-gray-700 text-xs leading-relaxed">
                            Strategic product manager with 8+ years of experience launching innovative digital products that scale to millions of users. Expert in product strategy, user research, and cross-functional team leadership with a track record of driving 40%+ growth in key metrics.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-gray-900 text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '2px solid #374151', paddingBottom: '4px'}}>EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Senior Product Manager</h3>
                                  <p className="text-gray-600 text-xs font-medium">Google • Search & Assistant</p>
                                </div>
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">2021 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Led product strategy for Google Assistant reaching 500M+ monthly users</li>
                                <li>• Launched AI-powered features increasing user engagement by 45%</li>
                                <li>• Managed $10M product budget and cross-functional team of 15+ engineers</li>
                                <li>• Drove product roadmap decisions using data analytics and user research</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Product Manager</h3>
                                  <p className="text-gray-600 text-xs font-medium">Meta • Facebook Marketplace</p>
                                </div>
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">2019 - 2021</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Built marketplace features serving 1B+ global users monthly</li>
                                <li>• Increased transaction volume by 60% through UX improvements</li>
                                <li>• Collaborated with engineering, design, and data science teams</li>
                              </ul>
                            </div>

                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Associate Product Manager</h3>
                                  <p className="text-gray-600 text-xs font-medium">Uber • Rider Experience</p>
                                </div>
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">2017 - 2019</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Optimized rider onboarding flow reducing drop-off by 25%</li>
                                <li>• A/B tested product features across 50+ markets globally</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '1px solid #374151', paddingBottom: '2px'}}>EDUCATION</h2>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold">MBA in Technology Management</h3>
                              <p className="text-gray-600 text-xs font-medium">Stanford Graduate School of Business</p>
                              <p className="text-gray-500 text-xs">2017</p>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '1px solid #374151', paddingBottom: '2px'}}>CORE SKILLS</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>• Product Strategy & Roadmapping</p>
                              <p>• User Research & Analytics</p>
                              <p>• Cross-functional Leadership</p>
                              <p>• A/B Testing & Experimentation</p>
                              <p>• SQL, Python, Figma, Amplitude</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide" style={{borderBottom: '2px solid #374151', paddingBottom: '4px'}}>KEY ACHIEVEMENTS</h2>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">500M+</p>
                              <p className="text-gray-600 text-xs">Users Reached</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">45%</p>
                              <p className="text-gray-600 text-xs">Growth Rate</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">$10M</p>
                              <p className="text-gray-600 text-xs">Budget Managed</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">15+</p>
                              <p className="text-gray-600 text-xs">Team Size</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'classic' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Times, Georgia, serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full" style={{padding: '20px 18px'}}>
                      <div className="text-center mb-4 pb-3 border-b-2 border-blue-600">
                        <h1 className="text-lg font-bold text-gray-900 mb-1" style={{fontFamily: 'Times, serif', letterSpacing: '1px'}}>DAVID CLASSIC</h1>
                        <p className="text-blue-600 text-sm font-medium">Financial Analyst</p>
                        <div className="text-xs text-gray-600 mt-2">
                          <p>david.classic@finance.com • (555) 456-7890</p>
                          <p>Boston, MA • linkedin.com/in/davidclassic</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h2 className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-600 pb-1">OBJECTIVE</h2>
                        <p className="text-gray-700 text-xs leading-relaxed italic">
                          Dedicated financial analyst with 6+ years of experience in investment banking and corporate finance. Seeking to leverage analytical expertise and financial modeling skills to drive strategic decision-making at a leading financial institution.
                        </p>
                      </div>

                      <div className="mb-4">
                        <h2 className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-600 pb-1">PROFESSIONAL EXPERIENCE</h2>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Senior Financial Analyst</h3>
                                <p className="text-blue-600 text-xs font-medium italic">Goldman Sachs • Investment Banking Division</p>
                              </div>
                              <span className="text-gray-600 text-xs">2021 - Present</span>
                            </div>
                            <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                              <li>• Built complex financial models for M&A transactions totaling $2.5B</li>
                              <li>• Performed due diligence analysis for private equity and corporate clients</li>
                              <li>• Prepared detailed pitch books and investment committee presentations</li>
                              <li>• Led financial analysis for 15+ successful deal closures</li>
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Financial Analyst</h3>
                                <p className="text-blue-600 text-xs font-medium italic">JPMorgan Chase • Corporate Banking</p>
                              </div>
                              <span className="text-gray-600 text-xs">2019 - 2021</span>
                            </div>
                            <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                              <li>• Analyzed credit risk for corporate lending portfolio ($500M+)</li>
                              <li>• Developed automated reporting systems reducing processing time by 40%</li>
                              <li>• Collaborated with relationship managers on client financial solutions</li>
                            </ul>
                          </div>

                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Junior Analyst</h3>
                                <p className="text-blue-600 text-xs font-medium italic">Deloitte • Financial Advisory</p>
                              </div>
                              <span className="text-gray-600 text-xs">2018 - 2019</span>
                            </div>
                            <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                              <li>• Conducted industry research and competitive analysis</li>
                              <li>• Assisted in preparation of valuation reports and fairness opinions</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h2 className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-600 pb-1">EDUCATION</h2>
                          <div className="space-y-2">
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Master of Business Administration</h3>
                              <p className="text-blue-600 text-xs font-medium italic">Harvard Business School</p>
                              <p className="text-gray-600 text-xs">Finance Concentration • 2018</p>
                            </div>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Bachelor of Science in Economics</h3>
                              <p className="text-blue-600 text-xs font-medium italic">University of Pennsylvania</p>
                              <p className="text-gray-600 text-xs">Summa Cum Laude • 2016</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-600 pb-1">TECHNICAL SKILLS</h2>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p>• Advanced Excel & VBA Programming</p>
                            <p>• Financial Modeling & Valuation</p>
                            <p>• Bloomberg Terminal & FactSet</p>
                            <p>• SQL Database Management</p>
                            <p>• Python for Data Analysis</p>
                            <p>• PowerPoint & Presentation Design</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h2 className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-600 pb-1">CERTIFICATIONS & ACHIEVEMENTS</h2>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• CFA Level II Candidate (June 2024)</p>
                          <p>• Goldman Sachs Analyst of the Quarter (Q3 2023)</p>
                          <p>• Dean's List - University of Pennsylvania (2014-2016)</p>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-600 pb-1">ADDITIONAL INFORMATION</h2>
                        <div className="text-xs text-gray-700">
                          <p><strong>Languages:</strong> English (Native), Spanish (Fluent), French (Conversational)</p>
                          <p><strong>Interests:</strong> Financial Markets, Economic Research, Marathon Running</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'grenadine' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Playfair Display, Georgia, serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full">
                      <div className="bg-gradient-to-r from-red-700 to-red-800 text-white text-center" style={{padding: '18px 16px'}}>
                        <h1 className="text-lg font-bold text-red-50 mb-2" style={{fontFamily: 'Playfair Display, serif', letterSpacing: '1px'}}>ELENA GRENADINE</h1>
                        <div className="w-16 h-px bg-red-300 mx-auto mb-2"></div>
                        <p className="text-red-200 text-sm font-light uppercase tracking-wider">Creative Director</p>
                        <div className="text-xs text-red-200 mt-3">
                          <p>elena@grenadine.studio • (555) 789-0123</p>
                          <p>Los Angeles, CA • behance.net/elena</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 18px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-red-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-red-700 pb-1">CREATIVE VISION</h2>
                          <p className="text-gray-700 text-xs leading-relaxed italic">Award-winning creative director with 10+ years crafting compelling brand narratives and visual experiences. Specialized in luxury brands and digital storytelling with portfolio spanning Fortune 100 companies.</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-red-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-red-700 pb-1">EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Creative Director</h3>
                                  <p className="text-red-600 text-xs font-medium italic">Ogilvy & Mather • Global Campaigns</p>
                                </div>
                                <span className="text-red-700 text-xs bg-red-50 px-2 py-0.5 rounded">2020 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                                <li>• Led creative teams for $25M+ luxury brand campaigns</li>
                                <li>• Won 3 Cannes Lions for innovative digital experiences</li>
                                <li>• Increased client engagement rates by 150% through storytelling</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Senior Art Director</h3>
                                  <p className="text-red-600 text-xs font-medium italic">BBDO • Brand Strategy</p>
                                </div>
                                <span className="text-red-700 text-xs bg-red-50 px-2 py-0.5 rounded">2017 - 2020</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                                <li>• Designed award-winning campaigns for Nike and Mercedes</li>
                                <li>• Managed creative budgets exceeding $10M annually</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-red-800 text-xs font-bold mb-2 uppercase tracking-wide border-b border-red-700 pb-1">EDUCATION</h2>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>MFA Visual Communication</h3>
                              <p className="text-red-600 text-xs font-medium italic">Art Center College of Design</p>
                              <p className="text-gray-600 text-xs">Distinguished Graduate • 2017</p>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-red-800 text-xs font-bold mb-2 uppercase tracking-wide border-b border-red-700 pb-1">EXPERTISE</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>• Brand Identity & Strategy</p>
                              <p>• Digital Experience Design</p>
                              <p>• Creative Team Leadership</p>
                              <p>• Adobe Creative Suite Master</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-red-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-red-700 pb-1">AWARDS & RECOGNITION</h2>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-red-50 p-2 rounded border border-red-200">
                              <p className="text-red-800 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>15+</p>
                              <p className="text-gray-600 text-xs">Industry Awards</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded border border-red-200">
                              <p className="text-red-800 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>$50M</p>
                              <p className="text-gray-600 text-xs">Campaign Value</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded border border-red-200">
                              <p className="text-red-800 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>20+</p>
                              <p className="text-gray-600 text-xs">Team Members</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'modern-pro' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full">
                      <div className="bg-gray-50 border-b-2 border-gray-300 text-center" style={{padding: '18px 16px'}}>
                        <h1 className="text-xl font-bold text-gray-900 mb-2" style={{letterSpacing: '1px'}}>MICHAEL MODERN</h1>
                        <div className="w-12 h-px bg-gray-400 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Software Architect</p>
                        <div className="text-xs text-gray-500 mt-3 space-y-1">
                          <p>michael@moderntech.com • (555) 234-5678</p>
                          <p>San Francisco, CA • github.com/mmodern</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 18px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">SUMMARY</h2>
                          <p className="text-gray-700 text-xs leading-relaxed">Senior software architect with 12+ years building scalable systems for high-growth startups and enterprise clients. Expert in microservices, cloud architecture, and team leadership with proven track record of delivering complex technical solutions.</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Principal Software Architect</h3>
                                  <p className="text-gray-600 text-xs font-medium">Stripe • Payment Infrastructure</p>
                                </div>
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">2021 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Architected payment systems processing $100B+ annually</li>
                                <li>• Led migration to Kubernetes reducing infrastructure costs by 40%</li>
                                <li>• Mentored 15+ engineers across distributed teams</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Senior Staff Engineer</h3>
                                  <p className="text-gray-600 text-xs font-medium">Airbnb • Platform Engineering</p>
                                </div>
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">2018 - 2021</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Built ML platform serving 100M+ predictions daily</li>
                                <li>• Designed API gateway handling 50K+ requests per second</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">EDUCATION</h2>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold">MS Computer Science</h3>
                              <p className="text-gray-600 text-xs font-medium">Carnegie Mellon University</p>
                              <p className="text-gray-500 text-xs">Distributed Systems • 2018</p>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">TECHNOLOGIES</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>• Go, Python, Java, TypeScript</p>
                              <p>• Kubernetes, Docker, AWS</p>
                              <p>• PostgreSQL, Redis, Kafka</p>
                              <p>• GraphQL, gRPC, REST APIs</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">METRICS</h2>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">$100B+</p>
                              <p className="text-gray-600 text-xs">Processed</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">50K</p>
                              <p className="text-gray-600 text-xs">RPS</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">40%</p>
                              <p className="text-gray-600 text-xs">Cost Reduction</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                              <p className="text-gray-900 text-sm font-bold">15+</p>
                              <p className="text-gray-600 text-xs">Engineers</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'minimal-white' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full" style={{padding: '30px 25px'}}>
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-thin text-gray-900 mb-3" style={{letterSpacing: '2px'}}>ANNA MINIMAL</h1>
                        <div className="w-8 h-px bg-gray-300 mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm font-light tracking-widest uppercase">UX Designer</p>
                        <div className="text-xs text-gray-400 mt-4">
                          <p>anna@minimal.design</p>
                          <p>(555) 345-6789 • Seattle, WA</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-gray-900 text-xs font-light mb-3 uppercase tracking-widest">Experience</h2>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-normal">Senior UX Designer</h3>
                                  <p className="text-gray-500 text-xs font-light">Apple • Human Interface</p>
                                </div>
                                <span className="text-gray-400 text-xs font-light">2022 - Present</span>
                              </div>
                              <p className="text-gray-600 text-xs leading-relaxed font-light">
                                Design intuitive interfaces for iOS applications used by millions worldwide. 
                                Lead user research initiatives and collaborate with engineering teams.
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-normal">UX Designer</h3>
                                  <p className="text-gray-500 text-xs font-light">Google • Material Design</p>
                                </div>
                                <span className="text-gray-400 text-xs font-light">2020 - 2022</span>
                              </div>
                              <p className="text-gray-600 text-xs leading-relaxed font-light">
                                Contributed to Material Design system updates affecting billions of users. 
                                Conducted usability testing and accessibility audits.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-gray-900 text-xs font-light mb-3 uppercase tracking-widest">Education</h2>
                          <div>
                            <h3 className="text-gray-900 text-xs font-normal">MFA Interaction Design</h3>
                            <p className="text-gray-500 text-xs font-light">School of Visual Arts, New York</p>
                            <p className="text-gray-400 text-xs font-light">2020</p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-gray-900 text-xs font-light mb-3 uppercase tracking-widest">Skills</h2>
                          <div className="text-xs text-gray-600 font-light space-y-1">
                            <p>User Research & Testing</p>
                            <p>Interaction Design</p>
                            <p>Figma, Sketch, Principle</p>
                            <p>Accessibility Standards</p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-gray-900 text-xs font-light mb-3 uppercase tracking-widest">Recognition</h2>
                          <div className="text-xs text-gray-600 font-light space-y-1">
                            <p>Webby Award for Best UX Design • 2023</p>
                            <p>Design Team Lead of the Year • Apple • 2023</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'corporate-blue' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Times, Georgia, serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full">
                      <div className="bg-blue-800 text-white text-center" style={{padding: '16px'}}>
                        <h1 className="text-lg font-bold text-white mb-2" style={{fontFamily: 'Times, serif', letterSpacing: '1px'}}>ROBERT CORPORATE</h1>
                        <div className="w-16 h-px bg-blue-300 mx-auto mb-2"></div>
                        <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">Chief Financial Officer</p>
                        <div className="text-xs text-blue-200 mt-3">
                          <p>robert@corporate.com • (555) 456-7890</p>
                          <p>New York, NY • linkedin.com/in/rcorporate</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 18px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">EXECUTIVE SUMMARY</h2>
                          <p className="text-gray-700 text-xs leading-relaxed">
                            Accomplished CFO with 15+ years driving financial strategy and operational excellence for Fortune 500 companies. Proven expertise in M&A, capital markets, and organizational transformation with track record of delivering measurable shareholder value.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">EXECUTIVE EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Chief Financial Officer</h3>
                                  <p className="text-blue-700 text-xs font-medium">Fortune 100 Manufacturing Corp.</p>
                                </div>
                                <span className="text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded">2019 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                                <li>• Managed $2.5B revenue portfolio with 15% YoY growth</li>
                                <li>• Led successful $500M acquisition integration program</li>
                                <li>• Implemented cost optimization saving $50M annually</li>
                                <li>• Directed team of 200+ finance and accounting professionals</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Vice President of Finance</h3>
                                  <p className="text-blue-700 text-xs font-medium">Global Technology Solutions Inc.</p>
                                </div>
                                <span className="text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded">2015 - 2019</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                                <li>• Raised $200M in Series C funding round</li>
                                <li>• Streamlined financial reporting reducing close time by 60%</li>
                                <li>• Built FP&A function supporting 40% revenue growth</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-800 pb-1">EDUCATION</h2>
                            <div className="space-y-2">
                              <div>
                                <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>MBA Finance</h3>
                                <p className="text-blue-700 text-xs font-medium">Wharton School, University of Pennsylvania</p>
                                <p className="text-gray-600 text-xs">Beta Gamma Sigma • 2015</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b border-blue-800 pb-1">CERTIFICATIONS</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>• CPA (Certified Public Accountant)</p>
                              <p>• CFA (Chartered Financial Analyst)</p>
                              <p>• Board Certified in Risk Management</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">KEY PERFORMANCE INDICATORS</h2>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-blue-50 p-2 rounded border border-blue-200">
                              <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>$2.5B</p>
                              <p className="text-gray-600 text-xs">Revenue</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-200">
                              <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>15%</p>
                              <p className="text-gray-600 text-xs">YoY Growth</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-200">
                              <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>$500M</p>
                              <p className="text-gray-600 text-xs">M&A Value</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-200">
                              <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>200+</p>
                              <p className="text-gray-600 text-xs">Team Size</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'creative-orange' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full flex">
                      <div className="w-1/3 bg-gradient-to-b from-orange-500 to-orange-600 text-white" style={{padding: '16px 12px'}}>
                        <div className="text-center mb-4">
                          <div className="w-14 h-14 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-lg">LC</span>
                          </div>
                          <h1 className="font-bold text-sm text-white leading-tight mb-1">LUNA CREATIVE</h1>
                          <div className="w-8 h-px bg-orange-300 mx-auto mb-2"></div>
                          <p className="text-orange-100 text-xs font-light uppercase tracking-wide">Art Director</p>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-orange-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-orange-400 pb-1">CONTACT</h2>
                          <div className="space-y-1.5 text-xs text-orange-100">
                            <div>📧 luna@creative.studio</div>
                            <div>📱 (555) 567-8901</div>
                            <div>📍 Portland, OR</div>
                            <div>🎨 behance.net/luna</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-orange-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-orange-400 pb-1">SKILLS</h2>
                          <div className="space-y-2">
                            <div className="bg-orange-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Adobe Creative Suite</div>
                            <div className="bg-orange-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Brand Design</div>
                            <div className="bg-orange-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Digital Illustration</div>
                            <div className="bg-orange-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Typography</div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-orange-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-orange-400 pb-1">AWARDS</h2>
                          <div className="text-xs text-orange-100 space-y-1">
                            <div>🏆 ADC Young Guns 2023</div>
                            <div>🏆 D&AD Pencil Winner</div>
                            <div>🏆 Communication Arts</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-white" style={{padding: '18px 16px'}}>
                        <div className="mb-4">
                          <h2 className="text-orange-600 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-orange-500 pb-1">CREATIVE EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Senior Art Director</h3>
                                  <p className="text-orange-600 text-xs font-medium">Nike • Global Creative</p>
                                </div>
                                <span className="text-orange-500 text-xs bg-orange-50 px-2 py-0.5 rounded">2021 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Led visual campaigns for Air Jordan reaching 50M+ consumers</li>
                                <li>• Created brand guidelines adopted across 200+ global markets</li>
                                <li>• Managed creative team of 8 designers and photographers</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Creative Designer</h3>
                                  <p className="text-orange-600 text-xs font-medium">Wieden+Kennedy • Brand Strategy</p>
                                </div>
                                <span className="text-orange-500 text-xs bg-orange-50 px-2 py-0.5 rounded">2019 - 2021</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Designed award-winning campaigns for Coca-Cola and Honda</li>
                                <li>• Developed brand identities generating $25M+ in client revenue</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-orange-600 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-orange-500 pb-1">EDUCATION & CERTIFICATIONS</h2>
                          <div>
                            <h3 className="text-gray-900 text-xs font-bold">BFA Graphic Design</h3>
                            <p className="text-orange-600 text-xs font-medium">Rhode Island School of Design</p>
                            <p className="text-gray-600 text-xs">Magna Cum Laude • 2019</p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-orange-600 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-orange-500 pb-1">FEATURED PROJECTS</h2>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-orange-50 p-2 rounded border border-orange-200">
                              <h4 className="text-orange-700 text-xs font-bold">Nike Air Campaign</h4>
                              <p className="text-gray-600 text-xs">50M reach, 300% engagement</p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded border border-orange-200">
                              <h4 className="text-orange-700 text-xs font-bold">Coca-Cola Rebrand</h4>
                              <p className="text-gray-600 text-xs">$25M revenue impact</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'tech-gray' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'JetBrains Mono, Monaco, monospace', fontSize: '6px', lineHeight: '1.3'}}>
                    <div className="h-full bg-gray-900 text-green-400">
                      <div className="bg-gray-800 border-b border-gray-700" style={{padding: '12px 16px'}}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-400 text-xs ml-2">resume.sh</span>
                        </div>
                        <div className="text-green-400 text-xs">
                          <span className="text-blue-400">$</span> cat /home/alex/resume.json
                        </div>
                      </div>
                      
                      <div style={{padding: '16px'}} className="text-xs">
                        <div className="mb-4">
                          <div className="text-yellow-400">{`{`}</div>
                          <div className="ml-4">
                            <div><span className="text-blue-400">"name":</span> <span className="text-green-300">"Alex Thompson"</span>,</div>
                            <div><span className="text-blue-400">"role":</span> <span className="text-green-300">"Senior DevOps Engineer"</span>,</div>
                            <div><span className="text-blue-400">"location":</span> <span className="text-green-300">"San Francisco, CA"</span>,</div>
                            <div><span className="text-blue-400">"contact":</span> <span className="text-yellow-400">{`{`}</span></div>
                            <div className="ml-4">
                              <div><span className="text-blue-400">"email":</span> <span className="text-green-300">"alex@devops.tech"</span>,</div>
                              <div><span className="text-blue-400">"github":</span> <span className="text-green-300">"github.com/alexops"</span></div>
                            </div>
                            <div><span className="text-yellow-400">{`}`}</span>,</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="ml-4">
                            <div><span className="text-blue-400">"experience":</span> <span className="text-yellow-400">[</span></div>
                            <div className="ml-4">
                              <div><span className="text-yellow-400">{`{`}</span></div>
                              <div className="ml-4">
                                <div><span className="text-blue-400">"company":</span> <span className="text-green-300">"Google"</span>,</div>
                                <div><span className="text-blue-400">"position":</span> <span className="text-green-300">"Senior DevOps Engineer"</span>,</div>
                                <div><span className="text-blue-400">"duration":</span> <span className="text-green-300">"2021-Present"</span>,</div>
                                <div><span className="text-blue-400">"achievements":</span> <span className="text-yellow-400">[</span></div>
                                <div className="ml-4">
                                  <div><span className="text-green-300">"Reduced deployment time by 80%"</span>,</div>
                                  <div><span className="text-green-300">"Managed 1000+ Kubernetes pods"</span>,</div>
                                  <div><span className="text-green-300">"Built CI/CD for 50+ microservices"</span></div>
                                </div>
                                <div><span className="text-yellow-400">]</span></div>
                              </div>
                              <div><span className="text-yellow-400">{`}`}</span></div>
                            </div>
                            <div><span className="text-yellow-400">]</span>,</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="ml-4">
                            <div><span className="text-blue-400">"technologies":</span> <span className="text-yellow-400">[</span></div>
                            <div className="ml-4 text-green-300">
                              <div>"Kubernetes", "Docker", "AWS",</div>
                              <div>"Terraform", "Jenkins", "Python",</div>
                              <div>"Go", "Prometheus", "Grafana"</div>
                            </div>
                            <div><span className="text-yellow-400">]</span>,</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="ml-4">
                            <div><span className="text-blue-400">"certifications":</span> <span className="text-yellow-400">[</span></div>
                            <div className="ml-4 text-green-300">
                              <div>"AWS Solutions Architect",</div>
                              <div>"Kubernetes Administrator",</div>
                              <div>"Docker Certified Associate"</div>
                            </div>
                            <div><span className="text-yellow-400">]</span></div>
                          </div>
                        </div>

                        <div><span className="text-yellow-400">{`}`}</span></div>

                        <div className="mt-4 text-green-400">
                          <span className="text-blue-400">$</span> <span className="animate-pulse">_</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'business-green' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full flex">
                      <div className="w-2/5 bg-gradient-to-b from-green-600 to-green-700 text-white" style={{padding: '16px 14px'}}>
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-lg">MB</span>
                          </div>
                          <h1 className="font-bold text-sm text-white leading-tight mb-1">MARCUS BUSINESS</h1>
                          <div className="w-10 h-px bg-green-300 mx-auto mb-2"></div>
                          <p className="text-green-100 text-xs font-light uppercase tracking-wide">Business Analyst</p>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-green-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-green-500 pb-1">CONTACT</h2>
                          <div className="space-y-1.5 text-xs text-green-100">
                            <div>📧 marcus@business.com</div>
                            <div>📱 (555) 678-9012</div>
                            <div>📍 Chicago, IL</div>
                            <div>🔗 linkedin.com/in/marcus</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-green-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-green-500 pb-1">CORE SKILLS</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Financial Analysis</span>
                                <span>95%</span>
                              </div>
                              <div className="w-full bg-green-500 h-1 rounded-full">
                                <div className="bg-white h-1 rounded-full" style={{width: '95%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Process Optimization</span>
                                <span>90%</span>
                              </div>
                              <div className="w-full bg-green-500 h-1 rounded-full">
                                <div className="bg-white h-1 rounded-full" style={{width: '90%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Data Analytics</span>
                                <span>85%</span>
                              </div>
                              <div className="w-full bg-green-500 h-1 rounded-full">
                                <div className="bg-white h-1 rounded-full" style={{width: '85%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-green-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-green-500 pb-1">TOOLS</h2>
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-green-500 text-white px-2 py-0.5 text-xs rounded">Excel</span>
                            <span className="bg-green-500 text-white px-2 py-0.5 text-xs rounded">SQL</span>
                            <span className="bg-green-500 text-white px-2 py-0.5 text-xs rounded">Tableau</span>
                            <span className="bg-green-500 text-white px-2 py-0.5 text-xs rounded">Python</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-white" style={{padding: '18px 16px'}}>
                        <div className="mb-4">
                          <h2 className="text-green-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-green-600 pb-1">PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Senior Business Analyst</h3>
                                  <p className="text-green-600 text-xs font-medium">McKinsey & Company</p>
                                </div>
                                <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded">2021 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Led cost reduction initiatives saving $15M annually for Fortune 500 clients</li>
                                <li>• Analyzed market data to identify $50M revenue opportunities</li>
                                <li>• Built financial models supporting $200M M&A transactions</li>
                                <li>• Managed cross-functional teams of 12+ consultants</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Business Analyst</h3>
                                  <p className="text-green-600 text-xs font-medium">Boston Consulting Group</p>
                                </div>
                                <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded">2019 - 2021</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Conducted strategic analysis for private equity portfolio companies</li>
                                <li>• Optimized supply chain operations reducing costs by 20%</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-green-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-green-600 pb-1">EDUCATION</h2>
                          <div>
                            <h3 className="text-gray-900 text-xs font-bold">MBA Strategy & Finance</h3>
                            <p className="text-green-600 text-xs font-medium">University of Chicago Booth</p>
                            <p className="text-gray-600 text-xs">Dean's List • 2019</p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-green-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-green-600 pb-1">KEY ACHIEVEMENTS</h2>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <p className="text-green-700 text-sm font-bold">$200M</p>
                              <p className="text-gray-600 text-xs">M&A Value</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <p className="text-green-700 text-sm font-bold">$15M</p>
                              <p className="text-gray-600 text-xs">Cost Saved</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <p className="text-green-700 text-sm font-bold">20%</p>
                              <p className="text-gray-600 text-xs">Efficiency Gain</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'elegant-purple' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Playfair Display, Georgia, serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white" style={{padding: '18px 16px', textAlign: 'center'}}>
                        <h1 className="text-lg font-bold text-purple-50 mb-2" style={{fontFamily: 'Playfair Display, serif', letterSpacing: '1px'}}>VICTORIA ELEGANT</h1>
                        <div className="w-16 h-px bg-purple-300 mx-auto mb-2"></div>
                        <p className="text-purple-200 text-sm font-light uppercase tracking-wider">Executive Assistant</p>
                        <div className="text-xs text-purple-200 mt-3">
                          <p>victoria@elegant.com • (555) 890-1234</p>
                          <p>New York, NY • linkedin.com/in/victoria</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 18px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-purple-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-purple-600 pb-1">EXECUTIVE SUMMARY</h2>
                          <p className="text-gray-700 text-xs leading-relaxed italic">Distinguished executive assistant with 8+ years supporting C-suite executives at Fortune 500 companies. Expert in strategic planning, executive communication, and high-level project coordination with proven ability to enhance executive productivity by 40%.</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-purple-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-purple-600 pb-1">PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Senior Executive Assistant</h3>
                                  <p className="text-purple-600 text-xs font-medium italic">Goldman Sachs • CEO Office</p>
                                </div>
                                <span className="text-purple-600 text-xs bg-purple-50 px-2 py-0.5 rounded">2020 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                                <li>• Support CEO and 3 senior executives managing $500B+ in assets</li>
                                <li>• Coordinate international travel and high-stakes board meetings</li>
                                <li>• Manage confidential correspondence with Fortune 100 CEOs</li>
                                <li>• Streamlined executive workflows increasing productivity by 40%</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>Executive Assistant</h3>
                                  <p className="text-purple-600 text-xs font-medium italic">JPMorgan Chase • Investment Banking</p>
                                </div>
                                <span className="text-purple-600 text-xs bg-purple-50 px-2 py-0.5 rounded">2017 - 2020</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-3">
                                <li>• Supported Managing Director overseeing $200M+ deals</li>
                                <li>• Coordinated client meetings and proposal presentations</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-purple-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-purple-600 pb-1">EDUCATION</h2>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Playfair Display, serif'}}>BA Business Administration</h3>
                              <p className="text-purple-600 text-xs font-medium italic">Columbia University</p>
                              <p className="text-gray-600 text-xs">Dean's List • 2017</p>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-purple-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-purple-600 pb-1">CORE COMPETENCIES</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>• Executive Communication</p>
                              <p>• Strategic Planning & Coordination</p>
                              <p>• Confidential Document Management</p>
                              <p>• Advanced Microsoft Office Suite</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-purple-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-purple-600 pb-1">KEY ACHIEVEMENTS</h2>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-purple-50 p-2 rounded border border-purple-200">
                              <p className="text-purple-700 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>$500B+</p>
                              <p className="text-gray-600 text-xs">Assets Managed</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded border border-purple-200">
                              <p className="text-purple-700 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>40%</p>
                              <p className="text-gray-600 text-xs">Productivity Gain</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded border border-purple-200">
                              <p className="text-purple-700 text-sm font-bold" style={{fontFamily: 'Playfair Display, serif'}}>3</p>
                              <p className="text-gray-600 text-xs">Executives</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'startup-red' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white">
                      <div className="text-center" style={{padding: '20px 16px'}}>
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg mx-auto mb-3 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold text-lg">🚀</span>
                        </div>
                        <h1 className="text-lg font-bold text-white mb-2" style={{letterSpacing: '1px'}}>RYAN STARTUP</h1>
                        <div className="w-12 h-px bg-red-300 mx-auto mb-2"></div>
                        <p className="text-red-200 text-sm font-medium uppercase tracking-wide">Startup Founder & CEO</p>
                        <div className="text-xs text-red-200 mt-3">
                          <p>ryan@startup.co • (555) 901-2345</p>
                          <p>Austin, TX • twitter.com/ryanstartup</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 18px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-red-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-red-600 pb-1">FOUNDER'S VISION</h2>
                          <p className="text-gray-700 text-xs leading-relaxed">Serial entrepreneur with 3 successful exits totaling $120M. Expert in scaling technology startups from ideation to IPO with focus on fintech and SaaS solutions. Built and led teams of 200+ across multiple time zones.</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-red-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-red-600 pb-1">STARTUP EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Founder & CEO</h3>
                                  <p className="text-red-600 text-xs font-medium">PayFlow Technologies • Fintech SaaS</p>
                                </div>
                                <span className="text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded">2021 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Raised $25M Series A from Sequoia Capital and Andreessen Horowitz</li>
                                <li>• Scaled from 0 to $10M ARR in 18 months with 95% customer retention</li>
                                <li>• Built distributed team of 85+ engineers and product managers</li>
                                <li>• Launched in 12 countries with 500K+ active users</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Co-Founder & CTO</h3>
                                  <p className="text-red-600 text-xs font-medium">DataSync Solutions • Acquired by Microsoft</p>
                                </div>
                                <span className="text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded">2018 - 2021</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Led technical team building enterprise data integration platform</li>
                                <li>• Achieved $50M acquisition by Microsoft after 2.5 years</li>
                                <li>• Built platform serving 1000+ enterprise customers</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h2 className="text-red-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-red-600 pb-1">EDUCATION</h2>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold">BS Computer Science</h3>
                              <p className="text-red-600 text-xs font-medium">Stanford University</p>
                              <p className="text-gray-600 text-xs">Phi Beta Kappa • 2018</p>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-red-700 text-xs font-bold mb-2 uppercase tracking-wide border-b border-red-600 pb-1">EXPERTISE</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>• Venture Capital Fundraising</p>
                              <p>• Product-Market Fit Strategy</p>
                              <p>• Scaling Engineering Teams</p>
                              <p>• SaaS Growth Marketing</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-red-700 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-red-600 pb-1">STARTUP METRICS</h2>
                          <div className="grid grid-cols-4 gap-1 text-center">
                            <div className="bg-red-50 p-1.5 rounded border border-red-200">
                              <p className="text-red-700 text-xs font-bold">$120M</p>
                              <p className="text-gray-600 text-xs">Exit Value</p>
                            </div>
                            <div className="bg-red-50 p-1.5 rounded border border-red-200">
                              <p className="text-red-700 text-xs font-bold">$25M</p>
                              <p className="text-gray-600 text-xs">Series A</p>
                            </div>
                            <div className="bg-red-50 p-1.5 rounded border border-red-200">
                              <p className="text-red-700 text-xs font-bold">500K+</p>
                              <p className="text-gray-600 text-xs">Users</p>
                            </div>
                            <div className="bg-red-50 p-1.5 rounded border border-red-200">
                              <p className="text-red-700 text-xs font-bold">85+</p>
                              <p className="text-gray-600 text-xs">Team Size</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'academic-navy' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Times, Georgia, serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full">
                      <div className="bg-navy-900 text-white text-center border-b-4 border-navy-800" style={{padding: '16px', backgroundColor: '#1e3a8a'}}>
                        <h1 className="text-lg font-bold text-white mb-2" style={{fontFamily: 'Times, serif', letterSpacing: '1px'}}>DR. PATRICIA ACADEMIC</h1>
                        <div className="w-20 h-px bg-blue-300 mx-auto mb-2"></div>
                        <p className="text-blue-200 text-sm font-medium tracking-wide">Associate Professor of Economics</p>
                        <div className="text-xs text-blue-200 mt-3">
                          <p>p.academic@university.edu • (555) 012-3456</p>
                          <p>Cambridge, MA • orcid.org/0000-0000-0000-0000</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '20px 18px'}} className="bg-white">
                        <div className="mb-4">
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">RESEARCH INTERESTS</h2>
                          <p className="text-gray-700 text-xs leading-relaxed">Behavioral Economics, Public Policy Analysis, and Economic Development. Specialized in experimental methodology and field studies examining decision-making processes in developing economies.</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">ACADEMIC POSITIONS</h2>
                          <div className="space-y-2">
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Associate Professor of Economics</h3>
                              <p className="text-blue-700 text-xs font-medium italic">Harvard University • Department of Economics</p>
                              <p className="text-gray-600 text-xs">2020 - Present</p>
                            </div>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Assistant Professor</h3>
                              <p className="text-blue-700 text-xs font-medium italic">MIT • Department of Economics</p>
                              <p className="text-gray-600 text-xs">2016 - 2020</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">EDUCATION</h2>
                          <div className="space-y-2">
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>PhD Economics</h3>
                              <p className="text-blue-700 text-xs font-medium italic">University of Chicago • 2016</p>
                              <p className="text-gray-600 text-xs">Dissertation: "Behavioral Factors in Development Economics"</p>
                            </div>
                            <div>
                              <h3 className="text-gray-900 text-xs font-bold" style={{fontFamily: 'Times, serif'}}>MA Economics</h3>
                              <p className="text-blue-700 text-xs font-medium italic">London School of Economics • 2012</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-blue-800 pb-1">SELECTED PUBLICATIONS</h2>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p>"Behavioral Interventions in Microfinance" • <em>American Economic Review</em> • 2023</p>
                            <p>"Experimental Evidence on Financial Literacy" • <em>Quarterly Journal of Economics</em> • 2022</p>
                            <p>"Policy Design for Developing Economies" • <em>Journal of Development Economics</em> • 2021</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>45+</p>
                            <p className="text-gray-600 text-xs">Publications</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>1,200+</p>
                            <p className="text-gray-600 text-xs">Citations</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <p className="text-blue-800 text-sm font-bold" style={{fontFamily: 'Times, serif'}}>$2.5M</p>
                            <p className="text-gray-600 text-xs">Grant Funding</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'designer-pink' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '7px', lineHeight: '1.3'}}>
                    <div className="h-full flex">
                      <div className="w-1/3 bg-gradient-to-b from-pink-500 to-pink-600 text-white" style={{padding: '16px 12px'}}>
                        <div className="text-center mb-4">
                          <div className="w-14 h-14 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-pink-600 font-bold text-lg">ZD</span>
                          </div>
                          <h1 className="font-bold text-sm text-white leading-tight mb-1">ZARA DESIGNER</h1>
                          <div className="w-8 h-px bg-pink-300 mx-auto mb-2"></div>
                          <p className="text-pink-100 text-xs font-light uppercase tracking-wide">UI/UX Designer</p>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-pink-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-pink-400 pb-1">CONTACT</h2>
                          <div className="space-y-1.5 text-xs text-pink-100">
                            <div>✉️ zara@designer.studio</div>
                            <div>📱 (555) 123-7890</div>
                            <div>📍 Los Angeles, CA</div>
                            <div>🎨 dribbble.com/zara</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-pink-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-pink-400 pb-1">DESIGN SKILLS</h2>
                          <div className="space-y-2">
                            <div className="bg-pink-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">User Research</div>
                            <div className="bg-pink-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Figma & Sketch</div>
                            <div className="bg-pink-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Prototyping</div>
                            <div className="bg-pink-400 bg-opacity-30 px-2 py-1 rounded text-xs text-center">Design Systems</div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-pink-200 text-xs font-bold mb-2 uppercase tracking-wide border-b border-pink-400 pb-1">PORTFOLIO</h2>
                          <div className="text-xs text-pink-100 space-y-1">
                            <div>🏆 Dribbble Top Designer 2023</div>
                            <div>🏆 Awwwards Site of Day</div>
                            <div>🏆 Design Team Lead of Year</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-white" style={{padding: '18px 16px'}}>
                        <div className="mb-4">
                          <h2 className="text-pink-600 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-pink-500 pb-1">DESIGN EXPERIENCE</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Senior Product Designer</h3>
                                  <p className="text-pink-600 text-xs font-medium">Instagram • Meta</p>
                                </div>
                                <span className="text-pink-500 text-xs bg-pink-50 px-2 py-0.5 rounded">2022 - Present</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Led design for Instagram Stories reaching 500M+ daily users</li>
                                <li>• Designed new creator monetization features increasing revenue 30%</li>
                                <li>• Built comprehensive design system used by 50+ designers</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-gray-900 text-xs font-bold">Product Designer</h3>
                                  <p className="text-pink-600 text-xs font-medium">Airbnb • Experience Design</p>
                                </div>
                                <span className="text-pink-500 text-xs bg-pink-50 px-2 py-0.5 rounded">2020 - 2022</span>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-0.5 ml-2">
                                <li>• Redesigned booking flow improving conversion by 25%</li>
                                <li>• Conducted user research with 200+ international users</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-pink-600 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-pink-500 pb-1">EDUCATION</h2>
                          <div>
                            <h3 className="text-gray-900 text-xs font-bold">MFA Interaction Design</h3>
                            <p className="text-pink-600 text-xs font-medium">Art Center College of Design</p>
                            <p className="text-gray-600 text-xs">Summa Cum Laude • 2020</p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-pink-600 text-xs font-bold mb-2 uppercase tracking-wide border-b-2 border-pink-500 pb-1">FEATURED PROJECTS</h2>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-pink-50 p-2 rounded border border-pink-200">
                              <h4 className="text-pink-700 text-xs font-bold">Instagram Stories Redesign</h4>
                              <p className="text-gray-600 text-xs">500M daily users, 30% engagement boost</p>
                            </div>
                            <div className="bg-pink-50 p-2 rounded border border-pink-200">
                              <h4 className="text-pink-700 text-xs font-bold">Airbnb Booking Flow</h4>
                              <p className="text-gray-600 text-xs">25% conversion improvement</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'consultant-black' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden" style={{fontFamily: 'Times, Georgia, serif', fontSize: '7px', lineHeight: '1.4'}}>
                    <div className="h-full">
                      <div className="bg-black text-white text-center" style={{padding: '20px 16px'}}>
                        <h1 className="text-xl font-bold text-white mb-2" style={{fontFamily: 'Times, serif', letterSpacing: '2px'}}>JONATHAN CONSULTANT</h1>
                        <div className="w-24 h-px bg-gray-400 mx-auto mb-3"></div>
                        <p className="text-gray-300 text-sm font-light uppercase tracking-widest">Management Consultant</p>
                        <div className="text-xs text-gray-400 mt-4">
                          <p>jonathan@consultant.com • +1 (555) 234-5678</p>
                          <p>New York, NY • linkedin.com/in/jonathanconsultant</p>
                        </div>
                      </div>
                      
                      <div style={{padding: '24px 20px'}} className="bg-white">
                        <div className="mb-5">
                          <h2 className="text-black text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '3px solid #000', paddingBottom: '4px'}}>EXECUTIVE SUMMARY</h2>
                          <p className="text-gray-800 text-xs leading-relaxed">
                            Senior management consultant with 12+ years advising Fortune 500 CEOs on strategic transformation and operational excellence. Led $500M+ engagements across financial services, technology, and healthcare sectors with proven track record of delivering measurable business impact.
                          </p>
                        </div>

                        <div className="mb-5">
                          <h2 className="text-black text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '3px solid #000', paddingBottom: '4px'}}>CONSULTING EXPERIENCE</h2>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-black text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Principal Consultant</h3>
                                  <p className="text-gray-700 text-xs font-medium" style={{fontFamily: 'Times, serif'}}>McKinsey & Company • Global Practice</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-black text-xs font-medium bg-gray-100 px-2 py-1 rounded">2019 - Present</span>
                                </div>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-1 ml-4" style={{listStyleType: 'disc'}}>
                                <li>Led digital transformation for $50B investment bank, delivering $200M cost savings</li>
                                <li>Advised healthcare conglomerate on $2B M&A integration strategy</li>
                                <li>Designed operating model for Fortune 100 tech company's international expansion</li>
                                <li>Managed teams of 25+ consultants across multiple workstreams</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-black text-xs font-bold" style={{fontFamily: 'Times, serif'}}>Senior Associate</h3>
                                  <p className="text-gray-700 text-xs font-medium" style={{fontFamily: 'Times, serif'}}>Bain & Company • Corporate Strategy</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-black text-xs font-medium bg-gray-100 px-2 py-1 rounded">2016 - 2019</span>
                                </div>
                              </div>
                              <ul className="text-gray-700 text-xs space-y-1 ml-4" style={{listStyleType: 'disc'}}>
                                <li>Conducted market entry analysis for private equity portfolio companies</li>
                                <li>Optimized supply chain operations across 15 manufacturing facilities</li>
                                <li>Built financial models supporting $1B+ strategic decisions</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-5">
                          <div>
                            <h2 className="text-black text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '2px solid #000', paddingBottom: '2px'}}>EDUCATION</h2>
                            <div className="space-y-3">
                              <div>
                                <h3 className="text-black text-xs font-bold" style={{fontFamily: 'Times, serif'}}>MBA Strategy & Finance</h3>
                                <p className="text-gray-700 text-xs font-medium" style={{fontFamily: 'Times, serif'}}>Harvard Business School</p>
                                <p className="text-gray-600 text-xs">Baker Scholar (Top 5%) • 2016</p>
                              </div>
                              <div>
                                <h3 className="text-black text-xs font-bold" style={{fontFamily: 'Times, serif'}}>BA Economics</h3>
                                <p className="text-gray-700 text-xs font-medium" style={{fontFamily: 'Times, serif'}}>Princeton University</p>
                                <p className="text-gray-600 text-xs">Phi Beta Kappa • 2012</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h2 className="text-black text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '2px solid #000', paddingBottom: '2px'}}>CORE COMPETENCIES</h2>
                            <div className="text-xs text-gray-700 space-y-1.5">
                              <p>• Strategic Planning & Execution</p>
                              <p>• Digital Transformation</p>
                              <p>• M&A Integration & Due Diligence</p>
                              <p>• Operational Excellence</p>
                              <p>• Financial Modeling & Analysis</p>
                              <p>• Change Management</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-black text-xs font-bold mb-3 uppercase tracking-wide" style={{borderBottom: '3px solid #000', paddingBottom: '4px'}}>CLIENT IMPACT METRICS</h2>
                          <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-gray-50 p-3 rounded border-2 border-gray-200">
                              <p className="text-black text-lg font-bold" style={{fontFamily: 'Times, serif'}}>$500M+</p>
                              <p className="text-gray-700 text-xs uppercase tracking-wide">Engagement Value</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border-2 border-gray-200">
                              <p className="text-black text-lg font-bold" style={{fontFamily: 'Times, serif'}}>$200M</p>
                              <p className="text-gray-700 text-xs uppercase tracking-wide">Cost Savings</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border-2 border-gray-200">
                              <p className="text-black text-lg font-bold" style={{fontFamily: 'Times, serif'}}>50+</p>
                              <p className="text-gray-700 text-xs uppercase tracking-wide">Clients Served</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border-2 border-gray-200">
                              <p className="text-black text-lg font-bold" style={{fontFamily: 'Times, serif'}}>25+</p>
                              <p className="text-gray-700 text-xs uppercase tracking-wide">Team Members</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'analyst' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-2 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="bg-blue-600 text-white p-2 -m-2 mb-3 rounded-t-lg">
                        <h1 className="text-sm font-bold">Michael Rivera</h1>
                        <p className="text-xs opacity-90">Business Analyst</p>
                      </div>
                      
                      <div className="px-2">
                        <div className="mb-3">
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>📧 michael.rivera@analytics.com</p>
                            <p>📱 (555) 234-5678</p>
                            <p>📍 Chicago, IL</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-blue-600">EXPERIENCE</h2>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">Senior Business Analyst</h3>
                            <p className="text-xs text-blue-600">Deloitte Consulting • 2021 - 2024</p>
                            <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                              <li>• Led $2M cost optimization project</li>
                              <li>• Improved process efficiency by 35%</li>
                              <li>• Analyzed complex business requirements</li>
                            </ul>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-blue-600">CORE SKILLS</h2>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>• Data Analysis</div>
                            <div>• Process Mapping</div>
                            <div>• SQL & Tableau</div>
                            <div>• Agile/Scrum</div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-blue-600">EDUCATION</h2>
                          <h3 className="text-xs font-bold text-gray-900">MS Business Analytics</h3>
                          <p className="text-xs text-blue-600">Northwestern University • 2021</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'director' ? (
                  <div className="aspect-[3/4] bg-gray-900 text-green-400 rounded-lg shadow-inner border border-gray-700 p-3 overflow-hidden" style={{fontFamily: 'Monaco, monospace'}}>
                    <div className="text-xs h-full">
                      <div className="border border-green-400 p-2 mb-2">
                        <div className="text-green-300 text-xs mb-1">$ whoami</div>
                        <h1 className="text-sm font-bold text-green-400">john_smith</h1>
                        <div className="text-xs">
                          <div><span className="text-green-600">email:</span> john@dev.com</div>
                          <div><span className="text-green-600">role:</span> full_stack_dev</div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-green-300 text-xs mb-1">$ cat experience.log</div>
                        <div className="border-l-2 border-green-600 pl-2">
                          <p className="text-green-400 font-bold text-xs">Senior Developer</p>
                          <p className="text-green-300 text-xs">@ TechStartup</p>
                          <p className="text-green-100 text-xs">▸ Built scalable APIs</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-green-300 text-xs mb-1">$ cat skills.json</div>
                        <div className="bg-gray-800 p-1 rounded text-xs">
                          <div className="text-green-400">{"{"}</div>
                          <div className="ml-2 text-green-100">"langs": ["JavaScript", "Python"]</div>
                          <div className="text-green-400">{"}"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'consulting' ? (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-3 overflow-hidden" style={{fontFamily: 'Arial, sans-serif'}}>
                    <div className="text-black text-xs h-full">
                      <div className="text-center border-b-2 border-gray-900 pb-2 mb-2">
                        <h1 className="text-sm font-bold">JOHN SMITH</h1>
                        <p className="text-xs text-gray-600">john@email.com | (555) 123-4567 | NYC</p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h2 className="text-xs font-bold border-b border-gray-400 pb-0.5">SUMMARY</h2>
                          <p className="text-xs text-gray-800">Strategy consultant with McKinsey experience</p>
                        </div>
                        <div>
                          <h2 className="text-xs font-bold border-b border-gray-400 pb-0.5">EXPERIENCE</h2>
                          <div className="flex justify-between">
                            <div>
                              <span className="font-bold text-xs">McKinsey & Co</span>
                              <span className="text-xs ml-1">| Analyst</span>
                            </div>
                            <span className="text-xs text-gray-600">2022-2024</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h2 className="text-xs font-bold border-b border-gray-400 pb-0.5">EDUCATION</h2>
                            <p className="text-xs font-bold">Harvard MBA</p>
                          </div>
                          <div>
                            <h2 className="text-xs font-bold border-b border-gray-400 pb-0.5">SKILLS</h2>
                            <p className="text-xs">Strategy, Analysis</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-slate-700 rounded-lg shadow-lg border border-gray-300 overflow-hidden flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                      <p className="text-sm opacity-75">Professional template</p>
                      <div className="mt-4 text-xs opacity-50">
                        Preview will be available after selection
                      </div>
                    </div>
                  </div>
                )}

                {/* All conflicting duplicate templates removed to fix layout - jumping to fallback section */}

                {/* Default template for others - disabled as all templates now have custom previews */}
                {false && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-2 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full flex text-black text-xs">
                      <div className="flex-1">
                        <div className="text-center mb-3 pb-2 border-b-2 border-gray-800">
                          <h1 className="text-sm font-bold text-gray-900">David Thompson</h1>
                          <p className="text-xs text-gray-800 font-medium">VP of Engineering</p>
                          <div className="text-xs text-gray-600 mt-1">
                            <p>david.thompson@techcorp.com</p>
                            <p>Seattle, WA • (555) 123-4567</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-900 mb-2">LEADERSHIP METRICS</h2>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div className="bg-gray-100 p-1 rounded">
                              <p className="text-xs font-bold text-gray-800">150+</p>
                              <p className="text-xs text-gray-600">Team Size</p>
                            </div>
                            <div className="bg-gray-100 p-1 rounded">
                              <p className="text-xs font-bold text-gray-800">$50M</p>
                              <p className="text-xs text-gray-600">Budget</p>
                            </div>
                            <div className="bg-gray-100 p-1 rounded">
                              <p className="text-xs font-bold text-gray-800">8 Yrs</p>
                              <p className="text-xs text-gray-600">Experience</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-gray-400">EXPERIENCE</h2>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">VP of Engineering</h3>
                            <p className="text-xs text-gray-700">TechCorp • 2020 - Present</p>
                            <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <li>• Scaled team from 20 to 150+ engineers</li>
                              <li>• Led $10M digital transformation</li>
                              <li>• Reduced time-to-market by 60%</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-gray-400">EXPERTISE</h2>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>• Strategic Planning</div>
                            <div>• Team Building</div>
                            <div>• Technical Leadership</div>
                            <div>• Budget Management</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'manager' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-2 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="text-center mb-3 pb-3 border-b-2 border-orange-500">
                        <h1 className="text-sm font-bold text-gray-900">Jennifer Park</h1>
                        <p className="text-xs text-orange-600 font-medium">Engineering Manager</p>
                        <p className="text-xs text-gray-600">jennifer@manager.com • Seattle, WA</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1 mb-3">
                        <div className="text-center bg-orange-50 p-1 rounded">
                          <p className="text-xs font-bold text-orange-700">12</p>
                          <p className="text-xs text-gray-600">Team Size</p>
                        </div>
                        <div className="text-center bg-orange-50 p-1 rounded">
                          <p className="text-xs font-bold text-orange-700">95%</p>
                          <p className="text-xs text-gray-600">On-Time</p>
                        </div>
                        <div className="text-center bg-orange-50 p-1 rounded">
                          <p className="text-xs font-bold text-orange-700">4.8</p>
                          <p className="text-xs text-gray-600">Rating</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-orange-500">EXPERIENCE</h2>
                        <div>
                          <h3 className="text-xs font-bold text-gray-900">Engineering Manager</h3>
                          <p className="text-xs text-orange-600">Shopify • 2022 - Present</p>
                          <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                            <li>• Manage team of 12 engineers</li>
                            <li>• Mentored 15+ junior developers</li>
                            <li>• Improved delivery rate to 95%</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-orange-500">SKILLS</h2>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>• Team Leadership</div>
                          <div>• Agile/Scrum</div>
                          <div>• 1:1 Coaching</div>
                          <div>• Performance Mgmt</div>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-orange-500">EDUCATION</h2>
                        <h3 className="text-xs font-bold text-gray-900">MS Computer Science</h3>
                        <p className="text-xs text-orange-600">University of Washington • 2020</p>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'designer' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-2 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="text-center mb-3 pb-3 border-b border-purple-300">
                        <div className="w-10 h-10 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">AM</span>
                        </div>
                        <h1 className="text-sm font-bold text-gray-900">Anna Martinez</h1>
                        <p className="text-xs text-purple-600 font-medium">UX/UI Designer</p>
                        <div className="text-xs text-gray-600 mt-1">
                          <p>anna@design.com | New York, NY</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center bg-purple-50 p-2 rounded">
                          <p className="text-sm font-bold text-purple-700">50+</p>
                          <p className="text-xs text-gray-600">Projects</p>
                        </div>
                        <div className="text-center bg-pink-50 p-2 rounded">
                          <p className="text-sm font-bold text-pink-700">4.9★</p>
                          <p className="text-xs text-gray-600">Rating</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-purple-600">EXPERIENCE</h2>
                        <div>
                          <h3 className="text-xs font-bold text-gray-900">Senior UX Designer</h3>
                          <p className="text-xs text-purple-600">Airbnb • 2022 - 2024</p>
                          <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                            <li>• Redesigned booking flow (+25% conversion)</li>
                            <li>• Led design system implementation</li>
                            <li>• Conducted 100+ user interviews</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-purple-600">DESIGN TOOLS</h2>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>• Figma</div>
                          <div>• Adobe XD</div>
                          <div>• Sketch</div>
                          <div>• Principle</div>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-purple-600">EDUCATION</h2>
                        <h3 className="text-xs font-bold text-gray-900">BFA Graphic Design</h3>
                        <p className="text-xs text-purple-600">Parsons School of Design • 2020</p>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'data' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-2 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full flex text-black text-xs">
                      <div className="w-1/3 bg-teal-50 p-2 -m-2 mr-2 border-r border-teal-200">
                        <div className="text-center mb-3">
                          <div className="w-12 h-12 bg-teal-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">EW</span>
                          </div>
                          <h1 className="text-sm font-bold text-gray-900 leading-tight">Dr. Emily Watson</h1>
                          <p className="text-xs text-teal-600 font-medium">Data Scientist</p>
                        </div>
                        
                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-800 mb-1 uppercase tracking-wide">Contact</h2>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>📧 emily@data.com</p>
                            <p>📱 (555) 456-7890</p>
                            <p>📍 San Francisco, CA</p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xs font-bold text-gray-800 mb-1 uppercase tracking-wide">Tools</h2>
                          <div className="space-y-1 text-xs">
                            <div className="bg-teal-100 px-2 py-1 rounded text-center text-teal-800">Python</div>
                            <div className="bg-teal-100 px-2 py-1 rounded text-center text-teal-800">TensorFlow</div>
                            <div className="bg-teal-100 px-2 py-1 rounded text-center text-teal-800">SQL</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-2">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-center bg-gray-100 p-2 rounded">
                            <p className="text-sm font-bold text-gray-800">$5M</p>
                            <p className="text-xs text-gray-600">Revenue Impact</p>
                          </div>
                          <div className="text-center bg-gray-100 p-2 rounded">
                            <p className="text-sm font-bold text-gray-800">99.2%</p>
                            <p className="text-xs text-gray-600">Model Accuracy</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-sm font-bold text-gray-900 mb-1 pb-1 border-b-2 border-teal-600">EXPERIENCE</h2>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">Senior Data Scientist</h3>
                            <p className="text-xs text-teal-600">Netflix • 2021 - 2024</p>
                            <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                              <li>• Built recommendation engine (40M users)</li>
                              <li>• Improved model accuracy by 15%</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-sm font-bold text-gray-900 mb-1 pb-1 border-b-2 border-teal-600">EDUCATION</h2>
                          <h3 className="text-xs font-bold text-gray-900">Ph.D. Data Science</h3>
                          <p className="text-xs text-teal-600">MIT • 2021</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'consultant' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-2 overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="bg-blue-600 text-white p-2 -m-2 mb-3 rounded-t-lg">
                        <h1 className="text-sm font-bold">Robert Chen</h1>
                        <p className="text-xs opacity-90">Strategy Consultant</p>
                      </div>
                      
                      <div className="px-2">
                        <div className="mb-3">
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>📧 robert@mckinsey.com</p>
                            <p>📱 (555) 987-6543</p>
                            <p>📍 New York, NY</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-center bg-blue-50 p-2 rounded">
                            <p className="text-sm font-bold text-blue-700">$500M+</p>
                            <p className="text-xs text-gray-600">Value Created</p>
                          </div>
                          <div className="text-center bg-blue-50 p-2 rounded">
                            <p className="text-sm font-bold text-blue-700">50+</p>
                            <p className="text-xs text-gray-600">Projects</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-blue-600">EXPERIENCE</h2>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">Principal Consultant</h3>
                            <p className="text-xs text-blue-600">McKinsey & Company • 2020 - 2024</p>
                            <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                              <li>• Led 50+ strategic engagements</li>
                              <li>• Digital transformation specialist</li>
                              <li>• Fortune 10 client portfolio</li>
                            </ul>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-blue-600">EXPERTISE</h2>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>• Strategy</div>
                            <div>• M&A</div>
                            <div>• Digital Transform</div>
                            <div>• Operations</div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xs font-bold text-gray-900 mb-2 pb-1 border-b border-blue-600">EDUCATION</h2>
                          <h3 className="text-xs font-bold text-gray-900">MBA</h3>
                          <p className="text-xs text-blue-600">Harvard Business School • 2020</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'marketing' && (
                  <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-orange-50 rounded-lg shadow-inner border border-rose-200 p-3 overflow-hidden">
                    <div className="h-full text-xs">
                      <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white p-2 -m-3 mb-2 rounded-t-lg">
                        <h1 className="text-sm font-bold">SOPHIA RODRIGUEZ</h1>
                        <p className="text-xs opacity-90">Marketing Manager</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-rose-600 mb-1">CAMPAIGN PERFORMANCE</h2>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-rose-100 p-1 rounded text-center">
                            <p className="text-xs font-bold text-rose-800">300%</p>
                            <p className="text-xs text-rose-600">ROI Increase</p>
                          </div>
                          <div className="bg-orange-100 p-1 rounded text-center">
                            <p className="text-xs font-bold text-orange-800">2M+</p>
                            <p className="text-xs text-orange-600">Impressions</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-rose-600 mb-1">EXPERIENCE</h2>
                        <div className="space-y-1">
                          <div className="border-l-3 border-rose-400 pl-2">
                            <p className="text-xs font-bold text-gray-900">Marketing Manager</p>
                            <p className="text-xs text-rose-600">HubSpot • 2022-2024</p>
                            <p className="text-xs text-gray-700">• Increased lead generation by 250%</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-rose-600 mb-1">MARKETING STACK</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-rose-200 text-rose-800 text-xs rounded">HubSpot</span>
                          <span className="px-1.5 py-0.5 bg-orange-200 text-orange-800 text-xs rounded">Google Ads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'sales' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-emerald-200 p-3 overflow-hidden">
                    <div className="h-full text-black text-xs">
                      <div className="bg-emerald-600 text-white p-2 -m-3 mb-2 rounded-t-lg">
                        <h1 className="text-sm font-bold">MARCUS WILLIAMS</h1>
                        <p className="text-xs opacity-90">Sales Director</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-emerald-700 mb-1">SALES PERFORMANCE</h2>
                        <div className="bg-emerald-50 p-2 rounded">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                              <p className="text-xs font-bold text-emerald-800">$25M</p>
                              <p className="text-xs text-emerald-600">Revenue Closed</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-emerald-800">150%</p>
                              <p className="text-xs text-emerald-600">Quota Attainment</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-emerald-700 mb-1">EXPERIENCE</h2>
                        <div className="space-y-1">
                          <div className="border-l-2 border-emerald-400 pl-2">
                            <p className="text-xs font-bold text-gray-900">Sales Director</p>
                            <p className="text-xs text-emerald-600">Salesforce • 2021-2024</p>
                            <p className="text-xs text-gray-700">• Led enterprise sales team (50+ reps)</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-emerald-700 mb-1">SALES EXPERTISE</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded">Enterprise Sales</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded">CRM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'finance' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-blue-200 p-3 overflow-hidden" style={{fontFamily: 'Times, serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="text-center mb-2 pb-2 border-b-2 border-blue-700">
                        <h1 className="text-sm font-bold text-blue-900">RACHEL KIM</h1>
                        <p className="text-xs text-blue-700 font-semibold">Finance Manager</p>
                        <p className="text-xs text-gray-600">CPA, CFA</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-blue-800 uppercase mb-1">FINANCIAL IMPACT</h2>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-center p-1 bg-blue-50 rounded">
                            <p className="text-xs font-bold text-blue-900">$15M</p>
                            <p className="text-xs text-blue-700">Budget Managed</p>
                          </div>
                          <div className="text-center p-1 bg-blue-50 rounded">
                            <p className="text-xs font-bold text-blue-900">20%</p>
                            <p className="text-xs text-blue-700">Cost Reduction</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-blue-800 uppercase mb-1">EXPERIENCE</h2>
                        <div>
                          <p className="text-xs font-bold text-blue-900">Senior Finance Manager</p>
                          <p className="text-xs text-blue-700">Goldman Sachs • 2020-2024</p>
                          <p className="text-xs text-gray-800">• Led financial planning & analysis</p>
                          <p className="text-xs text-gray-800">• Managed M&A due diligence</p>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-blue-800 uppercase mb-1">EXPERTISE</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">FP&A</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">M&A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'devops' && (
                  <div className="aspect-[3/4] bg-slate-900 text-cyan-400 rounded-lg shadow-inner border border-slate-700 p-3 overflow-hidden" style={{fontFamily: 'Monaco, monospace'}}>
                    <div className="text-xs h-full">
                      <div className="border border-cyan-400 p-2 mb-2">
                        <div className="text-cyan-300 text-xs mb-1">$ kubectl get engineer</div>
                        <h1 className="text-sm font-bold text-cyan-400">JAMES_ANDERSON</h1>
                        <div className="text-xs">
                          <div><span className="text-cyan-600">role:</span> devops_engineer</div>
                          <div><span className="text-cyan-600">experience:</span> 6_years</div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-cyan-300 text-xs mb-1">$ cat infrastructure.yml</div>
                        <div className="bg-slate-800 p-2 rounded text-xs">
                          <p className="text-cyan-100">aws_instances: 500+</p>
                          <p className="text-cyan-100">uptime: 99.9%</p>
                          <p className="text-cyan-100">cost_savings: $2M/year</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-cyan-300 text-xs mb-1">$ docker ps --format table</div>
                        <div className="text-xs text-cyan-200">
                          <p>• Built CI/CD pipelines (GitLab, Jenkins)</p>
                          <p>• Managed Kubernetes clusters (100+ pods)</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-cyan-300 text-xs mb-1">$ ls /skills</div>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-cyan-800 text-cyan-100 text-xs rounded">AWS</span>
                          <span className="px-1.5 py-0.5 bg-cyan-800 text-cyan-100 text-xs rounded">K8s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'fullstack' && (
                  <div className="aspect-[3/4] bg-gradient-to-br from-violet-900 to-fuchsia-900 text-white rounded-lg shadow-inner border border-violet-600 p-3 overflow-hidden">
                    <div className="h-full text-xs">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded flex items-center justify-center">
                            <span className="text-xs font-bold">👨‍💻</span>
                          </div>
                          <div>
                            <h1 className="text-sm font-bold">CARLOS MENDEZ</h1>
                            <p className="text-xs text-violet-300">Full Stack Developer</p>
                          </div>
                        </div>
                        <p className="text-xs text-violet-200">carlos.mendez@fullstack.dev</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-fuchsia-300 mb-1">STACK PROFICIENCY</h2>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-violet-800 p-1 rounded text-center">
                            <p className="text-xs font-bold">Frontend</p>
                            <p className="text-xs text-violet-200">React, Vue, Angular</p>
                          </div>
                          <div className="bg-fuchsia-800 p-1 rounded text-center">
                            <p className="text-xs font-bold">Backend</p>
                            <p className="text-xs text-fuchsia-200">Node.js, Python</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-fuchsia-300 mb-1">RECENT PROJECTS</h2>
                        <div className="space-y-1">
                          <div className="border-l-2 border-violet-400 pl-2">
                            <p className="text-xs font-bold">Senior Full Stack Developer</p>
                            <p className="text-xs text-violet-300">Stripe • 2022-2024</p>
                            <p className="text-xs text-violet-100">• Built payment processing system</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-fuchsia-300 mb-1">TECHNOLOGIES</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-violet-700 text-violet-100 text-xs rounded">React</span>
                          <span className="px-1.5 py-0.5 bg-fuchsia-700 text-fuchsia-100 text-xs rounded">Node.js</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'executive' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-300 p-3 overflow-hidden" style={{fontFamily: 'Georgia, serif'}}>
                    <div className="text-black text-xs h-full">
                      <div className="text-center mb-3">
                        <h1 className="text-lg font-light text-gray-900 mb-1">ELIZABETH CHEN</h1>
                        <div className="w-16 h-px bg-gray-400 mx-auto mb-2"></div>
                        <p className="text-xs text-gray-700 font-medium">Chief Executive Officer</p>
                        <p className="text-xs text-gray-600">elizabeth.chen@techcorp.com</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-light text-gray-900 mb-1 text-center">EXECUTIVE SUMMARY</h2>
                        <p className="text-xs text-gray-800 text-center">Fortune 500 CEO with 20+ years leadership experience driving $5B+ in revenue growth</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-light text-gray-900 mb-1 text-center">LEADERSHIP EXPERIENCE</h2>
                        <div className="text-center">
                          <h3 className="text-xs font-semibold text-gray-900">Chief Executive Officer</h3>
                          <p className="text-xs text-gray-700">TechGlobal Inc.</p>
                          <p className="text-xs text-gray-600">2020-2024</p>
                          <div className="w-12 h-px bg-gray-300 mx-auto my-2"></div>
                          <p className="text-xs text-gray-700">• Led $10B company transformation</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center">
                          <h2 className="text-xs font-light text-gray-900">EDUCATION</h2>
                          <p className="text-xs font-semibold">Harvard MBA</p>
                          <p className="text-xs text-gray-600">Stanford BS</p>
                        </div>
                        <div className="text-center">
                          <h2 className="text-xs font-light text-gray-900">BOARD POSITIONS</h2>
                          <p className="text-xs">• Microsoft Board</p>
                          <p className="text-xs">• Y Combinator LP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'mobile' && (
                  <div className="aspect-[3/4] bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-inner border border-green-200 p-3 overflow-hidden">
                    <div className="h-full text-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-12 bg-gradient-to-b from-green-500 to-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-xs font-bold">📱</span>
                        </div>
                        <div>
                          <h1 className="text-sm font-bold text-gray-900">KEVIN PARK</h1>
                          <p className="text-xs text-green-600">iOS/Android Developer</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-green-700 mb-1">APP PORTFOLIO</h2>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-green-100 p-1 rounded text-center">
                            <p className="text-xs font-bold text-green-800">50+</p>
                            <p className="text-xs text-green-600">Apps Built</p>
                          </div>
                          <div className="bg-blue-100 p-1 rounded text-center">
                            <p className="text-xs font-bold text-blue-800">1M+</p>
                            <p className="text-xs text-blue-600">Downloads</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-green-700 mb-1">EXPERIENCE</h2>
                        <div className="space-y-1">
                          <div className="border-l-2 border-green-400 pl-2">
                            <p className="text-xs font-bold text-gray-900">Senior Mobile Developer</p>
                            <p className="text-xs text-green-600">Uber • 2022-2024</p>
                            <p className="text-xs text-gray-700">• Built driver & rider apps (iOS/Android)</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-green-700 mb-1">MOBILE TECHNOLOGIES</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-green-200 text-green-800 text-xs rounded">Swift</span>
                          <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-xs rounded">Kotlin</span>
                          <span className="px-1.5 py-0.5 bg-green-200 text-green-800 text-xs rounded">React Native</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'security' && (
                  <div className="aspect-[3/4] bg-gradient-to-br from-red-900 to-orange-900 text-white rounded-lg shadow-inner border border-red-600 p-3 overflow-hidden">
                    <div className="h-full text-xs">
                      <div className="mb-2 pb-2 border-b border-red-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                            <span className="text-xs">🔒</span>
                          </div>
                          <div>
                            <h1 className="text-sm font-bold">ALEX THOMPSON</h1>
                            <p className="text-xs text-red-300">Security Engineer</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-red-300 mb-1">SECURITY METRICS</h2>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-red-800 p-1 rounded text-center">
                            <p className="text-xs font-bold">99.9%</p>
                            <p className="text-xs text-red-200">Uptime</p>
                          </div>
                          <div className="bg-orange-800 p-1 rounded text-center">
                            <p className="text-xs font-bold">Zero</p>
                            <p className="text-xs text-orange-200">Breaches</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-red-300 mb-1">EXPERIENCE</h2>
                        <div className="space-y-1">
                          <div className="border-l-2 border-red-400 pl-2">
                            <p className="text-xs font-bold">Senior Security Engineer</p>
                            <p className="text-xs text-red-300">CloudFlare • 2022-2024</p>
                            <p className="text-xs text-red-100">• Protected 25M+ websites</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-red-300 mb-1">SECURITY EXPERTISE</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-red-700 text-red-100 text-xs rounded">Penetration Testing</span>
                          <span className="px-1.5 py-0.5 bg-orange-700 text-orange-100 text-xs rounded">CISSP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'research' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-indigo-200 p-3 overflow-hidden" style={{fontFamily: 'Times New Roman, serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="text-center mb-2 pb-2 border-b-2 border-indigo-600">
                        <h1 className="text-sm font-bold text-indigo-900">DR. MARIA GONZALEZ</h1>
                        <p className="text-xs text-indigo-700">Research Scientist, Ph.D.</p>
                        <p className="text-xs text-gray-600">MIT Computer Science Lab</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-indigo-800 uppercase mb-1">RESEARCH IMPACT</h2>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          <div className="bg-indigo-50 p-1 rounded">
                            <p className="text-xs font-bold text-indigo-800">25+</p>
                            <p className="text-xs text-indigo-600">Papers</p>
                          </div>
                          <div className="bg-indigo-50 p-1 rounded">
                            <p className="text-xs font-bold text-indigo-800">500+</p>
                            <p className="text-xs text-indigo-600">Citations</p>
                          </div>
                          <div className="bg-indigo-50 p-1 rounded">
                            <p className="text-xs font-bold text-indigo-800">$2M</p>
                            <p className="text-xs text-indigo-600">Grants</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-indigo-800 uppercase mb-1">EXPERIENCE</h2>
                        <div>
                          <p className="text-xs font-bold text-indigo-900">Principal Research Scientist</p>
                          <p className="text-xs text-indigo-700">MIT CSAIL • 2020-2024</p>
                          <p className="text-xs text-gray-800">• AI/ML research in computer vision</p>
                          <p className="text-xs text-gray-800">• Published in Nature, Science</p>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-indigo-800 uppercase mb-1">SPECIALIZATION</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded">Machine Learning</span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded">Computer Vision</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'startup' && (
                  <div className="aspect-[3/4] bg-gradient-to-br from-purple-900 to-pink-900 text-white rounded-lg shadow-inner border border-purple-500 p-3 overflow-hidden">
                    <div className="h-full text-xs">
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold">🚀</span>
                          </div>
                          <div>
                            <h1 className="text-sm font-bold">JAMIE SILVA</h1>
                            <p className="text-xs text-purple-300">Startup Founder & CEO</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-pink-300 mb-1">STARTUP ACHIEVEMENTS</h2>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-purple-800 p-1 rounded text-center">
                            <p className="text-xs font-bold">$50M</p>
                            <p className="text-xs text-purple-200">Raised</p>
                          </div>
                          <div className="bg-pink-800 p-1 rounded text-center">
                            <p className="text-xs font-bold">3x</p>
                            <p className="text-xs text-pink-200">Exits</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-pink-300 mb-1">FOUNDED COMPANIES</h2>
                        <div className="space-y-1">
                          <div className="border-l-2 border-purple-400 pl-2">
                            <p className="text-xs font-bold">Founder & CEO</p>
                            <p className="text-xs text-purple-300">TechFlow AI • 2022-2024</p>
                            <p className="text-xs text-purple-100">• Series B ($25M) • 100+ employees</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-pink-300 mb-1">EXPERTISE</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-purple-700 text-purple-100 text-xs rounded">Product Strategy</span>
                          <span className="px-1.5 py-0.5 bg-pink-700 text-pink-100 text-xs rounded">Fundraising</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'academic' && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-300 p-3 overflow-hidden" style={{fontFamily: 'Times New Roman, serif'}}>
                    <div className="h-full text-black text-xs">
                      <div className="text-center mb-2 pb-2">
                        <h1 className="text-sm font-bold text-gray-900 mb-1">PROFESSOR DAVID WILSON</h1>
                        <p className="text-xs text-gray-700">Associate Professor of Computer Science</p>
                        <p className="text-xs text-gray-600">Stanford University</p>
                        <p className="text-xs text-gray-500">david.wilson@stanford.edu</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-gray-800 uppercase mb-1">ACADEMIC PROFILE</h2>
                        <div className="text-xs text-gray-700 space-y-0.5">
                          <p>• Ph.D. Computer Science, MIT (2015)</p>
                          <p>• 50+ peer-reviewed publications</p>
                          <p>• H-index: 32, Citations: 2,500+</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-gray-800 uppercase mb-1">TEACHING & RESEARCH</h2>
                        <div className="text-xs text-gray-700">
                          <p className="font-semibold">Associate Professor</p>
                          <p>Stanford University • 2020-Present</p>
                          <p>• Distributed Systems, Database Theory</p>
                          <p>• NSF CAREER Award recipient</p>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-gray-800 uppercase mb-1">SPECIALIZATION</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">Database Systems</span>
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">Algorithms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.id === 'freelancer' && (
                  <div className="aspect-[3/4] bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-inner border border-yellow-200 p-3 overflow-hidden">
                    <div className="h-full text-xs">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">JD</span>
                          </div>
                          <div>
                            <h1 className="text-sm font-bold text-gray-900">JORDAN DAVIS</h1>
                            <p className="text-xs text-yellow-700">Independent Contractor</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">jordan@freelance.dev • Available for hire</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-yellow-700 mb-1">CLIENT SUCCESS</h2>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          <div className="bg-yellow-100 p-1 rounded">
                            <p className="text-xs font-bold text-yellow-800">200+</p>
                            <p className="text-xs text-yellow-600">Projects</p>
                          </div>
                          <div className="bg-amber-100 p-1 rounded">
                            <p className="text-xs font-bold text-amber-800">5.0★</p>
                            <p className="text-xs text-amber-600">Rating</p>
                          </div>
                          <div className="bg-yellow-100 p-1 rounded">
                            <p className="text-xs font-bold text-yellow-800">$500K</p>
                            <p className="text-xs text-yellow-600">Earned</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold text-yellow-700 mb-1">RECENT WORK</h2>
                        <div className="space-y-1">
                          <div className="border-l-2 border-yellow-400 pl-2">
                            <p className="text-xs font-bold text-gray-900">Full Stack Developer</p>
                            <p className="text-xs text-yellow-600">Various Clients • 2020-2024</p>
                            <p className="text-xs text-gray-700">• 50+ web applications delivered</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-yellow-700 mb-1">SERVICES OFFERED</h2>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">Web Development</span>
                          <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 text-xs rounded">Consulting</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default template for others - disabled as all templates now have custom previews */}
                {false && (
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-inner border border-gray-200 p-3 overflow-hidden">
                    <div className="h-full w-full text-black text-xs leading-tight">
                      <div className="text-center border-b border-gray-300 pb-2 mb-2">
                        <h1 className="text-sm font-bold uppercase tracking-wider text-gray-900">JOHN SMITH</h1>
                        <p className="text-xs text-gray-600 mt-1">{template.name.split(' ')[0]} Professional</p>
                        <p className="text-xs text-gray-500">john@email.com • (555) 123-4567</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">EXPERIENCE</h2>
                        <p className="text-xs font-semibold">Senior {template.name.split(' ')[0]}</p>
                        <p className="text-xs text-gray-600 italic">Professional Corp</p>
                        <p className="text-xs text-gray-700">• Industry expertise</p>
                      </div>
                      <div className="mb-2">
                        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">SKILLS</h2>
                        <p className="text-xs text-gray-700">Industry-specific skills and expertise</p>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">EDUCATION</h2>
                        <p className="text-xs font-semibold">Bachelor's Degree</p>
                        <p className="text-xs text-gray-600 italic">University</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {template.id === 'atlantic-blue' && 'Multi-column design with blue sidebar - perfect for marketing and business professionals'}
                    {template.id === 'executive' && 'Classic serif design with black and white palette - ideal for C-suite executives'}
                    {template.id === 'blue-steel' && 'Minimalistic professional template with clean blue accents'}
                    {template.id === 'rosewood' && 'Two-column layout designed specifically for creative professionals'}
                    {template.id === 'simply-blue' && 'Clean minimalistic design with subtle blue accents and centered layout'}
                    {template.id === 'mercury' && 'One-column header-focused design with classic professional styling'}
                    {template.id === 'classic' && 'Simple traditional design with blue accent - timeless and professional'}
                    {template.id === 'hunter-green' && 'Multi-column left-aligned template with green theme for business professionals'}
                    {template.id === 'grenadine' && 'Multi-column template with elegant borders and sophisticated design'}
                    {template.id === 'modern-pro' && 'Contemporary professional design with clean lines and modern typography'}
                    {template.id === 'minimal-white' && 'Ultra-clean minimalist design with maximum white space'}
                    {template.id === 'corporate-blue' && 'Traditional corporate design with professional blue color scheme'}
                    {template.id === 'creative-orange' && 'Vibrant creative template with orange accents for designers'}
                    {template.id === 'tech-gray' && 'Modern technical template with gray tones for developers'}
                    {template.id === 'business-green' && 'Professional business template with green accent colors'}
                    {template.id === 'elegant-purple' && 'Sophisticated template with purple accents for senior professionals'}
                    {template.id === 'startup-red' && 'Dynamic template with red accents perfect for startup environments'}
                    {template.id === 'academic-navy' && 'Traditional academic CV template with navy blue professional styling'}
                    {template.id === 'consultant-black' && 'Premium consulting template with black and white professional design'}
                    {template.id === 'designer-pink' && 'Creative portfolio template with pink accents for design professionals'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      ATS Optimized
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Professional Layout
                    </div>
                  </div>

                  <Button 
                    className={`w-full ${selectedTemplate === template.id ? 'bg-purple-600' : ''} pointer-events-auto relative z-10`}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    onClick={(e) => handleUseTemplate(template, e)}
                    style={{pointerEvents: 'auto'}}
                  >
                    {selectedTemplate === template.id ? 'Use This Template' : 
                     template.isFree ? 'Use Free Template' : `Use Template - $${template.price}`}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="px-12"
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplate);
                  if (template) handleUseTemplate(template);
                }}
              >
                Continue with Selected Template
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};