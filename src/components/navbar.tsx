"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import AuthModal from "./auth-modal";
import { useUserStore } from "../stores/useUserStore";
import { useRouter } from "next/navigation";

export const Navbar = ({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useUserStore();
  const isLight = tone === "light";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Job Tracker", href: "/job-tracker" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Blog", href: "/blog" }
  ];

  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
        isLight ? "bg-white/85 border-slate-200" : "bg-black/80 border-slate-800",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center cursor-pointer"
            onClick={() => window.location.href = "/"}
          >
            <img
              src="/logo.png"
              alt="ResumeAssist AI"
              className="h-16 w-auto object-contain py-1"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                href={item.href}
                className={cn(
                  "transition-colors duration-200 relative group text-sm font-medium",
                  isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"
                )}
              >
                {item.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r transition-all duration-300 group-hover:w-full",
                    isLight ? "from-teal-500 to-emerald-500" : "from-purple-500 to-blue-500"
                  )}
                ></span>
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + navItems.length * 0.1 }}
            >
              <HoverBorderGradient
                as="a"
                href="https://levelup-8csx.vercel.app/courses"
                target="_blank"
                rel="noopener noreferrer"
                containerClassName="rounded-full"
                className={cn(
                  "text-sm font-medium px-3 py-1",
                  isLight ? "bg-white text-slate-700" : "bg-black text-slate-200"
                )}
                duration={2}
              >
                Courses
              </HoverBorderGradient>
            </motion.div>
          </div>

          {/* Desktop Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href="/contact-us"}
              className={cn(
                isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : ""
              )}
            >
              Contact Us
            </Button>
            {
              user ? (
                <div className="relative group">
                  <button
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-medium",
                      isLight ? "bg-slate-900" : "bg-gradient-to-br from-purple-500 to-blue-500"
                    )}
                    aria-haspopup="true"
                    aria-expanded={false}
                  >
                    {user.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                  </button>

                  <div className={cn(
                    "absolute right-0 mt-2 w-40 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-1 group-hover:translate-y-0 transition-all duration-150 z-50 border",
                    isLight ? "bg-white border-neutral-200" : "bg-slate-800 border-slate-700"
                  )}>
                    <a href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`} className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}>Profile</a>
                    <a href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`} className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}>Orders</a>
                    <button onClick={async () => { await logout(); router.replace('/') }} className={cn("w-full text-left px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}>Logout</button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/login?next=${window.location.href}`}
                  className={cn(
                    isLight ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : ""
                  )}
                >
                  Login
                </Button>
              )
            }
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "transition-colors duration-200 p-2",
                isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
              )}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            {
              user && (
                <div className="relative">
                  {/* 1. Added onClick to toggle and changed aria-expanded */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-medium transition-transform active:scale-95",
                      isLight ? "bg-slate-900" : "bg-gradient-to-br from-purple-500 to-blue-500"
                    )}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                  >
                    {user?.email ? user?.email?.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                  </button>

                  {/* 2. Replaced group-hover classes with state-based conditional classes */}
                  <div 
                    className={cn(
                      "absolute right-0 mt-2 w-40 rounded-md shadow-lg transform transition-all duration-150 z-50 border",
                      isLight ? "bg-white border-neutral-200" : "bg-slate-800 border-slate-700",
                      // Control visibility via state
                      isMenuOpen 
                        ? "opacity-100 visible translate-y-0" 
                        : "opacity-0 invisible translate-y-1"
                    )}
                  >
                    <a 
                      href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`} 
                      className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                      onClick={() => setIsMenuOpen(false)} // Close on click
                    >
                      Profile
                    </a>
                    <a 
                      href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`} 
                      className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                      onClick={() => setIsMenuOpen(false)} // Close on click
                    >
                      Orders
                    </a>
                    <button 
                      onClick={async () => { 
                        setIsMenuOpen(false); 
                        await logout(); 
                        router.replace('/');
                      }} 
                      className={cn("w-full text-left px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                    >
                      Logout
                    </button>
                  </div>

                  {/* 3. Invisible backdrop to close menu when clicking outside */}
                  {isMenuOpen && (
                    <div 
                      className="fixed inset-0 z-40 h-full w-full" 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                  )}
                </div>
              )
            }
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div
                className={cn(
                  "px-2 pt-2 pb-3 space-y-1 rounded-lg mt-2 border",
                  isLight ? "bg-white/95 border-slate-200" : "bg-slate-900/50 border-slate-800"
                )}
              >
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                      isLight
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className={cn("border-t pt-3 mt-3 space-y-2", isLight ? "border-slate-200" : "border-slate-700")}>
                  <div className="px-3">
                    <HoverBorderGradient
                      as="a"
                      href="https://levelup-8csx.vercel.app/courses"
                      target="_blank"
                      rel="noopener noreferrer"
                      containerClassName="rounded-full w-full"
                      className={cn(
                        "text-sm font-medium px-3 py-1 w-full justify-center",
                        isLight ? "bg-white text-slate-700" : "bg-black text-slate-200"
                      )}
                      duration={2}
                      onClick={() => setIsOpen(false)}
                    >
                      Courses
                    </HoverBorderGradient>
                  </div>
                  <a
                    href="contact-us"
                    className={cn(
                      "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                      isLight
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    Contact Us
                  </a>
                  <div className="px-3 space-y-2">
                    {
                      !user && (
                        <Button
                          size="sm"
                          className={cn(
                            "w-full",
                            isLight ? "bg-slate-900 text-white hover:bg-slate-800" : ""
                          )}
                          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/login?next=${window.location.href}`}
                        >
                          Login
                        </Button>

                      )
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </motion.nav >
  );
};
