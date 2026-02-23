"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUserStore } from "../stores/useUserStore";

export const AuthModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [open]);

	const { login, signup, loading } = useUserStore();

	const handleAccount = async (e: any) => {
		e.preventDefault();
        let res = null;
        if (mode === "signup") {
            res = await signup({email: form.email, password: form.password, username: form.username, confirmPassword});
        } else {
            res = await login(form.email, form.password);
        }
        if (res && res.success) {
            onClose();
        }
	};

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center left-[50%] top-50 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.div
            className="relative w-full max-w-md mx-4 bg-slate-900 rounded-lg shadow-lg p-6 border border-slate-700"
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, duration: 0.28 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{mode === "login" ? "Login" : "Create Account"}</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white rounded-md p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); /* integrate auth here */ }}>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Username</label>
                  <input onChange={handleForm} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" type="text" name="username" placeholder="Your username" />
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input onChange={handleForm} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" type="email" name="email" placeholder="you@example.com" required />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Password</label>
                <input onChange={handleForm} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" type="password" name="password" placeholder="Password" required />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Confirm Password</label>
                  <input onChange={(e)=> setConfirmPassword(e.target.value)} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white" type="password" name="confirmPassword" placeholder="Confirm password" required />
                </div>
              )}

              <div className="flex items-center justify-between space-x-3">
                <button
                    onClick={handleAccount}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md px-4 py-2"
                >
                  {loading && '...'}{mode === "login" ? "Login" : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-slate-300 px-3 py-2"
                >
                  {mode === "login" ? "Create Account" : "Have an account? Login"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
