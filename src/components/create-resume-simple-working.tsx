import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';

export const CreateResumeSimpleWorking = () => {
  const router = useRouter();

  const handleTemplateSelect = (template: any) => {
    if (template.isFree || window.confirm(`This template costs $${template.price}. Continue?`)) {
      router.push(`/build/${template.id}`);
    }
  };

  const templates = [
    { id: 'faangpath-simple', name: 'FAANGPath Simple', price: 0, isFree: true },
    { id: 'deedy-reversed', name: 'Deedy Reversed', price: 12, isFree: false },
    { id: 'luxsleek-cv', name: 'LuxSleek CV', price: 15, isFree: false }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Choose Your Perfect Template</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select from our collection of beautifully designed, ATS-optimized resume templates
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="cursor-pointer transform hover:scale-102 transition-transform duration-300"
                onClick={() => handleTemplateSelect(template)}
              >
                {/* FAANGPath Simple Template */}
                {template.id === 'faangpath-simple' ? (
                  <div className="w-full aspect-[8.5/11] bg-white rounded-lg shadow-2xl overflow-hidden transform scale-[0.65] origin-top" style={{ fontFamily: 'Times, serif', fontSize: '5px', lineHeight: '1.1' }}>
                    <div className="min-h-full p-6">
                      {/* Header */}
                      <div className="text-center mb-2">
                        <h1 className="text-base font-bold text-black mb-1">Your Name</h1>
                        <div className="text-sm text-black">
                          <p>Your Address | Your City, State ZIP</p>
                          <p>Your Phone | Your Email</p>
                        </div>
                      </div>

                      {/* Objective */}
                      <div className="mb-2">
                        <h2 className="text-sm font-bold text-black mb-1 uppercase">Objective</h2>
                        <p className="text-sm text-black leading-tight text-justify">
                          To obtain a challenging position in software engineering where I can apply my technical skills
                          and contribute to innovative projects while growing professionally in a dynamic environment.
                        </p>
                      </div>

                      {/* Education */}
                      <div className="mb-1.5">
                        <h2 className="text-sm font-bold text-black mb-0.5 uppercase">Education</h2>
                        <div className="text-sm text-black mb-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">Bachelor of Science in Computer Science</p>
                              <p>University Name, City, State</p>
                              <p>Relevant Coursework: Data Structures, Algorithms, Software Engineering</p>
                            </div>
                            <span className="whitespace-nowrap ml-2">Expected May 2024</span>
                          </div>
                          <p className="mt-0.5">GPA: 3.8/4.0</p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-1.5">
                        <h2 className="text-sm font-bold text-black mb-0.5 uppercase">Skills</h2>
                        <div className="text-sm text-black space-y-0">
                          <p><strong>Programming Languages:</strong> Python, Java, C++, JavaScript, SQL</p>
                          <p><strong>Technologies:</strong> React, Node.js, Git, Docker, AWS, MongoDB</p>
                          <p><strong>Tools:</strong> VS Code, IntelliJ IDEA, Jupyter Notebook</p>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="mb-1.5">
                        <h2 className="text-sm font-bold text-black mb-0.5 uppercase">Experience</h2>
                        <div className="space-y-1">
                          <div>
                            <div className="flex justify-between items-start mb-0.5">
                              <div>
                                <p className="text-sm font-semibold text-black">Software Engineering Intern</p>
                                <p className="text-sm text-black">Company Name, City, State</p>
                              </div>
                              <span className="text-sm text-black whitespace-nowrap ml-2">June 2023 - Aug 2023</span>
                            </div>
                            <ul className="text-sm text-black pl-3 space-y-0">
                              <li>• Developed backend services processing 1M+ requests daily</li>
                              <li>• Optimized database queries improving performance by 30%</li>
                              <li>• Collaborated with cross-functional teams on product features</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Projects */}
                      <div className="mb-2">
                        <h2 className="text-sm font-bold text-black mb-1 uppercase">Projects</h2>
                        <div className="space-y-1">
                          <div>
                            <p className="text-sm font-semibold text-black">E-commerce Web Application</p>
                            <ul className="text-sm text-black pl-4 space-y-0">
                              <li>• Built full-stack application using React, Node.js, and PostgreSQL</li>
                              <li>• Implemented user authentication and payment processing</li>
                            </ul>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-black">Machine Learning Classifier</p>
                            <ul className="text-sm text-black pl-4 space-y-0">
                              <li>• Developed image classification model with 92% accuracy</li>
                              <li>• Used Python, TensorFlow, and scikit-learn</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Extra-Curricular Activities */}
                      <div className="mb-2">
                        <h2 className="text-sm font-bold text-black mb-1 uppercase">Extra-Curricular Activities</h2>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm font-semibold text-black">Member, Computer Science Club</p>
                              <p className="text-sm text-black">University Name</p>
                            </div>
                            <span className="text-sm text-black whitespace-nowrap ml-2">2022 - Present</span>
                          </div>
                          <ul className="text-sm text-black pl-4 space-y-0">
                            <li>• Participated in weekly coding competitions and hackathons</li>
                            <li>• Organized technical workshops for fellow students</li>
                          </ul>
                        </div>
                      </div>

                      {/* Leadership */}
                      <div>
                        <h2 className="text-sm font-bold text-black mb-1 uppercase">Leadership</h2>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm font-semibold text-black">Team Lead, Senior Capstone Project</p>
                              <p className="text-sm text-black">University Name</p>
                            </div>
                            <span className="text-sm text-black whitespace-nowrap ml-2">2023 - 2024</span>
                          </div>
                          <ul className="text-sm text-black pl-4 space-y-0">
                            <li>• Led team of 4 students in developing enterprise software solution</li>
                            <li>• Coordinated project timeline and deliverables with faculty advisor</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'deedy-reversed' ? (
                  <div className="w-full aspect-[8.5/11] bg-white rounded-lg shadow-2xl overflow-hidden transform scale-[0.75] origin-top">
                    <div className="h-full p-4" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {/* Header */}
                      <div className="text-center mb-3">
                        <h1 className="text-3xl font-light text-black mb-2" style={{ letterSpacing: '6px', fontWeight: 300 }}>YOUR NAME</h1>
                        <div className="text-sm text-black">
                          Your Address | Your City, State ZIP | (555) 000-0000 | email@example.com
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {/* Left Column - Main Content */}
                        <div className="w-3/5 space-y-4">
                          {/* Experience */}
                          <div>
                            <h2 className="text-sm font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px', letterSpacing: '1px' }}>Experience</h2>

                            <div className="mb-3">
                              <div className="flex justify-between items-baseline mb-1">
                                <div>
                                  <span className="text-sm font-bold text-black">Software Engineer</span>
                                  <span className="text-sm text-black font-normal"> | Coursera</span>
                                </div>
                                <span className="text-sm text-black font-normal italic">Oct 2014 – Present</span>
                              </div>
                              <div className="text-sm text-gray-600 italic mb-1">Mountain View, CA</div>
                              <ul className="text-sm text-black ml-4">
                                <li>• Create and optimize data structures for processing educational content</li>
                                <li>• Developed A/B testing framework and tools for measuring learner engagement</li>
                              </ul>
                            </div>

                            <div className="mb-2">
                              <div className="flex justify-between items-baseline mb-1">
                                <div>
                                  <span className="text-sm font-bold text-black">Software Engineering Intern</span>
                                  <span className="text-sm text-black ml-2">| Google Inc.</span>
                                </div>
                                <span className="text-sm text-black italic">June 2013 – Sept 2013</span>
                              </div>
                              <div className="text-sm text-gray-600 italic mb-2">Mountain View, CA</div>
                              <ul className="text-sm text-black space-y-1 ml-4">
                                <li>• Worked on YouTube Creator Playbook optimization</li>
                                <li>• Built analytics tools for video performance measurement</li>
                              </ul>
                            </div>
                          </div>

                          {/* Research */}
                          <div>
                            <h2 className="text-base font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}>Research</h2>

                            <div className="mb-2">
                              <div className="flex justify-between items-baseline mb-1">
                                <div>
                                  <span className="text-sm font-bold text-black">Undergraduate Research</span>
                                  <span className="text-sm text-black ml-2">| Cornell University</span>
                                </div>
                                <span className="text-sm text-black italic">Jan 2013 – May 2014</span>
                              </div>
                              <ul className="text-sm text-black space-y-1 ml-4">
                                <li>• Led development of distributed systems for large-scale data processing</li>
                                <li>• Published research on machine learning algorithms</li>
                              </ul>
                            </div>
                          </div>

                          {/* Projects */}
                          <div>
                            <h2 className="text-base font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}>Projects</h2>

                            <div className="mb-2">
                              <p className="text-sm font-bold text-black mb-1">Coursera Performance Analysis | <span className="font-normal">Python</span></p>
                              <ul className="text-sm text-black ml-4">
                                <li>• Built comprehensive analytics platform</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="w-2/5 space-y-4">
                          {/* Education */}
                          <div>
                            <h2 className="text-base font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}>Education</h2>
                            <div>
                              <p className="text-sm font-bold text-black">Cornell University</p>
                              <p className="text-sm text-black">BS in Computer Science</p>
                              <p className="text-sm text-black italic">Expected May 2014</p>
                              <p className="text-sm text-black">GPA: 3.83 / 4.0</p>
                            </div>
                          </div>

                          {/* Skills */}
                          <div>
                            <h2 className="text-base font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}>Skills</h2>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-bold text-black">Programming:</p>
                                <p className="text-sm text-black">Java • Python • C++ • JavaScript</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-black">Technologies:</p>
                                <p className="text-sm text-black">Git • MySQL • jQuery • Node.js</p>
                              </div>
                            </div>
                          </div>

                          {/* Awards */}
                          <div>
                            <h2 className="text-base font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}>Awards</h2>
                            <div className="text-sm text-black space-y-1">
                              <p>Dean's List (Fall 2012, Spring 2013)</p>
                              <p>USACO Finalist 2012</p>
                              <p>First Place, Cornell Hackathon 2013</p>
                            </div>
                          </div>

                          {/* Links */}
                          <div>
                            <h2 className="text-base font-bold text-black mb-2 uppercase" style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}>Links</h2>
                            <div className="text-sm text-black space-y-1">
                              <p>github.com/yourusername</p>
                              <p>linkedin.com/in/yourprofile</p>
                              <p>yourportfolio.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : template.id === 'luxsleek-cv' ? (
                  <div className="w-full aspect-[8.5/11] bg-white rounded-lg shadow-2xl overflow-hidden transform scale-[0.65] origin-top" style={{ fontFamily: 'Fira Sans, sans-serif', fontSize: '5px', lineHeight: '1.1' }}>
                    <div className="h-full flex">
                      {/* Left Column - Dark Blue Sidebar */}
                      <div className="w-1/3 text-white p-4" style={{ backgroundColor: '#304263' }}>
                        {/* Profile Photo */}
                        <div className="text-center mb-2">
                          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 overflow-hidden border-2 border-white/30">
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm font-bold">PHOTO</span>
                            </div>
                          </div>
                        </div>

                        {/* Name */}
                        <div className="text-center mb-5">
                          <h1 className="text-base font-light text-white mb-2 tracking-widest">YOUR NAME</h1>
                          <p className="text-sm text-blue-200 uppercase tracking-wider font-medium">Data Scientist</p>
                        </div>

                        {/* Profile */}
                        <div className="mb-2">
                          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest border-b border-white/30 pb-1">Profile</h3>
                          <p className="text-sm text-blue-100 leading-tight">
                            Experienced data scientist with expertise in machine learning,
                            statistical analysis, and business intelligence solutions for enterprise clients.
                          </p>
                        </div>

                        {/* Contact Details */}
                        <div className="mb-2">
                          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest border-b border-white/30 pb-1">Contact Details</h3>
                          <div className="space-y-1 text-sm text-blue-100">
                            <div className="flex items-start gap-2">
                              <span className="text-sm mt-0.5">✉</span>
                              <span>email@example.com</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-sm mt-0.5">☎</span>
                              <span>(555) 000-0000</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-sm mt-0.5">🌐</span>
                              <span>yourwebsite.com</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-sm mt-0.5">📍</span>
                              <span>City, State ZIP</span>
                            </div>
                          </div>
                        </div>

                        {/* Personal Info */}
                        <div className="mb-2">
                          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest border-b border-white/30 pb-1">Personal Info</h3>
                          <div className="space-y-1 text-sm text-blue-100">
                            <p>Date of Birth: January 15, 1990</p>
                            <p>Nationality: American</p>
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest border-b border-white/30 pb-1">Skills</h3>
                          <div className="space-y-4 text-sm">
                            <div>
                              <p className="text-blue-100 mb-1">Python</p>
                              <div className="w-full bg-blue-800/50 rounded h-1">
                                <div className="bg-white h-1 rounded" style={{ width: '90%' }}></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-blue-100 mb-1">Machine Learning</p>
                              <div className="w-full bg-blue-800/50 rounded h-1">
                                <div className="bg-white h-1 rounded" style={{ width: '85%' }}></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-blue-100 mb-1">SQL</p>
                              <div className="w-full bg-blue-800/50 rounded h-1">
                                <div className="bg-white h-1 rounded" style={{ width: '80%' }}></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-blue-100 mb-1">Tableau</p>
                              <div className="w-full bg-blue-800/50 rounded h-1">
                                <div className="bg-white h-1 rounded" style={{ width: '75%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Main Content */}
                      <div className="flex-1 p-4">
                        {/* Experience */}
                        <div className="mb-2">
                          <h2 className="text-sm font-bold mb-2 uppercase tracking-widest border-b-2 pb-1" style={{ color: '#304263', borderColor: '#304263' }}>Experience</h2>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-sm font-bold text-black">Senior Data Scientist</h3>
                                  <p className="text-sm text-gray-700 italic">Tech Corporation, New York</p>
                                </div>
                                <span className="text-sm text-black font-medium">2021 - Present</span>
                              </div>
                              <ul className="text-sm text-black pl-4 space-y-0">
                                <li>• Led machine learning projects resulting in $2M annual cost savings</li>
                                <li>• Developed predictive models with 95% accuracy for customer segmentation</li>
                                <li>• Mentored team of 5 junior data scientists and analysts</li>
                                <li>• Collaborated with product teams to integrate ML models into production systems</li>
                              </ul>
                            </div>

                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-sm font-bold text-black">Data Analyst</h3>
                                  <p className="text-sm text-gray-700 italic">Analytics Firm, Boston</p>
                                </div>
                                <span className="text-sm text-black font-medium">2019 - 2021</span>
                              </div>
                              <ul className="text-sm text-black pl-4 space-y-0">
                                <li>• Built comprehensive dashboards and reports for C-level executives</li>
                                <li>• Improved data processing efficiency by 40% through automation</li>
                                <li>• Conducted statistical analysis on customer behavior patterns</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Education */}
                        <div className="mb-2">
                          <h2 className="text-sm font-bold mb-2 uppercase tracking-widest border-b-2 pb-1" style={{ color: '#304263', borderColor: '#304263' }}>Education</h2>
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-sm font-bold text-black">Master of Science in Data Science</h3>
                                <p className="text-sm text-gray-700 italic">Massachusetts Institute of Technology</p>
                                <p className="text-sm text-gray-600">Thesis: "Advanced ML Techniques for Time Series Forecasting"</p>
                              </div>
                              <span className="text-sm text-black font-medium">2019</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-sm font-bold text-black">Bachelor of Science in Mathematics</h3>
                                <p className="text-sm text-gray-700 italic">Harvard University</p>
                                <p className="text-sm text-gray-600">Magna Cum Laude, GPA: 3.8/4.0</p>
                              </div>
                              <span className="text-sm text-black font-medium">2017</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Education */}
                        <div className="mb-2">
                          <h2 className="text-sm font-bold mb-2 uppercase tracking-widest border-b-2 pb-1" style={{ color: '#304263', borderColor: '#304263' }}>Additional Education</h2>
                          <div className="text-sm text-black space-y-1">
                            <p>• Machine Learning Specialization - Stanford University (Coursera), 2020</p>
                            <p>• AWS Certified Solutions Architect - Amazon Web Services, 2021</p>
                            <p>• Deep Learning Specialization - DeepLearning.AI, 2020</p>
                            <p>• Advanced SQL for Data Scientists - DataCamp, 2019</p>
                          </div>
                        </div>

                        {/* Hobbies */}
                        <div>
                          <h2 className="text-sm font-bold mb-2 uppercase tracking-widest border-b-2 pb-1" style={{ color: '#304263', borderColor: '#304263' }}>Hobbies</h2>
                          <div className="text-sm text-black">
                            <p>Photography, Rock Climbing, Chess, Contributing to Open Source Projects</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};