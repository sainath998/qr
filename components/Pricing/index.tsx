"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";
import { useState } from "react";
import Script from "next/script";
import { getUserDetails } from "@/utils/auth";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "monthly",
      price: 10,
      title: "Monthly",
      description: "Billed monthly",
      features: [
        "Unlimited QR Generations",
        "No limit on tracking",
        "Support for adding logo to QR",
      ],
    },
    {
      id: "lifetime",
      price: 59,
      title: "Lifetime",
      description: "One-time payment",
      features: [
        "Unlimited QR Generations",
        "No limit on tracking",
        "Support for adding logo to QR",
      ],
    },
  ];

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/payment/order`, {
        // ✅ Call order API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.price, currency: "INR" }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      initializePayment(data.id);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const user = getUserDetails();

  const initializePayment = async (orderId: string) => {
    if (!user) return;
    const rzp1 = new window.Razorpay({
      key: process.env.RAZORPAY_KEY_ID,
      amount: plans.find((p) => p.id === selectedPlan)?.price * 100,
      currency: "INR",
      name: "QR Code Generator",
      description: "Subscription Payment",
      image: "/images/logo.png",
      order_id: orderId, // Pass the correct order ID here
      handler: async (response: any) => {
        const verifyData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        };

        try {
          const verifyResponse = await fetch(`/api/subscription/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(verifyData),
          });

          if (verifyResponse.ok) {
            // alert("Payment successful!");
            // need to update the user subscription status in db

            fetch(`/api/user/update`, {
              email: user.email,
              subscription: selectedPlan,
            });
          } else {
            alert("Payment verification failed. Please try again.");
          }
        } catch (error) {
          console.error("Verification error:", error);
          alert("Payment verification failed. Please try again.");
        }
      },
      prefill: {
        name: "",
        email: "",
      },
      theme: {
        color: "#3399cc",
      },
    });

    rzp1.open();
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `PRICING PLANS`,
                subtitle: `Pricing`,
                description: `Simple Pricing no hidden charges. Choose your plan and get started with us.`,
              }}
            />
          </div>
        </div>
        <div className="relative mx-auto mt-15 max-w-[1207px] px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="absolute -bottom-15 -z-1 h-full w-full">
            <Image
              fill
              src="./images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-7.5 lg:flex-nowrap xl:gap-12.5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                                    animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5
                                    ${
                                      selectedPlan === plan.id
                                        ? "ring-2 ring-primary"
                                        : ""
                                    }
                                `}
              >
                <h3 className="mb-7.5 text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                  ${plan.price}{" "}
                </h3>
                <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
                  {plan.title}
                </h4>
                <p>{plan.description}</p>
                <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="mb-4 text-black last:mb-0 dark:text-manatee"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading}
                  aria-label="Get the Plan button"
                  className={`
                                        group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary
                                        ${
                                          loading
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                        }
                                    `}
                >
                  <span className="duration-300 group-hover/btn:pr-2">
                    {loading ? "Processing..." : "Get the Plan"}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
