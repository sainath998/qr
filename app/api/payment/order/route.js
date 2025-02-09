import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { amount, currency } = await request.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: currency,
      payment_capture: 1, // Auto-capture payment
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
