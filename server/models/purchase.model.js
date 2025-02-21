import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const PurchaseModel = mongoose.model("Purchase", purchaseSchema);

export default PurchaseModel;
