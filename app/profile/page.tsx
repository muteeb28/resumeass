"use client";

import { useState } from "react";
import {
  CircleHelp,
  CreditCard,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  Star,
  UserRound,
  Zap,
} from "lucide-react";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProfileMenu = "profile" | "orders" | "billing" | "support";

const menuItems: Array<{
  key: ProfileMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
}> = [
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
    activeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    key: "orders",
    label: "Orders",
    icon: ReceiptText,
    activeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    key: "billing",
    label: "Billing & Membership",
    icon: CreditCard,
    activeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    key: "support",
    label: "Help & Support",
    icon: CircleHelp,
    activeClass: "bg-rose-100 text-rose-700 border-rose-200",
  },
];

const orders = [
  {
    id: "RA-10245",
    item: "ATS Resume Optimization",
    date: "February 14, 2026",
    status: "Delivered",
    amount: "$19.00",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "RA-10222",
    item: "Premium Resume Template Pack",
    date: "January 30, 2026",
    status: "Processing",
    amount: "$9.00",
    statusClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "RA-10110",
    item: "Monthly Membership",
    date: "January 01, 2026",
    status: "Delivered",
    amount: "$29.00",
    statusClass: "bg-blue-100 text-blue-700",
  },
];

const memberships = [
  {
    plan: "Pro Monthly",
    state: "Active",
    startedAt: "February 01, 2026",
    renewalAt: "March 01, 2026",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    plan: "Starter Trial",
    state: "Past",
    startedAt: "January 01, 2026",
    renewalAt: "January 31, 2026",
    badgeClass: "bg-slate-100 text-slate-700",
  },
];

export default function ProfilePage() {
  const [activeMenu, setActiveMenu] = useState<ProfileMenu>("profile");

  return (
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen">
      <Navbar tone="light" />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-xl backdrop-blur">
          <div className="grid min-h-[78vh] grid-cols-1 lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-neutral-200 bg-neutral-50/80 p-4 lg:border-b-0 lg:border-r lg:p-6">
              <h1 className="text-xl font-bold text-neutral-800">Account Center</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Manage profile, orders, billing and support.
              </p>

              <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveMenu(item.key)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition",
                        "border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-white",
                        isActive && item.activeClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="p-4 sm:p-6 lg:p-8">{renderPanel(activeMenu)}</section>
          </div>
        </div>
      </main>
    </BackgroundRippleLayout>
  );
}

function renderPanel(activeMenu: ProfileMenu) {
  if (activeMenu === "profile") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Profile Settings</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Update your personal details and account security information.
          </p>
        </div>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <UserRound className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Full Name" placeholder="John Doe" />
            <FormField label="Current Designation" placeholder="Full Stack Developer" />
            <FormField label="Current Company" placeholder="ResumeAssist AI" />
            <FormField label="Years of Experience" placeholder="3-5 years" />
            <div className="md:col-span-2">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">Save Basic Info</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
              <Mail className="h-5 w-5" />
              Email Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Changing your email requires OTP verification sent to your new email.
              For security, account access may be limited during verification.
            </p>
            <FormField label="Current Email" placeholder="john@example.com" disabled />
            <FormField label="New Email Address" placeholder="new-email@example.com" />
            <div className="flex flex-wrap gap-3">
              <Button className="bg-amber-600 text-white hover:bg-amber-700">
                Send OTP to New Email
              </Button>
              <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                Verify OTP
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              Password & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="New Password" type="password" placeholder="********" />
            <FormField label="Confirm Password" type="password" placeholder="********" />
            <div className="md:col-span-2">
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeMenu === "orders") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Orders</h2>
          <p className="mt-1 text-sm text-neutral-500">All orders you have placed.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-700">{order.id}</p>
                    <h3 className="text-lg font-semibold text-neutral-800">{order.item}</h3>
                    <p className="text-sm text-neutral-500">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", order.statusClass)}>
                      {order.status}
                    </span>
                    <p className="text-base font-semibold text-neutral-800">{order.amount}</p>
                    <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeMenu === "billing") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Billing & Membership</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Track your active and past membership plans.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {memberships.map((membership) => (
            <Card key={`${membership.plan}-${membership.state}`} className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-blue-700">
                    <Star className="h-5 w-5" />
                    {membership.plan}
                  </span>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-medium", membership.badgeClass)}>
                    {membership.state}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-600">
                <p>
                  <span className="font-semibold text-neutral-700">Started: </span>
                  {membership.startedAt}
                </p>
                <p>
                  <span className="font-semibold text-neutral-700">Renewal/End: </span>
                  {membership.renewalAt}
                </p>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Manage Plan</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-violet-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <Zap className="h-5 w-5" />
              Billing Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="bg-violet-600 text-white hover:bg-violet-700">Update Payment Method</Button>
            <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
              Download Invoices
            </Button>
            <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
              Cancel Membership
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-800">Help & Support</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Reach out to us using email, phone, or the support form.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-600">
            <p>support@resumeassist.ai</p>
            <p className="text-xs text-neutral-500">Response time: within 24 hours.</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Phone className="h-5 w-5" />
              Phone Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-600">
            <p>+1 (555) 019-2048</p>
            <p className="text-xs text-neutral-500">Mon-Fri, 9:00 AM to 6:00 PM.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-700">Support Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Subject" placeholder="Issue with membership renewal" />
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Explain your issue in detail..." className="min-h-28" />
          </div>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Submit Request</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} disabled={disabled} />
    </div>
  );
}
