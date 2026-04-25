"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { useEffect } from "react";


// type HrContact = {
//   name: string;
//   jobTitle: string;
//   linkedinUrl: string;
//   companyName: string;
//   status: string;
//   appliedFor: string;
//   companyWebsite: string;
//   companyLinkedin: string;
//   companySocial: string;
//   companyTwitter: string;
//   location: string;
//   companyNiche: string;
// };

// const hrContacts: HrContact[] = [
//   {
//     name: "Chetna Gogia",
//     jobTitle: "Chief Human Resources Officer",
//     linkedinUrl: "http://www.linkedin.com/in/chetna-gogia",
//     companyName: "GoKwik",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.gokwik.co/",
//     companyLinkedin: "http://www.linkedin.com/company/gokwik",
//     companySocial: "https://www.facebook.com/GoKwikCo/",
//     companyTwitter: "https://twitter.com/gokwik",
//     location: "Gurgaon, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Iqbal Kaur",
//     jobTitle: "Senior Manager - Talent Acquisition",
//     linkedinUrl: "http://www.linkedin.com/in/iqbal-kaur-7bb65310",
//     companyName: "Birdeye",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.birdeye.com/",
//     companyLinkedin: "http://www.linkedin.com/company/birdeye",
//     companySocial: "https://www.facebook.com/BirdeyeReviews",
//     companyTwitter: "https://twitter.com/birdeye_",
//     location: "Gurgaon, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Vishwanadh Raju",
//     jobTitle: "Head Talent Acquisition Operations- Talent Solutioning",
//     linkedinUrl: "http://www.linkedin.com/in/vishwanadh",
//     companyName: "ANSR",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.ansr.com/",
//     companyLinkedin: "http://www.linkedin.com/company/ansr-consulting",
//     companySocial: "https://twitter.com/ansrglobal",
//     companyTwitter: "",
//     location: "Bengaluru, India",
//     companyNiche: "Management Consulting",
//   },
//   {
//     name: "Rekha Singh",
//     jobTitle: "Sr. Manager- Talent Acquisition",
//     linkedinUrl: "http://www.linkedin.com/in/rekhaasingh",
//     companyName: "Leena AI",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.leena.ai/",
//     companyLinkedin: "http://www.linkedin.com/company/l-e-e-n-a",
//     companySocial: "https://www.facebook.com/Leena-AI-301312863666839/",
//     companyTwitter: "",
//     location: "Delhi, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Deepak Aggarwal",
//     jobTitle: "Senior Executive Talent Acquisition",
//     linkedinUrl: "http://www.linkedin.com/in/deepak-aggarwal-6393a31a",
//     companyName: "Easyrewardz Software Services",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.easyrewardz.com/",
//     companyLinkedin: "http://www.linkedin.com/company/easyrewardz",
//     companySocial: "https://facebook.com/easyrewardzz/",
//     companyTwitter: "https://twitter.com/easyrewardz",
//     location: "New Delhi, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Mamtha",
//     jobTitle: "Director Talent Acquisition - Leadership Hiring",
//     linkedinUrl: "http://www.linkedin.com/in/mamtha-a-74436088",
//     companyName: "Sigmoid",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.sigmoid.com/",
//     companyLinkedin: "http://www.linkedin.com/company/sigmoid-analytics",
//     companySocial: "http://www.facebook.com/pages/Sigmoid-Analytics/237480799741290",
//     companyTwitter: "http://twitter.com/sigmoidInc",
//     location: "Bengaluru, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Ravi Patel",
//     jobTitle: "Senior Manager- Global Talent Hunter",
//     linkedinUrl: "http://www.linkedin.com/in/ravi-patel-3071b05",
//     companyName: "Entropik",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.entropik.io/",
//     companyLinkedin: "http://www.linkedin.com/company/entropiktech",
//     companySocial: "http://facebook.com/entropiktech",
//     companyTwitter: "http://twitter.com/entropiktech",
//     location: "Bengaluru, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Naveen Mon",
//     jobTitle: "Recruitment Manager",
//     linkedinUrl: "http://www.linkedin.com/in/naveenrecruiter",
//     companyName: "ANSR",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.ansr.com/",
//     companyLinkedin: "http://www.linkedin.com/company/ansr-consulting",
//     companySocial: "https://twitter.com/ansrglobal",
//     companyTwitter: "",
//     location: "Karnataka, India",
//     companyNiche: "Management Consulting",
//   },
//   {
//     name: "Omkar Pradhan",
//     jobTitle: "Associate Director - People,Culture & Talent",
//     linkedinUrl: "http://www.linkedin.com/in/omkarpradhan7",
//     companyName: "GoKwik",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.gokwik.co/",
//     companyLinkedin: "http://www.linkedin.com/company/gokwik",
//     companySocial: "https://www.facebook.com/GoKwikCo/",
//     companyTwitter: "https://twitter.com/gokwik",
//     location: "Gurugram, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Raj Raghavan",
//     jobTitle: "Gurugram, India",
//     linkedinUrl: "http://www.linkedin.com/in/raj-raghavan-4285251",
//     companyName: "CoreStack",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.corestack.io/",
//     companyLinkedin: "http://www.linkedin.com/company/corestack",
//     companySocial: "https://www.facebook.com/corestack",
//     companyTwitter: "https://twitter.com/corestack",
//     location: "280",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Naga Siddharth",
//     jobTitle: "Chief Human Resources Officer",
//     linkedinUrl: "http://www.linkedin.com/in/nagasiddharth",
//     companyName: "UrbanPiper",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.urbanpiper.com/",
//     companyLinkedin: "http://www.linkedin.com/company/urbanpiper",
//     companySocial: "https://www.facebook.com/urbanpiper/",
//     companyTwitter: "https://twitter.com/urbanpiper",
//     location: "Bengaluru, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Anjali Sharma",
//     jobTitle: "Talent Acquisition Executive II",
//     linkedinUrl: "http://www.linkedin.com/in/oeanjali",
//     companyName: "Junglee Games",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.jungleegames.com/",
//     companyLinkedin: "http://www.linkedin.com/company/junglee-games",
//     companySocial: "",
//     companyTwitter: "",
//     location: "Noida, India",
//     companyNiche: "Computer Games",
//   },
//   {
//     name: "Indu Balakrishnan",
//     jobTitle: "Technical Recruiter",
//     linkedinUrl: "http://www.linkedin.com/in/indu-balakrishnan-4105a35",
//     companyName: "Tenstorrent Inc.",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.tenstorrent.com/",
//     companyLinkedin: "http://www.linkedin.com/company/tenstorrent-inc.",
//     companySocial: "https://twitter.com/tenstorrent",
//     companyTwitter: "",
//     location: "Bengaluru, India",
//     companyNiche: "Computer Hardware",
//   },
//   {
//     name: "Priyanka Mishra",
//     jobTitle: "Sr. Manager - Culture & Talent",
//     linkedinUrl: "http://www.linkedin.com/in/priyankamishra14",
//     companyName: "Headout",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.headout.com/",
//     companyLinkedin: "http://www.linkedin.com/company/headout-com",
//     companySocial: "https://www.facebook.com/headoutapp",
//     companyTwitter: "https://twitter.com/Headout_App",
//     location: "Karnataka, India",
//     companyNiche: "Information Technology & Services",
//   },
//   {
//     name: "Nishant Das",
//     jobTitle: "VP & Head of Talent Acquisition",
//     linkedinUrl: "http://www.linkedin.com/in/nishantd",
//     companyName: "CoinSwitch",
//     status: "",
//     appliedFor: "",
//     companyWebsite: "http://www.coinswitch.co/",
//     companyLinkedin: "http://www.linkedin.com/company/coinswitch",
//     companySocial: "https://facebook.com/coinswitch",
//     companyTwitter: "https://twitter.com/coinswitch",
//     location: "Mumbai, India",
//     companyNiche: "Financial Servic",
//   },
// ];

