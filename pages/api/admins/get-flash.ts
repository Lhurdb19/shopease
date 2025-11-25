//superadmin/get-flash

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FlashSale from "@/models/FlashSale";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();

  const sales = await FlashSale.find().sort({ createdAt: -1 });

  const populated = await Promise.all(
    sales.map(async (sale) => {
      const product = await Product.findById(sale.productId);
      return { ...sale.toObject(), product };
    })
  );

  return NextResponse.json(populated);
}
