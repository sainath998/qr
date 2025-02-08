import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  qrData: { type: String, required: true },
  views: { type: Number, default: 0 },
});

export default mongoose.models.QRCode || mongoose.model("QRCode", qrCodeSchema);
