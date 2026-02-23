import mongoose from 'mongoose';
import BlogPost from '../model/blog.model.js';
import { connectDB } from '../db/db.js';

const dubaiBlogs = [
  {
    title: "Complete Guide to Job Hunting in Dubai 2026",
    excerpt: "Everything you need to know about finding employment in Dubai, from visa requirements to salary expectations and the best job portals.",
    content: `
      <p>Dubai continues to be one of the most attractive destinations for professionals worldwide. With its tax-free income, multicultural environment, and booming economy, the emirate offers countless opportunities across various industries.</p>

      <h2>Understanding Dubai's Job Market</h2>
      <p>Dubai's economy is diversified across several key sectors:</p>
      <ul>
        <li><strong>Finance & Banking:</strong> DIFC hosts major international banks</li>
        <li><strong>Technology:</strong> Growing tech hub with numerous startups and MNCs</li>
        <li><strong>Tourism & Hospitality:</strong> World-class hotels and attractions</li>
        <li><strong>Real Estate:</strong> Continuous development and investment opportunities</li>
        <li><strong>Healthcare:</strong> Expanding medical tourism and healthcare facilities</li>
      </ul>

      <h2>Visa Requirements and Work Permits</h2>
      <p>To work in Dubai, you'll need:</p>
      <ul>
        <li>Employment visa sponsored by your employer</li>
        <li>Emirates ID</li>
        <li>Medical fitness certificate</li>
        <li>Educational certificate attestation</li>
      </ul>

      <h2>Best Job Portals for Dubai</h2>
      <ul>
        <li>LinkedIn - Most effective for professional roles</li>
        <li>Bayt.com - Leading Middle East job portal</li>
        <li>Dubizzle Jobs - Local classifieds with job listings</li>
        <li>GulfTalent - Specialized in Gulf region opportunities</li>
        <li>Naukri Gulf - Popular among Indian professionals</li>
      </ul>

      <h2>Salary Expectations</h2>
      <p>Salaries in Dubai vary significantly by industry and experience level. Here are average ranges (AED per month):</p>
      <ul>
        <li>Entry Level: 3,000 - 8,000 AED</li>
        <li>Mid Level: 8,000 - 20,000 AED</li>
        <li>Senior Level: 20,000 - 50,000+ AED</li>
      </ul>

      <h2>Tips for Success</h2>
      <ul>
        <li>Tailor your CV to UAE standards</li>
        <li>Network actively through professional events</li>
        <li>Consider recruitment agencies</li>
        <li>Be prepared for multiple interview rounds</li>
        <li>Research company culture and values</li>
      </ul>
    `,
    author: {
      name: "Ahmed Al-Rashid",
      bio: "HR Director with 12+ years experience in Dubai's recruitment industry",
      avatar: ""
    },
    category: "Dubai Jobs",
    tags: ["Dubai", "Job Search", "UAE", "Career", "Visa"],
    featured: true,
    readTime: "8 min read"
  },
  {
    title: "Top 10 Highest Paying Jobs in UAE 2026",
    excerpt: "Discover the most lucrative career opportunities in the UAE, including salary ranges and qualification requirements.",
    content: `
      <p>The UAE job market offers some of the highest salaries in the region, especially for skilled professionals. Here are the top-paying positions across various industries.</p>

      <h2>1. Chief Executive Officer (CEO)</h2>
      <p><strong>Average Salary:</strong> 80,000 - 200,000+ AED/month</p>
      <p>Leading multinational corporations and large local companies in Dubai and Abu Dhabi.</p>

      <h2>2. Investment Banking Director</h2>
      <p><strong>Average Salary:</strong> 60,000 - 150,000 AED/month</p>
      <p>DIFC and ADGM host major investment banks offering lucrative opportunities.</p>

      <h2>3. Petroleum Engineer</h2>
      <p><strong>Average Salary:</strong> 45,000 - 100,000 AED/month</p>
      <p>High demand in Abu Dhabi's oil and gas sector.</p>

      <h2>4. Consultant Surgeon</h2>
      <p><strong>Average Salary:</strong> 50,000 - 120,000 AED/month</p>
      <p>Private hospitals and medical centers offer competitive packages.</p>

      <h2>5. IT Director/CTO</h2>
      <p><strong>Average Salary:</strong> 40,000 - 80,000 AED/month</p>
      <p>Growing demand in Dubai's tech transformation initiatives.</p>

      <h2>6. Legal Counsel</h2>
      <p><strong>Average Salary:</strong> 35,000 - 70,000 AED/month</p>
      <p>International law firms and corporate legal departments.</p>

      <h2>7. Marketing Director</h2>
      <p><strong>Average Salary:</strong> 30,000 - 60,000 AED/month</p>
      <p>Luxury brands and multinational companies.</p>

      <h2>8. Project Manager (Construction)</h2>
      <p><strong>Average Salary:</strong> 25,000 - 50,000 AED/month</p>
      <p>Mega projects and real estate developments.</p>

      <h2>9. Data Scientist</h2>
      <p><strong>Average Salary:</strong> 20,000 - 45,000 AED/month</p>
      <p>Emerging field with high growth potential.</p>

      <h2>10. Airline Pilot</h2>
      <p><strong>Average Salary:</strong> 35,000 - 65,000 AED/month</p>
      <p>Emirates, Etihad, and other regional carriers.</p>

      <h2>Factors Affecting Salaries</h2>
      <ul>
        <li>Years of experience</li>
        <li>Educational qualifications</li>
        <li>Industry certifications</li>
        <li>Company size and reputation</li>
        <li>Negotiation skills</li>
      </ul>
    `,
    author: {
      name: "Sarah Mitchell",
      bio: "Recruitment consultant specializing in executive placements in the Gulf region",
      avatar: ""
    },
    category: "Salary Guide",
    tags: ["UAE", "Salary", "High Paying Jobs", "Career", "Dubai"],
    featured: true,
    readTime: "6 min read"
  },
  {
    title: "UAE Resume Format: What Recruiters Really Want",
    excerpt: "Learn the specific resume formatting and content requirements that will get you noticed by UAE employers and recruitment agencies.",
    content: `
      <p>Creating a resume for the UAE job market requires understanding local preferences and cultural nuances. Here's what you need to know to make your CV stand out.</p>

      <h2>Essential Resume Sections for UAE</h2>
      
      <h3>1. Personal Information</h3>
      <p>Unlike Western countries, UAE resumes typically include:</p>
      <ul>
        <li>Full name and professional title</li>
        <li>Contact details (phone, email, LinkedIn)</li>
        <li>Current location in UAE (if applicable)</li>
        <li>Nationality and visa status</li>
        <li>Professional photo (optional but common)</li>
      </ul>

      <h3>2. Professional Summary</h3>
      <p>A concise 3-4 line summary highlighting:</p>
      <ul>
        <li>Years of experience</li>
        <li>Key expertise areas</li>
        <li>Industry focus</li>
        <li>Career objectives</li>
      </ul>

      <h3>3. Work Experience</h3>
      <p>List in reverse chronological order with:</p>
      <ul>
        <li>Job title and company name</li>
        <li>Employment dates (month/year)</li>
        <li>Location (city, country)</li>
        <li>Key achievements with quantifiable results</li>
        <li>Technologies/tools used</li>
      </ul>

      <h3>4. Education</h3>
      <p>Include:</p>
      <ul>
        <li>Degree type and major</li>
        <li>University name and location</li>
        <li>Graduation year</li>
        <li>GPA (if above 3.5)</li>
        <li>Relevant coursework or honors</li>
      </ul>

      <h3>5. Skills</h3>
      <p>Categorize into:</p>
      <ul>
        <li>Technical skills</li>
        <li>Software proficiency</li>
        <li>Languages (with proficiency levels)</li>
        <li>Certifications</li>
      </ul>

      <h2>UAE-Specific Tips</h2>
      
      <h3>Language Requirements</h3>
      <p>Always mention language proficiency:</p>
      <ul>
        <li>English (essential for most roles)</li>
        <li>Arabic (highly valued)</li>
        <li>Other languages (Hindi, Urdu, French, etc.)</li>
      </ul>

      <h3>Cultural Considerations</h3>
      <ul>
        <li>Keep the tone professional and formal</li>
        <li>Avoid personal details like marital status</li>
        <li>Highlight international experience</li>
        <li>Mention any Middle East experience</li>
      </ul>

      <h3>Format Guidelines</h3>
      <ul>
        <li>Length: 2-3 pages maximum</li>
        <li>Font: Arial or Calibri, 11-12pt</li>
        <li>Format: PDF preferred</li>
        <li>File name: FirstName_LastName_CV.pdf</li>
      </ul>

      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Using US or European resume formats</li>
        <li>Omitting visa status information</li>
        <li>Not mentioning salary expectations</li>
        <li>Including irrelevant work experience</li>
        <li>Poor English grammar and spelling</li>
      </ul>
    `,
    author: {
      name: "Fatima Al-Zahra",
      bio: "Senior HR Manager at a leading Dubai-based multinational corporation",
      avatar: ""
    },
    category: "Resume Guide",
    tags: ["UAE Resume", "CV Format", "Dubai Jobs", "Resume Tips"],
    featured: false,
    readTime: "7 min read"
  },
  {
    title: "Dubai's Tech Scene: Opportunities for Software Developers",
    excerpt: "Explore the booming technology sector in Dubai, from startups to multinational tech giants, and discover career opportunities for developers.",
    content: `
      <p>Dubai is rapidly establishing itself as a major technology hub in the Middle East. With government initiatives like Dubai 10X and Smart Dubai, the emirate is attracting tech talent from around the world.</p>

      <h2>Major Tech Companies in Dubai</h2>
      
      <h3>Multinational Corporations</h3>
      <ul>
        <li><strong>Microsoft:</strong> Regional headquarters with growing teams</li>
        <li><strong>Amazon:</strong> AWS and e-commerce operations</li>
        <li><strong>Google:</strong> Cloud and digital marketing services</li>
        <li><strong>IBM:</strong> AI and cloud computing solutions</li>
        <li><strong>Oracle:</strong> Database and enterprise software</li>
      </ul>

      <h3>Regional Tech Giants</h3>
      <ul>
        <li><strong>Careem:</strong> Ride-hailing and super app</li>
        <li><strong>Noon:</strong> E-commerce platform</li>
        <li><strong>Souq.com:</strong> Amazon's Middle East marketplace</li>
        <li><strong>Fetchr:</strong> Logistics and delivery technology</li>
      </ul>

      <h3>Growing Startups</h3>
      <ul>
        <li>Fintech companies in DIFC</li>
        <li>E-commerce platforms</li>
        <li>HealthTech solutions</li>
        <li>EdTech platforms</li>
        <li>PropTech innovations</li>
      </ul>

      <h2>In-Demand Tech Skills</h2>
      
      <h3>Programming Languages</h3>
      <ul>
        <li>JavaScript/TypeScript</li>
        <li>Python</li>
        <li>Java</li>
        <li>C#/.NET</li>
        <li>Go</li>
        <li>Swift/Kotlin for mobile</li>
      </ul>

      <h3>Frameworks & Technologies</h3>
      <ul>
        <li>React/Angular/Vue.js</li>
        <li>Node.js</li>
        <li>Spring Boot</li>
        <li>Docker/Kubernetes</li>
        <li>AWS/Azure/GCP</li>
        <li>MongoDB/PostgreSQL</li>
      </ul>

      <h3>Emerging Technologies</h3>
      <ul>
        <li>Artificial Intelligence/Machine Learning</li>
        <li>Blockchain</li>
        <li>IoT (Internet of Things)</li>
        <li>Cybersecurity</li>
        <li>Data Analytics</li>
      </ul>

      <h2>Salary Ranges for Developers</h2>
      <ul>
        <li><strong>Junior Developer:</strong> 8,000 - 15,000 AED/month</li>
        <li><strong>Mid-level Developer:</strong> 15,000 - 25,000 AED/month</li>
        <li><strong>Senior Developer:</strong> 25,000 - 40,000 AED/month</li>
        <li><strong>Tech Lead:</strong> 35,000 - 55,000 AED/month</li>
        <li><strong>Engineering Manager:</strong> 45,000 - 70,000 AED/month</li>
      </ul>

      <h2>Getting Started</h2>
      <ul>
        <li>Build a strong GitHub portfolio</li>
        <li>Contribute to open source projects</li>
        <li>Attend Dubai tech meetups and conferences</li>
        <li>Network on LinkedIn with Dubai tech professionals</li>
        <li>Consider remote work opportunities initially</li>
      </ul>
    `,
    author: {
      name: "Raj Patel",
      bio: "Senior Software Engineer at a Dubai-based fintech startup",
      avatar: ""
    },
    category: "Dubai Jobs",
    tags: ["Dubai", "Tech Jobs", "Software Developer", "Programming", "Startups"],
    featured: false,
    readTime: "9 min read"
  },
  {
    title: "Mastering the Dubai Job Interview: Cultural Tips and Best Practices",
    excerpt: "Navigate Dubai's multicultural interview environment with confidence. Learn what employers expect and how to make a lasting impression.",
    content: `
      <p>Job interviews in Dubai can be quite different from other parts of the world due to the emirate's unique multicultural business environment. Success requires understanding both international business practices and local cultural nuances.</p>

      <h2>Pre-Interview Preparation</h2>
      
      <h3>Research the Company</h3>
      <ul>
        <li>Company history and values</li>
        <li>Recent news and developments</li>
        <li>Key leadership team</li>
        <li>Business model and revenue streams</li>
        <li>Competitors and market position</li>
      </ul>

      <h3>Understand the Role</h3>
      <ul>
        <li>Job requirements and responsibilities</li>
        <li>Required skills and experience</li>
        <li>Career progression opportunities</li>
        <li>Team structure and reporting lines</li>
      </ul>

      <h2>Cultural Considerations</h2>
      
      <h3>Dress Code</h3>
      <ul>
        <li><strong>Men:</strong> Business suit, conservative colors</li>
        <li><strong>Women:</strong> Professional attire, modest coverage</li>
        <li>Avoid flashy jewelry or strong fragrances</li>
        <li>Ensure clothes are well-fitted and pressed</li>
      </ul>

      <h3>Communication Style</h3>
      <ul>
        <li>Maintain respectful and formal tone</li>
        <li>Use proper titles (Mr., Ms., Dr.)</li>
        <li>Show respect for hierarchy</li>
        <li>Be patient with decision-making processes</li>
      </ul>

      <h3>Business Etiquette</h3>
      <ul>
        <li>Arrive 10-15 minutes early</li>
        <li>Bring multiple copies of your CV</li>
        <li>Offer a firm handshake</li>
        <li>Wait to be seated</li>
        <li>Turn off mobile devices</li>
      </ul>

      <h2>Common Interview Questions</h2>
      
      <h3>General Questions</h3>
      <ul>
        <li>"Tell me about yourself"</li>
        <li>"Why do you want to work in Dubai?"</li>
        <li>"What do you know about our company?"</li>
        <li>"Where do you see yourself in 5 years?"</li>
        <li>"Why are you leaving your current job?"</li>
      </ul>

      <h3>UAE-Specific Questions</h3>
      <ul>
        <li>"How do you handle working in a multicultural environment?"</li>
        <li>"What is your visa status?"</li>
        <li>"When can you start?"</li>
        <li>"What are your salary expectations?"</li>
        <li>"Do you have experience working in the Middle East?"</li>
      </ul>

      <h2>Questions to Ask the Interviewer</h2>
      <ul>
        <li>What does success look like in this role?</li>
        <li>What are the biggest challenges facing the team?</li>
        <li>How does the company support professional development?</li>
        <li>What is the company culture like?</li>
        <li>What are the next steps in the interview process?</li>
      </ul>

      <h2>Salary Negotiation Tips</h2>
      <ul>
        <li>Research market rates beforehand</li>
        <li>Consider the total package (housing, transport, insurance)</li>
        <li>Be prepared to discuss expectations openly</li>
        <li>Understand that negotiation is expected</li>
        <li>Factor in cost of living in Dubai</li>
      </ul>

      <h2>Follow-Up Best Practices</h2>
      <ul>
        <li>Send a thank-you email within 24 hours</li>
        <li>Reiterate your interest in the position</li>
        <li>Address any concerns raised during the interview</li>
        <li>Provide additional information if requested</li>
        <li>Be patient with the decision timeline</li>
      </ul>
    `,
    author: {
      name: "Omar Hassan",
      bio: "Executive recruiter with 15+ years experience placing candidates in Dubai's top companies",
      avatar: ""
    },
    category: "Interview Tips",
    tags: ["Dubai", "Interview Tips", "Job Interview", "Career Advice", "UAE"],
    featured: false,
    readTime: "10 min read"
  }
];

async function seedBlogs() {
  try {
    await connectDB();
    
    // Clear existing blog posts
    await BlogPost.deleteMany({});
    console.log('Cleared existing blog posts');
    
    // Insert new blog posts
    const insertedPosts = await BlogPost.insertMany(dubaiBlogs);
    console.log(`Inserted ${insertedPosts.length} blog posts`);
    
    console.log('Blog seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBlogs();