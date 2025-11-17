import mongoose, { Schema, Document } from "mongoose";

// TypeScript interface for Order document
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  total: number;

  shipping: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    postalCode?: string;
  };

 history: {
  type: [
    {
      status: String,
      message: String,
      timestamp: Date,
    },
  ],
  default: [], // <- ensures history is never undefined
},

  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipping"
    | "delivered"
    | "received"
    | "cod_pending"
    | "cod_on_delivery"
    | "cod_delivered"
    | "cancelled";

  paymentStatus: "unpaid" | "pending" | "paid" | "failed";
  paymentMethod: "paystack" | "flutterwave" | "cod";

  reference?: string;

  trackingNumber?: string;
  trackingUrl?: string;

  refund: {
    status: "none" | "requested" | "processing" | "completed" | "failed";
    reason?: string;
    amount?: number;
    gatewayResponse?: any;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    total: { type: Number, required: true },

    shipping: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: String,
      postalCode: String,
    },

    history: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipping",
        "delivered",
        "received",
        "cod_pending",
        "cod_on_delivery",
        "cod_delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed"],
      default: "unpaid",
    },

    paymentMethod: {
      type: String,
      enum: ["paystack", "flutterwave", "cod"],
      required: true,
    },

    reference: String,

    // ✅ Tracking fields
    trackingNumber: String,
    trackingUrl: String,

    refund: {
      status: {
        type: String,
        enum: ["none", "requested", "processing", "completed", "failed"],
        default: "none",
      },
      reason: String,
      amount: Number,
      gatewayResponse: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Export model
export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