interface HrEmailsTableProps {
  id: string,
  name: string,
  email: string,
  title: string,
  company: string,
  createdAt: string,
  updateAt: string,
  status: string,
  website: string,
  linkedin: string,
  social: string,
  twitter: string,
  location: string,
}

const renderCell = (value: string) => {
  if (!value) return <span className="text-slate-400">-</span>;
  const isUrl = value.startsWith("http://") || value.startsWith("https://");
  if (isUrl) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {value}
      </a>
    );
  }
  return <span className="text-slate-700">{value}</span>;
};

export default function HrEmailsTable({
  className,
  tableClassName,
}: {
  className?: string;
  tableClassName?: string;
  hrContacts?: HrEmailsTableProps[];
}) {

    const [hrContacts, setHrContacts] = React.useState<HrEmailsTableProps[] | []>([]);
  
    useEffect(() => {
      const getHrContacts = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hr/list/demo`);
          const data = await response.json();
          console.log('this is the response from the server: ', data.list);
          setHrContacts(data.list);
        } catch (error) {
          console.error("error handling the response", error);
        }
      }
      getHrContacts();
    }, []);

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className={cn("overflow-x-auto max-h-[420px] overflow-y-auto", tableClassName)}>
        <table className="min-w-full text-left text-xs">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">S.No</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Job Title</th>
              <th className="px-3 py-2 font-semibold">Company Name</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Company Email</th>
              <th className="px-3 py-2 font-semibold">Company Website</th>
              <th className="px-3 py-2 font-semibold">Company Linkedin</th>
              <th className="px-3 py-2 font-semibold">Company Social</th>
              <th className="px-3 py-2 font-semibold">Company Twitter</th>
              <th className="px-3 py-2 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody>
            {hrContacts?.map((row, index) => (
              <tr
                key={`${row.name}-${index}`}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="px-3 py-2 text-slate-600">{index + 1}</td>
                <td className="px-3 py-2 font-semibold text-slate-900">{row.name}</td>
                <td className="px-3 py-2">{renderCell(row.title)}</td>
                <td className="px-3 py-2">{renderCell(row.company)}</td>
                <td className="px-3 py-2">{renderCell(row.status || 'active')}</td>
                <td className="px-3 py-2">{renderCell(row.email)}</td>
                <td className="px-3 py-2">{renderCell(row.website || '-')}</td>
                <td className="px-3 py-2">{renderCell(row.linkedin || '-')}</td>
                <td className="px-3 py-2">{renderCell(row.social || '-')}</td>
                <td className="px-3 py-2">{renderCell(row.twitter || '-')}</td>
                <td className="px-3 py-2">{renderCell(row.location || '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
