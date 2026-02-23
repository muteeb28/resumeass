"use client";
import { Button } from "./button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

// Patrick O'Hara CV Mockup - Exact match to reference
const PatrickOHaraCV = () => (
    <div className="w-[380px] md:w-[420px] lg:w-[460px] bg-white rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.16)] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="text-center py-5 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Your Name</h2>
            <p className="text-amber-700 italic text-lg mt-1" style={{ fontFamily: 'Georgia, serif' }}>Curriculum Vitae</p>
        </div>

        <div className="flex min-h-[520px]">
            {/* Left Column - White */}
            <div className="w-[55%] p-4 space-y-4 border-r border-slate-100">
                {/* Work Experience */}
                <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800 border-b border-amber-800 pb-1 mb-3">
                        Work Experience
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">June 2009 – Present</p>
                            <p className="text-[10px] text-slate-500">Global Tech Solutions</p>
                            <p className="font-semibold text-[11px] text-slate-800">Server</p>
                            <p className="text-[9px] text-slate-500 leading-relaxed mt-1">
                                Servicing Canada's largest fast service restaurant chain whose sales records in baked goods and coffee have had remarkable impact on the Canadian food service industry.
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">June 2013 – December 2013</p>
                            <p className="text-[10px] text-slate-500">Innovation Labs</p>
                            <p className="font-semibold text-[11px] text-slate-800">Firestopper</p>
                            <p className="text-[9px] text-slate-500 leading-relaxed mt-1">
                                Restoring fire-resistance of walls and floors in new housing structures by impeding the spread of hazardous flames.
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">May 2012 – November 2012</p>
                            <p className="text-[10px] text-slate-500">Design Studio</p>
                            <p className="font-semibold text-[11px] text-slate-800">Landscaper</p>
                            <p className="text-[9px] text-slate-500 leading-relaxed mt-1">
                                Modification of the visible features of an area of land in many forms namely gardening and planting.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Education */}
                <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800 border-b border-amber-800 pb-1 mb-3">
                        Education
                    </h3>
                    <div className="space-y-2">
                        <div className="flex gap-3">
                            <p className="text-[9px] text-slate-500 w-20 shrink-0">2011 – 2015</p>
                            <div>
                                <p className="font-semibold text-[10px] text-slate-800">Biology</p>
                                <p className="text-[9px] text-slate-500 uppercase">Bachelor of Science</p>
                                <p className="text-[9px] text-slate-500 italic">Dalhousie University, Halifax NS</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-[9px] text-slate-500 w-20 shrink-0">2010 – 2011</p>
                            <div>
                                <p className="font-semibold text-[10px] text-slate-800">Secondary School Diploma</p>
                                <p className="text-[9px] text-slate-500 italic">White Oaks Secondary School, Oakville ON</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-[9px] text-slate-500 w-20 shrink-0">2008 – 2010</p>
                            <div>
                                <p className="font-semibold text-[10px] text-slate-800">Secondary School</p>
                                <p className="text-[9px] text-slate-500 italic">American School of Dubai, UAE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Cream */}
            <div className="w-[45%] bg-amber-50/80 p-4 space-y-4">
                {/* Contact Box */}
                <div className="bg-amber-100/60 border border-amber-200 rounded p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-700 text-[10px]">📍</span>
                        <p className="text-[9px] text-slate-700">312 Poplar Drive, Oakville, ON</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-700 text-[10px]">📞</span>
                        <p className="text-[9px] text-slate-700">(902) 441 5181</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-700 text-[10px]">✉️</span>
                        <p className="text-[9px] text-slate-700">your.email@example.com</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-700 text-[10px]">🔗</span>
                        <p className="text-[9px] text-slate-700">facebook.com/patrick.ohara</p>
                    </div>
                </div>

                {/* Extra Curricular Activities */}
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 border-b border-amber-800 pb-1 mb-2">
                        Extra Curricular Activities
                    </h3>
                    <div className="space-y-1.5">
                        <div className="flex gap-2">
                            <p className="text-[9px] text-slate-500 w-8 shrink-0">2015</p>
                            <div>
                                <p className="text-[9px] font-semibold text-slate-800">Journey Canadian Tour</p>
                                <p className="text-[8px] text-slate-500 italic">Shadow Security Services</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <p className="text-[9px] text-slate-500 w-8 shrink-0">2015</p>
                            <div>
                                <p className="text-[9px] font-semibold text-slate-800">Bonnie Raitt</p>
                                <p className="text-[8px] text-slate-500 italic">Shadow Security Services</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <p className="text-[9px] text-slate-500 w-8 shrink-0">2014</p>
                            <div>
                                <p className="text-[9px] font-semibold text-slate-800">Freak Show Haunted Wharf</p>
                                <p className="text-[8px] text-slate-500 italic">Murphy's The Cable Wharf</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <p className="text-[9px] text-slate-500 w-8 shrink-0">2010</p>
                            <div>
                                <p className="text-[9px] font-semibold text-slate-800">Big Brother Program</p>
                                <p className="text-[8px] text-slate-500 italic">American School of Dubai</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Communication Skills */}
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 border-b border-amber-800 pb-1 mb-2">
                        Communication Skills
                    </h3>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px]">
                            <span className="text-slate-600 uppercase">English</span>
                            <span className="text-slate-500">Native speaker</span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                            <span className="text-slate-600 uppercase">French</span>
                            <span className="text-slate-500">Oral: intermediate; written: poor</span>
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 border-b border-amber-800 pb-1 mb-2">
                        Achievements
                    </h3>
                    <div className="space-y-1">
                        <div className="flex gap-2 text-[9px]">
                            <span className="text-slate-500 w-8 shrink-0">2015</span>
                            <span className="text-slate-700 font-medium">Bachelors Degree</span>
                        </div>
                        <div className="flex gap-2 text-[9px]">
                            <span className="text-slate-500 w-8 shrink-0">2011</span>
                            <span className="text-slate-700 font-medium">Honor Roll</span>
                        </div>
                        <div className="flex gap-2 text-[9px]">
                            <span className="text-slate-500 w-8 shrink-0">2010</span>
                            <span className="text-slate-700 font-medium">Eastern Mediterranean Volleyball Champions</span>
                        </div>
                    </div>
                </div>

                {/* Computer Skills */}
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 border-b border-amber-800 pb-1 mb-2">
                        Computer Skills
                    </h3>
                    <div className="space-y-1 text-[9px]">
                        <div className="flex gap-2">
                            <span className="text-slate-500 uppercase w-16 shrink-0">Good level</span>
                            <span className="text-slate-600">Microsoft Office, email, social networking</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500 uppercase w-16 shrink-0">Basic level</span>
                            <span className="text-slate-600">GitHub, HTML</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Floating Elements with Animations
