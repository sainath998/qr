import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User"; // Ensure your User model is correctly imported

export async function POST(request) {
  try {
    const { email, isLifetime } = await request.json();
    console.log("🔹 Request received for:", email, "isLifetime:", isLifetime);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Determine new values based on subscription type
    const updateFields = isLifetime
      ? { isLifeTimeUser: true, premiumSubscriptionExpireDate: null }
      : {
          isLifeTimeUser: false,
          premiumSubscriptionExpireDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ), // 30 days from now
        };

    // ✅ Corrected query
    const updatedUser = await User.findOneAndUpdate(
      { email }, // Find user by email
      { $set: updateFields }, // Update fields
      { new: true }, // Return updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Subscription updated successfully", user: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Subscription update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
