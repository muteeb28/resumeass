"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Navbar } from "./navbar";

interface Template {
  id: string;
  name: string;
  price: number;
  isFree: boolean;
}

// These components are not used anymore, but keeping for reference
// const ModernTemplatePreview = () => (...);
// const ExecutiveTemplatePreview = () => (...);
// const CreativeTemplatePreview = () => (...);

export const CreateResumeTest = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  const handleUseTemplate = (template: Template, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent card click
      event.preventDefault();
    }
    if (template.isFree) {
      // For free template, navigate to resume builder
      router.push(`/build/${template.id}`);
    } else {
      // For paid templates, show payment flow (for now, just navigate - payment integration later)
      alert(`✨ ${template.name} - Premium Template\n\nPrice: $${template.price}\n\nFor demo purposes, proceeding to resume builder. Payment integration coming soon!`);
      router.push(`/build/${template.id}`);
    }
  };

  const templates: Template[] = [
    { id: 'modern', name: 'Modern Professional', price: 0, isFree: true },
    { id: 'executive', name: 'Executive Premium', price: 12, isFree: false },
    { id: 'creative', name: 'Creative Designer', price: 15, isFree: false },
    { id: 'minimal', name: 'Minimal Clean', price: 8, isFree: false },
    { id: 'corporate', name: 'Corporate Elite', price: 18, isFree: false },
    { id: 'tech', name: 'Tech Specialist', price: 10, isFree: false },
    { id: 'product-manager', name: 'Senior Product Manager', price: 14, isFree: false }
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                <div className="aspect-[3/4] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  {template.id === 'modern' && (
                    <div className="w-full h-full flex" style={{fontSize: '6px', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      {/* Left Sidebar - AltaCV Style */}
                      <div className="w-1/3 bg-slate-800 text-white p-3">
                        <div className="mb-4">
                          <h1 className="text-lg font-bold mb-1" style={{fontFamily: 'system-ui, sans-serif'}}>DAVID CHEN</h1>
                          <p className="text-xs text-slate-300 font-medium">Software Engineer</p>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-xs font-bold mb-2 text-slate-200 uppercase tracking-wide">Contact</h2>
                          <div className="text-xs text-slate-300 space-y-1">
                            <p>📧 david.chen@gmail.com</p>
                            <p>📱 +1 (555) 123-4567</p>
                            <p>📍 San Francisco, CA</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h2 className="text-xs font-bold mb-2 text-slate-200 uppercase tracking-wide">Skills</h2>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1 py-0.5 bg-blue-600 text-xs rounded">React</span>
                            <span className="px-1 py-0.5 bg-blue-600 text-xs rounded">Node.js</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Main Content */}
                      <div className="w-2/3 p-3" style={{fontFamily: 'system-ui, sans-serif'}}>
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Experience</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="font-bold text-xs text-gray-900">Senior Software Engineer</h3>
                                  <p className="text-xs text-blue-700 font-medium">Google LLC</p>
                                </div>
                                <span className="text-xs text-gray-600">2021 – Present</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Led development of search infrastructure serving 8B+ queries daily</li>
                                <li>• Improved search relevance by 15% through ML model optimization</li>
                                <li>• Mentored 5 junior engineers and conducted technical interviews</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="font-bold text-xs text-gray-900">Software Engineer</h3>
                                  <p className="text-xs text-blue-700 font-medium">Meta (Facebook)</p>
                                </div>
                                <span className="text-xs text-gray-600">2019 – 2021</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Built real-time messaging features for 2B+ users</li>
                                <li>• Reduced message delivery latency by 40% across global data centers</li>
                                <li>• Collaborated with cross-functional teams on privacy initiatives</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="font-bold text-xs text-gray-900">Software Engineer Intern</h3>
                                  <p className="text-xs text-blue-700 font-medium">Airbnb</p>
                                </div>
                                <span className="text-xs text-gray-600">Summer 2018</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Developed booking optimization algorithms increasing conversion by 8%</li>
                                <li>• Implemented A/B testing framework for mobile applications</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Education</h2>
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-bold text-xs text-gray-900">Master of Science, Computer Science</h3>
                                <p className="text-xs text-blue-700 font-medium">Stanford University</p>
                              </div>
                              <span className="text-xs text-gray-600">2017 – 2019</span>
                            </div>
                            <p className="text-xs text-gray-700">GPA: 3.85/4.0 • Focus: Machine Learning & Distributed Systems</p>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-bold text-xs text-gray-900">Bachelor of Science, Computer Engineering</h3>
                                <p className="text-xs text-blue-700 font-medium">UC Berkeley</p>
                              </div>
                              <span className="text-xs text-gray-600">2013 – 2017</span>
                            </div>
                            <p className="text-xs text-gray-700">Magna Cum Laude • Phi Beta Kappa</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Projects</h2>
                          <div className="space-y-1">
                            <div>
                              <h3 className="font-bold text-xs text-gray-900">Open Source Contributor</h3>
                              <p className="text-xs text-gray-700">• TensorFlow: Contributed to core ML training pipeline (500+ stars)</p>
                              <p className="text-xs text-gray-700">• React: Fixed critical performance bug affecting millions of users</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Awards</h2>
                          <div className="text-xs text-gray-700 space-y-0.5">
                            <p>• Google Peer Bonus Award (2022, 2023)</p>
                            <p>• Meta Hackathon Winner (2020)</p>
                            <p>• Stanford Graduate Fellowship</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'executive' && (
                    <div className="w-full h-full text-black p-4" style={{fontSize: '6px', fontFamily: 'Times, serif', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      {/* Classic Academic Header */}
                      <div className="text-center mb-4 border-b-2 border-gray-900 pb-3">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Times, serif'}}>Dr. Margaret Thompson</h1>
                        <p className="text-sm text-gray-700 mb-2">Professor of Economics • Harvard University</p>
                        <div className="text-xs text-gray-600">
                          <p>Department of Economics, Harvard University, Cambridge, MA 02138</p>
                          <p>Email: mthompson@harvard.edu • Phone: +1 (617) 495-2144</p>
                          <p>Website: scholar.harvard.edu/mthompson • ORCID: 0000-0002-1234-5678</p>
                        </div>
                      </div>
                      
                      {/* Academic Positions */}
                      <div className="mb-3">
                        <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Academic Positions</h2>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold text-xs">Professor of Economics</p>
                              <p className="text-xs italic text-gray-700">Harvard University, Cambridge, MA</p>
                            </div>
                            <span className="text-xs">2018 – Present</span>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold text-xs">Associate Professor of Economics</p>
                              <p className="text-xs italic text-gray-700">MIT Sloan School of Management, Cambridge, MA</p>
                            </div>
                            <span className="text-xs">2012 – 2018</span>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold text-xs">Assistant Professor of Economics</p>
                              <p className="text-xs italic text-gray-700">University of Chicago Booth School, Chicago, IL</p>
                            </div>
                            <span className="text-xs">2007 – 2012</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Education */}
                      <div className="mb-3">
                        <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Education</h2>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold text-xs">Ph.D. in Economics</p>
                              <p className="text-xs italic text-gray-700">Princeton University</p>
                              <p className="text-xs text-gray-600">Dissertation: "Labor Market Dynamics in Digital Economies"</p>
                            </div>
                            <span className="text-xs">2007</span>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold text-xs">M.A. in Economics</p>
                              <p className="text-xs italic text-gray-700">Princeton University</p>
                            </div>
                            <span className="text-xs">2005</span>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold text-xs">B.A. in Economics, summa cum laude</p>
                              <p className="text-xs italic text-gray-700">Yale University</p>
                              <p className="text-xs text-gray-600">Phi Beta Kappa</p>
                            </div>
                            <span className="text-xs">2003</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Selected Publications */}
                      <div className="mb-3">
                        <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Selected Publications</h2>
                        <div className="text-xs text-gray-800 space-y-1 leading-relaxed">
                          <p>"Digital Labor Markets and Wage Inequality," <em>American Economic Review</em>, 2023, 113(4): 1045-1089.</p>
                          <p>"Platform Economics and Market Concentration," <em>Quarterly Journal of Economics</em>, 2022, 137(2): 567-612.</p>
                          <p>"Remote Work and Productivity: Evidence from the Pandemic," <em>Journal of Political Economy</em>, 2021, 129(8): 2204-2245.</p>
                          <p>"Automation and Employment Dynamics," <em>Review of Economic Studies</em>, 2020, 87(3): 1123-1165.</p>
                        </div>
                      </div>
                      
                      {/* Research & Grants */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Research Interests</h2>
                          <div className="text-xs text-gray-800 space-y-0.5">
                            <p>• Labor Economics</p>
                            <p>• Digital Platform Markets</p>
                            <p>• Technology and Employment</p>
                            <p>• Income Inequality</p>
                            <p>• Macroeconomic Policy</p>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Grants & Awards</h2>
                          <div className="text-xs text-gray-800 space-y-0.5">
                            <p>• NSF Career Award ($500K), 2019-2024</p>
                            <p>• Sloan Research Fellowship, 2016</p>
                            <p>• John Bates Clark Medal Nominee, 2020</p>
                            <p>• AEA Best Paper Award, 2023</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Service & Other Activities */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Editorial Service</h2>
                          <div className="text-xs text-gray-800 space-y-0.5">
                            <p>• Associate Editor, <em>AER</em>, 2021-Present</p>
                            <p>• Editorial Board, <em>QJE</em>, 2019-2022</p>
                            <p>• Referee for top economics journals</p>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-bold mb-2 text-gray-900 uppercase">Professional Service</h2>
                          <div className="text-xs text-gray-800 space-y-0.5">
                            <p>• Federal Reserve Bank of Boston, Advisor</p>
                            <p>• NBER Research Associate</p>
                            <p>• AEA Program Committee, 2022</p>
                            <p>• Congressional Budget Office, Consultant</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'creative' && (
                    <div className="w-full h-full bg-white text-black p-4" style={{fontSize: '6px', fontFamily: 'system-ui, sans-serif', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      {/* Simple Minimalist Header */}
                      <div className="text-left mb-4 border-b border-gray-300 pb-3">
                        <h1 className="text-2xl font-light text-gray-900 mb-1" style={{fontFamily: 'system-ui, sans-serif'}}>Emma Rodriguez</h1>
                        <p className="text-sm text-gray-700 font-normal mb-2">UX Designer</p>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p>emma.rodriguez@design.co • +1 (415) 555-0192</p>
                          <p>San Francisco, CA • emma-rodriguez.com • linkedin.com/in/emmarodriguez</p>
                        </div>
                      </div>
                      
                      {/* Experience Section */}
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold mb-2 text-gray-900 uppercase tracking-wide">Experience</h2>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-semibold text-xs text-gray-900">Senior UX Designer</h3>
                                <p className="text-xs text-gray-700">Spotify — New York, NY</p>
                              </div>
                              <span className="text-xs text-gray-600">2021 — Present</span>
                            </div>
                            <ul className="text-xs text-gray-700 space-y-0.5">
                              <li>• Led design for Spotify's discovery algorithms, increasing user engagement by 25%</li>
                              <li>• Designed mobile interface improvements used by 400M+ monthly active users</li>
                              <li>• Conducted user research across 15 global markets for podcast features</li>
                              <li>• Collaborated with engineering teams to implement design system at scale</li>
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-semibold text-xs text-gray-900">Product Designer</h3>
                                <p className="text-xs text-gray-700">Airbnb — San Francisco, CA</p>
                              </div>
                              <span className="text-xs text-gray-600">2019 — 2021</span>
                            </div>
                            <ul className="text-xs text-gray-700 space-y-0.5">
                              <li>• Redesigned host onboarding flow, reducing drop-off rates by 30%</li>
                              <li>• Designed accessibility features improving platform usability for disabled users</li>
                              <li>• Led cross-functional team to launch new booking experience</li>
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-semibold text-xs text-gray-900">UX Designer</h3>
                                <p className="text-xs text-gray-700">Uber — San Francisco, CA</p>
                              </div>
                              <span className="text-xs text-gray-600">2017 — 2019</span>
                            </div>
                            <ul className="text-xs text-gray-700 space-y-0.5">
                              <li>• Designed rider app features for emerging markets in Latin America</li>
                              <li>• Improved driver signup conversion by 40% through UX optimization</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Education */}
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold mb-2 text-gray-900 uppercase tracking-wide">Education</h2>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold text-xs text-gray-900">Master of Fine Arts, Interaction Design</p>
                              <p className="text-xs text-gray-700">School of Visual Arts, New York</p>
                            </div>
                            <span className="text-xs text-gray-600">2017</span>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold text-xs text-gray-900">Bachelor of Arts, Graphic Design</p>
                              <p className="text-xs text-gray-700">UCLA, Los Angeles</p>
                            </div>
                            <span className="text-xs text-gray-600">2015</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Skills and Awards in Two Columns */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h2 className="text-sm font-semibold mb-2 text-gray-900 uppercase tracking-wide">Skills</h2>
                          <div className="text-xs text-gray-700 space-y-1">
                            <div>
                              <p className="font-medium">Design Tools</p>
                              <p>Figma, Sketch, Adobe Creative Suite, Principle, Framer</p>
                            </div>
                            <div>
                              <p className="font-medium">Research Methods</p>
                              <p>User Interviews, Usability Testing, A/B Testing, Analytics</p>
                            </div>
                            <div>
                              <p className="font-medium">Technical</p>
                              <p>HTML/CSS, React Basics, Design Systems, Prototyping</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-semibold mb-2 text-gray-900 uppercase tracking-wide">Recognition</h2>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p>• Webby Awards — Best Mobile App Design (2023)</p>
                            <p>• UX Design Awards — Gold Winner (2022)</p>
                            <p>• Fast Company — Most Creative People (2021)</p>
                            <p>• Design + Research — Featured Case Study (2020)</p>
                          </div>
                          
                          <h2 className="text-sm font-semibold mb-2 mt-3 text-gray-900 uppercase tracking-wide">Languages</h2>
                          <div className="text-xs text-gray-700 space-y-0.5">
                            <p>English (Native), Spanish (Fluent), Portuguese (Conversational)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'minimal' && (
                    <div className="w-full h-full bg-white text-black p-4" style={{fontSize: '6px', fontFamily: 'system-ui, sans-serif', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      <div className="text-center mb-4">
                        <h1 className="text-3xl font-thin text-gray-900 mb-1">ALEX MINIMAL</h1>
                        <div className="w-16 h-0.5 bg-gray-400 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Frontend Developer</p>
                        <p className="text-xs text-gray-500 mt-1">alex@minimal.dev • +1 (555) 000-0000 • Berlin, Germany</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-sm font-medium mb-2 text-gray-800">EXPERIENCE</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Senior Frontend Developer</span>
                                <span className="text-gray-600">2022 — Present</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">Vercel • Remote</p>
                              <p className="text-xs text-gray-700">Built Next.js dashboard components used by 1M+ developers worldwide</p>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Frontend Developer</span>
                                <span className="text-gray-600">2020 — 2022</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">Shopify • Berlin</p>
                              <p className="text-xs text-gray-700">Developed checkout flow improvements increasing conversion by 12%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h2 className="text-sm font-medium mb-2 text-gray-800">SKILLS</h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>React, Next.js, TypeScript</p>
                              <p>Tailwind CSS, Framer Motion</p>
                              <p>Node.js, GraphQL, PostgreSQL</p>
                            </div>
                          </div>
                          <div>
                            <h2 className="text-sm font-medium mb-2 text-gray-800">EDUCATION</h2>
                            <div className="text-xs">
                              <p className="font-medium">B.S. Computer Science</p>
                              <p className="text-gray-600">Technical University of Berlin</p>
                              <p className="text-gray-500">2020</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'corporate' && (
                    <div className="w-full h-full bg-white text-black" style={{fontSize: '6px', fontFamily: 'Times, serif', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      <div className="bg-gray-900 text-white p-3 mb-3">
                        <h1 className="text-2xl font-bold mb-1">RICHARD STERLING</h1>
                        <p className="text-sm">Managing Director • Investment Banking</p>
                        <div className="flex justify-between text-xs mt-2">
                          <span>richard.sterling@goldmansachs.com</span>
                          <span>+1 (212) 555-0199</span>
                        </div>
                      </div>
                      
                      <div className="px-3">
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-gray-900 border-b border-gray-300">EXECUTIVE SUMMARY</h2>
                          <p className="text-xs text-gray-800 leading-relaxed">
                            Senior investment banking professional with 15+ years experience executing $50B+ in M&A transactions. 
                            Proven track record of leading cross-border deals for Fortune 500 clients across technology, healthcare, and financial services sectors.
                          </p>
                        </div>
                        
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-gray-900 border-b border-gray-300">PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <div>
                                  <p className="font-bold">Managing Director</p>
                                  <p className="italic">Goldman Sachs • New York, NY</p>
                                </div>
                                <span>2018 — Present</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Led $15B acquisition of biotech company for Pfizer</li>
                                <li>• Generated $250M+ in fees across 25+ completed transactions</li>
                                <li>• Managed team of 12 VPs and Associates</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <div>
                                  <p className="font-bold">Vice President</p>
                                  <p className="italic">Morgan Stanley • New York, NY</p>
                                </div>
                                <span>2014 — 2018</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Executed IPO for $2B tech unicorn raising $500M</li>
                                <li>• Advised on strategic acquisitions in SaaS sector</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h2 className="text-sm font-bold mb-2 text-gray-900 border-b border-gray-300">EDUCATION</h2>
                            <div className="text-xs">
                              <p className="font-bold">MBA, Finance</p>
                              <p>Wharton School</p>
                              <p className="text-gray-600">2014</p>
                            </div>
                          </div>
                          <div>
                            <h2 className="text-sm font-bold mb-2 text-gray-900 border-b border-gray-300">CERTIFICATIONS</h2>
                            <div className="text-xs text-gray-700 space-y-0.5">
                              <p>• Series 7, 63, 79</p>
                              <p>• CFA Charterholder</p>
                              <p>• FINRA Registered</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'tech' && (
                    <div className="w-full h-full bg-slate-50 text-black" style={{fontSize: '6px', fontFamily: 'system-ui, sans-serif', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      <div className="bg-blue-600 text-white p-3 mb-3">
                        <h1 className="text-xl font-bold mb-1">SARAH TECH</h1>
                        <p className="text-sm">DevOps Engineer</p>
                        <div className="text-xs mt-1">
                          <p>sarah.tech@kubernetes.io • github.com/sarahtech • San Francisco, CA</p>
                        </div>
                      </div>
                      
                      <div className="px-3">
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-blue-800 border-b-2 border-blue-600">TECHNICAL EXPERTISE</h2>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="font-semibold text-gray-900">Cloud Platforms</p>
                              <p className="text-gray-700">AWS, GCP, Azure</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Container Tech</p>
                              <p className="text-gray-700">Docker, Kubernetes</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Infrastructure</p>
                              <p className="text-gray-700">Terraform, Ansible</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h2 className="text-sm font-bold mb-2 text-blue-800 border-b-2 border-blue-600">EXPERIENCE</h2>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <div>
                                  <p className="font-bold text-gray-900">Senior DevOps Engineer</p>
                                  <p className="text-blue-700">Docker Inc. • San Francisco, CA</p>
                                </div>
                                <span className="text-gray-600">2021 — Present</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Built CI/CD pipelines reducing deployment time by 80%</li>
                                <li>• Managed Kubernetes clusters serving 10M+ container pulls/day</li>
                                <li>• Implemented monitoring stack with Prometheus and Grafana</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <div>
                                  <p className="font-bold text-gray-900">Cloud Engineer</p>
                                  <p className="text-blue-700">HashiCorp • San Francisco, CA</p>
                                </div>
                                <span className="text-gray-600">2019 — 2021</span>
                              </div>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                <li>• Automated infrastructure provisioning saving 40+ hours/week</li>
                                <li>• Migrated monolith to microservices architecture</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h2 className="text-sm font-bold mb-2 text-blue-800 border-b border-blue-400">CERTIFICATIONS</h2>
                            <div className="text-xs text-gray-700 space-y-0.5">
                              <p>• AWS Solutions Architect Pro</p>
                              <p>• Certified Kubernetes Admin</p>
                              <p>• HashiCorp Terraform Associate</p>
                            </div>
                          </div>
                          <div>
                            <h2 className="text-sm font-bold mb-2 text-blue-800 border-b border-blue-400">OPEN SOURCE</h2>
                            <div className="text-xs text-gray-700 space-y-0.5">
                              <p>• Kubernetes contributor (500+ commits)</p>
                              <p>• Helm chart maintainer</p>
                              <p>• CNCF Ambassador</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'product-manager' && (
                    <div className="w-full h-full bg-white text-black" style={{fontSize: '6px', fontFamily: 'system-ui, sans-serif', transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}>
                      {/* Header with Hunter Green accent */}
                      <div className="border-b-2 border-emerald-800 pb-3 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-2xl font-bold text-emerald-900 mb-1">VANESSA FORD</h1>
                            <p className="text-sm text-emerald-700 font-semibold mb-2">Senior Product Manager</p>
                          </div>
                          <div className="text-right text-xs text-gray-700">
                            <p>vanessa.ford@productco.com</p>
                            <p>+1 (415) 555-0147</p>
                            <p>San Francisco, CA</p>
                            <p>linkedin.com/in/vanessaford</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {/* Left Column - Narrower */}
                        <div className="w-1/3 space-y-3">
                          {/* Core Competencies */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">CORE COMPETENCIES</h2>
                            <div className="text-xs text-gray-800 space-y-1">
                              <p>• Product Strategy & Roadmapping</p>
                              <p>• User Research & Analytics</p>
                              <p>• Cross-functional Leadership</p>
                              <p>• Agile/Scrum Methodologies</p>
                              <p>• A/B Testing & Optimization</p>
                              <p>• Market Analysis & Positioning</p>
                              <p>• Technical Product Management</p>
                            </div>
                          </div>

                          {/* Technical Skills */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">TECHNICAL SKILLS</h2>
                            <div className="text-xs text-gray-800 space-y-1">
                              <p><span className="font-semibold">Analytics:</span> Mixpanel, Amplitude, Google Analytics, Tableau</p>
                              <p><span className="font-semibold">Design:</span> Figma, Sketch, Miro, Whimsical</p>
                              <p><span className="font-semibold">Development:</span> SQL, Python, API Design, REST</p>
                              <p><span className="font-semibold">Tools:</span> Jira, Confluence, Slack, Notion</p>
                            </div>
                          </div>

                          {/* Education */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">EDUCATION</h2>
                            <div className="space-y-1">
                              <div>
                                <p className="font-bold text-xs text-gray-900">MBA, Strategy & Innovation</p>
                                <p className="text-xs text-gray-700">Stanford Graduate School of Business</p>
                                <p className="text-xs text-gray-600">2018</p>
                              </div>
                              <div className="mt-2">
                                <p className="font-bold text-xs text-gray-900">B.S. Computer Science</p>
                                <p className="text-xs text-gray-700">UC Berkeley</p>
                                <p className="text-xs text-gray-600">2014</p>
                              </div>
                            </div>
                          </div>

                          {/* Certifications */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">CERTIFICATIONS</h2>
                            <div className="text-xs text-gray-800 space-y-0.5">
                              <p>• Certified Scrum Product Owner</p>
                              <p>• Google Analytics Certified</p>
                              <p>• Product Management Certificate (General Assembly)</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Wider Main Content */}
                        <div className="w-2/3 space-y-3">
                          {/* Professional Summary */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">PROFESSIONAL SUMMARY</h2>
                            <p className="text-xs text-gray-800 leading-relaxed">
                              Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative products that drive user engagement and business growth. Expertise in end-to-end product lifecycle management, from ideation to launch, with a proven track record of increasing user adoption by 40%+ and revenue by $50M+. Strong technical background combined with strategic business acumen.
                            </p>
                          </div>

                          {/* Professional Experience */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">PROFESSIONAL EXPERIENCE</h2>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="font-bold text-xs text-gray-900">Senior Product Manager</h3>
                                    <p className="text-xs text-emerald-700 font-medium">Meta (Facebook) • Menlo Park, CA</p>
                                  </div>
                                  <span className="text-xs text-gray-600">2021 — Present</span>
                                </div>
                                <ul className="text-xs text-gray-800 space-y-0.5 leading-relaxed">
                                  <li>• Led product strategy for Instagram Shopping, driving $2B+ in annual GMV</li>
                                  <li>• Launched AR try-on features, increasing purchase conversion by 35%</li>
                                  <li>• Managed cross-functional team of 25+ engineers, designers, and data scientists</li>
                                  <li>• Implemented A/B testing framework reducing time-to-insight by 50%</li>
                                  <li>• Collaborated with business teams to expand merchant ecosystem by 200%</li>
                                </ul>
                              </div>

                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="font-bold text-xs text-gray-900">Product Manager</h3>
                                    <p className="text-xs text-emerald-700 font-medium">Uber • San Francisco, CA</p>
                                  </div>
                                  <span className="text-xs text-gray-600">2019 — 2021</span>
                                </div>
                                <ul className="text-xs text-gray-800 space-y-0.5 leading-relaxed">
                                  <li>• Owned rider app experience for 50M+ monthly active users</li>
                                  <li>• Redesigned core booking flow, improving completion rates by 25%</li>
                                  <li>• Launched dynamic pricing optimization, increasing driver utilization by 30%</li>
                                  <li>• Built real-time matching algorithm reducing wait times by 40%</li>
                                </ul>
                              </div>

                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="font-bold text-xs text-gray-900">Associate Product Manager</h3>
                                    <p className="text-xs text-emerald-700 font-medium">Airbnb • San Francisco, CA</p>
                                  </div>
                                  <span className="text-xs text-gray-600">2017 — 2019</span>
                                </div>
                                <ul className="text-xs text-gray-800 space-y-0.5 leading-relaxed">
                                  <li>• Developed host onboarding experience, reducing churn by 20%</li>
                                  <li>• Led growth initiatives for emerging markets, expanding user base by 150%</li>
                                  <li>• Collaborated with legal and policy teams on regulatory compliance</li>
                                </ul>
                              </div>

                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="font-bold text-xs text-gray-900">Product Analyst</h3>
                                    <p className="text-xs text-emerald-700 font-medium">LinkedIn • Mountain View, CA</p>
                                  </div>
                                  <span className="text-xs text-gray-600">2015 — 2017</span>
                                </div>
                                <ul className="text-xs text-gray-800 space-y-0.5 leading-relaxed">
                                  <li>• Analyzed user engagement metrics for LinkedIn Learning platform</li>
                                  <li>• Built data pipeline infrastructure supporting 500M+ user profiles</li>
                                  <li>• Created executive dashboards tracking key business metrics</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Key Achievements */}
                          <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-600 pb-1">KEY ACHIEVEMENTS</h2>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-800">
                              <div className="bg-emerald-50 p-2 rounded">
                                <p className="font-bold text-emerald-900">$50M+</p>
                                <p>Revenue Generated</p>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded">
                                <p className="font-bold text-emerald-900">40%</p>
                                <p>User Adoption Increase</p>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded">
                                <p className="font-bold text-emerald-900">25+</p>
                                <p>Products Launched</p>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded">
                                <p className="font-bold text-emerald-900">100M+</p>
                                <p>Users Impacted</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {template.id === 'modern' && 'Clean, ATS-friendly design perfect for tech roles'}
                    {template.id === 'executive' && 'Academic CV format for professors and researchers'}
                    {template.id === 'creative' && 'Minimalist design for UX/UI professionals'}
                    {template.id === 'minimal' && 'Ultra-clean design for modern professionals'}
                    {template.id === 'corporate' && 'Premium format for finance and consulting'}
                    {template.id === 'tech' && 'Technical resume for DevOps and engineers'}
                    {template.id === 'product-manager' && 'Professional template with hunter green accents for product managers'}
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