const ATSBadge = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
        className="absolute -top-3 -left-3 z-30"
    >
        <div className="bg-teal-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-teal-500/30 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ATS Perfect
        </div>
    </motion.div>
);

const AINotesCard = () => (
    <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
        className="absolute -right-6 top-24 z-30"
    >
        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 w-[160px]">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-slate-700">AI-powered Notes</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
                ✓ Enhanced work descriptions with action verbs
            </p>
        </div>
    </motion.div>
);

const StatsCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
        className="absolute -right-4 bottom-28 z-30"
    >
        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 w-[140px]">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-bold text-slate-600">Interview rate up</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">+45%</p>
            <p className="text-[9px] text-slate-400">with AI-optimized CV</p>
        </div>
    </motion.div>
);

const SummaryCard = () => (
    <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
        className="absolute -left-6 top-32 z-30"
    >
        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 w-[150px]">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                <span className="text-[10px] font-bold text-slate-700">Summary Wins</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
                Added quantifiable metrics across sections
            </p>
        </div>
    </motion.div>
);

const GenerateButton = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.4 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30"
    >
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[11px] font-bold py-2.5 px-5 rounded-full flex items-center gap-2 shadow-xl shadow-teal-500/40 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Generate with AI
        </div>
    </motion.div>
);

// Person Illustration
const PersonIllustration = () => (
    <svg viewBox="0 0 130 220" className="w-32 md:w-36 lg:w-40">
        {/* Head */}
        <ellipse cx="65" cy="35" rx="26" ry="28" fill="#f5d0b0" />
        {/* Hair */}
        <ellipse cx="65" cy="20" rx="28" ry="18" fill="#2d3748" />
        <ellipse cx="44" cy="35" rx="6" ry="12" fill="#2d3748" />
        <ellipse cx="86" cy="35" rx="6" ry="12" fill="#2d3748" />
        {/* Face */}
        <circle cx="55" cy="38" r="2.5" fill="#2d3748" />
        <circle cx="75" cy="38" r="2.5" fill="#2d3748" />
        <path d="M58 50 Q65 54 72 50" stroke="#d4a574" strokeWidth="2" fill="none" />
        {/* Body */}
        <path d="M42 65 Q65 60 88 65 L95 140 Q65 148 35 140 Z" fill="#60a5fa" />
        {/* Arms */}
        <ellipse cx="30" cy="85" rx="12" ry="8" fill="#f5d0b0" />
        <rect x="25" y="65" width="16" height="28" rx="8" fill="#60a5fa" />
        <ellipse cx="100" cy="95" rx="11" ry="7" fill="#f5d0b0" />
        <rect x="90" y="75" width="16" height="26" rx="8" fill="#60a5fa" />
        {/* Holding tablet */}
        <rect x="94" y="88" width="22" height="32" rx="3" fill="#1e293b" />
        <rect x="96" y="91" width="18" height="26" rx="2" fill="#38bdf8" />
        {/* Legs */}
        <rect x="45" y="138" width="18" height="60" rx="9" fill="#f59e0b" />
        <rect x="67" y="138" width="18" height="60" rx="9" fill="#f59e0b" />
        {/* Shoes */}
        <ellipse cx="54" cy="202" rx="14" ry="6" fill="#1e293b" />
        <ellipse cx="76" cy="202" rx="14" ry="6" fill="#1e293b" />
    </svg>
);

