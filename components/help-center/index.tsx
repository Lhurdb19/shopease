// import Link from "next/link";
// import { useState } from "react";
// import faqData from "@/data/faqs.json";

// export default function HelpCenter() {
//   const [search, setSearch] = useState("");

//   const filtered = faqData.filter((f) =>
//     f.question.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold mb-4">Help Center</h1>

//       {/* Search */}
//       <input
//         placeholder="Search for help..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="w-full p-3 border rounded-lg bg-white"
//       />

//       {/* Suggestions */}
//       {search && (
//         <div className="bg-white border rounded-lg mt-2 divide-y">
//           {filtered.map((faq) => (
//             <Link
//               href={`/help-center/faq/${faq.id}`}
//               key={faq.id}
//               className="block p-3 hover:bg-gray-50"
//             >
//               {faq.question}
//             </Link>
//           ))}

//           {filtered.length === 0 && (
//             <div className="p-3 text-gray-500">No results found.</div>
//           )}
//         </div>
//       )}

//       {/* Categories */}
//       <h2 className="mt-8 text-xl font-semibold">Categories</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
//         {["Orders", "Payments", "Account", "Delivery"].map((cat) => (
//           <Link
//             key={cat}
//             href={`/help-center/category/${cat.toLowerCase()}`}
//             className="p-5 bg-white shadow rounded-lg hover:bg-gray-50"
//           >
//             <h3 className="font-semibold">{cat}</h3>
//             <p className="text-sm text-gray-500">View related articles</p>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
