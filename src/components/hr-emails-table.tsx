"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { useEffect } from "react";

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

// export default function HrEmailsTable({
//   className,
//   tableClassName,
// }: {
//   className?: string;
//   tableClassName?: string;
//   hrContacts?: HrEmailsTableProps[];
// }) {

//     const [hrContacts, setHrContacts] = React.useState<HrEmailsTableProps[] | []>([]);
  
//     useEffect(() => {
//       const getHrContacts = async () => {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hr/list/demo`);
//           const data = await response.json();
//           console.log('this is the response from the server: ', data.list);
//           setHrContacts(data.list);
//         } catch (error) {
//           console.error("error handling the response", error);
//         }
//       }
//       getHrContacts();
//     }, []);

//   return (
//     <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
//       <div className={cn("overflow-x-auto max-h-[420px] overflow-y-auto", tableClassName)}>
//         <table className="min-w-full text-left text-xs">
//           <thead className="bg-blue-600 text-white">
//             <tr>
//               <th className="px-3 py-2 font-semibold">S.No</th>
//               <th className="px-3 py-2 font-semibold">Name</th>
//               <th className="px-3 py-2 font-semibold">Job Title</th>
//               <th className="px-3 py-2 font-semibold">Company Name</th>
//               <th className="px-3 py-2 font-semibold">Status</th>
//               <th className="px-3 py-2 font-semibold">Company Email</th>
//               <th className="px-3 py-2 font-semibold">Company Website</th>
//               <th className="px-3 py-2 font-semibold">Company Linkedin</th>
//               <th className="px-3 py-2 font-semibold">Company Social</th>
//               <th className="px-3 py-2 font-semibold">Company Twitter</th>
//               <th className="px-3 py-2 font-semibold">Location</th>
//             </tr>
//           </thead>
//           <tbody>
//             {hrContacts?.map((row, index) => (
//               <tr
//                 key={`${row.name}-${index}`}
//                 className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
//               >
//                 <td className="px-3 py-2 text-slate-600">{index + 1}</td>
//                 <td className="px-3 py-2 font-semibold text-slate-900">{row.name}</td>
//                 <td className="px-3 py-2">{renderCell(row.title)}</td>
//                 <td className="px-3 py-2">{renderCell(row.company)}</td>
//                 <td className="px-3 py-2">{renderCell(row.status || 'active')}</td>
//                 <td className="px-3 py-2">{renderCell(row.email)}</td>
//                 <td className="px-3 py-2">{renderCell(row.website || '-')}</td>
//                 <td className="px-3 py-2">{renderCell(row.linkedin || '-')}</td>
//                 <td className="px-3 py-2">{renderCell(row.social || '-')}</td>
//                 <td className="px-3 py-2">{renderCell(row.twitter || '-')}</td>
//                 <td className="px-3 py-2">{renderCell(row.location || '-')}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

export default function HrEmailsTable({
  className,
  tableClassName,
}: {
  className?: string;
  tableClassName?: string;
}) {
  const [hrContacts, setHrContacts] = React.useState<HrEmailsTableProps[]>([]);

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
    };
    getHrContacts();
  }, []);

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className={cn("overflow-x-auto max-h-[420px] overflow-y-auto", tableClassName)}>
        <table className="min-w-full text-left text-xs">
          <thead className="bg-blue-600 text-white sticky top-0 z-10">
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
            {hrContacts?.map((row, index) => {
              const isPremium = (row as any).type === "premium";

              return (
                <tr
                  key={`${row.name}-${index}`}
                  className={cn(
                    index % 2 === 0 ? "bg-white" : "bg-slate-50",
                    isPremium && "bg-amber-50/40 hover:bg-amber-50/60 transition-colors"
                  )}
                >
                  <td className="px-3 py-2 text-slate-600">
                    {isPremium ? (
                      <span className="flex items-center gap-1">
                        {index + 1} <span title="Premium Contact">⭐</span>
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{row.name}</span>
                      {isPremium && (
                        <span className="w-fit bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-md border border-amber-200 font-bold uppercase">
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">{renderCell(row.title)}</td>
                  <td className="px-3 py-2">{renderCell(row.company)}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      isPremium ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {row.status || 'active'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{renderCell(row.email)}</td>
                  <td className="px-3 py-2">{renderCell(row.website || '-')}</td>
                  <td className="px-3 py-2">{renderCell(row.linkedin || '-')}</td>
                  <td className="px-3 py-2">{renderCell(row.social || '-')}</td>
                  <td className="px-3 py-2">{renderCell(row.twitter || '-')}</td>
                  <td className="px-3 py-2">{renderCell(row.location || '-')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}