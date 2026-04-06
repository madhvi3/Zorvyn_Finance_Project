import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["Viewer", "Analyst", "Admin"], default: "Viewer" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
