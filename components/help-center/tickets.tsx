// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function TicketsPage() {
//   const userId = "test-user-123";
//   const [tickets, setTickets] = useState([]);

//   useEffect(() => {
//     axios.get(`/api/tickets?userId=${userId}`).then((res) => {
//       setTickets(res.data);
//     });
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold">My Support Tickets</h1>

//       <div className="mt-4 space-y-3">
//         {tickets.map((t) => (
//           <div key={t._id} className="p-4 bg-white shadow rounded-lg">
//             <h3 className="font-semibold">{t.subject}</h3>
//             <p className="text-gray-500 text-sm">{t.message}</p>
//             <p className="text-xs mt-2">Status: {t.status}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
