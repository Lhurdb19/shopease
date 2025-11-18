import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const Product = (await import("../models/Product.ts")).default;

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected");

  try {
    await Product.collection.dropIndex("slug_1");
    console.log("Index dropped");
  } catch (err) {
    console.log("Index not found");
  }

  process.exit(0);
}

run();
