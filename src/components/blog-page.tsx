"use client";

import { motion } from "motion/react";
import { Navbar } from "./navbar";
import { useState, useEffect } from "react";
import { Button } from "./button";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    bio: string;
  };
  featured?: boolean;
  views: number;
}

interface Category {
  name: string;
  count: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch posts with category filter
      const postsQuery = selectedCategory === "All" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
      const postsResponse = await fetch(`/api/blog/posts${postsQuery}&page=${currentPage}`);
      const postsData = await postsResponse.json();

      if (postsData.success) {
        setPosts(postsData.data.posts);
        setTotalPages(postsData.data.pagination.pages);
      }

      // Fetch other data only on initial load
      if (currentPage === 1) {
        const [featuredResponse, categoriesResponse] = await Promise.all([
          fetch('/api/blog/featured'),
          fetch('/api/blog/categories')
        ]);

        const [featuredData, categoriesData] = await Promise.all([
          featuredResponse.json(),
          categoriesResponse.json()
        ]);

        if (featuredData.success) setFeaturedPosts(featuredData.data);
        if (categoriesData.success) setCategories([{ name: "All", count: 0 }, ...categoriesData.data]);
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar tone="light" />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p>Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar tone="light" />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-4">Off-Campus Job Hunt</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-slate-900">Complete Playbook</h1>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              100 Active HR Contacts | Cold Call Script | Email Templates | LinkedIn Messages | Full Strategy
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-4 text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 font-semibold">SECTION 1</span>
                  <span>Off-Campus Strategy Roadmap (7 Steps)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 font-semibold">SECTION 2</span>
                  <span>Timing Guide — When to Connect &amp; Send</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 font-semibold">SECTION 3</span>
                  <span>Cold Calling Script (Full + Short Version)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 font-semibold">SECTION 4</span>
                  <span>Cold Email Templates (3 Versions)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 font-semibold">SECTION 5</span>
                  <span>LinkedIn Connection Message Templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 font-semibold">SECTION 6</span>
                  <span>Follow-Up System (Day-by-Day Schedule)</span>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <span className="text-slate-400 font-semibold">SECTION 7</span>
                  <span>100 Active HR Contacts Directory</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 1 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden bg-white border border-emerald-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" />
              <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
                    Strategy Roadmap
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  SECTION 1 — OFF-CAMPUS STRATEGY ROADMAP
                </h2>
                <p className="text-slate-600 mb-8">
                  This 7-step roadmap is the exact process used to convert an off-campus offer in March hiring season. Follow each step in
                  order.
                </p>

              <div className="space-y-8 text-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">STEP 1 — Build Your Profile Before You Reach Out</h3>
                  <p className="text-slate-600 mb-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                      Why this matters
                    </span>
                  </p>
                  <p className="text-slate-700 mb-3">HRs check your LinkedIn before responding. A weak profile = no reply.</p>
                  <p className="text-slate-600 mb-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                      Action items
                    </span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Update your LinkedIn headline: [Your Role] | [Key Skill] | Open to Work</li>
                    <li>Add a professional photo (not a selfie)</li>
                    <li>Write a 3-line About section: Who you are, what you can do, what you want</li>
                    <li>Pin your best project or achievement at the top</li>
                    <li>Set your profile to OPEN TO WORK (visible to recruiters)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">STEP 2 — Pick Your Target Companies (10 at a Time)</h3>
                  <p className="text-slate-700 mb-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                      Rule
                    </span>{" "}
                    Do not blast all 100 HRs at once.
                  </p>
                  <p className="text-slate-700 mb-3">Pick 10 companies per week. Research each one before reaching out.</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Go to the company's LinkedIn page and check: 'Jobs' section</li>
                    <li>Check if they have posted any jobs in the last 30 days</li>
                    <li>Note the role and department you want to apply for</li>
                    <li>Write down the HR name from this file who belongs to that company</li>
                  </ul>
                  <p className="text-slate-600 mt-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                      Pro Tip
                    </span>{" "}
                    Prioritise companies where you have relevant skills or internship experience.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">STEP 3 — LinkedIn First, Then Call, Then Email</h3>
                  <p className="text-slate-700 mb-3">This is the exact sequence that works best:</p>
                  <div className="grid md:grid-cols-2 gap-2 text-slate-700">
                    <p>Day 1 Send LinkedIn connection request with a short note</p>
                    <p>Day 2-3 Wait for connection to be accepted</p>
                    <p>Day 4 Send cold email to the HR</p>
                    <p>Day 5-6 Wait for email reply</p>
                    <p>Day 7 Make the cold call if no reply</p>
                    <p>Day 10 Send one final follow-up message</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">STEP 4 — Prepare Your Pitch (30-Second Version)</h3>
                  <p className="text-slate-700 mb-3">Before you call or message, prepare this exact pitch:</p>
                  <blockquote className="border-l-4 border-emerald-300 pl-4 italic text-slate-700">
                    Hi, I am [Your Name], a [Your Degree] graduate from [Your College]. I have [X months/years] of experience in [Your
                    Skill/Domain]. I noticed [Company Name] is hiring and I would love to explore if there is a fit. I have sent my resume
                    to your email. Could you take 2 minutes to review it?
                  </blockquote>
                  <p className="text-slate-600 mt-3">
                    Practice this until it sounds natural.{" "}
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                      Do NOT
                    </span>{" "}
                    read it off a paper.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">STEP 5 — Send Resume the Right Way</h3>
                  <p className="text-slate-700 mb-2">Resume file name format:</p>
                  <p className="text-slate-700 mb-2">
                    FirstName_LastName_Role_Resume.pdf (Example: Rahul_Sharma_DataAnalyst_Resume.pdf)
                  </p>
                  <p className="text-slate-700 mb-2">Email subject line format:</p>
                  <p className="text-slate-700 mb-3">Application for [Role] | [Your Name] | [College Name]</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Keep resume to 1 page if you have less than 2 years of experience</li>
                    <li>Use a clean, simple format — no heavy graphics</li>
                    <li>Always send as PDF, never as Word (.doc)</li>
                    <li>Tailor your resume for each company — change the top 3 bullet points</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">STEP 6 — Track Every Outreach</h3>
                  <p className="text-slate-700 mb-3">Create a simple tracker in Excel or Notion with these columns:</p>
                  <div className="grid md:grid-cols-2 gap-2 text-slate-700">
                    <p>HR Name Name from this contact list</p>
                    <p>Company Company name</p>
                    <p>LinkedIn Sent Date you sent the connection request</p>
                    <p>Email Sent Date you sent the cold email</p>
                    <p>Call Made Date you called</p>
                    <p>Response Yes / No / Follow up needed</p>
                    <p>Status Applied / Interview / Rejected / Offer</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden bg-white border border-sky-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-sky-400" />
              <div className="absolute -left-24 -top-16 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-900">
                    Timing Guide
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  SECTION 2 — TIMING GUIDE
                </h2>
                <p className="text-slate-600 mb-8">
                  When you reach out matters as much as what you say. Here is the exact timing that gets the best response rates.
                </p>

              <div className="space-y-8 text-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">BEST DAYS TO REACH OUT</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Tuesday</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">BEST DAY</span>{" "}
                      — HRs are settled into the week. Highest open rates.
                    </p>
                    <p>
                      <span className="font-semibold">Wednesday</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">SECOND BEST</span>{" "}
                      — Good for follow-ups and calls.
                    </p>
                    <p><span className="font-semibold">Thursday</span> Good for final follow-ups before the weekend.</p>
                    <p>
                      <span className="font-semibold">Monday</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">Avoid</span>{" "}
                      — HRs are catching up on backlog from the weekend.
                    </p>
                    <p>
                      <span className="font-semibold">Friday</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">Avoid</span>{" "}
                      — People are in wind-down mode. Low response rate.
                    </p>
                    <p>
                      <span className="font-semibold">Saturday / Sunday</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">Never</span>{" "}
                      reach out on weekends. It looks unprofessional.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">BEST TIME WINDOWS</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">9:00 AM – 10:30 AM</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">PRIME WINDOW</span>{" "}
                      for emails. HRs check inbox first thing in the morning.
                    </p>
                    <p><span className="font-semibold">11:00 AM – 12:00 PM</span> Good for cold calls. People are active before lunch.</p>
                    <p><span className="font-semibold">2:00 PM – 3:30 PM</span> Second best window. Post-lunch, emails are checked again.</p>
                    <p><span className="font-semibold">5:00 PM – 6:00 PM</span> LinkedIn messages work well here. People scroll LinkedIn after work.</p>
                    <p>
                      <span className="font-semibold">After 7:00 PM</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">Avoid</span>{" "}
                      completely. Do not send professional messages at night.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">MARCH SPECIFIC TIMING</h3>
                  <p className="text-slate-700 mb-2">Why March is special:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Q1 hiring budgets are freshly approved — companies are ready to hire</li>
                    <li>Most companies start onboarding new employees in April–May</li>
                    <li>HRs are actively looking to fill positions in March</li>
                  </ul>
                  <p className="text-slate-700 mt-4 mb-2">Best weeks in March to be most active:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Week 1 (1st–7th): Send all LinkedIn requests and first emails</li>
                    <li>Week 2 (8th–14th): Make follow-up calls for non-responders</li>
                    <li>Week 3 (15th–21st): Send second round emails to new HRs</li>
                    <li>Week 4 (22nd–31st): Final push — focus only on warm leads</li>
                  </ul>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden bg-white border border-rose-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-rose-400" />
              <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-rose-100/70 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-900">
                    Cold Calling
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  SECTION 3 — COLD CALLING SCRIPT
                </h2>
                <p className="text-slate-600 mb-8">
                  Use this when the HR does not respond to email or LinkedIn. Keep the call{" "}
                  <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">
                    under 3 minutes
                  </span>
                  .
                </p>

              <div className="space-y-8 text-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">FULL SCRIPT — Step by Step</h3>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                      <p className="text-sm font-semibold text-rose-900 mb-3">OPENING (First 10 seconds)</p>
                      <div className="space-y-2 text-slate-700">
                        <p><span className="font-semibold text-rose-900">You:</span> Good morning / Good afternoon! May I speak with [HR Name]?</p>
                        <p className="text-slate-500 italic">[ Wait for confirmation ]</p>
                        <p><span className="font-semibold text-rose-900">You:</span> Hi [HR Name], my name is [Your Name]. I am a [Your Degree] graduate from [Your College / University]. I hope I am not catching you at a bad time.</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-white p-4">
                      <p className="text-sm font-semibold text-rose-900 mb-3">YOUR PITCH (15–20 seconds)</p>
                      <div className="space-y-2 text-slate-700">
                        <p><span className="font-semibold text-rose-900">You:</span> I came across your profile on LinkedIn and I can see that you handle recruitment at [Company Name].
                        I have [X months] of experience in [Skill/Domain] and I believe I could be a strong fit for your team.
                         <br />I have already sent my resume to your email — the subject line is [mention your email subject]. I was hoping you could take just 2 minutes to review it when you get a chance.</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                      <p className="text-sm font-semibold text-rose-900 mb-3">CLOSING</p>
                      <div className="space-y-2 text-slate-700">
                        <p><span className="font-semibold text-rose-900">You:</span> Thank you so much for your time, [HR Name]. I really appreciate it. I will make sure my resume is in your inbox. Have a great day!</p>
                        <p className="text-slate-500 italic">[ Hang up politely. Never drag the call. ]</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-white p-4">
                      <p className="text-sm font-semibold text-rose-900 mb-3">HANDLING COMMON RESPONSES</p>
                      <div className="space-y-3 text-slate-700">
                        <div>
                          <p className="font-semibold text-slate-900">IF THEY SAY "WE ARE NOT HIRING":</p>
                          <p>I completely understand. I would love to be kept in mind for any future openings. Is it okay if I stay connected with you on LinkedIn?</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">IF THEY SAY "SEND YOUR RESUME":</p>
                          <p>Of course! I have already sent it to [their email if you know it]. Could I confirm the best email address to send it to?</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">IF THEY SAY "CALL BACK LATER":</p>
                          <p>Absolutely, when would be the best time to call back? <span className="text-slate-500 italic">[ Note down the time they give and call EXACTLY then. ]</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">SHORT SCRIPT — Under 60 Seconds</h3>
                  <blockquote className="border-l-4 border-rose-300 pl-4 italic text-slate-700">
                    Hi, is this [HR Name]? Great — I am [Your Name], a fresher from [College]. I have [X skill] experience and I sent you
                    my resume today for [role or general application]. Could you spare 2 minutes to look at it? It would mean a lot. Thank
                    you so much!
                  </blockquote>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">CALLING TIPS</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Call from a quiet place. No background noise.</li>
                    <li>Smile while you talk — it comes through in your voice.</li>
                    <li>
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">
                        Do NOT
                      </span>{" "}
                      use speakerphone. Use earphones.
                    </li>
                    <li>Keep a pen and paper ready to write down names, times, email IDs.</li>
                    <li>If nervous, stand up while calling — it helps your voice sound confident.</li>
                    <li>If they cut the call, do not call back immediately. Wait 2 days.</li>
                    <li>
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900">
                        Never
                      </span>{" "}
                      call before 9 AM or after 6 PM.
                    </li>
                  </ul>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Section 4 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden bg-white border border-amber-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
              <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
                    Email Templates
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  SECTION 4 — COLD EMAIL TEMPLATES
                </h2>
                <p className="text-slate-600 mb-8">
                  These are 3 different email templates. Use Template 1 for most HRs. Use Template 2 for startups. Use Template 3 for
                  follow-up.
                </p>

              <div className="space-y-8 text-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    TEMPLATE 1 — Standard Cold Email (Works for Most Companies)
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-700">Subject:</span> Application for [Role] | [Your Name] | [Your College]</p>
                      <p><span className="font-semibold text-slate-700">To:</span> [HR First Name]</p>
                      <p><span className="font-semibold text-slate-700">From:</span> [Your Name]</p>
                    </div>
                    <div className="px-4 py-4 text-[13px] leading-relaxed text-slate-800 font-mono bg-white space-y-3">
                      <p>Dear [HR First Name],</p>
                      <p>I hope this email finds you well.</p>
                      <p>
                        My name is [Your Name] and I am a [Your Degree] graduate from [College Name]. I am reaching out because I admire the
                        work [Company Name] is doing in [mention one thing you know about the company — a product, recent news, or their
                        mission].
                      </p>
                      <p>
                        I have [X months/years] of experience in [Your Key Skill or Domain] and I believe my background aligns well with the
                        roles your team typically hires for.
                      </p>
                      <p>I have attached my resume for your review. I would be grateful if you could take 2 minutes to go through it.</p>
                      <p>If there are any current or upcoming openings that might be a fit, I would love to connect.</p>
                      <p>Thank you for your time.</p>
                      <p>Best regards,</p>
                      <p>[Your Name]</p>
                      <p>[Phone Number] | [LinkedIn Profile URL]</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">TEMPLATE 2 — Startup / Growth Company Email</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-700">Subject:</span> Excited About [Company Name] — [Your Name] Reaching Out</p>
                      <p><span className="font-semibold text-slate-700">To:</span> [HR First Name]</p>
                      <p><span className="font-semibold text-slate-700">From:</span> [Your Name]</p>
                    </div>
                    <div className="px-4 py-4 text-[13px] leading-relaxed text-slate-800 font-mono bg-white space-y-3">
                      <p>Hi [HR First Name],</p>
                      <p>
                        I have been following [Company Name] for a while now — [mention one specific thing: a product launch, funding news,
                        or a value of theirs]. The work you are doing is genuinely exciting.
                      </p>
                      <p>
                        I am [Your Name], a [Degree] graduate from [College]. I specialise in [Your Skill] and have worked on [brief mention of
                        a project or internship].
                      </p>
                      <p>
                        I know fast-growing companies like yours often need sharp, motivated people who can hit the ground running. I would
                        love to be that person.
                      </p>
                      <p>Resume attached. Would love to chat if the timing is right.</p>
                      <p>Warm regards,</p>
                      <p>[Your Name]</p>
                      <p>[Phone Number] | [LinkedIn Profile URL]</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    TEMPLATE 3 — Follow-Up Email (After No Reply for 5–7 Days)
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-700">Subject:</span> Following Up — [Your Name] | [Role/Domain]</p>
                      <p><span className="font-semibold text-slate-700">To:</span> [HR First Name]</p>
                      <p><span className="font-semibold text-slate-700">From:</span> [Your Name]</p>
                    </div>
                    <div className="px-4 py-4 text-[13px] leading-relaxed text-slate-800 font-mono bg-white space-y-3">
                      <p>Hi [HR First Name],</p>
                      <p>
                        I had sent you an email on [date] regarding an opportunity at [Company Name]. I wanted to follow up in case it got
                        missed in your busy inbox.
                      </p>
                      <p>
                        I remain very interested in joining [Company Name] and would love to know if there are any suitable openings. I am
                        happy to share any additional information you may need.
                      </p>
                      <p>Thank you again for your time.</p>
                      <p>Best,</p>
                      <p>[Your Name]</p>
                      <p>[Phone Number] | [LinkedIn Profile URL]</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">EMAIL TIPS</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Always personalise the first line — mention something real about the company.</li>
                    <li>
                      Subject line must be clear.{" "}
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        Do NOT
                      </span>{" "}
                      write "Job Application" as subject. Use the format shown above.
                    </li>
                    <li>
                      Keep the email under{" "}
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        150 words
                      </span>
                      . HRs do not read long emails.
                    </li>
                    <li>
                      Send at{" "}
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        9:00 AM – 10:00 AM
                      </span>{" "}
                      on Tuesday or Wednesday for best open rates.
                    </li>
                    <li>Always attach your resume as a PDF. Name the file properly.</li>
                    <li>
                      Send from a professional email ID —{" "}
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        firstname.lastname@gmail.com
                      </span>{" "}
                      format
                    </li>
                    <li>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        Do NOT
                      </span>{" "}
                      use: "To Whom It May Concern", "Dear Sir/Ma'am", or "I humbly request".
                    </li>
                  </ul>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Section 5 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden bg-white border border-violet-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-violet-400" />
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-100/70 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-900">
                    LinkedIn Messages
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  SECTION 5 — LINKEDIN CONNECTION MESSAGES
                </h2>
                <p className="text-slate-600 mb-8">
                  LinkedIn has a{" "}
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
                    300-character limit
                  </span>{" "}
                  on connection request notes. Keep these short and genuine.
                </p>

              <div className="space-y-8 text-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">MESSAGE 1 — General Connection Request</h3>
                  <blockquote className="border-l-4 border-violet-300 pl-4 italic text-slate-700">
                    Hi [Name], I came across your profile and noticed you work in HR at [Company]. I am a [Degree] fresher with a
                    background in [Skill] and would love to connect. Looking forward to staying in touch!
                  </blockquote>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">MESSAGE 2 — After They Accept Your Connection</h3>
                  <blockquote className="border-l-4 border-violet-300 pl-4 italic text-slate-700">
                    Hi [Name], thank you for connecting! I wanted to reach out because I am actively looking for opportunities in
                    [Domain/Role] and [Company] has always been on my list. I have sent a brief email to your inbox. Would love your
                    thoughts when you get a chance. Thank you!
                  </blockquote>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">MESSAGE 3 — Referencing a Job Post</h3>
                  <blockquote className="border-l-4 border-violet-300 pl-4 italic text-slate-700">
                    Hi [Name], I saw [Company] recently posted a [Role] opening and I am very interested. I have [X] months of experience
                    in [Skill] and would love to be considered. May I send my resume to you directly?
                  </blockquote>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">MESSAGE 4 — Startup / Direct Approach</h3>
                  <blockquote className="border-l-4 border-violet-300 pl-4 italic text-slate-700">
                    Hi [Name], love what [Company] is building! I am a [Degree] grad with strong skills in [Skill] and I am looking to
                    join a growing team. Would be great to connect and explore if there is a fit.
                  </blockquote>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">LINKEDIN TIPS</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
                        Do NOT
                      </span>{" "}
                      send a blank connection request — always add a note.
                    </li>
                    <li>
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
                        Do NOT
                      </span>{" "}
                      send your resume in the very first message. Connect first, then follow up.
                    </li>
                    <li>
                      Engage with{" "}
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
                        2–3
                      </span>{" "}
                      of their recent posts BEFORE sending a message. It helps.
                    </li>
                    <li>
                      If they do not accept within{" "}
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
                        7 days
                      </span>
                      , send a cold email instead.
                    </li>
                    <li>Keep your LinkedIn profile updated before you start sending requests.</li>
                    <li>
                      Post on LinkedIn{" "}
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
                        2–3 times a week
                      </span>{" "}
                      during your job search — HRs notice active profiles.
                    </li>
                  </ul>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Section 6 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden bg-white border border-teal-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-teal-400" />
              <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-teal-100/70 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-900">
                    Follow-Up System
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  SECTION 6 — FOLLOW-UP SYSTEM
                </h2>
                <p className="text-slate-600 mb-8">
                  Most people give up after the first outreach. That is the biggest mistake. Here is the exact follow-up schedule to use
                  for each HR contact.
                </p>

              <div className="space-y-8 text-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">14-DAY FOLLOW-UP SCHEDULE</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-slate-700">
                    <p>Day 1 (Tuesday) Send LinkedIn connection request with a short note</p>
                    <p>Day 3 (Thursday) HR accepted? Send a follow-up LinkedIn message (Template 2)</p>
                    <p>Day 4 (Friday) Send cold email (Template 1) — 9:00 AM</p>
                    <p>Day 7 (Tuesday) No email reply? Send follow-up email (Template 3)</p>
                    <p>Day 9 (Thursday) Still no reply? Make the cold call using the script</p>
                    <p>
                      Day 12 (Sunday) Rest.{" "}
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                        No weekends
                      </span>
                    </p>
                    <p>
                      Day 14 (Tuesday) Send one{" "}
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                        final follow-up
                      </span>{" "}
                      on LinkedIn or email. After this, move on.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">WHAT TO SAY IN THE FINAL FOLLOW-UP</h3>
                  <blockquote className="border-l-4 border-teal-300 pl-4 italic text-slate-700">
                    Hi [Name], I know you must be very busy. This is my last follow-up regarding an opportunity at [Company]. If the timing
                    is not right, I completely understand. I would love to reconnect in a few months. Thank you for your time!
                  </blockquote>
                  <p className="text-slate-600 mt-3">
                    Why this works: Saying 'this is my last follow-up' often triggers a response because it signals that you are
                    respectful of their time and not desperate.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">AFTER YOU GET A RESPONSE</h3>
                  <div className="space-y-2 text-slate-700">
                    <p><span className="font-semibold">They say "Send Resume"</span> Reply within 30 minutes. Attach PDF resume. Say thank you.</p>
                    <p><span className="font-semibold">They say "We will keep you in mind"</span> Reply: "Thank you! I will follow up in 2 weeks if that is okay."</p>
                    <p><span className="font-semibold">They share a JD</span> Apply immediately. Reply to confirm you have applied.</p>
                    <p><span className="font-semibold">They ask for an interview</span> Confirm within 1 hour. Prepare thoroughly before going.</p>
                    <p>
                      <span className="font-semibold">No reply even after Day 14</span> Mark as{" "}
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                        cold lead
                      </span>
                      . Revisit after 3–4 weeks.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">WEEKLY TARGETS TO STAY ON TRACK</h3>
                  <p className="text-slate-700 mb-2">Set these as your weekly goals:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Monday: Research 10 companies from the HR list</li>
                    <li>Tuesday: Send 10 LinkedIn requests and 5 cold emails</li>
                    <li>Wednesday: Follow up on all Day-4 emails from last week</li>
                    <li>Thursday: Make cold calls for all non-responders from last week</li>
                    <li>Friday: Update your tracker. Review what is working.</li>
                  </ul>
                  <div className="mt-3 space-y-1 text-slate-700">
                    <p><span className="font-semibold">Target:</span> 10 outreaches per week = 40 contacts per month</p>
                    <p>
                      <span className="font-semibold">Expected response rate:</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                        10–20%
                      </span>{" "}
                      = 4 to 8 positive replies per month
                    </p>
                    <p>
                      <span className="font-semibold">Conversion to interview:</span>{" "}
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                        30–50%
                      </span>{" "}
                      of replies = 1 to 4 interviews per month
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === category.name
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className="ml-2 text-xs opacity-60">({category.count})</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Posts - Only show if "All" category is selected */}
          {selectedCategory === "All" && featuredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-8 text-center text-slate-900">Featured</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post, index) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => window.location.href = `/blog/${post.slug}`}
                  >
                    <div className="bg-white rounded-lg p-6 h-full border border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                        <span className="text-slate-500 text-sm">
                          {post.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-slate-700 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{post.author.name}</span>
                        <div className="flex items-center gap-4">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}

          {/* Blog Posts List - Minimal style like the image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {posts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                className="group cursor-pointer border-b border-slate-200 pb-8 last:border-b-0"
                onClick={() => window.location.href = `/blog/${post.slug}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2 text-sm text-slate-500">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span className="text-slate-400">•</span>
                      <span>{post.readTime}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700">{post.category}</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 group-hover:text-slate-700 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>By {post.author.name}</span>
                      {post.views > 0 && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span>{post.views} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex justify-center items-center gap-4 mt-16"
            >
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Previous
              </Button>

              <span className="text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="ResumeAssistAI"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-slate-500 mb-8">
            AI-powered resume optimization for career success
          </p>
          <div className="flex justify-center gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Support</a>
          </div>
          <p className="text-slate-400 text-sm mt-8">
            © 2026 ResumeAssistAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
