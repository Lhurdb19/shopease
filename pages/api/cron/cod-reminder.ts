// export default async function handler() {
//   const codOrders = await Order.find({ status: "cod_pending" });

//   codOrders.forEach(o => {
//     sendSMS(o.shipping.phone, "Reminder: Your COD order is pending.");
//   });

//   return Response.json({ ok: true });
// }