// Main Hero Visual
const HeroVisual = () => (
    <div className="relative flex items-end justify-center">
        <div className="relative flex items-end">
            {/* CV Card with floating elements */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative"
            >
                <PatrickOHaraCV />
                <ATSBadge />
                <AINotesCard />
                <StatsCard />
                <SummaryCard />
                <GenerateButton />
            </motion.div>

            {/* Person */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
                className="relative -ml-10 mb-10"
            >
                <PersonIllustration />
            </motion.div>
        </div>
    </div>
);

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-white text-slate-900 pt-24 pb-12 lg:pt-28 lg:pb-20">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-32 -right-16 h-80 w-80 rounded-full bg-teal-50 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-sky-50 blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-5 text-center lg:text-left"
                >
                    <Badge variant="brand" className="uppercase tracking-wider py-1.5 px-4 text-[11px]">
                        2k resumes created today
                    </Badge>

                    <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-slate-900">
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">professional AI resume</span>, ready in minutes
                    </h1>

                    <p className="font-body text-base md:text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                        One Resume Doesn't Fit Every Job. Customize your resume for each role with AI--tailored, ATS-ready, and done in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                        <Button
                            size="lg"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 h-12 rounded-lg font-semibold shadow-lg shadow-teal-600/20"
                            onClick={() => window.location.href = "/create"}
                        >
                            Create AI Resume Now
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 h-12 rounded-lg font-semibold"
                            onClick={() => window.location.href = "/optimize"}
                        >
                            Improve My Resume
                        </Button>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 border-t border-slate-100">
                        <div className="text-left">
                            <p className="text-xl font-bold text-emerald-600">48%</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">more likely to get hired</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-left">
                            <p className="text-xl font-bold text-amber-500">12%</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">better pay with next job</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                            Our customers have been hired at:
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 opacity-40 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500">
                            <span className="text-base font-bold text-slate-600">Google</span>
                            <span className="text-base font-bold text-slate-600 italic">DHL</span>
                            <span className="text-base font-bold text-slate-600">Booking.com</span>
                            <span className="text-base font-bold text-slate-600">Spotify</span>
                            <span className="text-base font-bold text-slate-600">facebook</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Content - Visual */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative hidden lg:flex justify-center items-end min-h-[620px]"
                >
                    <HeroVisual />
                </motion.div>

            </div>
        </section>
    );
};
