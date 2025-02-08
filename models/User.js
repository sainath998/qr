import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String },
  isPremium: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
