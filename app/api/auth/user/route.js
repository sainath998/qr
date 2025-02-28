import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    await connectDB();
    const { user } = await req.json();
    const { name, email, profilePic, isPremium } = user;

    console.log("🔹 Request received for:", email);

    // Check if user already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("✅ User already exists:", existingUser);
    } else {
      // Create a new user
      const newUser = new User({ name, email, profilePic, isPremium });
      await newUser.save();
      console.log("🎉 New user created:", newUser);
    }

    const user_token = jwt.sign(
      {
        // random unique id
        id: randomUUID(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_photo: user.picture,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log("signing data for ", {
      // random unique id
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profile_photo: user.picture,
    });

    return Response.json({ success: true, user, user_token }, { status: 201 });
  } catch (error) {
    console.error("❌ Error:", error.message);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
