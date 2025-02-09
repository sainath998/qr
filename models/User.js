import mongoose from "mongoose";
import { nanoid } from "nanoid"; // Import NanoID generator

const userSchema = new mongoose.Schema({
  id: { type: String, default: () => nanoid(12), unique: true }, // 12-character unique ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String },
  isPremium: { type: Boolean, default: false },
  isLifeTimeUser: { type: Boolean, default: false },
  premiumSubscriptionExpireDate: { type: Date, default: null },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
