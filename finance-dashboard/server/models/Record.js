import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ["Income", "Expense"], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Record", recordSchema);
